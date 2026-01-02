#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YYC³ 文档统一化脚本
批量添加标准文档头部信息
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# 文档根目录
DOCS_ROOT = Path("/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环")

# 文档头部信息模板
HEADER_TEMPLATE = """---

**@file**：{file_name}
**@description**：{description}
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：{tags}

---
"""

# 文档描述映射
DESCRIPTION_MAP: Dict[str, str] = {
    "总体架构设计文档": "YYC³餐饮行业智能化平台的总体架构设计文档，包含系统架构概述、设计原则、技术架构、业务架构、数据架构、部署架构、安全架构等核心内容",
    "微服务架构设计文档": "YYC³餐饮行业智能化平台的微服务架构设计文档，包含微服务架构概述、服务拆分原则、服务定义与职责、服务间通信、服务治理、数据一致性、服务部署、服务监控等核心内容",
    "数据库架构详细设计文档": "YYC³餐饮行业智能化平台的数据库架构详细设计文档，包含数据库设计原则、表结构设计、索引设计、分库分表策略、数据迁移方案等核心内容",
    "API接口设计文档": "YYC³餐饮行业智能化平台的API接口设计文档，包含接口设计原则、接口规范、接口列表、接口文档、接口测试等核心内容",
    "数据架构详细设计文档": "YYC³餐饮行业智能化平台的数据架构详细设计文档，包含数据模型设计、数据流设计、数据存储设计、数据治理、数据安全等核心内容",
    "安全架构设计文档": "YYC³餐饮行业智能化平台的安全架构设计文档，包含安全设计原则、身份认证、权限控制、数据加密、安全审计、漏洞防护等核心内容",
    "接口架构设计文档": "YYC³餐饮行业智能化平台的接口架构设计文档，包含接口设计原则、接口规范、接口网关、接口监控、接口限流等核心内容",
    "智能架构设计文档": "YYC³餐饮行业智能化平台的智能架构设计文档，包含AI能力集成、智能推荐、智能客服、智能分析、智能决策等核心内容",
    "部署架构设计文档": "YYC³餐饮行业智能化平台的部署架构设计文档，包含部署架构设计、容器化部署、Kubernetes编排、环境管理、灰度发布等核心内容",
    "架构决策记录（ADR）集": "YYC³餐饮行业智能化平台的架构决策记录（ADR）集，记录重要的架构决策、决策背景、决策内容、决策影响等核心内容",
    "监控架构设计文档": "YYC³餐饮行业智能化平台的监控架构设计文档，包含监控架构设计、监控指标、告警规则、日志收集、链路追踪等核心内容",
    "全链路智能化转型总体架构设计": "YYC³餐饮行业智能化平台的全链路智能化转型总体架构设计，包含转型目标、转型路径、技术架构、业务架构、实施计划等核心内容",
    "全链路智能化转型技术实现计划": "YYC³餐饮行业智能化平台的全链路智能化转型技术实现计划，包含技术选型、技术架构、技术实现、技术验证、技术优化等核心内容",
    "全链路智能化转型执行方案": "YYC³餐饮行业智能化平台的全链路智能化转型执行方案，包含执行计划、执行步骤、执行资源、执行风险、执行监控等核心内容",
    "全链路智能化转型最终执行方案": "YYC³餐饮行业智能化平台的全链路智能化转型最终执行方案，包含最终方案、最终计划、最终资源、最终风险、最终监控等核心内容",
    "分层闭环开发模型设计": "YYC³餐饮行业智能化平台的分层闭环开发模型设计，包含开发模型、分层设计、闭环机制、开发流程、质量保障等核心内容",
    "多维度闭环监控与优化机制设计": "YYC³餐饮行业智能化平台的多维度闭环监控与优化机制设计，包含监控机制、优化机制、闭环机制、监控指标、优化策略等核心内容",
    "系统色设计规范": "YYC³餐饮行业智能化平台的系统色设计规范，包含色彩体系、色彩应用、色彩规范、色彩示例、色彩管理等内容",
    "可访问性标准": "YYC³餐饮行业智能化平台的可访问性标准，包含可访问性原则、可访问性规范、可访问性测试、可访问性示例、可访问性管理等内容",
    "错误处理架构设计文档": "YYC³餐饮行业智能化平台的错误处理架构设计文档，包含错误处理原则、错误分类、错误处理策略、错误监控、错误恢复等核心内容",
}

