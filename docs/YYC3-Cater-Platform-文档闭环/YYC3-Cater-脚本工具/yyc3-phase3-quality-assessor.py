#!/usr/bin/env python3
"""
YYC³ 文档质量评估工具 - 第三阶段（P2）
多维度评估文档质量，提供改进建议
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import json
from dataclasses import dataclass, field
from collections import Counter


@dataclass
class DocumentQualityMetrics:
    """文档质量指标"""
    completeness: float = 0.0  # 完整性
    accuracy: float = 0.0  # 准确性
    readability: float = 0.0  # 可读性
    practicality: float = 0.0  # 实用性
    consistency: float = 0.0  # 一致性
    overall_score: float = 0.0  # 综合评分
    
    # 详细指标
    has_title: bool = False
    has_description: bool = False
    has_author: bool = False
    has_version: bool = False
    has_table_of_contents: bool = False
    has_code_examples: bool = False
    has_best_practices: bool = False
    has_case_studies: bool = False
    has_faq: bool = False
    has_references: bool = False
    
    # 统计信息
    total_sections: int = 0
    code_blocks: int = 0
    code_lines: int = 0
    total_lines: int = 0
    word_count: int = 0
    avg_section_length: float = 0.0


@dataclass
class QualityIssue:
    """质量问题"""
    severity: str  # critical, major, minor, info
    category: str  # completeness, accuracy, readability, practicality, consistency
    message: str
    suggestion: str
    line_number: Optional[int] = None


@dataclass
class DocumentQualityReport:
    """文档质量评估报告"""
    file_path: str
    file_name: str
    doc_type: str
    metrics: DocumentQualityMetrics
    issues: List[QualityIssue] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    grade: str = "F"  # A, B, C, D, F


class DocumentQualityAssessor:
    """文档质量评估器"""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.reports: List[DocumentQualityReport] = []
        
        # 标准章节列表
        self.standard_sections = [
            "概述", "简介", "背景", "目标", "范围",
            "核心概念", "基本概念", "术语", "定义",
            "实施步骤", "实现步骤", "操作指南", "使用方法",
            "代码示例", "示例代码", "代码实现",
            "注意事项", "注意事项", "限制", "约束",
            "最佳实践", "实践建议", "经验总结",
            "常见问题", "FAQ", "问题解答",
            "案例分析", "案例研究", "实际案例",
            "总结", "总结与展望", "结论",
            "参考文档", "相关文档", "参考资料"
        ]
        
        # 文档类型权重
        self.doc_type_weights = {
            "architecture": {
                "completeness": 0.25,
                "accuracy": 0.30,
                "readability": 0.15,
                "practicality": 0.20,
                "consistency": 0.10
            },
            "technique": {
                "completeness": 0.20,
                "accuracy": 0.20,
                "readability": 0.20,
                "practicality": 0.30,
                "consistency": 0.10
            },
            "template": {
                "completeness": 0.30,
                "accuracy": 0.20,
                "readability": 0.15,
                "practicality": 0.25,
                "consistency": 0.10
            }
        }
    
    def detect_doc_type(self, file_path: Path) -> str:
        """检测文档类型"""
        file_name = file_path.name.lower()
        
        if "架构类" in file_name:
            return "architecture"
        elif "技巧类" in file_name:
            return "technique"
        elif "模版" in file_name or "模板" in file_name:
            return "template"
        else:
            return "technique"  # 默认
    
    def extract_metadata(self, content: str) -> Dict[str, bool]:
        """提取文档元数据"""
        metadata = {
            "has_title": False,
            "has_description": False,
            "has_author": False,
            "has_version": False,
            "has_table_of_contents": False
        }
        
        # 检查标题
        if re.search(r'^#\s+.+', content, re.MULTILINE):
            metadata["has_title"] = True
        
        # 检查描述
        if re.search(r'@description|描述|说明', content):
            metadata["has_description"] = True
        
        # 检查作者
        if re.search(r'@author|作者', content):
            metadata["has_author"] = True
        
        # 检查版本
        if re.search(r'@version|版本|v\d+\.\d+\.\d+', content):
            metadata["has_version"] = True
        
        # 检查目录
        if re.search(r'目录|TOC|##\s+\d+\.', content):
            metadata["has_table_of_contents"] = True
        
        return metadata
    
    def count_sections(self, content: str) -> int:
        """统计章节数量"""
        # 统计二级标题（##）
        sections = re.findall(r'^##\s+.+', content, re.MULTILINE)
        return len(sections)
    
    def count_code_blocks(self, content: str) -> Tuple[int, int]:
        """统计代码块数量和代码行数"""
        # 统计代码块
        code_blocks = re.findall(r'```[\s\S]*?```', content)
        block_count = len(code_blocks)
        
        # 统计代码行数
        code_lines = 0
        for block in code_blocks:
            lines = block.split('\n')
            # 排除代码块标记行
            code_lines += len([l for l in lines if l and not l.startswith('```')])
        
        return block_count, code_lines
    
    def check_standard_sections(self, content: str) -> Dict[str, bool]:
        """检查标准章节是否存在"""
        sections_found = {}
        
        for section in self.standard_sections:
            # 检查章节标题
            pattern = rf'^##\s*.*{section}.*$'
            if re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
                sections_found[section] = True
            else:
                sections_found[section] = False
        
        return sections_found
    
    def assess_completeness(self, content: str, metrics: DocumentQualityMetrics) -> float:
        """评估完整性"""
        score = 0.0
        max_score = 100.0
        
        # 元数据完整性 (30分)
        metadata_score = 0
        if metrics.has_title:
            metadata_score += 6
        if metrics.has_description:
            metadata_score += 6
        if metrics.has_author:
            metadata_score += 6
        if metrics.has_version:
            metadata_score += 6
        if metrics.has_table_of_contents:
            metadata_score += 6
        score += metadata_score
        
        # 章节完整性 (40分)
        sections = self.check_standard_sections(content)
        sections_score = sum(sections.values()) / len(sections) * 40
        score += sections_score
        
        # 内容完整性 (30分)
        content_score = 0
        if metrics.has_code_examples:
            content_score += 10
        if metrics.has_best_practices:
            content_score += 10
        if metrics.has_case_studies:
            content_score += 5
        if metrics.has_faq:
            content_score += 5
        score += content_score
        
        return score / max_score
    
    def assess_accuracy(self, content: str, metrics: DocumentQualityMetrics) -> float:
        """评估准确性"""
        score = 0.0
        max_score = 100.0
        
        # 检查代码示例 (40分)
        if metrics.has_code_examples and metrics.code_blocks > 0:
            score += 40
        elif metrics.code_blocks > 0:
            score += 20
        
        # 检查技术准确性 (30分)
        # 检查是否有具体的技术细节
        if re.search(r'(API|接口|函数|类|方法|参数|返回值)', content):
            score += 15
        if re.search(r'(示例|例子|demo|Demo)', content):
            score += 15
        
        # 检查版本信息 (30分)
        if metrics.has_version:
            score += 30
        
        return score / max_score
    
    def assess_readability(self, content: str, metrics: DocumentQualityMetrics) -> float:
        """评估可读性"""
        score = 0.0
        max_score = 100.0
        
        # 段落长度 (20分)
        paragraphs = content.split('\n\n')
        avg_para_length = sum(len(p) for p in paragraphs) / len(paragraphs) if paragraphs else 0
        if 100 <= avg_para_length <= 500:
            score += 20
        elif 50 <= avg_para_length < 100 or 500 < avg_para_length <= 800:
            score += 10
        
        # 标题层级 (20分)
        headers = re.findall(r'^#+\s+.+', content, re.MULTILINE)
        if len(headers) >= 5:
            score += 20
        elif len(headers) >= 3:
            score += 10
        
        # 列表使用 (20分)
        lists = re.findall(r'^\s*[-*+]\s+', content, re.MULTILINE)
        if len(lists) >= 10:
            score += 20
        elif len(lists) >= 5:
            score += 10
        
        # 表格使用 (20分)
        tables = re.findall(r'\|.*\|', content)
        if len(tables) >= 3:
            score += 20
        elif len(tables) >= 1:
            score += 10
        
        # 代码注释 (20分)
        if metrics.code_blocks > 0:
            score += 20
        
        return score / max_score
    
    def assess_practicality(self, content: str, metrics: DocumentQualityMetrics) -> float:
        """评估实用性"""
        score = 0.0
        max_score = 100.0
        
        # 代码示例 (30分)
        if metrics.has_code_examples:
            if metrics.code_blocks >= 3:
                score += 30
            elif metrics.code_blocks >= 1:
                score += 15
        
        # 最佳实践 (30分)
        if metrics.has_best_practices:
            score += 30
        
        # 案例分析 (20分)
        if metrics.has_case_studies:
            score += 20
        
        # 常见问题 (20分)
        if metrics.has_faq:
            score += 20
        
        return score / max_score
    
    def assess_consistency(self, content: str, metrics: DocumentQualityMetrics) -> float:
        """评估一致性"""
        score = 0.0
        max_score = 100.0
        
        # 命名一致性 (30分)
        # 检查术语是否一致
        terms = re.findall(r'\b[A-Z][a-zA-Z]+\b', content)
        term_counts = Counter(terms)
        # 如果有重复的大写术语，说明命名一致
        if term_counts.most_common(1)[0][1] >= 3:
            score += 30
        elif term_counts.most_common(1)[0][1] >= 2:
            score += 15
        
        # 格式一致性 (30分)
        # 检查标题格式
        headers = re.findall(r'^#+\s+.+', content, re.MULTILINE)
        if len(headers) > 0:
            # 检查是否使用了统一的标题格式
            consistent = all(re.match(r'^#+\s+', h) for h in headers)
            if consistent:
                score += 30
        
        # 代码风格一致性 (20分)
        if metrics.code_blocks > 0:
            score += 20
        
        # 元数据一致性 (20分)
        if metrics.has_title and metrics.has_author and metrics.has_version:
            score += 20
        
        return score / max_score
    
    def calculate_grade(self, overall_score: float) -> str:
        """计算等级"""
        if overall_score >= 90:
            return "A"
        elif overall_score >= 80:
            return "B"
        elif overall_score >= 70:
            return "C"
        elif overall_score >= 60:
            return "D"
        else:
            return "F"
    
    def generate_issues(self, metrics: DocumentQualityMetrics, content: str) -> List[QualityIssue]:
        """生成质量问题列表"""
        issues = []
        
        # 完整性问题
        if not metrics.has_title:
            issues.append(QualityIssue(
                severity="critical",
                category="completeness",
                message="文档缺少标题",
                suggestion="在文档开头添加 # 标题"
            ))
        
        if not metrics.has_description:
            issues.append(QualityIssue(
                severity="major",
                category="completeness",
                message="文档缺少描述信息",
                suggestion="添加 @description 或描述章节"
            ))
        
        if not metrics.has_author:
            issues.append(QualityIssue(
                severity="major",
                category="completeness",
                message="文档缺少作者信息",
                suggestion="添加 @author 或作者章节"
            ))
        
        if not metrics.has_version:
            issues.append(QualityIssue(
                severity="major",
                category="completeness",
                message="文档缺少版本信息",
                suggestion="添加 @version 或版本章节"
            ))
        
        if not metrics.has_table_of_contents:
            issues.append(QualityIssue(
                severity="minor",
                category="completeness",
                message="文档缺少目录",
                suggestion="添加目录章节，提升文档可导航性"
            ))
        
        # 实用性问题
        if not metrics.has_code_examples:
            issues.append(QualityIssue(
                severity="major",
                category="practicality",
                message="文档缺少代码示例",
                suggestion="添加代码示例，提升文档实用性"
            ))
        
        if not metrics.has_best_practices:
            issues.append(QualityIssue(
                severity="major",
                category="practicality",
                message="文档缺少最佳实践",
                suggestion="添加最佳实践章节，分享经验总结"
            ))
        
        if not metrics.has_case_studies:
            issues.append(QualityIssue(
                severity="minor",
                category="practicality",
                message="文档缺少案例分析",
                suggestion="添加案例分析章节，提供实际应用场景"
            ))
        
        if not metrics.has_faq:
            issues.append(QualityIssue(
                severity="minor",
                category="practicality",
                message="文档缺少常见问题",
                suggestion="添加常见问题章节，解答用户疑问"
            ))
        
        # 准确性问题
        if metrics.code_blocks == 0:
            issues.append(QualityIssue(
                severity="major",
                category="accuracy",
                message="文档缺少代码块",
                suggestion="添加代码块，提供具体实现示例"
            ))
        
        # 可读性问题
        if metrics.total_sections < 5:
            issues.append(QualityIssue(
                severity="minor",
                category="readability",
                message=f"文档章节过少（仅{metrics.total_sections}个）",
                suggestion="增加更多章节，完善文档结构"
            ))
        
        return issues
    
    def generate_suggestions(self, report: DocumentQualityReport) -> List[str]:
        """生成改进建议"""
        suggestions = []
        metrics = report.metrics
        
        # 基于评分生成建议
        if metrics.completeness < 0.7:
            suggestions.append("完善文档元数据，添加标题、描述、作者、版本等信息")
            suggestions.append("增加标准章节：概述、核心概念、实施步骤、代码示例等")
        
        if metrics.accuracy < 0.7:
            suggestions.append("添加更多代码示例，提升技术准确性")
            suggestions.append("提供具体的API接口、函数、参数说明")
        
        if metrics.readability < 0.7:
            suggestions.append("优化段落长度，控制在100-500字之间")
            suggestions.append("增加列表、表格等格式，提升可读性")
            suggestions.append("添加更多标题层级，改善文档结构")
        
        if metrics.practicality < 0.7:
            suggestions.append("添加最佳实践章节，分享经验总结")
            suggestions.append("增加案例分析，提供实际应用场景")
            suggestions.append("补充常见问题，解答用户疑问")
        
        if metrics.consistency < 0.7:
            suggestions.append("统一术语使用，保持命名一致性")
            suggestions.append("规范格式，保持标题、列表等格式统一")
            suggestions.append("统一代码风格，保持代码格式一致")
        
        return suggestions
    
    def assess_document(self, file_path: Path) -> DocumentQualityReport:
        """评估单个文档"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检测文档类型
        doc_type = self.detect_doc_type(file_path)
        
        # 提取元数据
        metadata = self.extract_metadata(content)
        
        # 统计信息
        total_sections = self.count_sections(content)
        code_blocks, code_lines = self.count_code_blocks(content)
        total_lines = len(content.split('\n'))
        word_count = len(content.split())
        avg_section_length = total_lines / total_sections if total_sections > 0 else 0
        
        # 检查标准章节
        sections = self.check_standard_sections(content)
        
        # 创建指标对象
        metrics = DocumentQualityMetrics(
            has_title=metadata["has_title"],
            has_description=metadata["has_description"],
            has_author=metadata["has_author"],
            has_version=metadata["has_version"],
            has_table_of_contents=metadata["has_table_of_contents"],
            has_code_examples=code_blocks > 0,
            has_best_practices=sections.get("最佳实践", False) or sections.get("实践建议", False),
            has_case_studies=sections.get("案例分析", False) or sections.get("案例研究", False),
            has_faq=sections.get("常见问题", False) or sections.get("FAQ", False) or sections.get("问题解答", False),
            has_references=sections.get("参考文档", False) or sections.get("相关文档", False),
            total_sections=total_sections,
            code_blocks=code_blocks,
            code_lines=code_lines,
            total_lines=total_lines,
            word_count=word_count,
            avg_section_length=avg_section_length
        )
        
        # 评估各个维度
        metrics.completeness = self.assess_completeness(content, metrics)
        metrics.accuracy = self.assess_accuracy(content, metrics)
        metrics.readability = self.assess_readability(content, metrics)
        metrics.practicality = self.assess_practicality(content, metrics)
        metrics.consistency = self.assess_consistency(content, metrics)
        
        # 计算综合评分
        weights = self.doc_type_weights.get(doc_type, self.doc_type_weights["technique"])
        metrics.overall_score = (
            metrics.completeness * weights["completeness"] +
            metrics.accuracy * weights["accuracy"] +
            metrics.readability * weights["readability"] +
            metrics.practicality * weights["practicality"] +
            metrics.consistency * weights["consistency"]
        ) * 100
        
        # 创建报告
        report = DocumentQualityReport(
            file_path=str(file_path),
            file_name=file_path.name,
            doc_type=doc_type,
            metrics=metrics,
            grade=self.calculate_grade(metrics.overall_score)
        )
        
        # 生成问题
        report.issues = self.generate_issues(metrics, content)
        
        # 生成建议
        report.suggestions = self.generate_suggestions(report)
        
        return report
    
    def assess_all_documents(self, directory: Path) -> List[DocumentQualityReport]:
        """评估目录下的所有文档"""
        reports = []
        
        for file in directory.rglob("*.md"):
            if file.name == "README.md":
                continue
            
            try:
                report = self.assess_document(file)
                reports.append(report)
                print(f"✓ 已评估: {file.name} - 评分: {report.metrics.overall_score:.1f} - 等级: {report.grade}")
            except Exception as e:
                print(f"✗ 评估失败: {file.name} - {e}")
        
        return reports
    
    def save_report(self, reports: List[DocumentQualityReport], suffix: str = ""):
        """保存评估报告"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_dir = self.base_path / "YYC3-Cater-审核报告"
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f"YYC3-文档质量评估报告{suffix}.json"
        
        # 转换为可序列化的格式
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_documents": len(reports),
                "avg_score": sum(r.metrics.overall_score for r in reports) / len(reports) if reports else 0,
                "grade_distribution": {
                    "A": sum(1 for r in reports if r.grade == "A"),
                    "B": sum(1 for r in reports if r.grade == "B"),
                    "C": sum(1 for r in reports if r.grade == "C"),
                    "D": sum(1 for r in reports if r.grade == "D"),
                    "F": sum(1 for r in reports if r.grade == "F")
                }
            },
            "reports": [
                {
                    "file_path": r.file_path,
                    "file_name": r.file_name,
                    "doc_type": r.doc_type,
                    "metrics": {
                        "completeness": r.metrics.completeness,
                        "accuracy": r.metrics.accuracy,
                        "readability": r.metrics.readability,
                        "practicality": r.metrics.practicality,
                        "consistency": r.metrics.consistency,
                        "overall_score": r.metrics.overall_score
                    },
                    "grade": r.grade,
                    "issues": [
                        {
                            "severity": i.severity,
                            "category": i.category,
                            "message": i.message,
                            "suggestion": i.suggestion
                        }
                        for i in r.issues
                    ],
                    "suggestions": r.suggestions
                }
                for r in reports
            ]
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n报告已保存到: {report_file}")
        
        # 生成Markdown报告
        self.generate_markdown_report(reports, report_dir, suffix)
    
    def generate_markdown_report(self, reports: List[DocumentQualityReport], report_dir: Path, suffix: str):
        """生成Markdown格式的报告"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = report_dir / f"YYC3-文档质量评估报告{suffix}.md"
        
        # 计算统计数据
        total_docs = len(reports)
        avg_score = sum(r.metrics.overall_score for r in reports) / total_docs if reports else 0
        grade_dist = {
            "A": sum(1 for r in reports if r.grade == "A"),
            "B": sum(1 for r in reports if r.grade == "B"),
            "C": sum(1 for r in reports if r.grade == "C"),
            "D": sum(1 for r in reports if r.grade == "D"),
            "F": sum(1 for r in reports if r.grade == "F")
        }
        
        # 按评分排序
        sorted_reports = sorted(reports, key=lambda r: r.metrics.overall_score, reverse=True)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# YYC³ 文档质量评估报告\n\n")
            f.write(f"**评估时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**评估目录**: {self.base_path}\n\n")
            
            f.write("## 📊 总体统计\n\n")
            f.write(f"- **总文档数**: {total_docs}\n")
            f.write(f"- **平均评分**: {avg_score:.1f}\n")
            f.write(f"- **通过率**: {sum(1 for r in reports if r.metrics.overall_score >= 60) / total_docs * 100:.1f}%\n\n")
            
            f.write("### 等级分布\n\n")
            f.write("| 等级 | 数量 | 占比 |\n")
            f.write("|------|------|------|\n")
            for grade in ["A", "B", "C", "D", "F"]:
                count = grade_dist[grade]
                percentage = count / total_docs * 100 if total_docs > 0 else 0
                f.write(f"| {grade} | {count} | {percentage:.1f}% |\n")
            f.write("\n")
            
            f.write("### 评分分布\n\n")
            f.write("```text\n")
            for report in sorted_reports:
                bar = "█" * int(report.metrics.overall_score / 5)
                f.write(f"{report.metrics.overall_score:5.1f} {bar} {report.file_name}\n")
            f.write("```\n\n")
            
            f.write("## 📈 详细评估结果\n\n")
            for report in sorted_reports:
                f.write(f"### {report.file_name}\n\n")
                f.write(f"**等级**: {report.grade} | **评分**: {report.metrics.overall_score:.1f}\n\n")
                
                f.write("#### 质量指标\n\n")
                f.write(f"- **完整性**: {report.metrics.completeness * 100:.1f}%\n")
                f.write(f"- **准确性**: {report.metrics.accuracy * 100:.1f}%\n")
                f.write(f"- **可读性**: {report.metrics.readability * 100:.1f}%\n")
                f.write(f"- **实用性**: {report.metrics.practicality * 100:.1f}%\n")
                f.write(f"- **一致性**: {report.metrics.consistency * 100:.1f}%\n\n")
                
                if report.issues:
                    f.write("#### 发现的问题\n\n")
                    for issue in report.issues:
                        emoji = {"critical": "🔴", "major": "🟡", "minor": "🟢", "info": "🔵"}
                        f.write(f"{emoji.get(issue.severity, '⚪')} **{issue.severity}**: {issue.message}\n")
                        f.write(f"   建议: {issue.suggestion}\n\n")
                
                if report.suggestions:
                    f.write("#### 改进建议\n\n")
                    for suggestion in report.suggestions:
                        f.write(f"- {suggestion}\n")
                    f.write("\n")
        
        print(f"Markdown报告已保存到: {report_file}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 文档质量评估工具')
    parser.add_argument('--base-path', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环',
                       help='文档根目录路径')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("YYC³ 文档质量评估工具 - 第三阶段（P2）")
    print("=" * 80)
    print(f"评估目录: {args.base_path}")
    print("=" * 80)
    print()
    
    assessor = DocumentQualityAssessor(args.base_path)
    reports = assessor.assess_all_documents(Path(args.base_path))
    
    print()
    print("=" * 80)
    print("评估完成统计")
    print("=" * 80)
    
    if reports:
        avg_score = sum(r.metrics.overall_score for r in reports) / len(reports)
        grade_dist = {
            "A": sum(1 for r in reports if r.grade == "A"),
            "B": sum(1 for r in reports if r.grade == "B"),
            "C": sum(1 for r in reports if r.grade == "C"),
            "D": sum(1 for r in reports if r.grade == "D"),
            "F": sum(1 for r in reports if r.grade == "F")
        }
        
        print(f"\n总文档数: {len(reports)}")
        print(f"平均评分: {avg_score:.1f}")
        print(f"通过率: {sum(1 for r in reports if r.metrics.overall_score >= 60) / len(reports) * 100:.1f}%")
        print(f"\n等级分布:")
        for grade in ["A", "B", "C", "D", "F"]:
            print(f"  {grade}: {grade_dist[grade]} 个")
    
    print("=" * 80)
    
    assessor.save_report(reports)
    
    print("\n✓ 文档质量评估完成！")


if __name__ == "__main__":
    main()
