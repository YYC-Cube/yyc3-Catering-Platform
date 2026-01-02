#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文件命名规范性审核脚本

@fileoverview YYC³文件命名规范性审核脚本
@description 检查文件命名是否符合YYC3规范
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


class FileNamingAuditor:
    """文件命名审核器"""

    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.issues = []
        self.stats = {
            'total_files': 0,
            'naming_issues': 0,
            'missing_number': 0,
            'invalid_format': 0,
            'passed': 0
        }

    def check_document_naming(self, file_path: Path) -> Dict:
        """检查单个文档的命名规范性"""
        file_name = file_path.name
        issues = []

        # 检查是否为Markdown文件
        if not file_name.endswith('.md'):
            return {
                'file': file_path,
                'status': 'skipped',
                'message': '非Markdown文件，跳过审核'
            }

        # 排除审核报告和脚本文件
        if '审核报告' in file_name or file_name.startswith('yyc3-') or file_name == 'YYC3-文档索引.md':
            return {
                'file': file_path,
                'status': 'skipped',
                'message': '审核报告或脚本文件，跳过审核'
            }

        # 检查文件名格式
        # 标准格式: 编号-YYC3-Cater--类型-名称.md
        # 例如: 01-YYC3-Cater--架构类-总体架构设计文档.md

        # 检查是否有编号
        if not re.match(r'^\d{2,3}-', file_name):
            issues.append({
                'type': 'missing_number',
                'severity': 'high',
                'message': '文件名缺少编号，格式应为: 编号-YYC3-Cater--类型-名称.md'
            })
            self.stats['missing_number'] += 1

        # 检查是否包含YYC3-Cater前缀
        if 'YYC3-Cater' not in file_name:
            issues.append({
                'type': 'invalid_format',
                'severity': 'high',
                'message': '文件名缺少YYC3-Cater前缀'
            })
            self.stats['invalid_format'] += 1

        # 检查是否包含类型标识（架构类、技巧类等）
        if '架构类' not in file_name and '技巧类' not in file_name:
            issues.append({
                'type': 'invalid_format',
                'severity': 'medium',
                'message': '文件名缺少类型标识（架构类/技巧类）'
            })
            self.stats['invalid_format'] += 1

        # 检查文件名是否使用kebab-case（除了编号和类型标识）
        # 提取文件名主体部分
        name_part = file_name.replace('.md', '')
        # 移除编号和类型标识部分
        name_part = re.sub(r'^\d{2,3}-YYC3-Cater--[架构类|技巧类]-', '', name_part)

        # 检查是否包含空格或特殊字符
        if ' ' in name_part:
            issues.append({
                'type': 'invalid_format',
                'severity': 'medium',
                'message': '文件名包含空格，应使用kebab-case格式'
            })
            self.stats['invalid_format'] += 1

        # 检查是否包含大写字母（除了类型标识）
        # 提取纯名称部分（移除类型标识）
        pure_name = name_part
        for type_name in ['架构类', '技巧类']:
            pure_name = pure_name.replace(type_name, '')

        if re.search(r'[A-Z]', pure_name):
            issues.append({
                'type': 'invalid_format',
                'severity': 'low',
                'message': '文件名包含大写字母，建议使用kebab-case格式'
            })
            self.stats['invalid_format'] += 1

        # 检查文件名长度
        if len(file_name) > 100:
            issues.append({
                'type': 'invalid_format',
                'severity': 'low',
                'message': f'文件名过长（{len(file_name)}字符），建议不超过100字符'
            })
            self.stats['invalid_format'] += 1

        if issues:
            self.stats['naming_issues'] += 1
            return {
                'file': file_path,
                'status': 'issues',
                'issues': issues
            }
        else:
            self.stats['passed'] += 1
            return {
                'file': file_path,
                'status': 'passed'
            }

    def audit_directory(self, dir_path: Path) -> List[Dict]:
        """审核目录下的所有文件"""
        results = []
        for file_path in sorted(dir_path.glob('*')):
            if file_path.is_file():
                self.stats['total_files'] += 1
                result = self.check_document_naming(file_path)
                if result['status'] != 'skipped':
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
            "# YYC³ 文件命名规范性审核报告\n",
            f"**审核时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**审核目录**: {self.base_dir}",
            "",
            "## 📊 审核统计\n",
            f"- **总文件数**: {self.stats['total_files']}",
            f"- **命名问题**: {self.stats['naming_issues']}",
            f"- **缺少编号**: {self.stats['missing_number']}",
            f"- **格式无效**: {self.stats['invalid_format']}",
            f"- **通过审核**: {self.stats['passed']}",
            f"- **通过率**: {(self.stats['passed'] / self.stats['total_files'] * 100):.1f}%" if self.stats['total_files'] > 0 else "- **通过率**: 0%",
            "",
            "## 🔍 详细问题\n"
        ]

        # 按分类列出问题
        for category, category_results in results.items():
            report_lines.append(f"\n### {category}\n")

            for doc_type, doc_results in category_results.items():
                report_lines.append(f"\n#### {doc_type}\n")

                for result in doc_results:
                    if result['status'] == 'issues':
                        file_name = result['file'].name
                        report_lines.append(f"\n**{file_name}**")

                        for issue in result['issues']:
                            severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                            report_lines.append(f"- {severity_icon} **{issue['type']}**: {issue['message']}")

        # 添加改进建议
        report_lines.extend([
            "",
            "## 💡 改进建议\n",
            "### 命名规范\n",
            "文档文件命名应遵循以下格式：\n",
            "```\n",
            "编号-YYC3-Cater--类型-名称.md\n",
            "```\n",
            "",
            "**示例：**\n",
            "- `01-YYC3-Cater--架构类-总体架构设计文档.md`\n",
            "- `02-YYC3-Cater--技巧类-微服务拆分避坑指南.md`\n",
            "",
            "### 命名规则\n",
            "1. **编号**: 使用2-3位数字，从01开始\n",
            "2. **前缀**: 必须包含 `YYC3-Cater`\n",
            "3. **类型**: 必须包含类型标识（架构类/技巧类）\n",
            "4. **名称**: 使用中文，清晰描述文档内容\n",
            "5. **格式**: 使用kebab-case，避免空格和特殊字符\n",
            "6. **长度**: 建议不超过100字符\n",
            "",
            "### 修正步骤\n",
            "1. **添加编号**: 为缺少编号的文件添加编号\n",
            "2. **统一前缀**: 确保所有文件包含YYC3-Cater前缀\n",
            "3. **添加类型**: 为缺少类型标识的文件添加类型标识\n",
            "4. **格式统一**: 将文件名转换为kebab-case格式\n",
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
    auditor = FileNamingAuditor(base_dir)

    # 执行审核
    print("开始审核文件命名规范性...")
    results = auditor.audit_all_categories()

    # 生成报告
    report = auditor.generate_report(results)

    # 保存报告
    report_path = base_dir / 'YYC3-文件命名审核报告.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"✅ 审核完成！")
    print(f"📊 总文件数: {auditor.stats['total_files']}")
    print(f"✅ 通过审核: {auditor.stats['passed']}")
    print(f"⚠️  需要改进: {auditor.stats['naming_issues']}")
    print(f"📄 报告已保存至: {report_path}")


if __name__ == '__main__':
    main()
