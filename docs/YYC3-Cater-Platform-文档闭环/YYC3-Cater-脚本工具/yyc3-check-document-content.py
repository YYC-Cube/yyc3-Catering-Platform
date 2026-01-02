#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文档内容完整性审核脚本

@fileoverview YYC³文档内容完整性审核脚本
@description 检查文档内容完整性、质量和技术准确性
@author YYC³
@version 1.0.0
@created 2025-01-30
@copyright Copyright (c) 2025 YYC³
@license MIT
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
from datetime import datetime


class DocumentContentAuditor:
    """文档内容审核器"""

    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.issues = []
        self.stats = {
            'total_docs': 0,
            'too_short': 0,
            'missing_sections': 0,
            'incomplete_content': 0,
            'passed': 0
        }

    def check_document_content(self, file_path: Path) -> Dict:
        """检查单个文档的内容完整性"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
        except Exception as e:
            return {
                'file': file_path,
                'status': 'error',
                'message': f'无法读取文件: {e}'
            }

        # 检查文档长度
        total_lines = len(lines)
        content_lines = len([l for l in lines if l.strip() and not l.strip().startswith('#')])

        issues = []

        # 检查内容是否过少（少于50行有效内容）
        if content_lines < 50:
            issues.append({
                'type': 'too_short',
                'severity': 'high',
                'message': f'文档内容过少，仅有 {content_lines} 行有效内容（建议至少50行）'
            })
            self.stats['too_short'] += 1

        # 检查是否有必要的章节
        required_sections = [
            r'##\s+\d+\.\s+概述|##\s+概述',
            r'##\s+\d+\.\s+功能特性|##\s+功能特性',
            r'##\s+\d+\.\s+技术栈|##\s+技术栈',
            r'##\s+\d+\.\s+实现|##\s+实现|##\s+\d+\.\s+详细设计|##\s+详细设计'
        ]

        missing_sections = []
        for pattern in required_sections:
            if not re.search(pattern, content):
                section_name = pattern.split('|')[0].replace(r'##\s+\d+\.\s+', '').replace(r'##\s+', '')
                missing_sections.append(section_name)

        if missing_sections:
            issues.append({
                'type': 'missing_sections',
                'severity': 'medium',
                'message': f'缺少必要章节: {", ".join(missing_sections)}'
            })
            self.stats['missing_sections'] += 1

        # 检查是否有代码示例（技术文档）
        if '```' not in content and ('架构' in file_path.name or '设计' in file_path.name):
            issues.append({
                'type': 'missing_examples',
                'severity': 'low',
                'message': '技术文档缺少代码示例或配置示例'
            })

        # 检查是否有表格（架构文档）
        if '|' not in content and ('架构' in file_path.name or '设计' in file_path.name):
            issues.append({
                'type': 'missing_tables',
                'severity': 'low',
                'message': '架构文档缺少表格（如组件列表、接口列表等）'
            })

        # 检查内容完整性
        if issues:
            self.stats['incomplete_content'] += 1
            return {
                'file': file_path,
                'status': 'incomplete',
                'total_lines': total_lines,
                'content_lines': content_lines,
                'issues': issues
            }
        else:
            self.stats['passed'] += 1
            return {
                'file': file_path,
                'status': 'passed',
                'total_lines': total_lines,
                'content_lines': content_lines
            }

    def audit_directory(self, dir_path: Path) -> List[Dict]:
        """审核目录下的所有文档"""
        results = []
        for md_file in sorted(dir_path.glob('*.md')):
            # 排除审核报告和脚本文件
            if '审核报告' in md_file.name or md_file.name.startswith('yyc3-') or md_file.name == 'YYC3-文档索引.md':
                continue
            self.stats['total_docs'] += 1
            result = self.check_document_content(md_file)
            results.append(result)
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
            "# YYC³ 文档内容完整性审核报告\n",
            f"**审核时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**审核目录**: {self.base_dir}",
            "",
            "## 📊 审核统计\n",
            f"- **总文档数**: {self.stats['total_docs']}",
            f"- **内容过少**: {self.stats['too_short']}",
            f"- **缺少章节**: {self.stats['missing_sections']}",
            f"- **内容不完整**: {self.stats['incomplete_content']}",
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

                for result in doc_results:
                    if result['status'] == 'incomplete':
                        file_name = result['file'].name
                        report_lines.append(f"\n**{file_name}**")
                        report_lines.append(f"- 总行数: {result['total_lines']}")
                        report_lines.append(f"- 有效内容行数: {result['content_lines']}")

                        for issue in result['issues']:
                            severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                            report_lines.append(f"- {severity_icon} **{issue['type']}**: {issue['message']}")

        # 添加改进建议
        report_lines.extend([
            "",
            "## 💡 改进建议\n",
            "### 高优先级（P0）\n",
            "1. **补充内容过少的文档**\n",
            "   - 为内容少于50行的文档补充详细说明\n",
            "   - 添加必要的章节和子章节\n",
            "   - 提供具体的实现细节和示例\n",
            "",
            "### 中优先级（P1）\n",
            "2. **完善文档结构**\n",
            "   - 为缺少必要章节的文档补充章节\n",
            "   - 确保文档包含概述、功能特性、技术栈、实现等核心章节\n",
            "   - 添加目录和索引\n",
            "",
            "### 低优先级（P2）\n",
            "3. **增强文档可读性**\n",
            "   - 为技术文档添加代码示例\n",
            "   - 为架构文档添加表格和图表\n",
            "   - 使用更多示例和用例说明\n",
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
    auditor = DocumentContentAuditor(base_dir)

    # 执行审核
    print("开始审核文档内容完整性...")
    results = auditor.audit_all_categories()

    # 生成报告
    report = auditor.generate_report(results)

    # 保存报告
    report_path = base_dir / 'YYC3-文档内容审核报告.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"✅ 审核完成！")
    print(f"📊 总文档数: {auditor.stats['total_docs']}")
    print(f"✅ 通过审核: {auditor.stats['passed']}")
    print(f"⚠️  需要改进: {auditor.stats['incomplete_content']}")
    print(f"📄 报告已保存至: {report_path}")


if __name__ == '__main__':
    main()
