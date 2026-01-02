#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文档编号修正脚本
自动修正重复编号和未编号的文档
"""

from pathlib import Path
import re
from typing import Dict, List


def extract_number_from_filename(filename: str) -> tuple[int, str]:
    """
    从文件名中提取编号
    返回 (编号, 剩余文件名)
    """
    match = re.match(r'^(\d+)-(.+)$', filename)
    if match:
        return int(match.group(1)), match.group(2)
    return 0, filename


def fix_duplicate_numbers(dir_path: Path) -> int:
    """
    修正重复编号
    使用子编号方式：01, 01-1, 01-2
    """
    number_files: Dict[int, List[Path]] = {}
    
    # 收集所有文件
    for file_path in sorted(dir_path.glob("*.md")):
        filename = file_path.name
        number, name = extract_number_from_filename(filename)
        if number > 0:
            if number not in number_files:
                number_files[number] = []
            number_files[number].append(file_path)
    
    fixed_count = 0
    
    # 处理重复编号
    for number, files in sorted(number_files.items()):
        if len(files) > 1:
            print(f"\n修正重复编号 {number} ({len(files)} 个文件):")
            
            # 第一个文件保持原编号
            files[0].rename(files[0].parent / f"{number:02d}-{files[0].name.split('-', 1)[1]}")
            print(f"  ✓ {files[0].name} -> {number:02d}-{files[0].name.split('-', 1)[1]}")
            fixed_count += 1
            
            # 其他文件使用子编号
            for i, file_path in enumerate(files[1:], 1):
                new_name = f"{number:02d}-{i}-{file_path.name.split('-', 1)[1]}"
                file_path.rename(file_path.parent / new_name)
                print(f"  ✓ {file_path.name} -> {new_name}")
                fixed_count += 1
    
    return fixed_count


def fix_unnumbered_files(dir_path: Path) -> int:
    """
    为未编号文件添加编号
    找到当前最大编号，然后递增
    """
    numbered_files = []
    unnumbered_files = []
    
    # 收集文件
    for file_path in sorted(dir_path.glob("*.md")):
        filename = file_path.name
        number, name = extract_number_from_filename(filename)
        if number > 0:
            numbered_files.append(number)
        else:
            unnumbered_files.append(file_path)
    
    if not unnumbered_files:
        return 0
    
    # 找到最大编号
    max_number = max(numbered_files) if numbered_files else 0
    
    fixed_count = 0
    
    # 为未编号文件分配新编号
    print(f"\n为未编号文件分配编号 (从 {max_number + 1} 开始):")
    for file_path in unnumbered_files:
        max_number += 1
        new_name = f"{max_number:02d}-{file_path.name}"
        file_path.rename(file_path.parent / new_name)
        print(f"  ✓ {file_path.name} -> {new_name}")
        fixed_count += 1
    
    return fixed_count


def fix_directory(dir_path: Path) -> tuple[int, int]:
    """
    修正单个目录的编号问题
    """
    print(f"\n处理目录: {dir_path.relative_to(dir_path.parent.parent)}")
    
    duplicate_fixed = fix_duplicate_numbers(dir_path)
    unnumbered_fixed = fix_unnumbered_files(dir_path)
    
    return duplicate_fixed, unnumbered_fixed


def main():
    """
    主函数
    """
    base_path = Path(__file__).parent
    
    print("=" * 80)
    print("YYC³ 文档编号修正")
    print("=" * 80)
    
    total_duplicate_fixed = 0
    total_unnumbered_fixed = 0
    
    # 遍历所有分类目录
    for category_dir in sorted(base_path.iterdir()):
        if not category_dir.is_dir():
            continue
        
        # 检查架构类和技巧类子目录
        for sub_dir in ['架构类', '技巧类']:
            sub_path = category_dir / sub_dir
            if sub_path.exists() and sub_path.is_dir():
                duplicate_fixed, unnumbered_fixed = fix_directory(sub_path)
                total_duplicate_fixed += duplicate_fixed
                total_unnumbered_fixed += unnumbered_fixed
    
    print("\n" + "=" * 80)
    print("修正完成")
    print("=" * 80)
    print(f"修正重复编号文档: {total_duplicate_fixed}")
    print(f"修正未编号文档: {total_unnumbered_fixed}")
    print(f"总计修正: {total_duplicate_fixed + total_unnumbered_fixed}")
    print("=" * 80)


if __name__ == '__main__':
    main()
