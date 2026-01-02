#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
@file: yyc3-phase1-improvement.py
@description: YYC³文档闭环系统第一阶段（P0）改进脚本
@author: YYC³
@version: 1.0.0
@created: 2025-01-30
@copyright: Copyright (c) 2025 YYC³
@license: MIT
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
import sys

# 文档根目录
DOCS_ROOT = "/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环"

# 标准章节模板
STANDARD_SECTIONS = {
    "架构设计": [
        "## 1. 概述",
        "### 1.1 设计目标",
        "### 1.2 设计原则",
        "### 1.3 技术选型",
        "## 2. 架构设计",
        "### 2.1 整体架构",
        "### 2.2 模块划分",
        "### 2.3 数据流向",
        "## 3. 技术实现",
        "### 3.1 核心技术",
        "### 3.2 关键算法",
        "### 3.3 性能优化",
        "## 4. 接口设计",
        "### 4.1 API接口",
        "### 4.2 数据接口",
        "### 4.3 消息接口",
        "## 5. 部署方案",
        "### 5.1 部署架构",
        "### 5.2 配置管理",
        "### 5.3 监控告警",
        "## 6. 附录",
        "### 6.1 术语表",
        "### 6.2 参考资料"
    ],
    "开发实施": [
        "## 1. 概述",
        "### 1.1 功能说明",
        "### 1.2 技术栈",
        "### 1.3 开发环境",
        "## 2. 实现方案",
        "### 2.1 代码结构",
        "### 2.2 核心逻辑",
        "### 2.3 数据处理",
        "## 3. 接口文档",
        "### 3.1 API接口",
        "### 3.2 请求参数",
        "### 3.3 响应格式",
        "## 4. 测试方案",
        "### 4.1 单元测试",
        "### 4.2 集成测试",
        "### 4.3 测试用例",
        "## 5. 部署指南",
        "### 5.1 环境准备",
        "### 5.2 部署步骤",
        "### 5.3 验证方法",
        "## 6. 常见问题",
        "### 6.1 问题排查",
        "### 6.2 解决方案"
    ],
    "技巧类": [
        "## 1. 概述",
        "### 1.1 技巧说明",
        "### 1.2 适用场景",
        "### 1.3 注意事项",
        "## 2. 技巧详解",
        "### 2.1 核心技巧",
        "### 2.2 实践案例",
        "### 2.3 最佳实践",
        "## 3. 实施指南",
        "### 3.1 实施步骤",
        "### 3.2 关键要点",
        "### 3.3 常见问题",
        "## 4. 工具推荐",
        "### 4.1 推荐工具",
        "### 4.2 使用方法",
        "### 4.3 效果对比",
        "## 5. 参考资源",
        "### 5.1 官方文档",
        "### 5.2 社区资源",
        "### 5.3 学习资料"
    ],
    "默认": [
        "## 1. 概述",
        "### 1.1 说明",
        "### 1.2 目标",
        "### 1.3 范围",
        "## 2. 详细内容",
        "### 2.1 核心内容",
        "### 2.2 实现细节",
        "### 2.3 注意事项",
        "## 3. 参考信息",
        "### 3.1 相关文档",
        "### 3.2 参考资料",
        "### 3.3 附录"
    ]
}

# 文档信息表格模板
DOC_INFO_TABLE = """## 📋 文档信息

| 属性 | 内容 |
|------|------|
| **文档标题** | {title} |
| **文档类型** | {doc_type} |
| **所属阶段** | {phase} |
| **遵循规范** | YYC³ 团队标准化规范 v1.0.0 |
| **版本号** | {version} |
| **创建日期** | {created} |
| **作者** | YYC³ Team |
| **更新日期** | {updated} |

---

"""

# 目录模板
TOC_TEMPLATE = """## 📑 目录

{toc_items}

---

"""

