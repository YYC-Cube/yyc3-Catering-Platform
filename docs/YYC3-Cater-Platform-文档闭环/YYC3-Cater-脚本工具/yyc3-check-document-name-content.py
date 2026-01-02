#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
@file：yyc3-check-document-name-content.py
@description：检查文档名称与内容对应关系
@author：YYC³
@version：1.0.0
@created：2025-01-30
@updated：2025-01-30
@copyright：Copyright (c) 2025 YYC³
@license：MIT
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
import json


class DocumentNameContentChecker:
    """文档名称与内容对应关系检查器"""

    def __init__(self, base_path: str):
        """
        初始化检查器

        Args:
            base_path: 文档基础路径
        """
        self.base_path = Path(base_path)
        self.issues = []
        self.check_results = []

    def extract_keywords_from_filename(self, filename: str) -> List[str]:
        """
        从文件名中提取关键词

        Args:
            filename: 文件名

        Returns:
            关键词列表
        """
        # 移除文件扩展名和前缀
        name = filename.replace('.md', '')
        # 移除YYC3-Cater前缀
        name = re.sub(r'^YYC3-Cater-', '', name)
        # 移除编号前缀（如01-、02-1-等）
        name = re.sub(r'^\d+(-\d+)?-', '', name)
        # 移除分类前缀（如架构类-、技巧类-）
        name = re.sub(r'^[架构|技巧]类-', '', name)
        # 移除YYC3前缀
        name = re.sub(r'^YYC3-', '', name)

        # 分割关键词
        keywords = re.split(r'[-_]', name)
        # 过滤空字符串和通用词
        keywords = [kw for kw in keywords if kw and kw not in ['文档', '设计', '架构', '说明', '指南', '手册']]

        return keywords

    def extract_keywords_from_content(self, content: str) -> List[str]:
        """
        从文档内容中提取关键词

        Args:
            content: 文档内容

        Returns:
            关键词列表
        """
        keywords = []

        # 从标题中提取关键词
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if title_match:
            title = title_match.group(1)
            title_keywords = re.split(r'[\s-]+', title)
            keywords.extend([kw for kw in title_keywords if kw and len(kw) > 1])

        # 从@description中提取关键词
        desc_match = re.search(r'\*\*@description\*\*：(.+)$', content, re.MULTILINE)
        if desc_match:
            desc = desc_match.group(1)
            desc_keywords = re.split(r'[\s,，、]+', desc)
            keywords.extend([kw for kw in desc_keywords if kw and len(kw) > 1])

        # 从文档信息表格中提取关键词
        table_match = re.search(r'\*\*文档标题\*\*\|(.+)$', content, re.MULTILINE)
        if table_match:
            title = table_match.group(1).strip()
            title_keywords = re.split(r'[\s-]+', title)
            keywords.extend([kw for kw in title_keywords if kw and len(kw) > 1])

        # 从目录中提取关键词
        toc_match = re.search(r'##\s+目录\s*\n([\s\S]+?)(?=\n##|\Z)', content)
        if toc_match:
            toc = toc_match.group(1)
            toc_keywords = re.findall(r'\[(.+?)\]', toc)
            keywords.extend([kw for kw in toc_keywords if kw and len(kw) > 1])

        # 去重并返回
        return list(set(keywords))

    def calculate_similarity(self, name_keywords: List[str], content_keywords: List[str]) -> float:
        """
        计算名称关键词和内容关键词的相似度

        Args:
            name_keywords: 名称关键词列表
            content_keywords: 内容关键词列表

        Returns:
            相似度（0-1之间）
        """
        if not name_keywords or not content_keywords:
            return 0.0

        # 转换为小写
        name_keywords = [kw.lower() for kw in name_keywords]
        content_keywords = [kw.lower() for kw in content_keywords]

        # 计算交集
        intersection = set(name_keywords) & set(content_keywords)

        # 计算相似度（Jaccard相似度）
        similarity = len(intersection) / len(set(name_keywords) | set(content_keywords))

        return similarity

    def check_document(self, file_path: Path) -> Dict:
        """
        检查单个文档的名称与内容对应关系

        Args:
            file_path: 文档路径

        Returns:
            检查结果字典
        """
        filename = file_path.name

        # 读取文档内容
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {
                'filename': filename,
                'status': 'error',
                'error': str(e)
            }

        # 提取关键词
        name_keywords = self.extract_keywords_from_filename(filename)
        content_keywords = self.extract_keywords_from_content(content)

        # 计算相似度
        similarity = self.calculate_similarity(name_keywords, content_keywords)

        # 判断是否匹配
        status = 'pass' if similarity >= 0.3 else 'fail'

        # 收集问题
        issues = []
        if similarity < 0.3:
            issues.append(f'相似度过低（{similarity:.2f}）')

        return {
            'filename': filename,
            'name_keywords': name_keywords,
            'content_keywords': content_keywords,
            'similarity': similarity,
            'status': status,
            'issues': issues
        }

    def check_all_documents(self) -> List[Dict]:
        """
        检查所有文档

        Returns:
            检查结果列表
        """
        # 查找所有Markdown文件
        md_files = list(self.base_path.rglob('*.md'))

        # 排除审核报告和脚本工具
        md_files = [f for f in md_files if '审核报告' not in str(f) and '脚本工具' not in str(f)]

        print(f'找到 {len(md_files)} 个文档文件')

        # 检查每个文档
        results = []
        for file_path in md_files:
            result = self.check_document(file_path)
            results.append(result)

            # 记录问题
            if result['status'] == 'fail':
                self.issues.append(result)

        self.check_results = results
        return results

    def generate_report(self) -> str:
        """
        生成审核报告

        Returns:
            Markdown格式的报告
        """
        # 统计结果
        total = len(self.check_results)
        passed = sum(1 for r in self.check_results if r['status'] == 'pass')
        failed = total - passed
        pass_rate = (passed / total * 100) if total > 0 else 0

        # 生成报告
        report = f"""# YYC³ 文档名称与内容对应关系审核报告

**@file**：YYC3-文档名称内容对应关系审核报告
**@description**：文档名称与内容对应关系审核结果和改进建议
**@author**：YYC³
**@version**：1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：审核报告,名称内容对应,YYC³

---

## 📋 审核概述

### 审核范围
- 审核文档总数：{total}个
- 审核维度：文档名称与内容对应关系
- 审核时间：2025-01-30

### 审核结果
- ✅ 通过文档数：{passed}个
- ❌ 未通过文档数：{failed}个
- 📊 通过率：{pass_rate:.1f}%

---

## 🔍 详细问题列表

### 严重问题（P0）

| 文档名称 | 名称关键词 | 内容关键词 | 相似度 | 优先级 | 建议修复 |
|---------|-----------|-----------|--------|--------|---------|
"""

        # 添加严重问题（相似度 < 0.1）
        for result in self.check_results:
            if result['status'] == 'fail' and result['similarity'] < 0.1:
                report += f"| {result['filename']} | {', '.join(result['name_keywords'][:5])} | {', '.join(result['content_keywords'][:5])} | {result['similarity']:.2f} | P0 | 重新命名文档或补充内容关键词 |\n"

        report += "\n### 警告问题（P1）\n\n"
        report += "| 文档名称 | 名称关键词 | 内容关键词 | 相似度 | 优先级 | 建议修复 |\n"
        report += "|---------|-----------|-----------|--------|--------|---------|\n"

        # 添加警告问题（0.1 <= 相似度 < 0.3）
        for result in self.check_results:
            if result['status'] == 'fail' and 0.1 <= result['similarity'] < 0.3:
                report += f"| {result['filename']} | {', '.join(result['name_keywords'][:5])} | {', '.join(result['content_keywords'][:5])} | {result['similarity']:.2f} | P1 | 优化文档名称或内容 |\n"

        report += "\n### 合规文档\n\n"
        report += "| 文档名称 | 名称关键词 | 内容关键词 | 相似度 |\n"
        report += "|---------|-----------|-----------|--------|\n"

        # 添加合规文档
        for result in self.check_results:
            if result['status'] == 'pass':
                report += f"| {result['filename']} | {', '.join(result['name_keywords'][:5])} | {', '.join(result['content_keywords'][:5])} | {result['similarity']:.2f} |\n"

        # 添加改进建议
        report += f"""

---

## 🚀 改进建议

### P0优先级（立即行动）

1. **重新命名相似度过低的文档**
   - 任务：为相似度低于0.1的文档重新命名
   - 负责人：文档管理员
   - 截止时间：2025-01-31
   - 预计工时：2小时

### P1优先级（短期行动）

1. **优化文档名称或内容**
   - 任务：为相似度在0.1-0.3之间的文档优化名称或内容
   - 负责人：各模块负责人
   - 截止时间：2025-02-06
   - 预计工时：10小时

### 长期优化（持续改进）

1. **建立文档命名规范**
   - 任务：制定更详细的文档命名规范
   - 负责人：文档管理员
   - 截止时间：持续进行
   - 预计工时：持续投入

2. **建立文档内容标准**
   - 任务：制定文档内容标准，确保包含必要的关键词
   - 负责人：文档管理员
   - 截止时间：持续进行
   - 预计工时：持续投入

---

## 📊 评分标准

| 相似度范围 | 等级 | 说明 |
|-----------|------|------|
| 0.7-1.0 | A | 优秀，名称与内容高度一致 |
| 0.5-0.7 | B | 良好，名称与内容基本一致 |
| 0.3-0.5 | C | 可接受，名称与内容部分一致 |
| 0.1-0.3 | D | 需要改进，名称与内容一致性较低 |
| 0.0-0.1 | F | 不合规，名称与内容不一致 |

---

## 📝 附录

### 审核方法

1. **关键词提取**：从文件名和文档内容中提取关键词
2. **相似度计算**：使用Jaccard相似度计算名称关键词和内容关键词的相似度
3. **结果判定**：根据相似度判断文档名称与内容是否对应

### 工具信息

- 工具名称：YYC³ 文档名称与内容对应关系检查器
- 工具版本：v1.0.0
- 工具作者：YYC³ Team

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
"""

        return report


def main():
    """主函数"""
    # 设置基础路径
    base_path = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环'

    # 创建检查器
    checker = DocumentNameContentChecker(base_path)

    # 检查所有文档
    print('开始检查文档名称与内容对应关系...')
    results = checker.check_all_documents()

    # 生成报告
    print('生成审核报告...')
    report = checker.generate_report()

    # 保存报告
    report_path = Path(base_path) / 'YYC3-Cater-审核报告' / 'YYC3-文档名称内容对应关系审核报告.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f'审核报告已保存到：{report_path}')
    print(f'审核完成：共检查 {len(results)} 个文档')


if __name__ == '__main__':
    main()
