#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
@file：yyc3-standardize-document-names.py
@description：统一文档命名规范
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
import shutil


class DocumentNameStandardizer:
    """文档命名规范化工具"""

    def __init__(self, base_path: str):
        """
        初始化规范化工具

        Args:
            base_path: 文档基础路径
        """
        self.base_path = Path(base_path)
        self.renamed_files = []
        self.issues = []

    def analyze_naming_issues(self) -> Dict:
        """
        分析命名问题

        Returns:
            命名问题字典
        """
        issues = {
            'missing_numbers': [],
            'duplicate_names': {},
            'inconsistent_prefix': [],
            'invalid_format': []
        }

        # 遍历所有目录
        for category_dir in self.base_path.iterdir():
            if not category_dir.is_dir():
                continue

            # 检查架构类和技巧类
            for type_dir in ['架构类', '技巧类']:
                type_path = category_dir / type_dir
                if not type_path.exists():
                    continue

                # 获取所有文档
                md_files = sorted(type_path.glob('*.md'))

                # 提取编号和名称
                numbered_files = {}
                for file in md_files:
                    match = re.match(r'^(\d+)-(.+)$', file.name)
                    if match:
                        number = int(match.group(1))
                        name = match.group(2)
                        numbered_files[number] = {
                            'path': file,
                            'name': name,
                            'number': number
                        }

                # 检查编号断层
                if numbered_files:
                    numbers = sorted(numbered_files.keys())
                    for i in range(numbers[0], numbers[-1] + 1):
                        if i not in numbers:
                            issues['missing_numbers'].append({
                                'category': category_dir.name,
                                'type': type_dir,
                                'missing_number': i,
                                'context': f'在 {numbers[0]}-{numbers[-1]} 范围内'
                            })

                # 检查重复名称
                name_counts = {}
                for number, file_info in numbered_files.items():
                    name = file_info['name']
                    if name not in name_counts:
                        name_counts[name] = []
                    name_counts[name].append(number)

                for name, numbers in name_counts.items():
                    if len(numbers) > 1:
                        issues['duplicate_names'][f"{category_dir.name}/{type_dir}/{name}"] = numbers

                # 检查命名格式不一致
                for file in md_files:
                    if not re.match(r'^\d+-YYC3-Cater--[架构|技巧]类-.+\.md$', file.name):
                        issues['invalid_format'].append(str(file))

        return issues

    def suggest_renames(self) -> List[Dict]:
        """
        建议重命名方案

        Returns:
            重命名建议列表
        """
        suggestions = []

        # 处理重复名称
        duplicate_issues = self.analyze_naming_issues()['duplicate_names']

        for key, numbers in duplicate_issues.items():
            category, type_dir, name = key.split('/')
            type_path = self.base_path / category / type_dir

            # 保留第一个编号，重命名其他
            for i, number in enumerate(numbers[1:], 1):
                old_file = type_path / f"{number:02d}-{name}"
                new_number = numbers[0] + i
                new_file = type_path / f"{new_number:02d}-{name}"

                suggestions.append({
                    'old_path': old_file,
                    'new_path': new_file,
                    'reason': f'重复名称，从 {number} 重命名为 {new_number}'
                })

        # 处理缺少YYC3-Cater前缀的文件
        for file in self.base_path.rglob('*.md'):
            if '审核报告' in str(file) or '脚本工具' in str(file):
                continue

            if not file.name.startswith('YYC3-Cater-') and re.match(r'^\d+-', file.name):
                # 提取编号和名称
                match = re.match(r'^(\d+)-(.+)$', file.name)
                if match:
                    number = match.group(1)
                    name = match.group(2)

                    # 检查是否需要添加YYC3-Cater前缀
                    if not name.startswith('YYC3-Cater-'):
                        new_name = f"{number}-YYC3-Cater-{name}"
                        new_file = file.parent / new_name

                        suggestions.append({
                            'old_path': file,
                            'new_path': new_file,
                            'reason': '缺少YYC3-Cater前缀'
                        })

        return suggestions

    def apply_renames(self, dry_run: bool = True) -> List[Dict]:
        """
        应用重命名

        Args:
            dry_run: 是否为试运行

        Returns:
            重命名结果列表
        """
        suggestions = self.suggest_renames()
        results = []

        for suggestion in suggestions:
            old_path = suggestion['old_path']
            new_path = suggestion['new_path']

            if not old_path.exists():
                results.append({
                    'status': 'skip',
                    'old_path': str(old_path),
                    'new_path': str(new_path),
                    'reason': '文件不存在'
                })
                continue

            if new_path.exists():
                results.append({
                    'status': 'skip',
                    'old_path': str(old_path),
                    'new_path': str(new_path),
                    'reason': '目标文件已存在'
                })
                continue

            if not dry_run:
                try:
                    shutil.move(str(old_path), str(new_path))
                    results.append({
                        'status': 'success',
                        'old_path': str(old_path),
                        'new_path': str(new_path),
                        'reason': suggestion['reason']
                    })
                    self.renamed_files.append(suggestion)
                except Exception as e:
                    results.append({
                        'status': 'error',
                        'old_path': str(old_path),
                        'new_path': str(new_path),
                        'reason': str(e)
                    })
            else:
                results.append({
                    'status': 'dry_run',
                    'old_path': str(old_path),
                    'new_path': str(new_path),
                    'reason': suggestion['reason']
                })

        return results

    def generate_report(self) -> str:
        """
        生成规范化报告

        Returns:
            Markdown格式的报告
        """
        # 分析问题
        issues = self.analyze_naming_issues()
        suggestions = self.suggest_renames()

        # 生成报告
        report = f"""# YYC³ 文档命名规范化报告

**@file**：YYC3-文档命名规范化报告
**@description**：文档命名规范化分析和改进建议
**@author**：YYC³
**@version**：1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：审核报告,命名规范,YYC³

---

## 📋 规范化概述

### 审核范围
- 审核目录：{self.base_path}
- 审核维度：文档命名规范
- 审核时间：2025-01-30

### 发现问题
- 🔢 编号断层：{len(issues['missing_numbers'])}个
- 📛 重复名称：{len(issues['duplicate_names'])}组
- 🔤 命名不一致：{len(issues['inconsistent_prefix'])}个
- ❌ 格式无效：{len(issues['invalid_format'])}个

---

## 🔍 详细问题列表

### 编号断层问题

| 分类 | 类型 | 缺失编号 | 上下文 |
|------|------|---------|--------|
"""

        # 添加编号断层问题
        for issue in issues['missing_numbers']:
            report += f"| {issue['category']} | {issue['type']} | {issue['missing_number']:02d} | {issue['context']} |\n"

        report += "\n### 重复名称问题\n\n"
        report += "| 分类/类型/名称 | 重复编号 |\n"
        report += "|----------------|---------|\n"

        # 添加重复名称问题
        for key, numbers in issues['duplicate_names'].items():
            report += f"| {key} | {', '.join([str(n) for n in numbers])} |\n"

        report += "\n### 格式无效问题\n\n"
        report += "| 文件路径 |\n"
        report += "|---------|\n"

        # 添加格式无效问题
        for file_path in issues['invalid_format']:
            report += f"| {file_path} |\n"

        report += "\n## 🚀 重命名建议\n\n"
        report += "| 原文件名 | 新文件名 | 原因 |\n"
        report += "|---------|---------|------|\n"

        # 添加重命名建议
        for suggestion in suggestions:
            report += f"| {suggestion['old_path'].name} | {suggestion['new_path'].name} | {suggestion['reason']} |\n"

        # 添加改进建议
        report += f"""

---

## 🚀 改进建议

### P0优先级（立即行动）

1. **修复重复名称**
   - 任务：为重复命名的文档重新编号
   - 负责人：文档管理员
   - 截止时间：2025-01-31
   - 预计工时：1小时

2. **补充缺失编号**
   - 任务：为编号断层创建占位文档或重新编号
   - 负责人：文档管理员
   - 截止时间：2025-01-31
   - 预计工时：2小时

### P1优先级（短期行动）

1. **统一命名格式**
   - 任务：为所有文档添加统一的YYC3-Cater前缀
   - 负责人：文档管理员
   - 截止时间：2025-02-06
   - 预计工时：3小时

2. **建立命名规范**
   - 任务：制定详细的文档命名规范文档
   - 负责人：文档管理员
   - 截止时间：2025-02-06
   - 预计工时：2小时

### 长期优化（持续改进）

1. **自动化命名检查**
   - 任务：集成到CI/CD流程，自动检查文档命名规范
   - 负责人：DevOps工程师
   - 截止时间：持续进行
   - 预计工时：持续投入

2. **命名规范培训**
   - 任务：为团队成员提供文档命名规范培训
   - 负责人：文档管理员
   - 截止时间：持续进行
   - 预计工时：持续投入

---

## 📊 命名规范标准

### 标准格式

```
[编号]-YYC3-Cater--[类型]-[文档名称].md
```

### 格式说明

- **编号**：两位数字，从01开始
- **YYC3-Cater**：项目前缀
- **类型**：架构类 或 技巧类
- **文档名称**：描述性的文档名称

### 示例

- ✅ 正确：`01-YYC3-Cater--架构类-总体架构设计文档.md`
- ✅ 正确：`02-YYC3-Cater--技巧类-编码规范手册.md`
- ❌ 错误：`总体架构设计文档.md`（缺少编号和前缀）
- ❌ 错误：`01-架构类-总体架构设计文档.md`（缺少YYC3-Cater前缀）

---

## 📝 附录

### 工具信息

- 工具名称：YYC³ 文档命名规范化工具
- 工具版本：v1.0.0
- 工具作者：YYC³ Team

### 使用方法

```bash
# 试运行（不实际重命名）
python3 yyc3-standardize-document-names.py

# 实际执行重命名
python3 yyc3-standardize-document-names.py --apply
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
"""

        return report


