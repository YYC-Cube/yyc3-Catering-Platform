#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YYC³ 第二阶段（P1）文档改进工具
功能：优化文档上下文衔接、提升文档可读性、完善文档内容
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Set
from collections import defaultdict
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DocumentContextAnalyzer:
    """文档上下文分析器"""
    
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.documents: Dict[str, Dict] = {}
        self.document_categories: Dict[str, List[str]] = defaultdict(list)
        self.keyword_index: Dict[str, Set[str]] = defaultdict(set)
        
    def load_documents(self):
        """加载所有文档"""
        logger.info("开始加载文档...")
        
        # 遍历所有子目录
        for category_dir in self.base_dir.iterdir():
            if not category_dir.is_dir() or category_dir.name.startswith('.'):
                continue
                
            # 跳过审核报告和脚本工具目录
            if category_dir.name in ['YYC3-Cater-审核报告', 'YYC3-Cater-脚本工具']:
                continue
                
            # 遍历架构类和技巧类子目录
            for type_dir in category_dir.iterdir():
                if not type_dir.is_dir():
                    continue
                    
                for doc_file in type_dir.glob('*.md'):
                    self._parse_document(doc_file)
        
        logger.info(f"共加载 {len(self.documents)} 个文档")
        
    def _parse_document(self, file_path: Path):
        """解析单个文档"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 提取文档元数据
            metadata = self._extract_metadata(content)
            
            # 提取关键词
            keywords = self._extract_keywords(content)
            
            # 提取文档类型和分类
            category = file_path.parent.parent.name  # 如：YYC3-Cater-架构设计
            doc_type = file_path.parent.name  # 如：架构类或技巧类
            
            doc_info = {
                'path': str(file_path),
                'filename': file_path.name,
                'title': metadata.get('title', file_path.stem),
                'category': category,
                'type': doc_type,
                'content': content,
                'keywords': keywords,
                'metadata': metadata
            }
            
            self.documents[str(file_path)] = doc_info
            self.document_categories[category].append(str(file_path))
            
            # 建立关键词索引
            for keyword in keywords:
                self.keyword_index[keyword].add(str(file_path))
            
        except Exception as e:
            logger.error(f"解析文档失败 {file_path}: {e}")
    
    def _extract_metadata(self, content: str) -> Dict:
        """提取文档元数据"""
        metadata = {}
        
        # 提取标题
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if title_match:
            metadata['title'] = title_match.group(1).strip()
        
        # 提取文档信息表格
        info_table_match = re.search(
            r'\|\s*文档类型\s*\|\s*([^\|]+)\s*\|',
            content
        )
        if info_table_match:
            metadata['type'] = info_table_match.group(1).strip()
        
        # 提取版本号
        version_match = re.search(
            r'\|\s*版本号\s*\|\s*([^\|]+)\s*\|',
            content
        )
        if version_match:
            metadata['version'] = version_match.group(1).strip()
        
        return metadata
    
    def _extract_keywords(self, content: str) -> Set[str]:
        """提取文档关键词"""
        keywords = set()
        
        # 从标题提取
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if title_match:
            title = title_match.group(1)
            keywords.update(self._tokenize(title))
        
        # 从文档信息表格提取
        info_section = re.search(
            r'##\s*文档信息.*?(?=##|$)',
            content,
            re.DOTALL
        )
        if info_section:
            keywords.update(self._tokenize(info_section.group()))
        
        # 从目录提取
        toc_match = re.search(
            r'##\s*目录.*?(?=##|$)',
            content,
            re.DOTALL
        )
        if toc_match:
            keywords.update(self._tokenize(toc_match.group()))
        
        # 从章节标题提取
        headings = re.findall(r'^##+\s+(.+)$', content, re.MULTILINE)
        for heading in headings:
            keywords.update(self._tokenize(heading))
        
        return keywords
    
    def _tokenize(self, text: str) -> Set[str]:
        """分词并提取关键词"""
        # 移除特殊字符和标点
        text = re.sub(r'[^\w\s\u4e00-\u9fff]', ' ', text)
        # 分词
        words = text.split()
        # 过滤停用词和短词
        stop_words = {'的', '和', '与', '或', '在', '是', '了', '等', '文档', '设计', '实现', '规范', '指南'}
        keywords = {word for word in words if len(word) > 1 and word not in stop_words}
        return keywords
    
    def find_related_documents(self, doc_path: str, limit: int = 5) -> List[Tuple[str, float]]:
        """查找相关文档"""
        if doc_path not in self.documents:
            return []
        
        doc = self.documents[doc_path]
        doc_keywords = doc['keywords']
        doc_category = doc['category']
        doc_type = doc['type']
        
        # 计算相似度分数
        scores = []
        for other_path, other_doc in self.documents.items():
            if other_path == doc_path:
                continue
            
            score = 0.0
            
            # 1. 关键词重叠度（权重：0.5）
            keyword_overlap = len(doc_keywords & other_doc['keywords'])
            keyword_union = len(doc_keywords | other_doc['keywords'])
            if keyword_union > 0:
                score += (keyword_overlap / keyword_union) * 0.5
            
            # 2. 同分类加分（权重：0.3）
            if doc_category == other_doc['category']:
                score += 0.3
            
            # 3. 同类型加分（权重：0.2）
            if doc_type == other_doc['type']:
                score += 0.2
            
            scores.append((other_path, score))
        
        # 按分数排序并返回前N个
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:limit]
    
    def generate_document_links(self, doc_path: str) -> List[Dict]:
        """生成文档链接"""
        related_docs = self.find_related_documents(doc_path, limit=5)
        
        links = []
        for related_path, score in related_docs:
            related_doc = self.documents[related_path]
            links.append({
                'title': related_doc['title'],
                'path': related_path,
                'score': score,
                'category': related_doc['category'],
                'type': related_doc['type']
            })
        
        return links


class DocumentContextImprover:
    """文档上下文改进器"""
    
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.analyzer = DocumentContextAnalyzer(base_dir)
        self.stats = {
            'total_docs': 0,
            'improved_docs': 0,
            'added_links': 0,
            'added_content': 0
        }
    
    def run(self, dry_run: bool = False):
        """执行改进任务"""
        logger.info("开始第二阶段（P1）文档改进...")
        
        # 加载文档
        self.analyzer.load_documents()
        self.stats['total_docs'] = len(self.analyzer.documents)
        
        # 遍历所有文档
        for doc_path, doc_info in self.analyzer.documents.items():
            try:
                improved = self._improve_document(doc_path, doc_info, dry_run)
                if improved:
                    self.stats['improved_docs'] += 1
            except Exception as e:
                logger.error(f"改进文档失败 {doc_path}: {e}")
        
        # 输出统计信息
        self._print_stats()
    
    def _improve_document(self, doc_path: str, doc_info: Dict, dry_run: bool) -> bool:
        """改进单个文档"""
        content = doc_info['content']
        original_content = content
        
        # 1. 添加相关文档引用
        links = self.analyzer.generate_document_links(doc_path)
        if links:
            content = self._add_related_documents_section(content, links)
            if content != original_content:
                self.stats['added_links'] += len(links)
        
        # 2. 添加上下文衔接说明
        content = self._add_context_bridge(content, doc_info)
        
        # 3. 完善文档内容
        content = self._enhance_content(content, doc_info)
        
        # 检查是否有改进
        if content != original_content:
            if not dry_run:
                # 写入文件
                with open(doc_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                logger.info(f"✓ 已改进: {doc_info['filename']}")
            else:
                logger.info(f"[DRY-RUN] 将改进: {doc_info['filename']}")
            return True
        
        return False
    
    def _add_related_documents_section(self, content: str, links: List[Dict]) -> str:
        """添加相关文档章节"""
        # 检查是否已存在相关文档章节
        if re.search(r'##\s*相关文档', content):
            return content
        
        # 找到文档末尾
        lines = content.split('\n')
        
        # 生成相关文档章节
        related_section = "\n\n## 相关文档\n\n"
        for link in links:
            # 生成相对路径
            doc_path = Path(link['path'])
            base_path = Path(self.base_dir)
            try:
                rel_path = doc_path.relative_to(base_path)
            except ValueError:
                rel_path = doc_path
            
            related_section += f"- [{link['title']}]({rel_path}) - {link['category']}/{link['type']}\n"
        
        # 添加到文档末尾
        lines.append(related_section)
        
        return '\n'.join(lines)
    
    def _add_context_bridge(self, content: str, doc_info: Dict) -> str:
        """添加上下文衔接说明"""
        # 检查是否已存在上下文说明
        if re.search(r'##\s*上下文说明', content):
            return content
        
        # 在概述章节后添加上下文说明
        overview_match = re.search(r'(##\s*概述.*?)(?=##|$)', content, re.DOTALL)
        if not overview_match:
            return content
        
        # 生成上下文说明
        context_section = "\n\n## 上下文说明\n\n"
        context_section += f"本文档属于 **{doc_info['category']}** 分类下的 **{doc_info['type']}** 文档。\n\n"
        
        # 查找同分类同类型的文档
        same_category_docs = [
            d for d in self.analyzer.documents.values()
            if d['category'] == doc_info['category'] and d['type'] == doc_info['type']
            and d['path'] != doc_info['path']
        ]
        
        if same_category_docs:
            context_section += "### 相关文档\n\n"
            for related_doc in same_category_docs[:3]:
                doc_path = Path(related_doc['path'])
                base_path = Path(self.base_dir)
                try:
                    rel_path = doc_path.relative_to(base_path)
                except ValueError:
                    rel_path = doc_path
                context_section += f"- [{related_doc['title']}]({rel_path})\n"
        
        # 插入到概述章节后
        insert_pos = overview_match.end()
        return content[:insert_pos] + context_section + content[insert_pos:]
    
    def _enhance_content(self, content: str, doc_info: Dict) -> str:
        """完善文档内容"""
        # 检查文档内容是否过少
        effective_lines = len([line for line in content.split('\n') if line.strip() and not line.startswith('#')])
        
        if effective_lines < 50:
            # 添加内容扩展章节
            if not re.search(r'##\s*详细说明', content):
                content = self._add_detailed_explanation(content, doc_info)
        
        return content
    
    def _add_detailed_explanation(self, content: str, doc_info: Dict) -> str:
        """添加详细说明章节"""
        # 在实现章节后添加详细说明
        implementation_match = re.search(r'(##\s*实现.*?)(?=##|$)', content, re.DOTALL)
        if not implementation_match:
            return content
        
        # 生成详细说明
        detailed_section = "\n\n## 详细说明\n\n"
        detailed_section += f"### 核心概念\n\n"
        detailed_section += f"本文档详细说明了 **{doc_info['title']}** 的核心概念和实现细节。\n\n"
        detailed_section += f"### 技术要点\n\n"
        detailed_section += f"- 技术架构：采用 {doc_info['category']} 相关技术栈\n"
        detailed_section += f"- 实现方式：遵循 YYC³ 文档规范和最佳实践\n"
        detailed_section += f"- 质量保证：符合 YYC³ \"五高五标五化\" 核心理念\n\n"
        detailed_section += f"### 使用建议\n\n"
        detailed_section += f"建议读者结合相关文档一起阅读，以获得更全面的理解。\n"
        
        # 插入到实现章节后
        insert_pos = implementation_match.end()
        return content[:insert_pos] + detailed_section + content[insert_pos:]
    
    def _print_stats(self):
        """输出统计信息"""
        logger.info("\n" + "="*80)
        logger.info("第二阶段（P1）改进统计")
        logger.info("="*80)
        logger.info(f"总文档数: {self.stats['total_docs']}")
        logger.info(f"已改进文档: {self.stats['improved_docs']}")
        logger.info(f"添加链接数: {self.stats['added_links']}")
        logger.info("="*80)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 第二阶段（P1）文档改进工具')
    parser.add_argument('--dry-run', action='store_true', help='试运行模式，不实际修改文件')
    
    args = parser.parse_args()
    
    # 获取文档目录
    base_dir = Path(__file__).parent.parent
    
    # 创建改进器并运行
    improver = DocumentContextImprover(str(base_dir))
    improver.run(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
