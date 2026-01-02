#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文档格式审核脚本
检查文档格式统一性（标题、目录、结构）
"""

from pathlib import Path
import re
from typing import List, Dict


def check_document_structure(file_path: Path) -> Dict:
    """
    检查文档结构
    """
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return {'error': str(e)}
    
    # 检查标准头部信息
    has_standard_header = '@file' in content and '@description' in content
    
    # 检查品牌标语
    has_brand_slogan = 'YanYuCloudCube' in content or 'YYC³' in content
    
    # 检查文档信息表格
    has_info_table = '文档信息' in content or '| 文档标题' in content
    
    # 检查目录
    has_toc = '## 📑 目录' in content or '## 目录' in content or '目录' in content
    
    # 检查章节标题格式（应该使用 ## 或 ###）
    chapter_pattern = re.compile(r'^#{1,6}\s+\d+\.\s+')
    has_chapters = bool(chapter_pattern.search(content))
    
    # 检查是否有空行分隔
    has_empty_lines = '\n\n' in content
    
    # 检查代码块
    has_code_blocks = '```' in content
    
    # 检查表格
    has_tables = '|' in content and '---' in content
    
    return {
        'file_path': file_path,
        'has_standard_header': has_standard_header,
        'has_brand_slogan': has_brand_slogan,
        'has_info_table': has_info_table,
        'has_toc': has_toc,
        'has_chapters': has_chapters,
        'has_empty_lines': has_empty_lines,
        'has_code_blocks': has_code_blocks,
        'has_tables': has_tables,
        'line_count': len(lines),
        'issues': issues
    }


def check_directory_format(dir_path: Path) -> Dict:
    """
    检查目录下所有文档的格式
    """
    results = []
    
    for file_path in sorted(dir_path.glob("*.md")):
        result = check_document_structure(file_path)
        if 'error' not in result:
            results.append(result)
    
    return {
        'directory': dir_path,
        'total': len(results),
        'results': results
    }


def generate_format_report(results: List[Dict]) -> str:
    """
    生成格式审核报告
    """
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("YYC³ 文档格式统一性审核报告")
    report_lines.append("=" * 80)
    report_lines.append("")
    
    total_docs = 0
    missing_header = 0
    missing_toc = 0
    missing_info_table = 0
    missing_chapters = 0
    
    for dir_result in results:
        dir_path = dir_result['directory']
        docs = dir_result['results']
        
        if not docs:
            continue
        
        report_lines.append(f"\n📁 目录: {dir_path.relative_to(dir_path.parent.parent)}")
        report_lines.append(f"   总计文档: {len(docs)}")
        
        dir_missing_header = 0
        dir_missing_toc = 0
        dir_missing_info_table = 0
        dir_missing_chapters = 0
        
        for doc in docs:
            total_docs += 1
            
            if not doc['has_standard_header']:
                dir_missing_header += 1
                missing_header += 1
            
            if not doc['has_toc']:
                dir_missing_toc += 1
                missing_toc += 1
            
            if not doc['has_info_table']:
                dir_missing_info_table += 1
                missing_info_table += 1
            
            if not doc['has_chapters']:
                dir_missing_chapters += 1
                missing_chapters += 1
        
        if dir_missing_header > 0:
            report_lines.append(f"   🔴 缺少标准头部信息: {dir_missing_header} 个文档")
        
        if dir_missing_toc > 0:
            report_lines.append(f"   🟡 缺少目录: {dir_missing_toc} 个文档")
        
        if dir_missing_info_table > 0:
            report_lines.append(f"   🟡 缺少文档信息表格: {dir_missing_info_table} 个文档")
        
        if dir_missing_chapters > 0:
            report_lines.append(f"   🟡 缺少章节标题: {dir_missing_chapters} 个文档")
        
        if dir_missing_header == 0 and dir_missing_toc == 0 and dir_missing_info_table == 0 and dir_missing_chapters == 0:
            report_lines.append(f"   ✅ 格式规范，无问题")
    
    report_lines.append("\n" + "=" * 80)
    report_lines.append("审核总结")
    report_lines.append("=" * 80)
    report_lines.append(f"检查文档总数: {total_docs}")
    report_lines.append(f"缺少标准头部信息: {missing_header}")
    report_lines.append(f"缺少目录: {missing_toc}")
    report_lines.append(f"缺少文档信息表格: {missing_info_table}")
    report_lines.append(f"缺少章节标题: {missing_chapters}")
    
    total_issues = missing_header + missing_toc + missing_info_table + missing_chapters
    
    if total_issues == 0:
        report_lines.append("\n✅ 所有文档格式统一，符合规范")
    else:
        report_lines.append(f"\n⚠️  发现 {total_issues} 个格式问题需要处理")
    
    report_lines.append("=" * 80)
    
    return "\n".join(report_lines)


def main():
    """
    主函数
    """
    base_path = Path(__file__).parent
    
    print("开始检查文档格式...")
    print()
    
    results = []
    
    # 遍历所有分类目录
    for category_dir in sorted(base_path.iterdir()):
        if not category_dir.is_dir():
            continue
        
        # 检查架构类和技巧类子目录
        for sub_dir in ['架构类', '技巧类']:
            sub_path = category_dir / sub_dir
            if sub_path.exists() and sub_path.is_dir():
                result = check_directory_format(sub_path)
                if result['total'] > 0:
                    results.append(result)
    
    report = generate_format_report(results)
    
    print(report)
    
    # 保存报告
    report_path = base_path / "YYC3-文档格式审核报告.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n报告已保存到: {report_path}")


if __name__ == '__main__':
    main()
