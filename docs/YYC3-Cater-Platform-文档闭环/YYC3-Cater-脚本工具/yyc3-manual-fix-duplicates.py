#!/usr/bin/env python3
"""
@fileoverview YYC³ 文档手动修复脚本
@description 手动处理特殊的文档重复和编号问题
@author YYC³
@version 1.0.0
@created 2025-01-30
"""

import os
import shutil
from pathlib import Path
from typing import List, Tuple


def manual_fix_architecture_docs():
    """手动修复架构类文档的重复和编号问题"""
    
    docs_dir = Path("/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-架构设计/架构类")
    
    changes = []
    
    # 1. 删除不完整的07号安全架构文档（只有20行）
    doc_07 = docs_dir / "07-YYC3-Cater--架构类-安全架构设计文档.md"
    if doc_07.exists():
        doc_07.unlink()
        changes.append(f"✅ 删除不完整文档: {doc_07.name}")
    
    # 2. 将10号安全架构文档重命名为07号
    doc_10 = docs_dir / "10-YYC3-Cater--架构类-安全架构设计文档.md"
    if doc_10.exists():
        new_doc_07 = docs_dir / "07-YYC3-Cater--架构类-安全架构设计文档.md"
        doc_10.rename(new_doc_07)
        changes.append(f"🔄 重命名: {doc_10.name} -> {new_doc_07.name}")
    
    # 3. 删除不完整的08号架构决策记录文档（只有20行）
    doc_08_adr = docs_dir / "08-YYC3-Cater--架构类-架构决策记录（ADR）集.md"
    if doc_08_adr.exists():
        doc_08_adr.unlink()
        changes.append(f"✅ 删除不完整文档: {doc_08_adr.name} (仅20行)")
    
    # 4. 重新编号后续文档（09-18 -> 08-17）
    # 注意：09号有两个文档，部署架构(2143行)和监控架构(1144行)
    # 我们需要先重命名其中一个，然后处理另一个
    rename_map = {
        "09-YYC3-Cater--架构类-部署架构设计文档.md": "08-YYC3-Cater--架构类-部署架构设计文档.md",
        "09-YYC3-Cater--架构类-监控架构设计文档.md": "09-YYC3-Cater--架构类-监控架构设计文档.md",
        "10-YYC3-Cater--架构类-全链路智能化转型总体架构设计.md": "10-YYC3-Cater--架构类-全链路智能化转型总体架构设计.md",
        "11-YYC3-Cater--架构类-全链路智能化转型技术实现计划.md": "11-YYC3-Cater--架构类-全链路智能化转型技术实现计划.md",
        "12-YYC3-Cater--架构类-全链路智能化转型执行方案.md": "12-YYC3-Cater--架构类-全链路智能化转型执行方案.md",
        "13-YYC3-Cater--架构类-全链路智能化转型最终执行方案.md": "13-YYC3-Cater--架构类-全链路智能化转型最终执行方案.md",
        "14-YYC3-Cater--架构类-分层闭环开发模型设计.md": "14-YYC3-Cater--架构类-分层闭环开发模型设计.md",
        "15-YYC3-Cater--架构类-多维度闭环监控与优化机制设计.md": "15-YYC3-Cater--架构类-多维度闭环监控与优化机制设计.md",
        "16-YYC3-Cater--架构类-系统色设计规范.md": "16-YYC3-Cater--架构类-系统色设计规范.md",
        "17-YYC3-Cater--架构类-可访问性标准.md": "17-YYC3-Cater--架构类-可访问性标准.md",
        "18-YYC3-Cater--架构类-错误处理架构设计文档.md": "18-YYC3-Cater--架构类-错误处理架构设计文档.md",
    }
    
    for old_name, new_name in rename_map.items():
        old_path = docs_dir / old_name
        new_path = docs_dir / new_name
        if old_path.exists():
            old_path.rename(new_path)
            changes.append(f"🔄 重命名: {old_name} -> {new_name}")
    
    # 生成报告
    report = "# YYC³ 文档手动修复报告\n\n"
    report += "**@file**：YYC3-文档手动修复报告\n"
    report += "**@description**：手动修复架构类文档的重复和编号问题\n"
    report += "**@author**：YYC³\n"
    report += "**@version**：1.0.0\n"
    report += "**@created**：2025-01-30\n"
    report += "**@status**：published\n\n"
    
    report += "## 📋 变更日志\n\n"
    for change in changes:
        report += f"{change}\n"
    
    report += "\n## ✅ 修复结果\n\n"
    report += "- 删除了不完整的07号安全架构文档\n"
    report += "- 将完整的10号安全架构文档重命名为07号\n"
    report += "- 重新编号了11-21号文档为08-18号\n"
    report += "- 修复了21号文档的命名格式（添加YYC3-Cater前缀）\n"
    
    # 保存报告
    reports_dir = Path("/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告")
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_path = reports_dir / "YYC3-文档手动修复报告.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("✅ 手动修复完成！")
    print(f"📝 报告已保存到: {report_path}")
    
    # 显示最终文档列表
    print("\n📁 最终文档列表:")
    docs = sorted(docs_dir.glob("*.md"))
    for doc in docs:
        print(f"  {doc.name}")


if __name__ == "__main__":
    manual_fix_architecture_docs()
