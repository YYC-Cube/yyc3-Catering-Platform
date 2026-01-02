#!/usr/bin/env python3
"""
YYC³ 文档编号规范化工具 - 第二阶段（P1）
为模版规范目录下的文档添加编号
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime
import json


class DocumentRenumberer:
    """文档编号规范化工具"""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.renumber_actions = []
        
    def get_document_list(self, directory: Path) -> List[Path]:
        """获取目录下的所有Markdown文档"""
        docs = []
        for file in directory.glob("*.md"):
            if file.name != "README.md":  # 排除README
                docs.append(file)
        return sorted(docs)
    
    def extract_number(self, filename: str) -> Tuple[int, str]:
        """从文件名中提取编号"""
        match = re.match(r'^(\d+)-(.+)', filename)
        if match:
            return int(match.group(1)), match.group(2)
        return -1, filename
    
    def needs_renumbering(self, file: Path, expected_number: int) -> bool:
        """检查文件是否需要重新编号"""
        current_number, name = self.extract_number(file.name)
        return current_number != expected_number
    
    def generate_new_filename(self, file: Path, new_number: int) -> str:
        """生成新的文件名"""
        _, name = self.extract_number(file.name)
        return f"{new_number:02d}-{name}"
    
    def renumber_documents(self, directory: Path, dry_run: bool = True) -> Dict:
        """重新编号文档"""
        docs = self.get_document_list(directory)
        
        if not docs:
            return {
                "directory": str(directory),
                "total": 0,
                "renumbered": 0,
                "failed": 0,
                "files": []
            }
        
        results = {
            "directory": str(directory),
            "total": len(docs),
            "renumbered": 0,
            "failed": 0,
            "files": []
        }
        
        for idx, doc in enumerate(docs, start=1):
            if self.needs_renumbering(doc, idx):
                old_name = doc.name
                new_name = self.generate_new_filename(doc, idx)
                old_path = str(doc)
                new_path = str(doc.parent / new_name)
                
                action = {
                    "old_name": old_name,
                    "new_name": new_name,
                    "old_path": old_path,
                    "new_path": new_path,
                    "status": "pending"
                }
                
                if not dry_run:
                    try:
                        os.rename(old_path, new_path)
                        action["status"] = "success"
                        results["renumbered"] += 1
                        print(f"✓ 已重新编号: {old_name} -> {new_name}")
                    except Exception as e:
                        action["status"] = "failed"
                        action["error"] = str(e)
                        results["failed"] += 1
                        print(f"✗ 重新编号失败: {old_name} - {e}")
                else:
                    results["renumbered"] += 1
                    print(f"[DRY-RUN] 将重新编号: {old_name} -> {new_name}")
                
                results["files"].append(action)
        
        return results
    
    def process_all_directories(self, dry_run: bool = True) -> List[Dict]:
        """处理所有目录"""
        results = []
        
        # 模版规范目录
        template_dir = self.base_path / "YYC3-Cater-模版规范"
        if template_dir.exists():
            result = self.renumber_documents(template_dir, dry_run)
            results.append(result)
        
        return results
    
    def save_report(self, results: List[Dict], dry_run: bool, suffix: str = ""):
        """保存报告"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_dir = self.base_path / "YYC3-Cater-审核报告"
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f"YYC3-文档编号规范化报告{suffix}.json"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "dry_run": dry_run,
            "summary": {
                "total_directories": len(results),
                "total_files": sum(r["total"] for r in results),
                "total_renumbered": sum(r["renumbered"] for r in results),
                "total_failed": sum(r["failed"] for r in results)
            },
            "details": results
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"\n报告已保存到: {report_file}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 文档编号规范化工具')
    parser.add_argument('--dry-run', action='store_true', help='试运行模式，不实际修改文件')
    parser.add_argument('--base-path', type=str, 
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环',
                       help='文档根目录路径')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("YYC³ 文档编号规范化工具 - 第二阶段（P1）")
    print("=" * 80)
    print(f"模式: {'DRY-RUN (试运行)' if args.dry_run else 'EXECUTE (执行)'}")
    print(f"基础路径: {args.base_path}")
    print("=" * 80)
    print()
    
    renumberer = DocumentRenumberer(args.base_path)
    results = renumberer.process_all_directories(dry_run=args.dry_run)
    
    print()
    print("=" * 80)
    print("第二阶段（P1）文档编号规范化统计")
    print("=" * 80)
    
    for result in results:
        print(f"\n目录: {result['directory']}")
        print(f"  总文件数: {result['total']}")
        print(f"  需要重新编号: {result['renumbered']}")
        print(f"  失败: {result['failed']}")
    
    print()
    print("=" * 80)
    print(f"总计:")
    print(f"  总目录数: {len(results)}")
    print(f"  总文件数: {sum(r['total'] for r in results)}")
    print(f"  需要重新编号: {sum(r['renumbered'] for r in results)}")
    print(f"  失败: {sum(r['failed'] for r in results)}")
    print("=" * 80)
    
    suffix = "_dryrun" if args.dry_run else ""
    renumberer.save_report(results, args.dry_run, suffix)
    
    if not args.dry_run:
        print("\n✓ 文档编号规范化完成！")
    else:
        print("\n✓ 试运行完成！使用 --execute 参数执行实际操作。")


if __name__ == "__main__":
    main()
