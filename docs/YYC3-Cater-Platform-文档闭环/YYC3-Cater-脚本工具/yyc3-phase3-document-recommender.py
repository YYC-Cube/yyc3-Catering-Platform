#!/usr/bin/env python3
"""
YYC³ 智能文档推荐系统 - 第三阶段（P2）
基于知识图谱实现智能文档推荐
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional
from datetime import datetime
import json
from dataclasses import dataclass, field
from collections import Counter, defaultdict
import math


@dataclass
class RecommendationResult:
    """推荐结果"""
    document_name: str
    title: str
    category: str
    relevance_score: float  # 相关性评分
    quality_score: float  # 质量评分
    importance: float  # 重要性
    match_reasons: List[str]  # 匹配原因
    preview: str  # 预览文本


@dataclass
class UserContext:
    """用户上下文"""
    current_document: Optional[str] = None  # 当前查看的文档
    search_history: List[str] = field(default_factory=list)  # 搜索历史
    viewed_documents: List[str] = field(default_factory=list)  # 查看过的文档
    interests: List[str] = field(default_factory=list)  # 兴趣标签
    role: str = "developer"  # 用户角色


class IntelligentDocumentRecommender:
    """智能文档推荐系统"""
    
    def __init__(self, graph_file: str):
        self.graph_file = Path(graph_file)
        self.graph = None
        self.documents = {}
        self.concepts = {}
        self.edges = []
        
        # 加载知识图谱
        self.load_graph()
        
        # 构建索引
        self.build_indexes()
    
    def load_graph(self):
        """加载知识图谱"""
        with open(self.graph_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.graph = data
        self.documents = {doc["name"]: doc for doc in data["documents"]}
        self.concepts = {concept["name"]: concept for concept in data["concepts"]}
        self.edges = data["edges"]
        
        print(f"✓ 已加载知识图谱: {len(self.documents)} 个文档, {len(self.concepts)} 个概念, {len(self.edges)} 条边")
    
    def build_indexes(self):
        """构建索引"""
        # 关键词索引
        self.keyword_index = defaultdict(set)
        for doc_name, doc in self.documents.items():
            for keyword in doc["keywords"]:
                self.keyword_index[keyword.lower()].add(doc_name)
        
        # 概念索引
        self.concept_index = defaultdict(set)
        for doc_name, doc in self.documents.items():
            for concept in doc["concepts"]:
                self.concept_index[concept].add(doc_name)
        
        # 分类索引
        self.category_index = defaultdict(set)
        for doc_name, doc in self.documents.items():
            self.category_index[doc["category"]].add(doc_name)
        
        # 引用索引
        self.reference_index = defaultdict(set)
        for edge in self.edges:
            if edge["type"] == "reference":
                self.reference_index[edge["source"]].add(edge["target"])
        
        # 反向引用索引
        self.referenced_by_index = defaultdict(set)
        for edge in self.edges:
            if edge["type"] == "reference":
                self.referenced_by_index[edge["target"]].add(edge["source"])
        
        print("✓ 已构建索引")
    
    def search_by_keywords(self, keywords: List[str], limit: int = 10) -> List[RecommendationResult]:
        """基于关键词搜索"""
        results = []
        keyword_scores = defaultdict(float)
        
        # 计算每个文档的关键词匹配分数
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in self.keyword_index:
                for doc_name in self.keyword_index[keyword_lower]:
                    keyword_scores[doc_name] += 1
        
        # 归一化分数
        max_score = max(keyword_scores.values()) if keyword_scores else 1
        for doc_name in keyword_scores:
            keyword_scores[doc_name] = keyword_scores[doc_name] / max_score
        
        # 生成推荐结果
        for doc_name, score in sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
            doc = self.documents[doc_name]
            result = RecommendationResult(
                document_name=doc_name,
                title=doc["title"],
                category=doc["category"],
                relevance_score=score,
                quality_score=doc["quality_score"],
                importance=doc["importance"],
                match_reasons=[f"匹配关键词: {', '.join(keywords)}"],
                preview=doc.get("description", "")[:200]
            )
            results.append(result)
        
        return results
    
    def recommend_by_concepts(self, concepts: List[str], limit: int = 10) -> List[RecommendationResult]:
        """基于概念推荐"""
        results = []
        concept_scores = defaultdict(float)
        
        # 计算每个文档的概念匹配分数
        for concept in concepts:
            if concept in self.concept_index:
                concept_weight = self.concepts[concept]["importance"]
                for doc_name in self.concept_index[concept]:
                    concept_scores[doc_name] += concept_weight
        
        # 归一化分数
        max_score = max(concept_scores.values()) if concept_scores else 1
        for doc_name in concept_scores:
            concept_scores[doc_name] = concept_scores[doc_name] / max_score
        
        # 生成推荐结果
        for doc_name, score in sorted(concept_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
            doc = self.documents[doc_name]
            matched_concepts = [c for c in concepts if c in doc["concepts"]]
            result = RecommendationResult(
                document_name=doc_name,
                title=doc["title"],
                category=doc["category"],
                relevance_score=score,
                quality_score=doc["quality_score"],
                importance=doc["importance"],
                match_reasons=[f"匹配概念: {', '.join(matched_concepts)}"],
                preview=doc.get("description", "")[:200]
            )
            results.append(result)
        
        return results
    
    def recommend_by_document(self, document_name: str, limit: int = 10) -> List[RecommendationResult]:
        """基于文档推荐相关文档"""
        results = []
        
        if document_name not in self.documents:
            return results
        
        doc = self.documents[document_name]
        doc_scores = defaultdict(float)
        
        # 基于引用关系推荐
        if document_name in self.reference_index:
            for ref_doc in self.reference_index[document_name]:
                doc_scores[ref_doc] += 0.3
        
        # 基于被引用关系推荐
        if document_name in self.referenced_by_index:
            for ref_doc in self.referenced_by_index[document_name]:
                doc_scores[ref_doc] += 0.4
        
        # 基于共享概念推荐
        for concept in doc["concepts"]:
            if concept in self.concept_index:
                for other_doc in self.concept_index[concept]:
                    if other_doc != document_name:
                        doc_scores[other_doc] += 0.2
        
        # 基于相同分类推荐
        for other_doc in self.category_index[doc["category"]]:
            if other_doc != document_name:
                doc_scores[other_doc] += 0.1
        
        # 排除当前文档
        if document_name in doc_scores:
            del doc_scores[document_name]
        
        # 归一化分数
        max_score = max(doc_scores.values()) if doc_scores else 1
        for doc_name in doc_scores:
            doc_scores[doc_name] = doc_scores[doc_name] / max_score
        
        # 生成推荐结果
        for doc_name, score in sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
            other_doc = self.documents[doc_name]
            
            # 计算匹配原因
            match_reasons = []
            if document_name in self.reference_index and doc_name in self.reference_index[document_name]:
                match_reasons.append("被当前文档引用")
            if document_name in self.referenced_by_index and doc_name in self.referenced_by_index[document_name]:
                match_reasons.append("引用当前文档")
            
            shared_concepts = set(doc["concepts"]) & set(other_doc["concepts"])
            if shared_concepts:
                match_reasons.append(f"共享概念: {', '.join(list(shared_concepts)[:3])}")
            
            if other_doc["category"] == doc["category"]:
                match_reasons.append("相同分类")
            
            result = RecommendationResult(
                document_name=doc_name,
                title=other_doc["title"],
                category=other_doc["category"],
                relevance_score=score,
                quality_score=other_doc["quality_score"],
                importance=other_doc["importance"],
                match_reasons=match_reasons,
                preview=other_doc.get("description", "")[:200]
            )
            results.append(result)
        
        return results
    
    def recommend_by_category(self, category: str, limit: int = 10) -> List[RecommendationResult]:
        """基于分类推荐"""
        results = []
        
        if category not in self.category_index:
            return results
        
        # 获取该分类下的所有文档
        doc_names = list(self.category_index[category])
        
        # 按重要性和质量评分排序
        sorted_docs = sorted(
            doc_names,
            key=lambda x: (self.documents[x]["importance"], self.documents[x]["quality_score"]),
            reverse=True
        )[:limit]
        
        # 生成推荐结果
        for doc_name in sorted_docs:
            doc = self.documents[doc_name]
            result = RecommendationResult(
                document_name=doc_name,
                title=doc["title"],
                category=doc["category"],
                relevance_score=doc["importance"],
                quality_score=doc["quality_score"],
                importance=doc["importance"],
                match_reasons=[f"分类: {category}"],
                preview=doc.get("description", "")[:200]
            )
            results.append(result)
        
        return results
    
    def personalized_recommend(self, user_context: UserContext, limit: int = 10) -> List[RecommendationResult]:
        """个性化推荐"""
        results = []
        doc_scores = defaultdict(float)
        
        # 基于查看历史推荐
        for viewed_doc in user_context.viewed_documents:
            if viewed_doc in self.documents:
                # 推荐与查看过的文档相关的文档
                related_docs = self.recommend_by_document(viewed_doc, limit=5)
                for related in related_docs:
                    doc_scores[related.document_name] += 0.3
        
        # 基于兴趣标签推荐
        for interest in user_context.interests:
            # 关键词匹配
            if interest.lower() in self.keyword_index:
                for doc_name in self.keyword_index[interest.lower()]:
                    doc_scores[doc_name] += 0.2
            
            # 概念匹配
            if interest in self.concept_index:
                for doc_name in self.concept_index[interest]:
                    doc_scores[doc_name] += 0.3
        
        # 排除已查看的文档
        for viewed_doc in user_context.viewed_documents:
            if viewed_doc in doc_scores:
                del doc_scores[viewed_doc]
        
        # 归一化分数
        max_score = max(doc_scores.values()) if doc_scores else 1
        for doc_name in doc_scores:
            doc_scores[doc_name] = doc_scores[doc_name] / max_score
        
        # 生成推荐结果
        for doc_name, score in sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
            doc = self.documents[doc_name]
            result = RecommendationResult(
                document_name=doc_name,
                title=doc["title"],
                category=doc["category"],
                relevance_score=score,
                quality_score=doc["quality_score"],
                importance=doc["importance"],
                match_reasons=["个性化推荐"],
                preview=doc.get("description", "")[:200]
            )
            results.append(result)
        
        return results
    
    def hybrid_recommend(self, query: str, user_context: Optional[UserContext] = None, limit: int = 10) -> List[RecommendationResult]:
        """混合推荐（综合多种推荐策略）"""
        results = []
        doc_scores = defaultdict(float)
        
        # 提取查询关键词
        keywords = self.extract_keywords(query)
        
        # 1. 关键词搜索（权重0.4）
        keyword_results = self.search_by_keywords(keywords, limit=20)
        for result in keyword_results:
            doc_scores[result.document_name] += result.relevance_score * 0.4
        
        # 2. 概念推荐（权重0.3）
        concepts = self.extract_concepts(query)
        concept_results = self.recommend_by_concepts(concepts, limit=20)
        for result in concept_results:
            doc_scores[result.document_name] += result.relevance_score * 0.3
        
        # 3. 基于当前文档推荐（权重0.2）
        if user_context and user_context.current_document:
            doc_results = self.recommend_by_document(user_context.current_document, limit=20)
            for result in doc_results:
                doc_scores[result.document_name] += result.relevance_score * 0.2
        
        # 4. 个性化推荐（权重0.1）
        if user_context:
            personalized_results = self.personalized_recommend(user_context, limit=20)
            for result in personalized_results:
                doc_scores[result.document_name] += result.relevance_score * 0.1
        
        # 排序并生成最终结果
        sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        for doc_name, score in sorted_docs:
            doc = self.documents[doc_name]
            
            # 收集所有匹配原因
            match_reasons = []
            if keywords:
                matched_keywords = [kw for kw in keywords if kw.lower() in [k.lower() for k in doc["keywords"]]]
                if matched_keywords:
                    match_reasons.append(f"匹配关键词: {', '.join(matched_keywords[:3])}")
            
            if concepts:
                matched_concepts = [c for c in concepts if c in doc["concepts"]]
                if matched_concepts:
                    match_reasons.append(f"匹配概念: {', '.join(matched_concepts[:3])}")
            
            result = RecommendationResult(
                document_name=doc_name,
                title=doc["title"],
                category=doc["category"],
                relevance_score=score,
                quality_score=doc["quality_score"],
                importance=doc["importance"],
                match_reasons=match_reasons,
                preview=doc.get("description", "")[:200]
            )
            results.append(result)
        
        return results
    
    def extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        keywords = []
        
        # 匹配大写开头的单词
        words = re.findall(r'\b[A-Z][a-zA-Z]{2,}\b', text)
        keywords.extend(words)
        
        # 匹配常见技术术语
        tech_terms = re.findall(
            r'\b(?:架构|设计|开发|测试|部署|API|接口|服务|模块|组件|系统|平台|应用|数据库|缓存|消息队列|监控|日志|安全|性能|优化)\b',
            text
        )
        keywords.extend(tech_terms)
        
        # 去重并限制数量
        return list(set(keywords))[:10]
    
    def extract_concepts(self, text: str) -> List[str]:
        """提取概念"""
        concepts = []
        
        # 匹配预定义概念
        for concept_name in self.concepts.keys():
            if concept_name in text:
                concepts.append(concept_name)
        
        return concepts
    
    def save_recommendation_report(self, results: List[RecommendationResult], output_file: Path, query: str = ""):
        """保存推荐报告"""
        output_file.parent.mkdir(exist_ok=True)
        
        # 保存JSON格式
        json_file = output_file.parent / f"{output_file.stem}.json"
        json_data = {
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "total_results": len(results),
            "results": [
                {
                    "document_name": r.document_name,
                    "title": r.title,
                    "category": r.category,
                    "relevance_score": r.relevance_score,
                    "quality_score": r.quality_score,
                    "importance": r.importance,
                    "match_reasons": r.match_reasons,
                    "preview": r.preview
                }
                for r in results
            ]
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        # 保存Markdown格式
        md_file = output_file
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write("# YYC³ 文档推荐报告\n\n")
            f.write(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            if query:
                f.write(f"**查询**: {query}\n")
            f.write(f"**推荐结果数**: {len(results)}\n\n")
            
            f.write("## 推荐结果\n\n")
            f.write("| 排名 | 文档名称 | 标题 | 分类 | 相关性 | 质量 | 重要性 | 匹配原因 |\n")
            f.write("|------|---------|------|------|--------|------|--------|----------|\n")
            
            for i, result in enumerate(results, 1):
                reasons = "; ".join(result.match_reasons[:2])
                f.write(f"| {i} | {result.document_name[:30]} | {result.title[:30]} | {result.category} | {result.relevance_score:.3f} | {result.quality_score:.1f} | {result.importance:.3f} | {reasons} |\n")
            
            f.write("\n## 详细信息\n\n")
            for i, result in enumerate(results, 1):
                f.write(f"### {i}. {result.title}\n\n")
                f.write(f"**文档名称**: {result.document_name}\n\n")
                f.write(f"**分类**: {result.category}\n\n")
                f.write(f"**相关性评分**: {result.relevance_score:.3f}\n\n")
                f.write(f"**质量评分**: {result.quality_score:.1f}\n\n")
                f.write(f"**重要性**: {result.importance:.3f}\n\n")
                f.write(f"**匹配原因**:\n")
                for reason in result.match_reasons:
                    f.write(f"- {reason}\n")
                f.write(f"\n**预览**: {result.preview}...\n\n")
                f.write("---\n\n")
        
        print(f"推荐报告已保存到: {md_file}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 智能文档推荐系统')
    parser.add_argument('--graph-file', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告/YYC3-文档知识图谱_20251228_045044.json',
                       help='知识图谱文件路径')
    parser.add_argument('--query', type=str, default='架构设计',
                       help='查询关键词')
    parser.add_argument('--type', type=str, choices=['keyword', 'concept', 'document', 'category', 'personalized', 'hybrid'],
                       default='hybrid', help='推荐类型')
    parser.add_argument('--document', type=str, help='文档名称（用于基于文档的推荐）')
    parser.add_argument('--category', type=str, help='分类名称（用于基于分类的推荐）')
    parser.add_argument('--limit', type=int, default=10, help='推荐结果数量')
    parser.add_argument('--output-dir', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告',
                       help='输出目录')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("YYC³ 智能文档推荐系统 - 第三阶段（P2）")
    print("=" * 80)
    print(f"知识图谱文件: {args.graph_file}")
    print(f"推荐类型: {args.type}")
    print(f"查询: {args.query}")
    print("=" * 80)
    print()
    
    # 初始化推荐系统
    recommender = IntelligentDocumentRecommender(args.graph_file)
    
    # 执行推荐
    results = []
    
    if args.type == 'keyword':
        keywords = args.query.split()
        results = recommender.search_by_keywords(keywords, args.limit)
    elif args.type == 'concept':
        concepts = recommender.extract_concepts(args.query)
        results = recommender.recommend_by_concepts(concepts, args.limit)
    elif args.type == 'document':
        if not args.document:
            print("错误: 需要指定 --document 参数")
            return
        results = recommender.recommend_by_document(args.document, args.limit)
    elif args.type == 'category':
        if not args.category:
            print("错误: 需要指定 --category 参数")
            return
        results = recommender.recommend_by_category(args.category, args.limit)
    elif args.type == 'personalized':
        user_context = UserContext(
            current_document=args.document,
            interests=args.query.split()
        )
        results = recommender.personalized_recommend(user_context, args.limit)
    elif args.type == 'hybrid':
        user_context = UserContext(current_document=args.document)
        results = recommender.hybrid_recommend(args.query, user_context, args.limit)
    
    # 显示结果
    print(f"\n找到 {len(results)} 个推荐结果:\n")
    print("=" * 120)
    print(f"{'排名':<6}{'文档名称':<35}{'分类':<12}{'相关性':<10}{'质量':<8}{'重要性':<10}{'匹配原因'}")
    print("=" * 120)
    
    for i, result in enumerate(results, 1):
        reasons = "; ".join(result.match_reasons[:2])
        print(f"{i:<6}{result.document_name[:35]:<35}{result.category:<12}{result.relevance_score:.3f}{'':<6}{result.quality_score:.1f}{'':<4}{result.importance:.3f}{'':<6}{reasons[:40]}")
    
    print("=" * 120)
    
    # 保存报告
    output_file = Path(args.output_dir) / f"YYC3-文档推荐报告_{args.type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    recommender.save_recommendation_report(results, output_file, args.query)
    
    print(f"\n✓ 推荐完成！")


if __name__ == "__main__":
    main()
