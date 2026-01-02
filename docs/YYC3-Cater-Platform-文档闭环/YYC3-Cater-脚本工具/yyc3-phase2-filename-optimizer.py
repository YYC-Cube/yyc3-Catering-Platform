#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
YYC³ 文件命名优化工具
用于第二阶段（P1）文件命名规范化

功能：
1. 扫描所有文件
2. 识别不符合kebab-case规范的文件名
3. 生成新的文件名
4. 执行重命名操作
"""

import os
import re
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


@dataclass
class FileRenameAction:
    """文件重命名操作"""
    original_path: str
    new_path: str
    reason: str
    executed: bool = False
    success: bool = False
    error_message: Optional[str] = None


class FilenameOptimizer:
    """文件名优化器"""
    
    def __init__(self, base_path: str, dry_run: bool = False):
        self.base_path = Path(base_path)
        self.dry_run = dry_run
        self.rename_actions: List[FileRenameAction] = []
        
        # 不需要重命名的文件
        self.ignore_files = {
            'README.md',
            'LICENSE',
            '.gitignore',
            '.env.example',
            'package.json',
            'tsconfig.json',
            'yyc3-*.py',
            'YYC3-*.md',
            '.DS_Store'
        }
    
    def is_kebab_case(self, filename: str) -> bool:
        """检查文件名是否符合kebab-case规范"""
        # 移除扩展名
        name_without_ext = Path(filename).stem
        
        # kebab-case规范：小写字母、数字、连字符
        pattern = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'
        
        return bool(re.match(pattern, name_without_ext))
    
    def to_kebab_case(self, filename: str) -> str:
        """将文件名转换为kebab-case，保留关键信息"""
        # 分离文件名和扩展名
        path = Path(filename)
        name = path.stem
        ext = path.suffix
        
        # 解析文件名结构
        # 格式：编号-YYC3-Cater--分类-描述.md
        # 例如：01-YYC3-Cater--技巧类-需求文档标准化编写指南.md
        
        # 1. 提取编号（如"01-"、"02-"等）
        number_match = re.match(r'^(\d+-)', name)
        number = number_match.group(1) if number_match else ''
        remaining = name[number_match.end():] if number_match else name
        
        # 2. 分离前缀和描述
        # 格式：YYC3-Cater--分类-描述
        parts = remaining.split('--', 1)
        if len(parts) == 2:
            prefix = parts[0]  # YYC3-Cater
            category_desc = parts[1]  # 技巧类-需求文档标准化编写指南
        else:
            prefix = ''
            category_desc = remaining
        
        # 3. 分离分类和描述
        category_desc_parts = category_desc.split('-', 1)
        if len(category_desc_parts) == 2:
            category = category_desc_parts[0]  # 技巧类
            description = category_desc_parts[1]  # 需求文档标准化编写指南
        else:
            category = ''
            description = category_desc_parts[0] if category_desc_parts else ''
        
        # 4. 转换为kebab-case
        # 转换描述部分：将空格、下划线替换为连字符
        kebab_description = re.sub(r'[\s_]+', '-', description)
        # 将大写字母转换为小写，并在前后添加连字符（如果需要）
        kebab_description = re.sub(r'([a-z])([A-Z])', r'\1-\2', kebab_description)
        # 将所有字母转换为小写
        kebab_description = kebab_description.lower()
        # 移除特殊字符（保留字母、数字、连字符和中文字符）
        kebab_description = re.sub(r'[^a-z0-9-\u4e00-\u9fff]', '-', kebab_description)
        # 移除连续的连字符
        kebab_description = re.sub(r'-+', '-', kebab_description)
        # 移除开头和结尾的连字符
        kebab_description = kebab_description.strip('-')
        
        # 5. 重新组合文件名
        # 格式：编号-YYC3-Cater--分类-描述.md
        if prefix and category:
            new_filename = f"{number}{prefix}--{category}-{kebab_description}{ext}"
        elif prefix:
            new_filename = f"{number}{prefix}--{kebab_description}{ext}"
        elif category:
            new_filename = f"{number}{category}-{kebab_description}{ext}"
        else:
            new_filename = f"{number}{kebab_description}{ext}"
        
        return new_filename
    
    def should_ignore(self, filename: str) -> bool:
        """检查文件是否应该被忽略"""
        # 检查是否在忽略列表中
        for pattern in self.ignore_files:
            if re.match(pattern, filename):
                return True
        
        # 检查是否为隐藏文件
        if filename.startswith('.'):
            return True
        
        return False
    
    def analyze_file(self, file_path: Path) -> Optional[FileRenameAction]:
        """分析文件是否需要重命名"""
        filename = file_path.name
        
        # 检查是否应该忽略
        if self.should_ignore(filename):
            return None
        
        # 检查是否符合kebab-case规范
        if self.is_kebab_case(filename):
            return None
        
        # 生成新的文件名
        new_filename = self.to_kebab_case(filename)
        new_path = file_path.parent / new_filename
        
        # 检查新文件名是否与原文件名相同
        if new_filename == filename:
            return None
        
        # 检查新文件是否已存在
        if new_path.exists():
            logger.warning(f"目标文件已存在，跳过: {new_path}")
            return None
        
        # 确定重命名原因
        reasons = []
        if '_' in filename:
            reasons.append("包含下划线")
        if ' ' in filename:
            reasons.append("包含空格")
        if any(c.isupper() for c in filename):
            reasons.append("包含大写字母")
        if re.search(r'[^a-zA-Z0-9._-]', filename):
            reasons.append("包含特殊字符")
        
        reason = "、".join(reasons) if reasons else "不符合kebab-case规范"
        
        return FileRenameAction(
            original_path=str(file_path),
            new_path=str(new_path),
            reason=reason
        )
    
    def execute_rename(self, action: FileRenameAction) -> bool:
        """执行文件重命名"""
        if self.dry_run:
            logger.info(f"[DRY-RUN] 将重命名: {Path(action.original_path).name} -> {Path(action.new_path).name}")
            action.executed = True
            return True
        
        try:
            # 执行重命名
            os.rename(action.original_path, action.new_path)
            action.executed = True
            action.success = True
            logger.info(f"✓ 已重命名: {Path(action.original_path).name} -> {Path(action.new_path).name}")
            return True
        except Exception as e:
            action.executed = True
            action.success = False
            action.error_message = str(e)
            logger.error(f"✗ 重命名失败: {Path(action.original_path).name} - {e}")
            return False
    
    def run(self) -> Dict:
        """运行文件名优化流程"""
        logger.info("=" * 80)
        logger.info("开始第二阶段（P1）文件命名优化")
        logger.info("=" * 80)
        
        # 扫描所有文件
        logger.info("\n扫描文件...")
        all_files = []
        for root, dirs, files in os.walk(self.base_path):
            # 跳过隐藏目录
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for filename in files:
                file_path = Path(root) / filename
                all_files.append(file_path)
        
        logger.info(f"找到 {len(all_files)} 个文件")
        
        # 分析文件
        logger.info("\n分析文件名...")
        for file_path in all_files:
            action = self.analyze_file(file_path)
            if action:
                self.rename_actions.append(action)
        
        # 统计
        total_actions = len(self.rename_actions)
        success_count = 0
        fail_count = 0
        
        # 执行重命名
        logger.info(f"\n执行重命名（共 {total_actions} 个文件）...")
        for action in self.rename_actions:
            if self.execute_rename(action):
                if action.success or self.dry_run:
                    success_count += 1
                else:
                    fail_count += 1
            else:
                fail_count += 1
        
        # 生成报告
        report = {
            'timestamp': datetime.now().isoformat(),
            'dry_run': self.dry_run,
            'statistics': {
                'total_files': len(all_files),
                'files_to_rename': total_actions,
                'success_count': success_count,
                'fail_count': fail_count
            },
            'rename_actions': [
                {
                    'original_path': action.original_path,
                    'new_path': action.new_path,
                    'original_name': Path(action.original_path).name,
                    'new_name': Path(action.new_path).name,
                    'reason': action.reason,
                    'executed': action.executed,
                    'success': action.success,
                    'error_message': action.error_message
                }
                for action in self.rename_actions
            ]
        }
        
        # 输出统计
        logger.info("\n" + "=" * 80)
        logger.info("第二阶段（P1）文件命名优化统计")
        logger.info("=" * 80)
        logger.info(f"总文件数: {len(all_files)}")
        logger.info(f"需要重命名: {total_actions}")
        logger.info(f"成功重命名: {success_count}")
        logger.info(f"失败重命名: {fail_count}")
        logger.info("=" * 80)
        
        return report


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 文件命名优化工具')
    parser.add_argument('--dry-run', action='store_true', help='试运行模式，不实际重命名文件')
    args = parser.parse_args()
    
    # 获取脚本所在目录的父目录（文档闭环目录）
    script_dir = Path(__file__).parent
    base_path = script_dir.parent
    
    # 创建优化器并运行
    optimizer = FilenameOptimizer(str(base_path), dry_run=args.dry_run)
    report = optimizer.run()
    
    # 保存报告
    report_path = script_dir.parent / 'YYC3-Cater-审核报告' / f'YYC3-文件命名优化报告{"_dryrun" if args.dry_run else ""}.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    logger.info(f"\n报告已保存到: {report_path}")


if __name__ == '__main__':
    main()