# 标签映射
TAGS_MAP: Dict[str, str] = {
    "架构设计": "架构设计,YYC³,系统架构",
    "微服务": "架构设计,微服务,YYC³,服务治理",
    "数据库": "架构设计,数据库,YYC³,数据存储",
    "API": "架构设计,API,YYC³,接口设计",
    "数据架构": "架构设计,数据架构,YYC³,数据治理",
    "安全架构": "架构设计,安全,YYC³,安全防护",
    "接口架构": "架构设计,接口,YYC³,接口管理",
    "智能架构": "架构设计,AI,YYC³,智能化",
    "部署架构": "架构设计,部署,YYC³,容器化",
    "ADR": "架构设计,ADR,YYC³,架构决策",
    "监控架构": "架构设计,监控,YYC³,运维监控",
    "全链路智能化": "架构设计,智能化,YYC³,转型",
    "分层闭环": "架构设计,开发模型,YYC³,闭环",
    "多维度闭环": "架构设计,监控优化,YYC³,闭环",
    "系统色": "架构设计,UI设计,YYC³,色彩",
    "可访问性": "架构设计,可访问性,YYC³,无障碍",
    "错误处理": "架构设计,错误处理,YYC³,容错",
}


def extract_doc_info(file_path: Path) -> Tuple[str, str, str]:
    """
    从文件路径提取文档信息
    """
    # 提取文件名（不含扩展名）
    file_name = file_path.stem
    
    # 提取文档类型（架构类/技巧类）
    doc_type = "架构类" if "架构类" in file_path.name else "技巧类"
    
    # 提取文档标题
    # 文件名格式：编号-YYC3-Cater--类型-标题.md
    match = re.match(r'\d+-YYC3-Cater--[^-]+-(.+)', file_name)
    if match:
        title = match.group(1)
    else:
        title = file_name
    
    return file_name, doc_type, title


def get_description(title: str) -> str:
    """
    根据标题获取文档描述
    """
    return DESCRIPTION_MAP.get(title, f"YYC³餐饮行业智能化平台的{title}")


def get_tags(title: str) -> str:
    """
    根据标题获取文档标签
    """
    # 根据标题关键词匹配标签
    for keyword, tags in TAGS_MAP.items():
        if keyword in title:
            return tags
    return "YYC³,文档"


def has_standard_header(content: str) -> bool:
    """
    检查文档是否已有标准头部信息
    """
    return "**@file**：" in content


def add_standard_header(file_path: Path) -> bool:
    """
    为文档添加标准头部信息
    """
    try:
        # 读取文件内容
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已有标准头部信息
        if has_standard_header(content):
            print(f"  ✓ 已有标准头部信息，跳过：{file_path.name}")
            return False
        
        # 提取文档信息
        file_name, doc_type, title = extract_doc_info(file_path)
        
        # 获取描述和标签
        description = get_description(title)
        tags = get_tags(title)
        
        # 生成标准头部信息
        header = HEADER_TEMPLATE.format(
            file_name=f"YYC³-{title}",
            description=description,
            tags=tags
        )
        
        # 在文档开头添加头部信息
        new_content = header + content
        
        # 写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ 已添加标准头部信息：{file_path.name}")
        return True
        
    except Exception as e:
        print(f"  ✗ 处理失败：{file_path.name} - {str(e)}")
        return False


def process_directory(dir_path: Path) -> Tuple[int, int]:
    """
    处理目录下的所有Markdown文档（递归处理子目录）
    """
    processed = 0
    skipped = 0
    
    print(f"\n处理目录：{dir_path.name}")
    
    # 递归遍历目录下的所有.md文件
    for file_path in sorted(dir_path.rglob("*.md")):
        if add_standard_header(file_path):
            processed += 1
        else:
            skipped += 1
    
    return processed, skipped


def main():
    """
    主函数
    """
    print("=" * 80)
    print("YYC³ 文档统一化脚本")
    print("批量添加标准文档头部信息")
    print("=" * 80)
    
    total_processed = 0
    total_skipped = 0
    
    # 处理所有子目录
    for subdir in sorted(DOCS_ROOT.iterdir()):
        if subdir.is_dir():
            processed, skipped = process_directory(subdir)
            total_processed += processed
            total_skipped += skipped
    
    # 输出统计信息
    print("\n" + "=" * 80)
    print("处理完成")
    print("=" * 80)
    print(f"总计处理：{total_processed + total_skipped} 个文档")
    print(f"已添加头部信息：{total_processed} 个")
    print(f"已跳过：{total_skipped} 个")
    print("=" * 80)


if __name__ == "__main__":
    main()
