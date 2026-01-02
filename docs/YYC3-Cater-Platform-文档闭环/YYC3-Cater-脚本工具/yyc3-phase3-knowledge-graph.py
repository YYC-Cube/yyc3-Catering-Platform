#!/usr/bin/env python3
"""
YYC³ 文档知识图谱构建工具 - 第三阶段（P2）
分析文档内容，提取关键概念，构建文档知识图谱
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional
from datetime import datetime
import json
from dataclasses import dataclass, field
from collections import Counter, defaultdict


@dataclass
class DocumentNode:
    """文档节点"""
    file_path: str
    file_name: str
    doc_type: str
    title: str
    description: str
    keywords: List[str]
    concepts: List[str]
    references: List[str]  # 引用的其他文档
    referenced_by: List[str]  # 被哪些文档引用
    category: str  # 文档分类
    quality_score: float = 0.0
    
    # 图谱属性
    centrality: float = 0.0  # 中心性
    importance: float = 0.0  # 重要性
    cluster: int = -1  # 所属聚类


@dataclass
class ConceptNode:
    """概念节点"""
    name: str
    category: str
    frequency: int
    documents: List[str]  # 出现在哪些文档中
    related_concepts: List[str]  # 相关概念
    importance: float = 0.0


@dataclass
class KnowledgeGraph:
    """知识图谱"""
    documents: Dict[str, DocumentNode] = field(default_factory=dict)
    concepts: Dict[str, ConceptNode] = field(default_factory=dict)
    edges: List[Dict] = field(default_factory=list)
    clusters: List[List[str]] = field(default_factory=list)
    
    # 统计信息
    total_documents: int = 0
    total_concepts: int = 0
    total_edges: int = 0


class DocumentKnowledgeGraphBuilder:
    """文档知识图谱构建器"""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.graph = KnowledgeGraph()
        
        # 关键词提取模式
        self.keyword_patterns = [
            r'\b[A-Z][a-zA-Z]{2,}\b',  # 大写开头的单词
            r'\b(?:架构|设计|开发|测试|部署|运维|监控|API|接口|服务|模块|组件|系统|平台|应用)\b',
            r'\b(?:AI|人工智能|机器学习|深度学习|智能|自动化|优化|性能|安全|质量)\b',
            r'\b(?:需求|规划|实施|迭代|发布|版本|文档|规范|标准|流程)\b'
        ]
        
        # 概念提取模式
        self.concept_patterns = [
            r'(?:架构|设计)模式',
            r'(?:开发|测试|部署|运维)流程',
            r'(?:API|接口)设计',
            r'(?:数据|业务|技术)架构',
            r'(?:性能|安全|质量)保障',
            r'(?:微服务|容器|云)部署',
            r'(?:CI/CD|DevOps)流水线',
            r'(?:监控|告警|日志)系统',
            r'(?:需求|用户|产品)管理',
            r'(?:文档|知识)管理'
        ]
        
        # 文档分类
        self.doc_categories = {
            "架构设计": ["架构", "设计", "系统", "平台"],
            "开发实施": ["开发", "实施", "编码", "实现"],
            "测试验证": ["测试", "验证", "质量", "缺陷"],
            "部署发布": ["部署", "发布", "运维", "容器"],
            "运维运营": ["运维", "监控", "告警", "日志"],
            "需求规划": ["需求", "规划", "产品", "用户"],
            "用户指南": ["指南", "手册", "教程", "入门"],
            "归类迭代": ["迭代", "版本", "更新", "变更"]
        }
    
    def extract_title(self, content: str) -> str:
        """提取文档标题"""
        match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if match:
            return match.group(1).strip()
        return ""
    
    def extract_description(self, content: str) -> str:
        """提取文档描述"""
        # 查找 @description
        match = re.search(r'@description\s*[:：]?\s*(.+?)(?:\n|$)', content)
        if match:
            return match.group(1).strip()
        
        # 查找描述章节
        match = re.search(r'##\s*(?:描述|说明|概述|简介)\s*\n\s*(.+?)(?:\n##|\n\n|$)', content, re.DOTALL)
        if match:
            return match.group(1).strip()[:200]  # 限制长度
        
        return ""
    
    def extract_keywords(self, content: str) -> List[str]:
        """提取关键词"""
        keywords = []
        
        for pattern in self.keyword_patterns:
            matches = re.findall(pattern, content)
            keywords.extend(matches)
        
        # 统计词频
        keyword_freq = Counter(keywords)
        
        # 返回前10个高频关键词
        return [kw for kw, _ in keyword_freq.most_common(10)]
    
    def extract_concepts(self, content: str) -> List[str]:
        """提取概念"""
        concepts = []
        
        for pattern in self.concept_patterns:
            matches = re.findall(pattern, content)
            concepts.extend(matches)
        
        # 去重
        return list(set(concepts))
    
    def extract_references(self, content: str, current_file: str) -> List[str]:
        """提取文档引用"""
        references = []
        
        # 查找Markdown链接
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        for text, url in links:
            # 检查是否是文档链接
            if url.endswith('.md') or url.endswith('.MD'):
                references.append(text)
        
        # 查找文档名称引用
        doc_refs = re.findall(r'YYC3-[^:\s\]]+', content)
        references.extend(doc_refs)
        
        # 去重
        return list(set(references))
    
    def classify_document(self, file_name: str, content: str) -> str:
        """分类文档"""
        file_lower = file_name.lower()
        content_lower = content.lower()
        
        for category, keywords in self.doc_categories.items():
            for keyword in keywords:
                if keyword in file_lower or keyword in content_lower:
                    return category
        
        return "其他"
    
    def load_quality_scores(self) -> Dict[str, float]:
        """加载文档质量评分"""
        quality_file = self.base_path / "YYC3-Cater-审核报告" / "YYC3-文档质量评估报告.json"
        
        if not quality_file.exists():
            return {}
        
        with open(quality_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        scores = {}
        for report in data.get("reports", []):
            scores[report["file_name"]] = report["metrics"]["overall_score"]
        
        return scores
    
    def build_document_nodes(self) -> Dict[str, DocumentNode]:
        """构建文档节点"""
        documents = {}
        quality_scores = self.load_quality_scores()
        
        for file in self.base_path.rglob("*.md"):
            if file.name == "README.md":
                continue
            
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                title = self.extract_title(content)
                description = self.extract_description(content)
                keywords = self.extract_keywords(content)
                concepts = self.extract_concepts(content)
                references = self.extract_references(content, file.name)
                category = self.classify_document(file.name, content)
                quality_score = quality_scores.get(file.name, 0.0)
                
                node = DocumentNode(
                    file_path=str(file),
                    file_name=file.name,
                    doc_type="architecture" if "架构类" in file.name else "technique",
                    title=title,
                    description=description,
                    keywords=keywords,
                    concepts=concepts,
                    references=references,
                    referenced_by=[],
                    category=category,
                    quality_score=quality_score
                )
                
                documents[file.name] = node
                print(f"✓ 已处理: {file.name}")
                
            except Exception as e:
                print(f"✗ 处理失败: {file.name} - {e}")
        
        return documents
    
    def build_concept_nodes(self, documents: Dict[str, DocumentNode]) -> Dict[str, ConceptNode]:
        """构建概念节点"""
        concepts = defaultdict(lambda: {
            "name": "",
            "category": "",
            "frequency": 0,
            "documents": [],
            "related_concepts": []
        })
        
        # 统计概念频率
        for doc_name, doc_node in documents.items():
            for concept in doc_node.concepts:
                concepts[concept]["name"] = concept
                concepts[concept]["frequency"] += 1
                concepts[concept]["documents"].append(doc_name)
        
        # 构建概念节点
        concept_nodes = {}
        for concept_name, concept_data in concepts.items():
            # 分类概念
            category = "技术"
            if "架构" in concept_name:
                category = "架构"
            elif "开发" in concept_name or "测试" in concept_name:
                category = "开发"
            elif "部署" in concept_name or "运维" in concept_name:
                category = "运维"
            elif "需求" in concept_name or "用户" in concept_name:
                category = "产品"
            
            # 计算重要性（频率 * 文档质量平均分）
            doc_scores = [documents[doc].quality_score for doc in concept_data["documents"]]
            avg_score = sum(doc_scores) / len(doc_scores) if doc_scores else 0
            importance = concept_data["frequency"] * avg_score / 100
            
            concept_node = ConceptNode(
                name=concept_name,
                category=category,
                frequency=concept_data["frequency"],
                documents=concept_data["documents"],
                related_concepts=[],
                importance=importance
            )
            
            concept_nodes[concept_name] = concept_node
        
        return concept_nodes
    
    def build_edges(self, documents: Dict[str, DocumentNode]) -> List[Dict]:
        """构建边"""
        edges = []
        
        # 构建文档引用边
        for doc_name, doc_node in documents.items():
            for ref in doc_node.references:
                # 查找被引用的文档
                for other_name, other_node in documents.items():
                    if ref in other_name or ref in other_node.title:
                        edges.append({
                            "source": doc_name,
                            "target": other_name,
                            "type": "reference",
                            "weight": 1.0
                        })
                        
                        # 记录被引用关系
                        if doc_name not in other_node.referenced_by:
                            other_node.referenced_by.append(doc_name)
                        break
        
        # 构建概念关联边
        for doc_name, doc_node in documents.items():
            for concept in doc_node.concepts:
                for other_name, other_node in documents.items():
                    if doc_name == other_name:
                        continue
                    
                    # 如果两个文档共享概念，建立关联
                    shared_concepts = set(doc_node.concepts) & set(other_node.concepts)
                    if shared_concepts:
                        edges.append({
                            "source": doc_name,
                            "target": other_name,
                            "type": "concept",
                            "weight": len(shared_concepts),
                            "concepts": list(shared_concepts)
                        })
        
        return edges
    
    def calculate_centrality(self, documents: Dict[str, DocumentNode], edges: List[Dict]):
        """计算中心性"""
        # 计算度中心性（入度+出度）
        for doc_name, doc_node in documents.items():
            in_degree = len(doc_node.referenced_by)
            out_degree = len(doc_node.references)
            doc_node.centrality = in_degree * 2 + out_degree  # 入度权重更高
    
    def calculate_importance(self, documents: Dict[str, DocumentNode]):
        """计算重要性"""
        max_centrality = max(doc.centrality for doc in documents.values()) if documents else 1
        max_quality = max(doc.quality_score for doc in documents.values()) if documents else 1
        
        for doc_node in documents.values():
            # 重要性 = 中心性(40%) + 质量评分(40%) + 引用数(20%)
            centrality_score = doc_node.centrality / max_centrality if max_centrality > 0 else 0
            quality_score = doc_node.quality_score / max_quality if max_quality > 0 else 0
            reference_score = len(doc_node.referenced_by) / len(documents) if documents else 0
            
            doc_node.importance = centrality_score * 0.4 + quality_score * 0.4 + reference_score * 0.2
    
    def build_graph(self) -> KnowledgeGraph:
        """构建知识图谱"""
        print("=" * 80)
        print("构建文档知识图谱")
        print("=" * 80)
        print()
        
        # 构建文档节点
        print("步骤1: 构建文档节点...")
        documents = self.build_document_nodes()
        self.graph.documents = documents
        self.graph.total_documents = len(documents)
        print(f"✓ 已构建 {len(documents)} 个文档节点\n")
        
        # 构建概念节点
        print("步骤2: 构建概念节点...")
        concepts = self.build_concept_nodes(documents)
        self.graph.concepts = concepts
        self.graph.total_concepts = len(concepts)
        print(f"✓ 已构建 {len(concepts)} 个概念节点\n")
        
        # 构建边
        print("步骤3: 构建边...")
        edges = self.build_edges(documents)
        self.graph.edges = edges
        self.graph.total_edges = len(edges)
        print(f"✓ 已构建 {len(edges)} 条边\n")
        
        # 计算中心性
        print("步骤4: 计算中心性...")
        self.calculate_centrality(documents, edges)
        print("✓ 已计算中心性\n")
        
        # 计算重要性
        print("步骤5: 计算重要性...")
        self.calculate_importance(documents)
        print("✓ 已计算重要性\n")
        
        return self.graph
    
    def save_graph(self, output_dir: Path):
        """保存知识图谱"""
        output_dir.mkdir(exist_ok=True)
        
        # 保存JSON格式
        json_file = output_dir / f"YYC3-文档知识图谱_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        graph_data = {
            "timestamp": datetime.now().isoformat(),
            "statistics": {
                "total_documents": self.graph.total_documents,
                "total_concepts": self.graph.total_concepts,
                "total_edges": self.graph.total_edges
            },
            "documents": [
                {
                    "name": node.file_name,
                    "title": node.title,
                    "category": node.category,
                    "keywords": node.keywords,
                    "concepts": node.concepts,
                    "quality_score": node.quality_score,
                    "centrality": node.centrality,
                    "importance": node.importance,
                    "references": node.references,
                    "referenced_by": node.referenced_by
                }
                for node in self.graph.documents.values()
            ],
            "concepts": [
                {
                    "name": node.name,
                    "category": node.category,
                    "frequency": node.frequency,
                    "documents": node.documents,
                    "importance": node.importance
                }
                for node in self.graph.concepts.values()
            ],
            "edges": self.graph.edges
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(graph_data, f, ensure_ascii=False, indent=2)
        
        print(f"JSON图谱已保存到: {json_file}")
        
        # 保存可视化数据（用于D3.js等可视化库）
        self.save_visualization_data(output_dir)
        
        # 生成Markdown报告
        self.generate_markdown_report(output_dir)
    
    def save_visualization_data(self, output_dir: Path):
        """保存可视化数据"""
        vis_file = output_dir / f"YYC3-文档知识图谱可视化_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # 构建节点和边
        nodes = []
        links = []
        
        # 添加文档节点
        for doc_name, doc_node in self.graph.documents.items():
            nodes.append({
                "id": doc_name,
                "type": "document",
                "title": doc_node.title,
                "category": doc_node.category,
                "size": 10 + doc_node.importance * 30,
                "color": self.get_category_color(doc_node.category),
                "importance": doc_node.importance,
                "quality": doc_node.quality_score
            })
        
        # 添加概念节点
        for concept_name, concept_node in self.graph.concepts.items():
            nodes.append({
                "id": f"concept_{concept_name}",
                "type": "concept",
                "title": concept_name,
                "category": concept_node.category,
                "size": 5 + concept_node.importance * 20,
                "color": self.get_concept_color(concept_node.category),
                "importance": concept_node.importance,
                "frequency": concept_node.frequency
            })
        
        # 添加边
        for edge in self.graph.edges:
            links.append({
                "source": edge["source"],
                "target": edge["target"],
                "type": edge["type"],
                "weight": edge["weight"]
            })
        
        vis_data = {
            "nodes": nodes,
            "links": links
        }
        
        with open(vis_file, 'w', encoding='utf-8') as f:
            json.dump(vis_data, f, ensure_ascii=False, indent=2)
        
        print(f"可视化数据已保存到: {vis_file}")
    
    def get_category_color(self, category: str) -> str:
        """获取分类颜色"""
        colors = {
            "架构设计": "#FF6B6B",
            "开发实施": "#4ECDC4",
            "测试验证": "#45B7D1",
            "部署发布": "#96CEB4",
            "运维运营": "#FFEAA7",
            "需求规划": "#DDA0DD",
            "用户指南": "#98D8C8",
            "归类迭代": "#F7DC6F",
            "其他": "#BDC3C7"
        }
        return colors.get(category, "#BDC3C7")
    
    def get_concept_color(self, category: str) -> str:
        """获取概念颜色"""
        colors = {
            "架构": "#E74C3C",
            "开发": "#3498DB",
            "运维": "#2ECC71",
            "产品": "#9B59B6",
            "技术": "#F39C12"
        }
        return colors.get(category, "#95A5A6")
    
    def generate_markdown_report(self, output_dir: Path):
        """生成Markdown报告"""
        md_file = output_dir / f"YYC3-文档知识图谱报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        # 按重要性排序文档
        sorted_docs = sorted(
            self.graph.documents.values(),
            key=lambda x: x.importance,
            reverse=True
        )
        
        # 按重要性排序概念
        sorted_concepts = sorted(
            self.graph.concepts.values(),
            key=lambda x: x.importance,
            reverse=True
        )
        
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write("# YYC³ 文档知识图谱报告\n\n")
            f.write(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            f.write("## 📊 图谱统计\n\n")
            f.write(f"- **文档节点数**: {self.graph.total_documents}\n")
            f.write(f"- **概念节点数**: {self.graph.total_concepts}\n")
            f.write(f"- **边数**: {self.graph.total_edges}\n\n")
            
            f.write("## 📄 重要文档TOP20\n\n")
            f.write("| 排名 | 文档名称 | 分类 | 重要性 | 质量评分 | 中心性 |\n")
            f.write("|------|---------|------|--------|---------|--------|\n")
            for i, doc in enumerate(sorted_docs[:20], 1):
                f.write(f"| {i} | {doc.file_name[:30]} | {doc.category} | {doc.importance:.3f} | {doc.quality_score:.1f} | {doc.centrality:.0f} |\n")
            f.write("\n")
            
            f.write("## 💡 重要概念TOP20\n\n")
            f.write("| 排名 | 概念名称 | 分类 | 频率 | 重要性 | 文档数 |\n")
            f.write("|------|---------|------|------|--------|--------|\n")
            for i, concept in enumerate(sorted_concepts[:20], 1):
                f.write(f"| {i} | {concept.name} | {concept.category} | {concept.frequency} | {concept.importance:.3f} | {len(concept.documents)} |\n")
            f.write("\n")
            
            f.write("## 🔗 文档引用关系\n\n")
            f.write("### 引用最多的文档TOP10\n\n")
            most_referenced = sorted(
                self.graph.documents.values(),
                key=lambda x: len(x.referenced_by),
                reverse=True
            )[:10]
            f.write("| 排名 | 文档名称 | 被引用次数 | 引用者 |\n")
            f.write("|------|---------|-----------|--------|\n")
            for i, doc in enumerate(most_referenced, 1):
                ref_by = ", ".join(doc.referenced_by[:3])
                if len(doc.referenced_by) > 3:
                    ref_by += f" 等{len(doc.referenced_by)}个"
                f.write(f"| {i} | {doc.file_name[:30]} | {len(doc.referenced_by)} | {ref_by} |\n")
            f.write("\n")
            
            f.write("### 引用最多的文档TOP10\n\n")
            most_referencing = sorted(
                self.graph.documents.values(),
                key=lambda x: len(x.references),
                reverse=True
            )[:10]
            f.write("| 排名 | 文档名称 | 引用次数 | 被引用文档 |\n")
            f.write("|------|---------|---------|----------|\n")
            for i, doc in enumerate(most_referencing, 1):
                refs = ", ".join(doc.references[:3])
                if len(doc.references) > 3:
                    refs += f" 等{len(doc.references)}个"
                f.write(f"| {i} | {doc.file_name[:30]} | {len(doc.references)} | {refs} |\n")
            f.write("\n")
            
            f.write("## 📂 文档分类统计\n\n")
            category_stats = defaultdict(int)
            for doc in self.graph.documents.values():
                category_stats[doc.category] += 1
            
            f.write("| 分类 | 文档数 | 占比 |\n")
            f.write("|------|--------|------|\n")
            total = len(self.graph.documents)
            for category, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
                percentage = count / total * 100 if total > 0 else 0
                f.write(f"| {category} | {count} | {percentage:.1f}% |\n")
            f.write("\n")
            
            f.write("## 📈 质量与重要性分析\n\n")
            f.write("### 高质量高重要性文档\n\n")
            high_quality_high_importance = [
                doc for doc in self.graph.documents.values()
                if doc.quality_score >= 80 and doc.importance >= 0.5
            ]
            for doc in high_quality_high_importance[:10]:
                f.write(f"- **{doc.file_name}**: 质量{doc.quality_score:.1f}, 重要性{doc.importance:.3f}\n")
            f.write("\n")
            
            f.write("### 低质量高重要性文档（需优先改进）\n\n")
            low_quality_high_importance = [
                doc for doc in self.graph.documents.values()
                if doc.quality_score < 70 and doc.importance >= 0.5
            ]
            if low_quality_high_importance:
                for doc in low_quality_high_importance[:10]:
                    f.write(f"- **{doc.file_name}**: 质量{doc.quality_score:.1f}, 重要性{doc.importance:.3f}\n")
            else:
                f.write("无低质量高重要性文档\n")
            f.write("\n")
        
        print(f"Markdown报告已保存到: {md_file}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 文档知识图谱构建工具')
    parser.add_argument('--base-path', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环',
                       help='文档根目录路径')
    parser.add_argument('--output-dir', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告',
                       help='输出目录')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("YYC³ 文档知识图谱构建工具 - 第三阶段（P2）")
    print("=" * 80)
    print(f"文档目录: {args.base_path}")
    print(f"输出目录: {args.output_dir}")
    print("=" * 80)
    print()
    
    builder = DocumentKnowledgeGraphBuilder(args.base_path)
    builder.build_graph()
    
    print()
    print("=" * 80)
    print("知识图谱构建完成")
    print("=" * 80)
    print(f"\n文档节点: {builder.graph.total_documents}")
    print(f"概念节点: {builder.graph.total_concepts}")
    print(f"边: {builder.graph.total_edges}")
    print("=" * 80)
    
    builder.save_graph(Path(args.output_dir))
    
    print("\n✓ 文档知识图谱构建完成！")


if __name__ == "__main__":
    main()
