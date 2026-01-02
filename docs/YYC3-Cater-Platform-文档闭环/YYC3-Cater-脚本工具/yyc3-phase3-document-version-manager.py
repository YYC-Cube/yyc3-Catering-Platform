#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
@file: yyc3-phase3-document-version-manager.py
@description: YYC³文档版本管理工具 - 基于Git的文档版本控制和管理
@author: YYC³
@version: 1.0.0
@created: 2025-01-30
@updated: 2025-01-30
@copyright: Copyright (c) 2025 YYC³
@license: MIT
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum


class VersionStatus(Enum):
    """版本状态枚举"""
    DRAFT = "草稿"
    REVIEW = "审核中"
    APPROVED = "已审核"
    PUBLISHED = "已发布"
    DEPRECATED = "已废弃"
    ARCHIVED = "已归档"


@dataclass
class DocumentVersion:
    """文档版本信息"""
    doc_name: str
    version: str
    status: VersionStatus
    created_at: str
    author: str
    commit_hash: str
    message: str
    changes: List[str]
    metadata: Dict[str, any]


@dataclass
class VersionDiff:
    """版本差异信息"""
    old_version: str
    new_version: str
    changed_files: List[str]
    additions: int
    deletions: int
    changes_summary: str


class DocumentVersionManager:
    """文档版本管理器"""
    
    def __init__(self, docs_dir: str, version_db_path: str):
        """
        初始化版本管理器
        
        Args:
            docs_dir: 文档目录路径
            version_db_path: 版本数据库路径
        """
        self.docs_dir = Path(docs_dir)
        self.version_db_path = Path(version_db_path)
        self.version_db = self._load_version_db()
        
        # 确保目录存在
        self.docs_dir.mkdir(parents=True, exist_ok=True)
        self.version_db_path.parent.mkdir(parents=True, exist_ok=True)
    
    def _load_version_db(self) -> Dict[str, List[DocumentVersion]]:
        """加载版本数据库"""
        if not self.version_db_path.exists():
            return {}
        
        try:
            with open(self.version_db_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # 转换为DocumentVersion对象
                version_db = {}
                for doc_name, versions in data.items():
                    version_db[doc_name] = [
                        DocumentVersion(
                            doc_name=v['doc_name'],
                            version=v['version'],
                            status=VersionStatus(v['status']),
                            created_at=v['created_at'],
                            author=v['author'],
                            commit_hash=v['commit_hash'],
                            message=v['message'],
                            changes=v['changes'],
                            metadata=v.get('metadata', {})
                        )
                        for v in versions
                    ]
                return version_db
        except Exception as e:
            print(f"✗ 加载版本数据库失败: {e}")
            return {}
    
    def _save_version_db(self):
        """保存版本数据库"""
        try:
            # 转换为可序列化的字典
            data = {}
            for doc_name, versions in self.version_db.items():
                data[doc_name] = [
                    {
                        'doc_name': v.doc_name,
                        'version': v.version,
                        'status': v.status.value,
                        'created_at': v.created_at,
                        'author': v.author,
                        'commit_hash': v.commit_hash,
                        'message': v.message,
                        'changes': v.changes,
                        'metadata': v.metadata
                    }
                    for v in versions
                ]
            
            with open(self.version_db_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✓ 版本数据库已保存: {self.version_db_path}")
        except Exception as e:
            print(f"✗ 保存版本数据库失败: {e}")
    
    def _get_git_commit_hash(self) -> str:
        """获取当前Git提交哈希"""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=self.docs_dir,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except Exception as e:
            print(f"✗ 获取Git提交哈希失败: {e}")
            return "unknown"
    
    def _get_git_diff_stats(self, file_path: str) -> Tuple[int, int]:
        """获取文件的Git差异统计"""
        try:
            result = subprocess.run(
                ['git', 'diff', '--shortstat', file_path],
                cwd=self.docs_dir,
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout.strip()
            
            # 解析差异统计
            additions = 0
            deletions = 0
            
            if 'insertion' in output:
                parts = output.split()
                for i, part in enumerate(parts):
                    if 'insertion' in part:
                        additions = int(parts[i-1])
            
            if 'deletion' in output:
                parts = output.split()
                for i, part in enumerate(parts):
                    if 'deletion' in part:
                        deletions = int(parts[i-1])
            
            return additions, deletions
        except Exception as e:
            print(f"✗ 获取Git差异统计失败: {e}")
            return 0, 0
    
    def _get_changed_files(self) -> List[str]:
        """获取已修改的文件列表"""
        try:
            result = subprocess.run(
                ['git', 'diff', '--name-only'],
                cwd=self.docs_dir,
                capture_output=True,
                text=True,
                check=True
            )
            return [f for f in result.stdout.strip().split('\n') if f]
        except Exception as e:
            print(f"✗ 获取已修改文件失败: {e}")
            return []
    
    def create_version(
        self,
        doc_name: str,
        version: str,
        status: VersionStatus,
        author: str,
        message: str,
        changes: List[str],
        metadata: Optional[Dict[str, any]] = None
    ) -> DocumentVersion:
        """
        创建新版本
        
        Args:
            doc_name: 文档名称
            version: 版本号
            status: 版本状态
            author: 作者
            message: 版本说明
            changes: 变更列表
            metadata: 元数据
            
        Returns:
            DocumentVersion: 创建的版本对象
        """
        # 获取Git提交哈希
        commit_hash = self._get_git_commit_hash()
        
        # 创建版本对象
        doc_version = DocumentVersion(
            doc_name=doc_name,
            version=version,
            status=status,
            created_at=datetime.now().isoformat(),
            author=author,
            commit_hash=commit_hash,
            message=message,
            changes=changes,
            metadata=metadata or {}
        )
        
        # 添加到版本数据库
        if doc_name not in self.version_db:
            self.version_db[doc_name] = []
        
        self.version_db[doc_name].append(doc_version)
        
        # 保存版本数据库
        self._save_version_db()
        
        print(f"✓ 版本已创建: {doc_name} v{version}")
        return doc_version
    
    def get_versions(self, doc_name: str) -> List[DocumentVersion]:
        """
        获取文档的所有版本
        
        Args:
            doc_name: 文档名称
            
        Returns:
            List[DocumentVersion]: 版本列表
        """
        return self.version_db.get(doc_name, [])
    
    def get_latest_version(self, doc_name: str) -> Optional[DocumentVersion]:
        """
        获取文档的最新版本
        
        Args:
            doc_name: 文档名称
            
        Returns:
            Optional[DocumentVersion]: 最新版本对象
        """
        versions = self.get_versions(doc_name)
        return versions[-1] if versions else None
    
    def get_version_by_number(self, doc_name: str, version: str) -> Optional[DocumentVersion]:
        """
        根据版本号获取文档版本
        
        Args:
            doc_name: 文档名称
            version: 版本号
            
        Returns:
            Optional[DocumentVersion]: 版本对象
        """
        versions = self.get_versions(doc_name)
        for v in versions:
            if v.version == version:
                return v
        return None
    
    def update_version_status(
        self,
        doc_name: str,
        version: str,
        new_status: VersionStatus
    ) -> bool:
        """
        更新版本状态
        
        Args:
            doc_name: 文档名称
            version: 版本号
            new_status: 新状态
            
        Returns:
            bool: 是否成功
        """
        versions = self.get_versions(doc_name)
        for v in versions:
            if v.version == version:
                v.status = new_status
                self._save_version_db()
                print(f"✓ 版本状态已更新: {doc_name} v{version} -> {new_status.value}")
                return True
        
        print(f"✗ 版本不存在: {doc_name} v{version}")
        return False
    
    def compare_versions(
        self,
        doc_name: str,
        version1: str,
        version2: str
    ) -> Optional[VersionDiff]:
        """
        比较两个版本
        
        Args:
            doc_name: 文档名称
            version1: 版本号1
            version2: 版本号2
            
        Returns:
            Optional[VersionDiff]: 版本差异对象
        """
        v1 = self.get_version_by_number(doc_name, version1)
        v2 = self.get_version_by_number(doc_name, version2)
        
        if not v1 or not v2:
            print(f"✗ 版本不存在")
            return None
        
        try:
            # 获取两个提交之间的差异
            result = subprocess.run(
                ['git', 'diff', '--stat', v1.commit_hash, v2.commit_hash],
                cwd=self.docs_dir,
                capture_output=True,
                text=True,
                check=True
            )
            
            output = result.stdout.strip()
            
            # 解析差异统计
            additions = 0
            deletions = 0
            changed_files = []
            
            for line in output.split('\n'):
                if '|' in line:
                    file_path = line.split('|')[0].strip()
                    changed_files.append(file_path)
                    
                    # 统计增删行数
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if 'insertion' in part:
                            additions += int(parts[i-1])
                        if 'deletion' in part:
                            deletions += int(parts[i-1])
            
            # 生成变更摘要
            changes_summary = f"从 {version1} 到 {version2} 的变更："
            changes_summary += f"\n- 修改文件: {len(changed_files)} 个"
            changes_summary += f"\n- 新增行数: {additions}"
            changes_summary += f"\n- 删除行数: {deletions}"
            
            return VersionDiff(
                old_version=version1,
                new_version=version2,
                changed_files=changed_files,
                additions=additions,
                deletions=deletions,
                changes_summary=changes_summary
            )
            
        except Exception as e:
            print(f"✗ 比较版本失败: {e}")
            return None
    
    def rollback_version(
        self,
        doc_name: str,
        target_version: str
    ) -> bool:
        """
        回滚到指定版本
        
        Args:
            doc_name: 文档名称
            target_version: 目标版本号
            
        Returns:
            bool: 是否成功
        """
        target_ver = self.get_version_by_number(doc_name, target_version)
        if not target_ver:
            print(f"✗ 版本不存在: {doc_name} v{target_version}")
            return False
        
        try:
            # 查找文档文件
            doc_file = self.docs_dir / f"{doc_name}.md"
            if not doc_file.exists():
                print(f"✗ 文档文件不存在: {doc_file}")
                return False
            
            # 使用git checkout恢复文件
            subprocess.run(
                ['git', 'checkout', target_ver.commit_hash, '--', str(doc_file)],
                cwd=self.docs_dir,
                check=True
            )
            
            print(f"✓ 文档已回滚到版本: {doc_name} v{target_version}")
            return True
            
        except Exception as e:
            print(f"✗ 回滚版本失败: {e}")
            return False
    
    def tag_version(
        self,
        doc_name: str,
        version: str,
        tag_name: str,
        tag_message: str
    ) -> bool:
        """
        为版本打标签
        
        Args:
            doc_name: 文档名称
            version: 版本号
            tag_name: 标签名称
            tag_message: 标签说明
            
        Returns:
            bool: 是否成功
        """
        target_ver = self.get_version_by_number(doc_name, version)
        if not target_ver:
            print(f"✗ 版本不存在: {doc_name} v{version}")
            return False
        
        try:
            # 创建Git标签
            subprocess.run(
                ['git', 'tag', '-a', tag_name, '-m', tag_message, target_ver.commit_hash],
                cwd=self.docs_dir,
                check=True
            )
            
            print(f"✓ 标签已创建: {tag_name} -> {doc_name} v{version}")
            return True
            
        except Exception as e:
            print(f"✗ 创建标签失败: {e}")
            return False
    
    def list_all_documents(self) -> List[str]:
        """
        列出所有文档
        
        Returns:
            List[str]: 文档名称列表
        """
        return list(self.version_db.keys())
    
    def get_version_history(self, doc_name: str) -> str:
        """
        获取版本历史（Markdown格式）
        
        Args:
            doc_name: 文档名称
            
        Returns:
            str: 版本历史Markdown文本
        """
        versions = self.get_versions(doc_name)
        
        if not versions:
            return f"# {doc_name} 版本历史\n\n暂无版本记录\n"
        
        markdown = f"# {doc_name} 版本历史\n\n"
        
        for i, version in enumerate(reversed(versions), 1):
            markdown += f"## v{version.version} - {version.status.value}\n\n"
            markdown += f"- **创建时间**: {version.created_at}\n"
            markdown += f"- **作者**: {version.author}\n"
            markdown += f"- **提交哈希**: `{version.commit_hash}`\n"
            markdown += f"- **说明**: {version.message}\n\n"
            
            if version.changes:
                markdown += "### 变更内容\n\n"
                for change in version.changes:
                    markdown += f"- {change}\n"
                markdown += "\n"
            
            if version.metadata:
                markdown += "### 元数据\n\n"
                for key, value in version.metadata.items():
                    markdown += f"- **{key}**: {value}\n"
                markdown += "\n"
            
            markdown += "---\n\n"
        
        return markdown
    
    def export_version_report(self, output_path: str):
        """
        导出版本报告
        
        Args:
            output_path: 输出文件路径
        """
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # 生成报告
        report = "# YYC³ 文档版本管理报告\n\n"
        report += f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        report += "---\n\n"
        
        # 统计信息
        total_docs = len(self.version_db)
        total_versions = sum(len(versions) for versions in self.version_db.values())
        
        report += "## 📊 统计信息\n\n"
        report += f"- **文档总数**: {total_docs}\n"
        report += f"- **版本总数**: {total_versions}\n"
        report += f"- **平均版本数**: {total_versions / total_docs:.1f}\n\n"
        
        # 状态分布
        status_count = {}
        for versions in self.version_db.values():
            for version in versions:
                status = version.status.value
                status_count[status] = status_count.get(status, 0) + 1
        
        report += "### 版本状态分布\n\n"
        for status, count in sorted(status_count.items()):
            report += f"- **{status}**: {count}\n"
        report += "\n"
        
        # 文档列表
        report += "## 📚 文档列表\n\n"
        for doc_name in sorted(self.version_db.keys()):
            versions = self.get_versions(doc_name)
            latest = versions[-1] if versions else None
            
            report += f"### {doc_name}\n\n"
            report += f"- **版本数**: {len(versions)}\n"
            if latest:
                report += f"- **最新版本**: v{latest.version} ({latest.status.value})\n"
                report += f"- **最后更新**: {latest.created_at}\n"
            report += "\n"
        
        # 保存报告
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✓ 版本报告已导出: {output_path}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³文档版本管理工具')
    parser.add_argument('--docs-dir', required=True, help='文档目录路径')
    parser.add_argument('--version-db', required=True, help='版本数据库路径')
    
    subparsers = parser.add_subparsers(dest='command', help='子命令')
    
    # 创建版本
    create_parser = subparsers.add_parser('create', help='创建新版本')
    create_parser.add_argument('--doc-name', required=True, help='文档名称')
    create_parser.add_argument('--version', required=True, help='版本号')
    create_parser.add_argument('--status', required=True, choices=['draft', 'review', 'approved', 'published', 'deprecated', 'archived'], help='版本状态')
    create_parser.add_argument('--author', required=True, help='作者')
    create_parser.add_argument('--message', required=True, help='版本说明')
    create_parser.add_argument('--changes', required=True, help='变更列表（逗号分隔）')
    
    # 列出版本
    list_parser = subparsers.add_parser('list', help='列出版本')
    list_parser.add_argument('--doc-name', required=True, help='文档名称')
    
    # 更新状态
    update_parser = subparsers.add_parser('update', help='更新版本状态')
    update_parser.add_argument('--doc-name', required=True, help='文档名称')
    update_parser.add_argument('--version', required=True, help='版本号')
    update_parser.add_argument('--status', required=True, choices=['draft', 'review', 'approved', 'published', 'deprecated', 'archived'], help='新状态')
    
    # 比较版本
    compare_parser = subparsers.add_parser('compare', help='比较版本')
    compare_parser.add_argument('--doc-name', required=True, help='文档名称')
    compare_parser.add_argument('--version1', required=True, help='版本号1')
    compare_parser.add_argument('--version2', required=True, help='版本号2')
    
    # 回滚版本
    rollback_parser = subparsers.add_parser('rollback', help='回滚版本')
    rollback_parser.add_argument('--doc-name', required=True, help='文档名称')
    rollback_parser.add_argument('--version', required=True, help='目标版本号')
    
    # 打标签
    tag_parser = subparsers.add_parser('tag', help='为版本打标签')
    tag_parser.add_argument('--doc-name', required=True, help='文档名称')
    tag_parser.add_argument('--version', required=True, help='版本号')
    tag_parser.add_argument('--tag-name', required=True, help='标签名称')
    tag_parser.add_argument('--tag-message', required=True, help='标签说明')
    
    # 导出报告
    export_parser = subparsers.add_parser('export', help='导出版本报告')
    export_parser.add_argument('--output', required=True, help='输出文件路径')
    
    args = parser.parse_args()
    
    # 创建版本管理器
    manager = DocumentVersionManager(args.docs_dir, args.version_db)
    
    # 执行命令
    if args.command == 'create':
        status_map = {
            'draft': VersionStatus.DRAFT,
            'review': VersionStatus.REVIEW,
            'approved': VersionStatus.APPROVED,
            'published': VersionStatus.PUBLISHED,
            'deprecated': VersionStatus.DEPRECATED,
            'archived': VersionStatus.ARCHIVED
        }
        
        manager.create_version(
            doc_name=args.doc_name,
            version=args.version,
            status=status_map[args.status],
            author=args.author,
            message=args.message,
            changes=[c.strip() for c in args.changes.split(',')]
        )
    
    elif args.command == 'list':
        versions = manager.get_versions(args.doc_name)
        print(f"\n{args.doc_name} 的版本列表:\n")
        for v in versions:
            print(f"  v{v.version} - {v.status.value} - {v.created_at} - {v.message}")
    
    elif args.command == 'update':
        status_map = {
            'draft': VersionStatus.DRAFT,
            'review': VersionStatus.REVIEW,
            'approved': VersionStatus.APPROVED,
            'published': VersionStatus.PUBLISHED,
            'deprecated': VersionStatus.DEPRECATED,
            'archived': VersionStatus.ARCHIVED
        }
        
        manager.update_version_status(
            doc_name=args.doc_name,
            version=args.version,
            new_status=status_map[args.status]
        )
    
    elif args.command == 'compare':
        diff = manager.compare_versions(args.doc_name, args.version1, args.version2)
        if diff:
            print(f"\n{diff.changes_summary}\n")
            print("修改的文件:")
            for f in diff.changed_files:
                print(f"  - {f}")
    
    elif args.command == 'rollback':
        manager.rollback_version(args.doc_name, args.version)
    
    elif args.command == 'tag':
        manager.tag_version(args.doc_name, args.version, args.tag_name, args.tag_message)
    
    elif args.command == 'export':
        manager.export_version_report(args.output)


if __name__ == '__main__':
    main()
