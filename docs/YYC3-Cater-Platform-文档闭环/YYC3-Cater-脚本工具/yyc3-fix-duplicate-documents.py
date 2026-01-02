#!/usr/bin/env python3
"""
@fileoverview YYC³ 文档重复处理脚本
@description 处理重复文档，保留更完整的版本并重新编号
@author YYC³
@version 1.0.0
@created 2025-01-30
"""

import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Tuple


class DuplicateDocumentFixer:
    """文档重复处理类"""
    
    def __init__(self, docs_root: str):
        self.docs_root = Path(docs_root)
        self.changes_log = []
    
    def find_duplicate_documents(self) -> Dict[str, List[Path]]:
        """查找重复文档"""
        duplicates = {}
        
        # 遍历所有架构类目录
        for category_dir in self.docs_root.rglob("*/架构类"):
            if not category_dir.is_dir():
                continue
            
            # 按文档名称分组
            doc_groups: Dict[str, List[Path]] = {}
            
            for doc_file in category_dir.glob("*.md"):
                # 提取文档名称（去除编号和前缀）
                match = re.match(r'^\d{2}-YYC3-Cater--(架构类|技巧类)-(.+)\.md$', doc_file.name)
                if match:
                    doc_name = match.group(2)
                    if doc_name not in doc_groups:
                        doc_groups[doc_name] = []
                    doc_groups[doc_name].append(doc_file)
            
            # 找出重复的文档
            for doc_name, files in doc_groups.items():
                if len(files) > 1:
                    duplicates[str(category_dir)] = files
        
        return duplicates
    
    def compare_document_completeness(self, files: List[Path]) -> Tuple[Path, List[Path]]:
        """比较文档完整性，返回保留的文档和要删除的文档"""
        # 按行数排序，保留最长的文档
        sorted_files = sorted(files, key=lambda f: f.stat().st_size, reverse=True)
        keep_file = sorted_files[0]
        delete_files = sorted_files[1:]
        
        return keep_file, delete_files
    
    def delete_duplicate_files(self, delete_files: List[Path]) -> None:
        """删除重复文件"""
        for file in delete_files:
            try:
                file.unlink()
                self.changes_log.append(f"✅ 删除重复文档: {file}")
            except Exception as e:
                self.changes_log.append(f"❌ 删除失败: {file} - {str(e)}")
    
    def renumber_documents(self, category_dir: Path) -> None:
        """重新编号文档"""
        # 获取所有文档并按原编号排序
        docs = sorted(category_dir.glob("*.md"), key=lambda f: self.extract_number(f.name))
        
        new_number = 1
        for doc in docs:
            match = re.match(r'^\d{2}-(.+)$', doc.name)
            if match:
                new_name = f"{new_number:02d}-{match.group(1)}"
                if new_name != doc.name:
                    new_path = doc.parent / new_name
                    try:
                        doc.rename(new_path)
                        self.changes_log.append(f"🔄 重命名: {doc.name} -> {new_name}")
                    except Exception as e:
                        self.changes_log.append(f"❌ 重命名失败: {doc.name} - {str(e)}")
                new_number += 1
    
    def extract_number(self, filename: str) -> int:
        """从文件名中提取编号"""
        match = re.match(r'^(\d{2})-', filename)
        if match:
            return int(match.group(1))
        return 999
    
    def fix_all_duplicates(self) -> None:
        """修复所有重复文档"""
        duplicates = self.find_duplicate_documents()
        
        if not duplicates:
            print("✅ 未发现重复文档")
            return
        
        print(f"🔍 发现 {len(duplicates)} 组重复文档")
        
        for category_dir, files in duplicates.items():
            print(f"\n📁 处理目录: {category_dir}")
            
            # 比较文档完整性
            keep_file, delete_files = self.compare_document_completeness(files)
            
            print(f"   保留: {keep_file.name} ({keep_file.stat().st_size} bytes)")
            for f in delete_files:
                print(f"   删除: {f.name} ({f.stat().st_size} bytes)")
            
            # 删除重复文件
            self.delete_duplicate_files(delete_files)
            
            # 重新编号文档
            print("   🔄 重新编号文档...")
            self.renumber_documents(Path(category_dir))
    
    def generate_report(self) -> str:
        """生成变更报告"""
        report = "# YYC³ 文档重复处理报告\n\n"
        report += "**@file**：YYC3-文档重复处理报告\n"
        report += "**@description**：文档重复处理和重新编号报告\n"
        report += "**@author**：YYC³\n"
        report += "**@version**：1.0.0\n"
        report += "**@created**：2025-01-30\n"
        report += "**@status**：published\n\n"
        
        report += "## 📋 变更日志\n\n"
        
        for log in self.changes_log:
            report += f"{log}\n"
        
        return report


def main():
    """主函数"""
    docs_root = "/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环"
    reports_dir = Path(docs_root) / "YYC3-Cater-审核报告"
    
    # 创建报告目录
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    # 创建修复器
    fixer = DuplicateDocumentFixer(docs_root)
    
    # 修复重复文档
    print("🔍 开始处理重复文档...")
    fixer.fix_all_duplicates()
    
    # 生成报告
    print("\n📝 生成处理报告...")
    report = fixer.generate_report()
    report_path = reports_dir / "YYC3-文档重复处理报告.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ 处理完成！报告已保存到: {report_path}")


if __name__ == "__main__":
    main()
