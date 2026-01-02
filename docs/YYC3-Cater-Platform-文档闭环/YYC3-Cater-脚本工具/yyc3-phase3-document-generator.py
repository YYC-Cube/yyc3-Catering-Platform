#!/usr/bin/env python3
"""
YYC³ 文档自动生成工具 - 第三阶段（P2）
基于模板和知识图谱自动生成文档
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Set, Optional
from datetime import datetime
import json
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class DocumentTemplate:
    """文档模板"""
    name: str
    category: str
    doc_type: str
    sections: List[Dict]
    required_fields: List[str]
    optional_fields: List[str]
    example_content: str


@dataclass
class GeneratedDocument:
    """生成的文档"""
    name: str
    content: str
    metadata: Dict
    references: List[str]
    related_concepts: List[str]


class DocumentAutoGenerator:
    """文档自动生成器"""
    
    def __init__(self, base_path: str, graph_file: str):
        self.base_path = Path(base_path)
        self.graph_file = Path(graph_file)
        self.graph = None
        self.documents = {}
        self.concepts = {}
        self.templates = {}
        
        # 加载知识图谱
        self.load_graph()
        
        # 加载模板
        self.load_templates()
    
    def load_graph(self):
        """加载知识图谱"""
        with open(self.graph_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.graph = data
        self.documents = {doc["name"]: doc for doc in data["documents"]}
        self.concepts = {concept["name"]: concept for concept in data["concepts"]}
        
        print(f"✓ 已加载知识图谱: {len(self.documents)} 个文档, {len(self.concepts)} 个概念")
    
    def load_templates(self):
        """加载文档模板"""
        template_dir = self.base_path / "YYC3-Cater-模版规范"
        
        if not template_dir.exists():
            print("⚠ 模板目录不存在，使用默认模板")
            self.create_default_templates()
            return
        
        # 扫描模板文件
        for template_file in template_dir.glob("*.md"):
            try:
                with open(template_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                template = self.parse_template(content, template_file.name)
                self.templates[template.name] = template
                print(f"✓ 已加载模板: {template.name}")
                
            except Exception as e:
                print(f"✗ 加载模板失败: {template_file.name} - {e}")
    
    def parse_template(self, content: str, file_name: str) -> DocumentTemplate:
        """解析模板"""
        # 提取模板名称
        name = file_name.replace(".md", "")
        
        # 提取分类
        category = "架构设计"
        if "技巧类" in name:
            category = "开发实施"
        elif "架构类" in name:
            category = "架构设计"
        
        # 提取文档类型
        doc_type = "architecture" if "架构类" in name else "technique"
        
        # 提取章节
        sections = []
        section_pattern = r'##\s+(.+?)(?:\n|$)'
        for match in re.finditer(section_pattern, content):
            sections.append({
                "title": match.group(1).strip(),
                "level": 2
            })
        
        # 提取必填字段
        required_fields = []
        required_pattern = r'\[必填\]\s*(.+?)(?:\n|$)'
        for match in re.finditer(required_pattern, content):
            required_fields.append(match.group(1).strip())
        
        # 提取可选字段
        optional_fields = []
        optional_pattern = r'\[可选\]\s*(.+?)(?:\n|$)'
        for match in re.finditer(optional_pattern, content):
            optional_fields.append(match.group(1).strip())
        
        return DocumentTemplate(
            name=name,
            category=category,
            doc_type=doc_type,
            sections=sections,
            required_fields=required_fields,
            optional_fields=optional_fields,
            example_content=content
        )
    
    def create_default_templates(self):
        """创建默认模板"""
        # 架构设计文档模板
        architecture_template = DocumentTemplate(
            name="架构设计文档模板",
            category="架构设计",
            doc_type="architecture",
            sections=[
                {"title": "文档概述", "level": 2},
                {"title": "架构设计", "level": 2},
                {"title": "技术选型", "level": 2},
                {"title": "实施计划", "level": 2},
                {"title": "风险评估", "level": 2}
            ],
            required_fields=["文档名称", "文档描述", "架构图", "技术栈"],
            optional_fields=["参考文档", "附录"],
            example_content=self.get_architecture_template_content()
        )
        
        # 技巧文档模板
        technique_template = DocumentTemplate(
            name="技巧文档模板",
            category="开发实施",
            doc_type="technique",
            sections=[
                {"title": "技巧概述", "level": 2},
                {"title": "适用场景", "level": 2},
                {"title": "实施步骤", "level": 2},
                {"title": "最佳实践", "level": 2},
                {"title": "注意事项", "level": 2}
            ],
            required_fields=["技巧名称", "技巧描述", "适用场景"],
            optional_fields=["示例代码", "参考资源"],
            example_content=self.get_technique_template_content()
        )
        
        self.templates["架构设计文档模板"] = architecture_template
        self.templates["技巧文档模板"] = technique_template
        
        print("✓ 已创建默认模板")
    
    def get_architecture_template_content(self) -> str:
        """获取架构设计模板内容"""
        return """# YYC³ {文档名称}

