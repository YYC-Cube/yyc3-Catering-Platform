#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文档编号检查与修正脚本
检查各分类目录下的文档编号规范性
"""

from pathlib import Path
from collections import defaultdict
import re


def extract_number_from_filename(filename: str) -> tuple[int, str]:
    """
    从文件名中提取编号
    返回 (编号, 剩余文件名)
    """
    match = re.match(r'^(\d+)-(.+)$', filename)
    if match:
        return int(match.group(1)), match.group(2)
    return 0, filename


def check_directory_numbers(dir_path: Path) -> dict:
    """
    检查目录下的文档编号
    返回编号统计信息
    """
    number_files = defaultdict(list)
    unnumbered_files = []
    
    for file_path in sorted(dir_path.glob("*.md")):
        filename = file_path.name
        number, name = extract_number_from_filename(filename)
        
        if number > 0:
            number_files[number].append(file_path)
        else:
            unnumbered_files.append(file_path)
    
    # 检查重复编号
    duplicates = {num: files for num, files in number_files.items() if len(files) > 1}
    
    return {
        'directory': dir_path,
        'number_files': dict(number_files),
        'duplicates': duplicates,
        'unnumbered': unnumbered_files,
        'total': len(list(dir_path.glob("*.md")))
    }


def check_all_directories(base_path: Path) -> list[dict]:
    """
    检查所有分类目录
    """
    results = []
    
    # 遍历所有分类目录
    for category_dir in sorted(base_path.iterdir()):
        if not category_dir.is_dir():
            continue
        
        # 检查架构类和技巧类子目录
        for sub_dir in ['架构类', '技巧类']:
            sub_path = category_dir / sub_dir
            if sub_path.exists() and sub_path.is_dir():
                result = check_directory_numbers(sub_path)
                if result['total'] > 0:
                    results.append(result)
    
    return results


def generate_report(results: list[dict]) -> str:
    """
    生成审核报告
    """
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("YYC³ 文档编号审核报告")
    report_lines.append("=" * 80)
    report_lines.append("")
    
    total_issues = 0
    total_duplicates = 0
    total_unnumbered = 0
    
    for result in results:
        dir_path = result['directory']
        duplicates = result['duplicates']
        unnumbered = result['unnumbered']
        
        report_lines.append(f"\n📁 目录: {dir_path.relative_to(dir_path.parent.parent)}")
        report_lines.append(f"   总计文档: {result['total']}")
        
        if duplicates:
            total_duplicates += sum(len(files) for files in duplicates.values())
            report_lines.append(f"\n   🔴 重复编号问题 ({len(duplicates)} 个):")
            for num, files in sorted(duplicates.items()):
                report_lines.append(f"      编号 {num}:")
                for file_path in files:
                    report_lines.append(f"         - {file_path.name}")
        
        if unnumbered:
            total_unnumbered += len(unnumbered)
            report_lines.append(f"\n   🟡 未编号文档 ({len(unnumbered)} 个):")
            for file_path in unnumbered:
                report_lines.append(f"      - {file_path.name}")
        
        if not duplicates and not unnumbered:
            report_lines.append(f"   ✅ 编号规范，无问题")
    
    report_lines.append("\n" + "=" * 80)
    report_lines.append("审核总结")
    report_lines.append("=" * 80)
    report_lines.append(f"检查目录数: {len(results)}")
    report_lines.append(f"重复编号文档: {total_duplicates}")
    report_lines.append(f"未编号文档: {total_unnumbered}")
    
    if total_duplicates == 0 and total_unnumbered == 0:
        report_lines.append("\n✅ 所有文档编号规范，无需修正")
    else:
        report_lines.append(f"\n⚠️  发现 {total_duplicates + total_unnumbered} 个问题需要处理")
    
    report_lines.append("=" * 80)
    
    return "\n".join(report_lines)


def main():
    """
    主函数
    """
    base_path = Path(__file__).parent
    
    print("开始检查文档编号...")
    print()
    
    results = check_all_directories(base_path)
    report = generate_report(results)
    
    print(report)
    
    # 保存报告
    report_path = base_path / "YYC3-文档编号审核报告.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n报告已保存到: {report_path}")


if __name__ == '__main__':
    main()
