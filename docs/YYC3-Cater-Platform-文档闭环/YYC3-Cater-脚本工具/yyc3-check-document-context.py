#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文档间上下文衔接有序性审核脚本

@fileoverview YYC³文档间上下文衔接有序性审核脚本
@description 检查文档之间的引用关系、编号连续性和内容关联性
@author YYC³
@version 1.0.0
@created 2025-01-30
@copyright Copyright (c) 2025 YYC³
@license MIT
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple, Set
from datetime import datetime


class DocumentContextAuditor:
    """文档上下文审核器"""

    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.issues = []
        self.stats = {
            'total_docs': 0,
            'reference_issues': 0,
            'numbering_gaps': 0,
            'orphan_docs': 0,
            'passed': 0
        }
        self.doc_index = {}  # 文档索引映射

    def extract_number(self, file_name: str) -> int:
        """从文件名提取编号"""
        match = re.match(r'^(\d{2,3})-', file_name)
        return int(match.group(1)) if match else 0

    def check_numbering_sequence(self, files: List[Path]) -> List[Dict]:
        """检查文档编号的连续性"""
        issues = []
        numbers = []

        for file_path in files:
            number = self.extract_number(file_path.name)
            if number > 0:
                numbers.append((number, file_path))

        # 按编号排序
        numbers.sort()

        # 检查编号连续性
        for i in range(1, len(numbers)):
            current_num, current_file = numbers[i]
            prev_num, prev_file = numbers[i-1]

            if current_num - prev_num > 1:
                issues.append({
                    'type': 'numbering_gap',
                    'severity': 'medium',
                    'message': f'编号不连续: {prev_num} → {current_num} (缺少 {prev_num+1}-{current_num-1})',
                    'files': [prev_file.name, current_file.name]
                })
                self.stats['numbering_gaps'] += 1

        return issues

    def check_document_references(self, file_path: Path, all_docs: Set[str]) -> List[Dict]:
        """检查文档中的引用是否有效"""
        issues = []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return [{
                'type': 'read_error',
                'severity': 'high',
                'message': f'无法读取文件: {e}'
            }]

        # 查找文档引用（Markdown链接格式）
        # 格式: [文本](../目录/文件名.md) 或 [文本](文件名.md)
        ref_pattern = r'\[([^\]]+)\]\(([^)]+\.md)\)'
        references = re.findall(ref_pattern, content)

        for text, ref_path in references:
            # 提取引用的文件名
            ref_file_name = Path(ref_path).name

            # 检查引用的文件是否存在
            if ref_file_name not in all_docs:
                issues.append({
                    'type': 'invalid_reference',
                    'severity': 'high',
                    'message': f'无效的文档引用: [{text}]({ref_path})',
                    'reference': ref_file_name
                })
                self.stats['reference_issues'] += 1

        return issues

    def check_orphan_documents(self, file_path: Path, all_references: Dict[str, List[str]]) -> List[Dict]:
        """检查孤立文档（没有被其他文档引用）"""
        issues = []
        file_name = file_path.name

        # 如果文档没有被任何其他文档引用，标记为孤立文档
        if file_name not in all_references or len(all_references[file_name]) == 0:
            # 排除索引文档和根目录文档
            if '索引' not in file_name and 'README' not in file_name:
                issues.append({
                    'type': 'orphan_document',
                    'severity': 'low',
                    'message': '文档没有被其他文档引用，可能需要添加相关链接'
                })
                self.stats['orphan_docs'] += 1

        return issues

    def audit_directory(self, dir_path: Path) -> Dict:
        """审核目录下的所有文档"""
        results = {}
        files = []

        # 收集所有文档
        for file_path in sorted(dir_path.glob('*.md')):
            # 排除审核报告和脚本文件
            if '审核报告' in file_path.name or file_path.name.startswith('yyc3-') or file_path.name == 'YYC3-文档索引.md':
                continue

            files.append(file_path)
            self.stats['total_docs'] += 1

        if not files:
            return results

        # 检查编号连续性
        numbering_issues = self.check_numbering_sequence(files)

        # 构建文档集合
        all_doc_names = {f.name for f in files}

        # 收集所有文档引用
        all_references = {}
        for file_path in files:
            all_references[file_path.name] = []

        # 检查每个文档的引用
        for file_path in files:
            file_issues = []

            # 检查文档引用
            ref_issues = self.check_document_references(file_path, all_doc_names)
            file_issues.extend(ref_issues)

            # 记录引用关系
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                ref_pattern = r'\[([^\]]+)\]\(([^)]+\.md)\)'
                references = re.findall(ref_pattern, content)
                for text, ref_path in references:
                    ref_file_name = Path(ref_path).name
                    if ref_file_name in all_doc_names:
                        all_references[ref_file_name].append(file_path.name)
            except:
                pass

            # 检查是否为孤立文档
            orphan_issues = self.check_orphan_documents(file_path, all_references)
            file_issues.extend(orphan_issues)

            # 检查编号问题
            file_issues.extend(numbering_issues)

            if file_issues:
                results[file_path.name] = {
                    'status': 'issues',
                    'issues': file_issues
                }
            else:
                self.stats['passed'] += 1
                results[file_path.name] = {
                    'status': 'passed'
                }

        return results

    def audit_all_categories(self) -> Dict:
        """审核所有分类目录"""
        all_results = {}

        # 定义分类目录
        categories = [
            'YYC3-Cater-架构设计',
            'YYC3-Cater-开发实施',
            'YYC3-Cater-部署发布',
            'YYC3-Cater-运维运营',
            'YYC3-Cater-测试验证',
            'YYC3-Cater-需求规划',
            'YYC3-Cater-用户指南',
            'YYC3-Cater-归类迭代',
            'YYC3-Cater-模版规范'
        ]

        for category in categories:
            category_path = self.base_dir / category
            if not category_path.exists():
                continue

            category_results = {}

            # 审核架构类和技巧类文档
            for doc_type in ['架构类', '技巧类']:
                type_path = category_path / doc_type
                if type_path.exists():
                    results = self.audit_directory(type_path)
                    if results:
                        category_results[doc_type] = results

            if category_results:
                all_results[category] = category_results

        return all_results

    def generate_report(self, results: Dict) -> str:
        """生成审核报告"""
        report_lines = [
            "# YYC³ 文档间上下文衔接有序性审核报告\n",
            f"**审核时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**审核目录**: {self.base_dir}",
            "",
            "## 📊 审核统计\n",
            f"- **总文档数**: {self.stats['total_docs']}",
            f"- **引用问题**: {self.stats['reference_issues']}",
            f"- **编号断层**: {self.stats['numbering_gaps']}",
            f"- **孤立文档**: {self.stats['orphan_docs']}",
            f"- **通过审核**: {self.stats['passed']}",
            f"- **通过率**: {(self.stats['passed'] / self.stats['total_docs'] * 100):.1f}%" if self.stats['total_docs'] > 0 else "- **通过率**: 0%",
            "",
            "## 🔍 详细问题\n"
        ]

        # 按分类列出问题
        for category, category_results in results.items():
            report_lines.append(f"\n### {category}\n")

            for doc_type, doc_results in category_results.items():
                report_lines.append(f"\n#### {doc_type}\n")

                for file_name, result in doc_results.items():
                    if result['status'] == 'issues':
                        report_lines.append(f"\n**{file_name}**")

                        for issue in result['issues']:
                            severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                            report_lines.append(f"- {severity_icon} **{issue['type']}**: {issue['message']}")

                            # 添加额外信息
                            if 'files' in issue:
                                report_lines.append(f"  - 涉及文件: {', '.join(issue['files'])}")
                            if 'reference' in issue:
                                report_lines.append(f"  - 引用文件: {issue['reference']}")

        # 添加改进建议
        report_lines.extend([
            "",
            "## 💡 改进建议\n",
            "### 高优先级（P0）\n",
            "1. **修复无效引用**\n",
            "   - 检查所有文档引用，确保引用的文件存在\n",
            "   - 更新或删除无效的文档链接\n",
            "   - 使用相对路径引用文档\n",
            "",
            "### 中优先级（P1）\n",
            "2. **完善编号连续性**\n",
            "   - 为缺失的编号创建文档或重新编号\n",
            "   - 确保同一目录下的文档编号连续\n",
            "   - 使用一致的编号规则\n",
            "",
            "### 低优先级（P2）\n",
            "3. **增强文档关联**\n",
            "   - 为孤立文档添加相关文档的引用\n",
            "   - 在相关文档中添加交叉引用\n",
            "   - 建立文档间的逻辑关联\n",
            "",
            "### 最佳实践\n",
            "4. **文档引用规范**\n",
            "   - 使用相对路径引用文档\n",
            "   - 引用时使用描述性文本\n",
            "   - 定期检查和更新文档引用\n",
            "   - 维护文档间的逻辑关系\n",
            "",
            "---\n",
            "<div align=\"center\">\n",
            "> 「***YanYuCloudCube***」\n",
            "> 「***<admin@0379.email>***」\n",
            "> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」\n",
            "> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」\n",
            "\n",
            "**Made with ❤️ by YYC³ Team**\n",
            "</div>"
        ])

        return '\n'.join(report_lines)


def main():
    """主函数"""
    # 文档根目录
    base_dir = Path('/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环')

    # 创建审核器
    auditor = DocumentContextAuditor(base_dir)

    # 执行审核
    print("开始审核文档间上下文衔接有序性...")
    results = auditor.audit_all_categories()

    # 生成报告
    report = auditor.generate_report(results)

    # 保存报告
    report_path = base_dir / 'YYC3-文档上下文审核报告.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"✅ 审核完成！")
    print(f"📊 总文档数: {auditor.stats['total_docs']}")
    print(f"✅ 通过审核: {auditor.stats['passed']}")
    print(f"⚠️  需要改进: {auditor.stats['total_docs'] - auditor.stats['passed']}")
    print(f"📄 报告已保存至: {report_path}")


if __name__ == '__main__':
    main()