def main():
    """主函数"""
    import sys

    # 设置基础路径
    base_path = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环'

    # 创建规范化工具
    standardizer = DocumentNameStandardizer(base_path)

    # 分析问题
    print('分析文档命名问题...')
    issues = standardizer.analyze_naming_issues()

    print(f'发现 {len(issues["missing_numbers"])} 个编号断层')
    print(f'发现 {len(issues["duplicate_names"])} 组重复名称')
    print(f'发现 {len(issues["invalid_format"])} 个格式无效')

    # 生成建议
    print('生成重命名建议...')
    suggestions = standardizer.suggest_renames()
    print(f'共 {len(suggestions)} 个重命名建议')

    # 应用重命名
    apply = '--apply' in sys.argv
    if apply:
        print('应用重命名...')
        results = standardizer.apply_renames(dry_run=False)
        print(f'成功重命名 {sum(1 for r in results if r["status"] == "success")} 个文件')
    else:
        print('试运行模式（不实际重命名）...')
        results = standardizer.apply_renames(dry_run=True)
        print(f'将重命名 {sum(1 for r in results if r["status"] == "dry_run")} 个文件')

    # 生成报告
    print('生成规范化报告...')
    report = standardizer.generate_report()

    # 保存报告
    report_path = Path(base_path) / 'YYC3-Cater-审核报告' / 'YYC3-文档命名规范化报告.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f'规范化报告已保存到：{report_path}')
    print('规范化完成！')


if __name__ == '__main__':
    main()