> {文档描述}

## 文档信息
- 文档类型：架构设计
- 创建日期：{创建日期}
- 最后更新：{最后更新日期}

## 1. 文档概述

### 1.1 文档目的
[必填] 说明本文档的目的和目标

### 1.2 适用范围
[必填] 说明本文档的适用范围和读者对象

### 1.3 参考文档
[可选] 列出相关的参考文档

## 2. 架构设计

### 2.1 总体架构
[必填] 描述系统的总体架构，包括架构图和说明

### 2.2 技术架构
[必填] 描述技术架构，包括技术栈和技术选型说明

### 2.3 数据架构
[必填] 描述数据架构，包括数据模型和数据流

### 2.4 部署架构
[必填] 描述部署架构，包括部署方案和架构图

## 3. 技术选型

### 3.1 技术栈
[必填] 列出使用的技术栈

### 3.2 技术选型说明
[必填] 说明技术选型的理由和依据

## 4. 实施计划

### 4.1 实施阶段
[必填] 描述实施的各个阶段

### 4.2 时间规划
[必填] 提供时间规划表

### 4.3 资源需求
[必填] 列出所需的资源

## 5. 风险评估

### 5.1 风险识别
[必填] 识别可能的风险

### 5.2 风险应对
[必填] 提供风险应对措施

## 6. 附录

[可选] 提供补充信息

---

<div align="center">

**YYC³ 团队**
**联系邮箱**: <admin@0379.email>

</div>
"""
    
    def get_technique_template_content(self) -> str:
        """获取技巧文档模板内容"""
        return """# YYC³ {技巧名称}

> {技巧描述}

## 文档信息
- 文档类型：技巧文档
- 创建日期：{创建日期}
- 最后更新：{最后更新日期}

## 1. 技巧概述

### 1.1 技巧简介
[必填] 简要介绍该技巧

### 1.2 技巧价值
[必填] 说明该技巧的价值和优势

## 2. 适用场景

### 2.1 应用场景
[必填] 列出该技巧适用的场景

### 2.2 前置条件
[必填] 说明使用该技巧的前置条件

## 3. 实施步骤

### 3.1 步骤一
[必填] 详细描述第一步

### 3.2 步骤二
[必填] 详细描述第二步

### 3.3 步骤三
[必填] 详细描述第三步

## 4. 最佳实践

### 4.1 实践建议
[必填] 提供最佳实践建议

### 4.2 常见问题
[必填] 列出常见问题和解决方案

## 5. 注意事项

### 5.1 注意事项
[必填] 列出需要注意的事项

### 5.2 风险提示
[必填] 提供风险提示

## 6. 示例代码

[可选] 提供示例代码

## 7. 参考资源

[可选] 提供参考资源链接

---

<div align="center">

**YYC³ 团队**
**联系邮箱**: <admin@0379.email>

