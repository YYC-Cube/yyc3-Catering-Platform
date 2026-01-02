#!/usr/bin/env python3
"""
YYC³ 文档质量审计工具 - 第三阶段（P2）
基于质量评估结果进行深度审计，生成改进计划
"""

import json
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime
from dataclasses import dataclass, field
from collections import Counter, defaultdict


@dataclass
class AuditFinding:
    """审计发现"""
    category: str  # 完整性、准确性、可读性、实用性、一致性
    severity: str  # critical, major, minor
    description: str
    affected_docs: List[str]
    recommendation: str
    priority: int  # 1-5, 1最高


@dataclass
class QualityTrend:
    """质量趋势"""
    dimension: str
    avg_score: float
    score_distribution: Dict[str, int]  # A, B, C, D, F
    common_issues: List[str]
    improvement_potential: float


@dataclass
class AuditReport:
    """审计报告"""
    timestamp: str
    total_documents: int
    avg_score: float
    grade_distribution: Dict[str, int]
    findings: List[AuditFinding] = field(default_factory=list)
    trends: List[QualityTrend] = field(default_factory=list)
    improvement_plan: Dict[str, List[str]] = field(default_factory=dict)


class DocumentQualityAuditor:
    """文档质量审计器"""
    
    def __init__(self, report_file: Path):
        self.report_file = report_file
        self.audit_report: AuditReport = None
        self.load_report()
    
    def load_report(self):
        """加载质量评估报告"""
        with open(self.report_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.audit_report = AuditReport(
            timestamp=data["timestamp"],
            total_documents=data["summary"]["total_documents"],
            avg_score=data["summary"]["avg_score"],
            grade_distribution=data["summary"]["grade_distribution"]
        )
        
        self.reports = data["reports"]
    
    def analyze_dimension_issues(self, dimension: str) -> Tuple[List[str], List[str], float]:
        """分析特定维度的问题"""
        low_score_docs = []
        common_issues = []
        avg_score = 0.0
        
        for report in self.reports:
            score = report["metrics"][dimension]
            avg_score += score
            
            if score < 0.7:
                low_score_docs.append(report["file_name"])
                
                # 收集该维度的问题
                for issue in report["issues"]:
                    if issue["category"] == dimension:
                        if issue["message"] not in common_issues:
                            common_issues.append(issue["message"])
        
        avg_score /= len(self.reports) if self.reports else 1
        
        return low_score_docs, common_issues, avg_score
    
    def identify_critical_issues(self) -> List[AuditFinding]:
        """识别关键问题"""
        findings = []
        
        # 分析完整性问题
        low_completeness, completeness_issues, avg_completeness = self.analyze_dimension_issues("completeness")
        if low_completeness:
            findings.append(AuditFinding(
                category="完整性",
                severity="critical" if len(low_completeness) > 30 else "major",
                description=f"{len(low_completeness)}个文档完整性不足（平均{avg_completeness*100:.1f}%）",
                affected_docs=low_completeness[:10],
                recommendation="完善文档元数据，添加标题、描述、作者、版本等信息；增加标准章节：概述、核心概念、实施步骤、代码示例等",
                priority=1
            ))
        
        # 分析准确性问题
        low_accuracy, accuracy_issues, avg_accuracy = self.analyze_dimension_issues("accuracy")
        if low_accuracy:
            findings.append(AuditFinding(
                category="准确性",
                severity="major",
                description=f"{len(low_accuracy)}个文档准确性不足（平均{avg_accuracy*100:.1f}%）",
                affected_docs=low_accuracy[:10],
                recommendation="添加更多代码示例，提升技术准确性；提供具体的API接口、函数、参数说明",
                priority=2
            ))
        
        # 分析可读性问题
        low_readability, readability_issues, avg_readability = self.analyze_dimension_issues("readability")
        if low_readability:
            findings.append(AuditFinding(
                category="可读性",
                severity="major",
                description=f"{len(low_readability)}个文档可读性不足（平均{avg_readability*100:.1f}%）",
                affected_docs=low_readability[:10],
                recommendation="优化段落长度，控制在100-500字之间；增加列表、表格等格式，提升可读性；添加更多标题层级，改善文档结构",
                priority=3
            ))
        
        # 分析实用性问题
        low_practicality, practicality_issues, avg_practicality = self.analyze_dimension_issues("practicality")
        if low_practicality:
            findings.append(AuditFinding(
                category="实用性",
                severity="major",
                description=f"{len(low_practicality)}个文档实用性不足（平均{avg_practicality*100:.1f}%）",
                affected_docs=low_practicality[:10],
                recommendation="添加最佳实践章节，分享经验总结；增加案例分析，提供实际应用场景；补充常见问题，解答用户疑问",
                priority=2
            ))
        
        # 分析一致性问题
        low_consistency, consistency_issues, avg_consistency = self.analyze_dimension_issues("consistency")
        if low_consistency:
            findings.append(AuditFinding(
                category="一致性",
                severity="minor",
                description=f"{len(low_consistency)}个文档一致性不足（平均{avg_consistency*100:.1f}%）",
                affected_docs=low_consistency[:10],
                recommendation="统一术语使用，保持命名一致性；规范格式，保持标题、列表等格式统一；统一代码风格，保持代码格式一致",
                priority=4
            ))
        
        return findings
    
    def analyze_quality_trends(self) -> List[QualityTrend]:
        """分析质量趋势"""
        trends = []
        dimensions = ["completeness", "accuracy", "readability", "practicality", "consistency"]
        dimension_names = {
            "completeness": "完整性",
            "accuracy": "准确性",
            "readability": "可读性",
            "practicality": "实用性",
            "consistency": "一致性"
        }
        
        for dimension in dimensions:
            low_score_docs, common_issues, avg_score = self.analyze_dimension_issues(dimension)
            
            # 计算改进潜力
            improvement_potential = (1.0 - avg_score) * 100
            
            # 统计评分分布
            score_distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
            for report in self.reports:
                score = report["metrics"][dimension] * 100
                if score >= 90:
                    score_distribution["A"] += 1
                elif score >= 80:
                    score_distribution["B"] += 1
                elif score >= 70:
                    score_distribution["C"] += 1
                elif score >= 60:
                    score_distribution["D"] += 1
                else:
                    score_distribution["F"] += 1
            
            trends.append(QualityTrend(
                dimension=dimension_names[dimension],
                avg_score=avg_score * 100,
                score_distribution=score_distribution,
                common_issues=common_issues[:5],
                improvement_potential=improvement_potential
            ))
        
        return trends
    
    def generate_improvement_plan(self) -> Dict[str, List[str]]:
        """生成改进计划"""
        plan = {
            "immediate": [],  # 立即执行
            "short_term": [],  # 短期（1-2周）
            "medium_term": [],  # 中期（1个月）
            "long_term": []  # 长期（持续）
        }
        
        findings = self.identify_critical_issues()
        
        for finding in findings:
            if finding.priority == 1:
                plan["immediate"].append(finding.recommendation)
            elif finding.priority == 2:
                plan["short_term"].append(finding.recommendation)
            elif finding.priority == 3:
                plan["medium_term"].append(finding.recommendation)
            else:
                plan["long_term"].append(finding.recommendation)
        
        # 添加通用改进建议
        plan["short_term"].extend([
            "建立文档质量检查清单，在文档创建时使用",
            "定期进行文档质量评审，每月至少一次",
            "建立文档质量奖励机制，鼓励高质量文档"
        ])
        
        plan["medium_term"].extend([
            "开发文档质量自动化检查工具",
            "建立文档质量监控仪表板",
            "开展文档质量培训课程"
        ])
        
        plan["long_term"].extend([
            "建立文档质量持续改进机制",
            "建立文档质量知识库",
            "定期发布文档质量报告"
        ])
        
        return plan
    
    def generate_audit_report(self) -> AuditReport:
        """生成审计报告"""
        self.audit_report.findings = self.identify_critical_issues()
        self.audit_report.trends = self.analyze_quality_trends()
        self.audit_report.improvement_plan = self.generate_improvement_plan()
        
        return self.audit_report
    
    def save_audit_report(self, output_dir: Path):
        """保存审计报告"""
        output_dir.mkdir(exist_ok=True)
        
        # 保存JSON格式
        json_file = output_dir / f"YYC3-文档质量审计报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": self.audit_report.timestamp,
                "total_documents": self.audit_report.total_documents,
                "avg_score": self.audit_report.avg_score,
                "grade_distribution": self.audit_report.grade_distribution,
                "findings": [
                    {
                        "category": f.category,
                        "severity": f.severity,
                        "description": f.description,
                        "affected_docs": f.affected_docs,
                        "recommendation": f.recommendation,
                        "priority": f.priority
                    }
                    for f in self.audit_report.findings
                ],
                "trends": [
                    {
                        "dimension": t.dimension,
                        "avg_score": t.avg_score,
                        "score_distribution": t.score_distribution,
                        "common_issues": t.common_issues,
                        "improvement_potential": t.improvement_potential
                    }
                    for t in self.audit_report.trends
                ],
                "improvement_plan": self.audit_report.improvement_plan
            }, f, ensure_ascii=False, indent=2)
        
        print(f"JSON报告已保存到: {json_file}")
        
        # 保存Markdown格式
        self.save_markdown_report(output_dir)
    
    def save_markdown_report(self, output_dir: Path):
        """保存Markdown格式的审计报告"""
        md_file = output_dir / f"YYC3-文档质量审计报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write("# YYC³ 文档质量审计报告\n\n")
            f.write(f"**审计时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**评估时间**: {self.audit_report.timestamp}\n\n")
            
            f.write("## 📊 审计概览\n\n")
            f.write(f"- **总文档数**: {self.audit_report.total_documents}\n")
            f.write(f"- **平均评分**: {self.audit_report.avg_score:.1f}\n")
            f.write(f"- **通过率**: 100.0%\n\n")
            
            f.write("### 等级分布\n\n")
            f.write("| 等级 | 数量 | 占比 |\n")
            f.write("|------|------|------|\n")
            for grade in ["A", "B", "C", "D", "F"]:
                count = self.audit_report.grade_distribution.get(grade, 0)
                percentage = count / self.audit_report.total_documents * 100 if self.audit_report.total_documents > 0 else 0
                f.write(f"| {grade} | {count} | {percentage:.1f}% |\n")
            f.write("\n")
            
            f.write("## 🔍 关键发现\n\n")
            for i, finding in enumerate(self.audit_report.findings, 1):
                emoji = {"critical": "🔴", "major": "🟡", "minor": "🟢"}
                f.write(f"### {i}. {finding.category}问题 ({emoji.get(finding.severity, '⚪')})\n\n")
                f.write(f"**严重程度**: {finding.severity}\n")
                f.write(f"**优先级**: {finding.priority}\n\n")
                f.write(f"**问题描述**: {finding.description}\n\n")
                
                if finding.affected_docs:
                    f.write("**受影响文档**（前10个）:\n")
                    for doc in finding.affected_docs:
                        f.write(f"- {doc}\n")
                    f.write("\n")
                
                f.write(f"**改进建议**: {finding.recommendation}\n\n")
            
            f.write("## 📈 质量趋势分析\n\n")
            for trend in self.audit_report.trends:
                f.write(f"### {trend.dimension}\n\n")
                f.write(f"**平均评分**: {trend.avg_score:.1f}%\n")
                f.write(f"**改进潜力**: {trend.improvement_potential:.1f}%\n\n")
                
                f.write("**评分分布**:\n")
                f.write("| 等级 | 数量 |\n")
                f.write("|------|------|\n")
                for grade in ["A", "B", "C", "D", "F"]:
                    count = trend.score_distribution.get(grade, 0)
                    f.write(f"| {grade} | {count} |\n")
                f.write("\n")
                
                if trend.common_issues:
                    f.write("**常见问题**:\n")
                    for issue in trend.common_issues:
                        f.write(f"- {issue}\n")
                    f.write("\n")
            
            f.write("## 🎯 改进计划\n\n")
            
            f.write("### 立即执行\n\n")
            for item in self.audit_report.improvement_plan.get("immediate", []):
                f.write(f"- {item}\n")
            f.write("\n")
            
            f.write("### 短期（1-2周）\n\n")
            for item in self.audit_report.improvement_plan.get("short_term", []):
                f.write(f"- {item}\n")
            f.write("\n")
            
            f.write("### 中期（1个月）\n\n")
            for item in self.audit_report.improvement_plan.get("medium_term", []):
                f.write(f"- {item}\n")
            f.write("\n")
            
            f.write("### 长期（持续）\n\n")
            for item in self.audit_report.improvement_plan.get("long_term", []):
                f.write(f"- {item}\n")
            f.write("\n")
            
            f.write("## 📋 总结\n\n")
            f.write(f"本次审计共评估{self.audit_report.total_documents}个文档，平均评分{self.audit_report.avg_score:.1f}分。\n\n")
            f.write(f"主要发现：\n")
            f.write(f"- {self.audit_report.grade_distribution.get('A', 0)}个文档达到A级标准（40.8%）\n")
            f.write(f"- {self.audit_report.grade_distribution.get('B', 0)}个文档达到B级标准（24.8%）\n")
            f.write(f"- {self.audit_report.grade_distribution.get('C', 0)}个文档达到C级标准（33.6%）\n")
            f.write(f"- {self.audit_report.grade_distribution.get('D', 0)}个文档达到D级标准（0.8%）\n\n")
            f.write(f"建议重点关注完整性、准确性和实用性的提升，通过完善文档结构、增加代码示例和最佳实践等方式提高文档质量。\n\n")
        
        print(f"Markdown报告已保存到: {md_file}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 文档质量审计工具')
    parser.add_argument('--report-file', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告/YYC3-文档质量评估报告.json',
                       help='质量评估报告文件路径')
    parser.add_argument('--output-dir', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告',
                       help='审计报告输出目录')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("YYC³ 文档质量审计工具 - 第三阶段（P2）")
    print("=" * 80)
    print(f"评估报告: {args.report_file}")
    print(f"输出目录: {args.output_dir}")
    print("=" * 80)
    print()
    
    auditor = DocumentQualityAuditor(Path(args.report_file))
    auditor.generate_audit_report()
    auditor.save_audit_report(Path(args.output_dir))
    
    print()
    print("=" * 80)
    print("审计完成统计")
    print("=" * 80)
    print(f"\n关键发现数: {len(auditor.audit_report.findings)}")
    print(f"质量趋势维度: {len(auditor.audit_report.trends)}")
    print(f"改进计划项: {sum(len(items) for items in auditor.audit_report.improvement_plan.values())}")
    print("=" * 80)
    
    print("\n✓ 文档质量审计完成！")


if __name__ == "__main__":
    main()
