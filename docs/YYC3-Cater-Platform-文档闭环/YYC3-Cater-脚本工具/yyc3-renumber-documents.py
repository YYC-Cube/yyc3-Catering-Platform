#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文档编号重新编号脚本
使用连续编号重新组织所有文档
"""

from pathlib import Path
import re


def extract_number_from_filename(filename: str) -> tuple[int, str]:
    """
    从文件名中提取编号
    返回 (编号, 剩余文件名)
    """
    match = re.match(r'^(\d+)(?:-\d+)?-(.+)$', filename)
    if match:
        return int(match.group(1)), match.group(2)
    return 0, filename


def renumber_directory(dir_path: Path) -> int:
    """
    重新编号目录下的所有文档
    使用连续编号
    """
    files = sorted(dir_path.glob("*.md"))
    if not files:
        return 0
    
    print(f"\n重新编号目录: {dir_path.relative_to(dir_path.parent.parent)}")
    
    # 提取所有文件并按原编号排序
    numbered_files = []
    for file_path in files:
        number, name = extract_number_from_filename(file_path.name)
        numbered_files.append((number, name, file_path))
    
    # 按原编号排序，未编号的排在最后
    numbered_files.sort(key=lambda x: (0 if x[0] == 0 else x[0], x[2].name))
    
    # 重新编号
    renamed_count = 0
    for new_number, (old_number, name, file_path) in enumerate(numbered_files, 1):
        new_name = f"{new_number:02d}-{name}"
        if file_path.name != new_name:
            file_path.rename(file_path.parent / new_name)
            print(f"  {file_path.name} -> {new_name}")
            renamed_count += 1
        else:
            print(f"  ✓ {file_path.name} (无需修改)")
    
    return renamed_count


def main():
    """
    主函数
    """
    base_path = Path(__file__).parent
    
    print("=" * 80)
    print("YYC³ 文档重新编号")
    print("=" * 80)
    
    total_renamed = 0
    
    # 遍历所有分类目录
    for category_dir in sorted(base_path.iterdir()):
        if not category_dir.is_dir():
            continue
        
        # 检查架构类和技巧类子目录
        for sub_dir in ['架构类', '技巧类']:
            sub_path = category_dir / sub_dir
            if sub_path.exists() and sub_path.is_dir():
                renamed = renumber_directory(sub_path)
                total_renamed += renamed
    
    print("\n" + "=" * 80)
    print("重新编号完成")
    print("=" * 80)
    print(f"总计重新编号: {total_renamed} 个文档")
    print("=" * 80)


if __name__ == '__main__':
    main()