</div>
"""
    
    def generate_document(
        self,
        template_name: str,
        doc_name: str,
        doc_description: str,
        fields: Dict[str, str],
        concepts: Optional[List[str]] = None
    ) -> GeneratedDocument:
        """生成文档"""
        if template_name not in self.templates:
            raise ValueError(f"模板不存在: {template_name}")
        
        template = self.templates[template_name]
        
        # 替换模板中的占位符
        content = template.example_content
        
        # 替换基本字段
        content = content.replace("{文档名称}", doc_name)
        content = content.replace("{文档描述}", doc_description)
        content = content.replace("{技巧名称}", doc_name)
        content = content.replace("{技巧描述}", doc_description)
        content = content.replace("{创建日期}", datetime.now().strftime('%Y-%m-%d'))
        content = content.replace("{最后更新日期}", datetime.now().strftime('%Y-%m-%d'))
        
        # 替换自定义字段
        for field_name, field_value in fields.items():
            content = content.replace(f"[必填] {field_name}", field_value)
            content = content.replace(f"[可选] {field_name}", field_value)
        
        # 添加相关概念
        if concepts:
            concepts_section = "\n## 相关概念\n\n"
            for concept in concepts:
                concepts_section += f"- {concept}\n"
            content += concepts_section
        
        # 添加相关文档引用
        related_docs = self.find_related_documents(concepts or [])
        if related_docs:
            references_section = "\n## 相关文档\n\n"
            for doc in related_docs[:5]:
                references_section += f"- [{doc['title']}]({doc['name']})\n"
            content += references_section
        
        # 生成元数据
        metadata = {
            "template": template_name,
            "category": template.category,
            "doc_type": template.doc_type,
            "created_at": datetime.now().isoformat(),
            "fields": fields
        }
        
        return GeneratedDocument(
            name=f"{doc_name}.md",
            content=content,
            metadata=metadata,
            references=[doc["name"] for doc in related_docs],
            related_concepts=concepts or []
        )
    
    def find_related_documents(self, concepts: List[str]) -> List[Dict]:
        """查找相关文档"""
        related = []
        
        for doc_name, doc in self.documents.items():
            # 检查是否包含相关概念
            doc_concepts = set(doc.get("concepts", []))
            concept_matches = doc_concepts & set(concepts)
            
            if concept_matches:
                related.append({
                    "name": doc_name,
                    "title": doc["title"],
                    "matches": len(concept_matches)
                })
        
        # 按匹配数排序
        related.sort(key=lambda x: x["matches"], reverse=True)
        
        return related
    
    def generate_document_from_requirements(
        self,
        doc_type: str,
        requirements: Dict[str, str]
    ) -> GeneratedDocument:
        """根据需求生成文档"""
        # 选择合适的模板
        if doc_type == "architecture":
            # 查找架构类模板
            template_name = None
            for name, template in self.templates.items():
                if "架构" in name or "architecture" in name.lower():
                    template_name = name
                    break
            if not template_name:
                template_name = "01-YYC3-分析建议文档模版"  # 使用第一个可用模板
        elif doc_type == "technique":
            # 查找技巧类模板
            template_name = None
            for name, template in self.templates.items():
                if "技巧" in name or "technique" in name.lower():
                    template_name = name
                    break
            if not template_name:
                template_name = "01-YYC3-分析建议文档模版"  # 使用第一个可用模板
        else:
            template_name = "01-YYC3-分析建议文档模版"  # 默认使用第一个可用模板
        
        # 提取概念
        concepts = self.extract_concepts_from_requirements(requirements)
        
        # 生成文档
        return self.generate_document(
            template_name=template_name,
            doc_name=requirements.get("name", "未命名文档"),
            doc_description=requirements.get("description", ""),
            fields=requirements,
            concepts=concepts
        )
    
    def extract_concepts_from_requirements(self, requirements: Dict[str, str]) -> List[str]:
        """从需求中提取概念"""
        concepts = []
        
        # 合并所有需求文本
        all_text = " ".join(requirements.values())
        
        # 匹配知识图谱中的概念
        for concept_name in self.concepts.keys():
            if concept_name.lower() in all_text.lower():
                concepts.append(concept_name)
        
        return concepts
    
    def save_document(self, doc: GeneratedDocument, output_dir: Path):
        """保存文档"""
        output_dir.mkdir(exist_ok=True)
        
        # 保存Markdown文档
        doc_file = output_dir / doc.name
        with open(doc_file, 'w', encoding='utf-8') as f:
            f.write(doc.content)
        
        print(f"✓ 文档已保存到: {doc_file}")
        
        # 保存元数据
        metadata_file = output_dir / f"{doc.name}.metadata.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(doc.metadata, f, ensure_ascii=False, indent=2)
        
        print(f"✓ 元数据已保存到: {metadata_file}")
        
        return doc_file
    
    def batch_generate(
        self,
        requirements_list: List[Dict[str, str]],
        output_dir: Path
    ) -> List[Path]:
        """批量生成文档"""
        generated_files = []
        
        for i, requirements in enumerate(requirements_list, 1):
            print(f"\n生成第 {i}/{len(requirements_list)} 个文档...")
            
            try:
                doc = self.generate_document_from_requirements(
                    doc_type=requirements.get("type", "architecture"),
                    requirements=requirements
                )
                
                doc_file = self.save_document(doc, output_dir)
                generated_files.append(doc_file)
                
            except Exception as e:
                print(f"✗ 生成文档失败: {requirements.get('name', '未知')} - {e}")
        
        return generated_files


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YYC³ 文档自动生成工具')
    parser.add_argument('--base-path', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环',
                       help='文档根目录路径')
    parser.add_argument('--graph-file', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-审核报告/YYC3-文档知识图谱_20251228_045044.json',
                       help='知识图谱文件路径')
    parser.add_argument('--output-dir', type=str,
                       default='/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-生成文档',
                       help='输出目录')
    parser.add_argument('--type', type=str, choices=['architecture', 'technique'],
                       default='architecture', help='文档类型')
    parser.add_argument('--name', type=str, help='文档名称')
    parser.add_argument('--description', type=str, help='文档描述')
    parser.add_argument('--batch', type=str, help='批量生成配置文件（JSON）')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("YYC³ 文档自动生成工具 - 第三阶段（P2）")
    print("=" * 80)
    print(f"文档目录: {args.base_path}")
    print(f"知识图谱文件: {args.graph_file}")
    print(f"输出目录: {args.output_dir}")
    print("=" * 80)
    print()
    
    # 初始化生成器
    generator = DocumentAutoGenerator(args.base_path, args.graph_file)
    
    # 批量生成
    if args.batch:
        with open(args.batch, 'r', encoding='utf-8') as f:
            requirements_list = json.load(f)
        
        print(f"批量生成 {len(requirements_list)} 个文档...\n")
        generated_files = generator.batch_generate(requirements_list, Path(args.output_dir))
        
        print(f"\n✓ 批量生成完成！共生成 {len(generated_files)} 个文档")
    
    # 单个生成
    elif args.name and args.description:
        requirements = {
            "name": args.name,
            "description": args.description,
            "type": args.type
        }
        
        print(f"生成文档: {args.name}\n")
        doc = generator.generate_document_from_requirements(args.type, requirements)
        doc_file = generator.save_document(doc, Path(args.output_dir))
        
        print(f"\n✓ 文档生成完成！")
    
    else:
        print("错误: 需要指定 --name 和 --description 参数，或使用 --batch 批量生成")
        print("\n示例:")
        print("  单个生成: python3 yyc3-phase3-document-generator.py --name '测试文档' --description '这是一个测试文档' --type architecture")
        print("  批量生成: python3 yyc3-phase3-document-generator.py --batch requirements.json")


if __name__ == "__main__":
    main()