class DocumentImprover:
    """文档改进器"""
    
    def __init__(self, docs_root: str):
        self.docs_root = Path(docs_root)
        self.stats = {
            "total_docs": 0,
            "short_content": 0,
            "missing_sections": 0,
            "missing_toc": 0,
            "missing_info_table": 0,
            "improved": 0
        }
    
    def find_all_markdown_files(self) -> List[Path]:
        """查找所有Markdown文件"""
        md_files = []
        for root, dirs, files in os.walk(self.docs_root):
            # 跳过脚本工具文件夹
            if "脚本工具" in root:
                continue
            for file in files:
                if file.endswith('.md'):
                    md_files.append(Path(root) / file)
        return md_files
    
    def analyze_document(self, file_path: Path) -> Dict:
        """分析文档"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ 无法读取文件 {file_path}: {e}")
            return None
        
        lines = content.split('\n')
        
        # 统计有效内容行数（排除空行和注释行）
        content_lines = [line for line in lines if line.strip() and not line.strip().startswith('#')]
        effective_lines = len(content_lines)
        
        # 检查是否有文档信息表格
        has_info_table = '## 📋 文档信息' in content or '## 文档信息' in content
        
        # 检查是否有目录
        has_toc = '## 📑 目录' in content or '## 目录' in content
        
        # 检查是否有标准章节
        has_standard_sections = any(section in content for section in ['## 1. 概述', '## 1. 说明'])
        
        # 提取文档元数据
        metadata = self.extract_metadata(content, file_path)
        
        return {
            'file_path': file_path,
            'effective_lines': effective_lines,
            'has_info_table': has_info_table,
            'has_toc': has_toc,
            'has_standard_sections': has_standard_sections,
            'metadata': metadata,
            'content': content
        }
    
    def extract_metadata(self, content: str, file_path: Path) -> Dict:
        """提取文档元数据"""
        metadata = {
            'title': '',
            'doc_type': '',
            'phase': '',
            'version': 'v1.0.0',
            'created': '2025-01-30',
            'updated': '2025-01-30'
        }
        
        # 从文件头部提取元数据
        lines = content.split('\n')[:20]
        for line in lines:
            if line.startswith('**@description**：'):
                metadata['title'] = line.split('：', 1)[1].strip()
            elif line.startswith('**@version**：'):
                metadata['version'] = line.split('：', 1)[1].strip()
            elif line.startswith('**@created**：'):
                metadata['created'] = line.split('：', 1)[1].strip()
            elif line.startswith('**@updated**：'):
                metadata['updated'] = line.split('：', 1)[1].strip()
        
        # 从文件路径推断文档类型和阶段
        path_parts = str(file_path).split('/')
        for part in path_parts:
            if '架构设计' in part:
                metadata['doc_type'] = '架构设计文档'
                metadata['phase'] = '架构设计'
            elif '开发实施' in part:
                metadata['doc_type'] = '开发实施文档'
                metadata['phase'] = '开发实施'
            elif '技巧类' in part:
                metadata['doc_type'] = '技巧类文档'
                metadata['phase'] = '开发实施'
            elif '部署发布' in part:
                metadata['doc_type'] = '部署发布文档'
                metadata['phase'] = '部署发布'
            elif '运维运营' in part:
                metadata['doc_type'] = '运维运营文档'
                metadata['phase'] = '运维运营'
            elif '测试验证' in part:
                metadata['doc_type'] = '测试验证文档'
                metadata['phase'] = '测试验证'
            elif '需求规划' in part:
                metadata['doc_type'] = '需求规划文档'
                metadata['phase'] = '需求规划'
            elif '用户指南' in part:
                metadata['doc_type'] = '用户指南文档'
                metadata['phase'] = '用户指南'
            elif '归类迭代' in part:
                metadata['doc_type'] = '归类迭代文档'
                metadata['phase'] = '归类迭代'
        
        if not metadata['title']:
            metadata['title'] = file_path.stem
        
        return metadata
    
    def generate_toc(self, content: str) -> str:
        """生成目录"""
        lines = content.split('\n')
        toc_items = []
        
        for line in lines:
            if line.startswith('##'):
                # 提取标题级别和文本
                match = re.match(r'^(#{2,4})\s+(.+)', line)
                if match:
                    level = len(match.group(1))
                    text = match.group(2)
                    # 生成锚点
                    anchor = text.lower().replace(' ', '-').replace('：', '').replace('：', '')
                    indent = '  ' * (level - 2)
                    toc_items.append(f"{indent}- [{text}](#{anchor})")
        
        return '\n'.join(toc_items)
    
    def improve_document(self, doc_info: Dict) -> bool:
        """改进文档"""
        content = doc_info['content']
        metadata = doc_info['metadata']
        file_path = doc_info['file_path']
        
        improved = False
        new_content = content
        
        # 1. 添加文档信息表格
        if not doc_info['has_info_table']:
            print(f"  📝 添加文档信息表格: {file_path.name}")
            
            # 找到插入位置（在文档头部之后）
            header_end = new_content.find('---\n\n')
            if header_end != -1:
                insert_pos = header_end + 5
                info_table = DOC_INFO_TABLE.format(
                    title=metadata['title'],
                    doc_type=metadata['doc_type'],
                    phase=metadata['phase'],
                    version=metadata['version'],
                    created=metadata['created'],
                    updated=metadata['updated']
                )
                new_content = new_content[:insert_pos] + info_table + new_content[insert_pos:]
                improved = True
                self.stats['missing_info_table'] += 1
        
        # 2. 添加目录
        if not doc_info['has_toc']:
            print(f"  📑 添加目录: {file_path.name}")
            
            # 找到文档信息表格之后的位置
            info_table_end = new_content.find('---\n\n', new_content.find('## 📋 文档信息'))
            if info_table_end != -1:
                insert_pos = info_table_end + 5
                
                # 生成目录
                toc_items = self.generate_toc(new_content)
                if toc_items:
                    toc = TOC_TEMPLATE.format(toc_items=toc_items)
                    new_content = new_content[:insert_pos] + toc + new_content[insert_pos:]
                    improved = True
                    self.stats['missing_toc'] += 1
        
        # 3. 添加标准章节（如果缺少）
        if not doc_info['has_standard_sections']:
            print(f"  📚 添加标准章节: {file_path.name}")
            
            # 确定使用哪个章节模板
            phase = metadata['phase']
            if phase in STANDARD_SECTIONS:
                sections = STANDARD_SECTIONS[phase]
            else:
                sections = STANDARD_SECTIONS['默认']
            
            # 找到目录之后的位置
            toc_end = new_content.find('---\n\n', new_content.find('## 📑 目录'))
            if toc_end != -1:
                insert_pos = toc_end + 5
                sections_text = '\n\n'.join(sections) + '\n\n'
                new_content = new_content[:insert_pos] + sections_text + new_content[insert_pos:]
                improved = True
                self.stats['missing_sections'] += 1
        
        # 4. 补充内容过少的文档
        if doc_info['effective_lines'] < 50:
            print(f"  ⚠️  内容过少 ({doc_info['effective_lines']}行): {file_path.name}")
            self.stats['short_content'] += 1
            # 这里可以添加补充内容的逻辑
        
        # 保存改进后的文档
        if improved:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                self.stats['improved'] += 1
                print(f"  ✅ 已改进: {file_path.name}")
                return True
            except Exception as e:
                print(f"  ❌ 保存失败: {e}")
                return False
        
        return False
    
    def run(self, dry_run: bool = False):
        """运行改进流程"""
        print("🚀 开始执行第一阶段（P0）文档改进...")
        print(f"📁 文档根目录: {self.docs_root}")
        print()
        
        # 查找所有Markdown文件
        md_files = self.find_all_markdown_files()
        self.stats['total_docs'] = len(md_files)
        
        print(f"📊 找到 {len(md_files)} 个Markdown文件")
        print()
        
        # 分析和改进每个文档
        for i, file_path in enumerate(md_files, 1):
            print(f"[{i}/{len(md_files)}] 处理: {file_path.name}")
            
            doc_info = self.analyze_document(file_path)
            if doc_info:
                if not dry_run:
                    self.improve_document(doc_info)
                else:
                    # 仅分析，不修改
                    if doc_info['effective_lines'] < 50:
                        print(f"  ⚠️  内容过少 ({doc_info['effective_lines']}行)")
                        self.stats['short_content'] += 1
                    if not doc_info['has_info_table']:
                        print(f"  📝 缺少文档信息表格")
                        self.stats['missing_info_table'] += 1
                    if not doc_info['has_toc']:
                        print(f"  📑 缺少目录")
                        self.stats['missing_toc'] += 1
                    if not doc_info['has_standard_sections']:
                        print(f"  📚 缺少标准章节")
                        self.stats['missing_sections'] += 1
            
            print()
        
        # 打印统计信息
        self.print_stats()
    
    def print_stats(self):
        """打印统计信息"""
        print("=" * 60)
        print("📊 改进统计")
        print("=" * 60)
        print(f"总文档数: {self.stats['total_docs']}")
        print(f"内容过少文档: {self.stats['short_content']}")
        print(f"缺少标准章节: {self.stats['missing_sections']}")
        print(f"缺少目录: {self.stats['missing_toc']}")
        print(f"缺少文档信息表格: {self.stats['missing_info_table']}")
        print(f"已改进文档: {self.stats['improved']}")
        print("=" * 60)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³文档闭环系统第一阶段（P0）改进脚本')
    parser.add_argument('--dry-run', action='store_true', help='仅分析，不修改文件')
    parser.add_argument('--docs-root', default=DOCS_ROOT, help='文档根目录')
    
    args = parser.parse_args()
    
    improver = DocumentImprover(args.docs_root)
    improver.run(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
