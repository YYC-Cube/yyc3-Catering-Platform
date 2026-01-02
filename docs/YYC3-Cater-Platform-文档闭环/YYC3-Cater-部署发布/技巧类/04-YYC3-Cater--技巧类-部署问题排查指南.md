---

**@file**：YYC³-部署问题排查指南
**@description**：YYC³餐饮行业智能化平台的部署问题排查指南
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：YYC³,文档

---
# 🔖 YYC³ 部署问题排查指南

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 属性 | 内容 |
|------|------|
| **文档标题** | YYC³ 部署问题排查指南 |
| **文档类型** | 技巧类文档 |
| **所属阶段** | 部署发布 |
| **遵循规范** | YYC³ 团队标准化规范 v1.0.0 |
| **版本号** | v1.0.0 |
| **创建日期** | 2025-01-30 |
| **作者** | YYC³ Team |
| **更新日期** | 2025-01-30 |

---

## 📑 目录

1. [问题排查概述](#1-问题排查概述)
2. [环境问题排查](#2-环境问题排查)
3. [容器问题排查](#3-容器问题排查)
4. [Kubernetes问题排查](#4-kubernetes问题排查)
5. [网络问题排查](#5-网络问题排查)
6. [存储问题排查](#6-存储问题排查)
7. [应用问题排查](#7-应用问题排查)
8. [性能问题排查](#8-性能问题排查)
9. [安全问题排查](#9-安全问题排查)
10. [常见问题FAQ](#10-常见问题faq)

---

## 1. 概述

### 1.1 功能说明

### 1.2 技术栈

### 1.3 开发环境

## 2. 实现方案

### 2.1 代码结构

### 2.2 核心逻辑

### 2.3 数据处理

## 3. 接口文档

### 3.1 API接口

### 3.2 请求参数

### 3.3 响应格式

## 4. 测试方案

### 4.1 单元测试

### 4.2 集成测试

### 4.3 测试用例

## 5. 部署指南

### 5.1 环境准备

### 5.2 部署步骤

### 5.3 验证方法

## 6. 常见问题

### 6.1 问题排查

### 6.2 解决方案

## 1. 问题排查概述

### 1.1 问题排查方法论

**系统化排查流程**
```mermaid
graph TD
    A[发现问题] --> B[问题分类]
    B --> C{问题类型}
    C -->|环境问题| D[环境排查]
    C -->|容器问题| E[容器排查]
    C -->|K8s问题| F[K8s排查]
    C -->|网络问题| G[网络排查]
    C -->|存储问题| H[存储排查]
    C -->|应用问题| I[应用排查]
    C -->|性能问题| J[性能排查]
    C -->|安全问题| K[安全排查]
    D --> L[定位根因]
    E --> L
    F --> L
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L
    L --> M[制定解决方案]
    M --> N[实施修复]
    N --> O[验证结果]
    O --> P{问题解决?}
    P -->|否| L
    P -->|是| Q[总结经验]
```

### 1.2 问题分类体系

| 问题类别 | 子类别 | 常见症状 | 优先级 |
|---------|--------|----------|--------|
| 环境问题 | 资源不足、配置错误、依赖缺失 | 部署失败、启动失败 | 高 |
| 容器问题 | 镜像问题、运行时错误、资源限制 | 容器崩溃、无法启动 | 高 |
| K8s问题 | 调度失败、状态异常、配置错误 | Pod未就绪、服务不可用 | 高 |
| 网络问题 | 连接超时、DNS解析、端口冲突 | 无法访问、网络不通 | 高 |
| 存储问题 | 挂载失败、容量不足、权限问题 | 数据丢失、无法读写 | 高 |
| 应用问题 | 代码错误、配置错误、依赖问题 | 功能异常、报错 | 中 |
| 性能问题 | 响应慢、吞吐量低、资源占用高 | 用户体验差 | 中 |
| 安全问题 | 漏洞、权限问题、配置不当 | 安全风险 | 高 |

### 1.3 排查工具清单

**必备工具**
```bash
# 系统工具
top              # 进程监控
htop             # 进程监控（增强版）
ps               # 进程列表
netstat          # 网络连接
ss               # 网络连接（现代版）
lsof             # 文件和网络连接
df               # 磁盘使用
du               # 目录大小
free             # 内存使用
uptime           # 系统负载

# 日志工具
journalctl       # systemd日志
tail             # 查看日志
grep             # 搜索日志
awk              # 日志分析
sed              # 日志处理

# 网络工具
ping             # 网络连通性
curl             # HTTP请求
wget             # HTTP下载
dig              # DNS查询
nslookup         # DNS查询
traceroute       # 路由追踪
tcpdump          # 抓包分析

# Docker工具
docker           # Docker管理
docker-compose   # Docker Compose

# Kubernetes工具
kubectl          # K8s管理
helm             # Helm包管理
k9s              # K8s交互式管理
```

---

## 2. 环境问题排查

### 2.1 资源不足问题

**问题症状**
- 部署失败
- 容器无法启动
- 系统响应缓慢

**排查步骤**
```bash
#!/bin/bash

# 环境资源排查脚本

echo "=== 环境资源排查 ==="

# 1. 检查CPU使用
echo "1. CPU使用情况..."
top -bn1 | head -20

# 2. 检查内存使用
echo ""
echo "2. 内存使用情况..."
free -h

# 3. 检查磁盘使用
echo ""
echo "3. 磁盘使用情况..."
df -h

# 4. 检查磁盘IO
echo ""
echo "4. 磁盘IO情况..."
iostat -x 1 3

# 5. 检查网络连接
echo ""
echo "5. 网络连接情况..."
netstat -tuln | head -20

# 6. 检查系统负载
echo ""
echo "6. 系统负载..."
uptime

# 7. 检查进程数
echo ""
echo "7. 进程数..."
ps aux | wc -l

# 8. 检查文件描述符
echo ""
echo "8. 文件描述符使用..."
cat /proc/sys/fs/file-nr
```

**解决方案**
```bash
# 1. 清理不必要的进程
kill -9 <PID>

# 2. 清理磁盘空间
# 清理Docker镜像
docker system prune -a

# 清理日志文件
find /var/log -type f -name "*.log" -mtime +7 -delete

# 清理临时文件
rm -rf /tmp/*

# 3. 优化系统参数
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 增加进程数限制
echo "* soft nproc 4096" >> /etc/security/limits.conf
echo "* hard nproc 4096" >> /etc/security/limits.conf
```

### 2.2 配置错误问题

**问题症状**
- 应用无法启动
- 配置不生效
- 行为异常

**排查步骤**
```bash
#!/bin/bash

# 配置排查脚本

echo "=== 配置排查 ==="

# 1. 检查环境变量
echo "1. 环境变量..."
env | grep -E "NODE_ENV|PORT|DATABASE_URL"

# 2. 检查配置文件
echo ""
echo "2. 配置文件..."
ls -la /etc/yyc3/

# 3. 检查权限
echo ""
echo "3. 文件权限..."
ls -la /etc/yyc3/config/

# 4. 验证配置文件语法
echo ""
echo "4. 配置文件语法..."
# JSON配置
cat /etc/yyc3/config.json | jq empty

# YAML配置
python3 -c "import yaml; yaml.safe_load(open('/etc/yyc3/config.yaml'))"

# 5. 检查配置差异
echo ""
echo "5. 配置差异..."
diff /etc/yyc3/config.json /etc/yyc3/config.json.bak
```

**解决方案**
```bash
# 1. 修复配置文件
# 备份当前配置
cp /etc/yyc3/config.json /etc/yyc3/config.json.bak

# 编辑配置文件
vim /etc/yyc3/config.json

# 验证配置
cat /etc/yyc3/config.json | jq empty

# 2. 重启应用
systemctl restart yyc3-web

# 3. 验证配置生效
curl http://localhost:3200/health
```

### 2.3 依赖缺失问题

**问题症状**
- 构建失败
- 运行时错误
- 模块找不到

**排查步骤**
```bash
#!/bin/bash

# 依赖排查脚本

echo "=== 依赖排查 ==="

# 1. 检查Node.js版本
echo "1. Node.js版本..."
node --version

# 2. 检查npm版本
echo ""
echo "2. npm版本..."
npm --version

# 3. 检查依赖安装
echo ""
echo "3. 依赖安装情况..."
npm list --depth=0

# 4. 检查缺失依赖
echo ""
echo "4. 缺失依赖..."
npm ls --depth=0 2>&1 | grep "UNMET"

# 5. 检查依赖冲突
echo ""
echo "5. 依赖冲突..."
npm ls --depth=0 2>&1 | grep "extraneous"

# 6. 检查系统依赖
echo ""
echo "6. 系统依赖..."
which git
which python3
which docker
```

**解决方案**
```bash
# 1. 安装缺失依赖
npm install

# 2. 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 3. 安装系统依赖
# Ubuntu/Debian
apt-get update
apt-get install -y git python3 docker.io

# CentOS/RHEL
yum update
yum install -y git python3 docker

# 4. 使用nvm管理Node.js版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

---

## 3. 容器问题排查

### 3.1 镜像问题

**问题症状**
- 镜像拉取失败
- 镜像启动失败
- 镜像大小过大

**排查步骤**
```bash
#!/bin/bash

# Docker镜像排查脚本

echo "=== Docker镜像排查 ==="

# 1. 检查镜像列表
echo "1. 本地镜像..."
docker images

# 2. 检查镜像大小
echo ""
echo "2. 镜像大小..."
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 3. 检查镜像详情
echo ""
echo "3. 镜像详情..."
docker inspect yyc3-web:latest | jq '.[0] | {Size, Created, Architecture, Os}'

# 4. 检查镜像层
echo ""
echo "4. 镜像层..."
docker history yyc3-web:latest

# 5. 测试镜像
echo ""
echo "5. 测试镜像..."
docker run --rm yyc3-web:latest echo "镜像测试成功"
```

**解决方案**
```bash
# 1. 清理无用镜像
docker image prune -a

# 2. 优化镜像大小
# 使用多阶段构建
cat > Dockerfile <<EOF
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["node", "dist/index.js"]
EOF

# 3. 构建镜像
docker build -t yyc3-web:latest .

# 4. 推送镜像
docker push yyc3-web:latest
```

### 3.2 容器运行时错误

**问题症状**
- 容器无法启动
- 容器频繁重启
- 容器无响应

**排查步骤**
```bash
#!/bin/bash

# 容器运行时排查脚本

echo "=== 容器运行时排查 ==="

# 1. 检查容器状态
echo "1. 容器状态..."
docker ps -a

# 2. 检查容器日志
echo ""
echo "2. 容器日志..."
docker logs yyc3-web --tail 100

# 3. 检查容器资源使用
echo ""
echo "3. 容器资源使用..."
docker stats yyc3-web --no-stream

# 4. 检查容器进程
echo ""
echo "4. 容器进程..."
docker top yyc3-web

# 5. 检查容器网络
echo ""
echo "5. 容器网络..."
docker inspect yyc3-web | jq '.[0].NetworkSettings.Networks'

# 6. 进入容器调试
echo ""
echo "6. 进入容器调试..."
docker exec -it yyc3-web sh
```

**解决方案**
```bash
# 1. 查看容器日志
docker logs yyc3-web -f

# 2. 重启容器
docker restart yyc3-web

# 3. 删除并重新创建容器
docker stop yyc3-web
docker rm yyc3-web
docker run -d --name yyc3-web -p 3200:3200 yyc3-web:latest

# 4. 检查容器健康状态
docker inspect yyc3-web | jq '.[0].State.Health'

# 5. 调整资源限制
docker run -d \
  --name yyc3-web \
  --memory="512m" \
  --cpus="1.0" \
  -p 3200:3200 \
  yyc3-web:latest
```

### 3.3 资源限制问题

**问题症状**
- 容器被OOM杀死
- 容器性能下降
- 容器无法启动

**排查步骤**
```bash
#!/bin/bash

# 容器资源排查脚本

echo "=== 容器资源排查 ==="

# 1. 检查容器资源限制
echo "1. 容器资源限制..."
docker inspect yyc3-web | jq '.[0].HostConfig | {Memory, CpuShares, CpuQuota}'

# 2. 检查容器资源使用
echo ""
echo "2. 容器资源使用..."
docker stats yyc3-web --no-stream

# 3. 检查系统内存
echo ""
echo "3. 系统内存..."
free -h

# 4. 检查系统CPU
echo ""
echo "4. 系统CPU..."
top -bn1 | head -20

# 5. 检查OOM日志
echo ""
echo "5. OOM日志..."
dmesg | grep -i "out of memory"
```

**解决方案**
```bash
# 1. 调整内存限制
docker update --memory="1g" yyc3-web

# 2. 调整CPU限制
docker update --cpus="2.0" yyc3-web

# 3. 添加交换空间
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 4. 优化应用内存使用
# 在应用中实现内存监控和限制
```

---

## 4. Kubernetes问题排查

### 4.1 Pod状态异常

**问题症状**
- Pod处于Pending状态
- Pod处于CrashLoopBackOff状态
- Pod处于ImagePullBackOff状态

**排查步骤**
```bash
#!/bin/bash

# Pod状态排查脚本

NAMESPACE=${1:-"yyc3-production"}

echo "=== Pod状态排查 ==="
echo "命名空间: $NAMESPACE"
echo ""

# 1. 检查Pod状态
echo "1. Pod状态..."
kubectl get pods -n $NAMESPACE

# 2. 检查Pod详情
echo ""
echo "2. Pod详情..."
kubectl describe pod -n $NAMESPACE -l app=yyc3-web

# 3. 检查Pod日志
echo ""
echo "3. Pod日志..."
kubectl logs -n $NAMESPACE -l app=yyc3-web --tail=100

# 4. 检查Pod事件
echo ""
echo "4. Pod事件..."
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'

# 5. 检查Pod资源使用
echo ""
echo "5. Pod资源使用..."
kubectl top pods -n $NAMESPACE
```

**解决方案**
```bash
# 1. Pending状态处理
# 检查调度失败原因
kubectl describe pod <pod-name> -n <namespace>

# 检查节点资源
kubectl describe nodes

# 检查污点和容忍度
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints

# 2. CrashLoopBackOff状态处理
# 查看Pod日志
kubectl logs <pod-name> -n <namespace> --previous

# 检查健康检查配置
kubectl get pod <pod-name> -n <namespace> -o yaml | grep -A 10 livenessProbe

# 3. ImagePullBackOff状态处理
# 检查镜像名称和标签
kubectl get pod <pod-name> -n <namespace> -o yaml | grep image:

# 检查镜像仓库访问
docker pull <image-name>

# 4. 删除并重新创建Pod
kubectl delete pod <pod-name> -n <namespace>
```

### 4.2 Service问题

**问题症状**
- Service无法访问
- Service负载均衡不工作
- Service DNS解析失败

**排查步骤**
```bash
#!/bin/bash

# Service排查脚本

NAMESPACE=${1:-"yyc3-production"}

echo "=== Service排查 ==="
echo "命名空间: $NAMESPACE"
echo ""

# 1. 检查Service状态
echo "1. Service状态..."
kubectl get svc -n $NAMESPACE

# 2. 检查Service详情
echo ""
echo "2. Service详情..."
kubectl describe svc yyc3-web -n $NAMESPACE

# 3. 检查Service端点
echo ""
echo "3. Service端点..."
kubectl get endpoints yyc3-web -n $NAMESPACE

# 4. 检查Service DNS
echo ""
echo "4. Service DNS..."
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup yyc3-web.$NAMESPACE.svc.cluster.local

# 5. 测试Service连接
echo ""
echo "5. 测试Service连接..."
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://yyc3-web.$NAMESPACE.svc.cluster.local:3200/health
```

**解决方案**
```bash
# 1. 检查Service选择器
kubectl get svc yyc3-web -n <namespace> -o yaml | grep selector

# 2. 检查Pod标签
kubectl get pods -n <namespace> -l app=yyc3-web --show-labels

# 3. 检查端口配置
kubectl get svc yyc3-web -n <namespace> -o yaml | grep -A 5 ports

# 4. 修复Service配置
kubectl patch svc yyc3-web -n <namespace> -p '{"spec":{"selector":{"app":"yyc3-web"}}}'

# 5. 重启Service
kubectl delete svc yyc3-web -n <namespace>
kubectl apply -f service.yaml
```

### 4.3 Ingress问题

**问题症状**
- Ingress无法访问
- Ingress路由不工作
- Ingress证书问题

**排查步骤**
```bash
#!/bin/bash

# Ingress排查脚本

NAMESPACE=${1:-"yyc3-production"}

echo "=== Ingress排查 ==="
echo "命名空间: $NAMESPACE"
echo ""

# 1. 检查Ingress状态
echo "1. Ingress状态..."
kubectl get ingress -n $NAMESPACE

# 2. 检查Ingress详情
echo ""
echo "2. Ingress详情..."
kubectl describe ingress yyc3-web -n $NAMESPACE

# 3. 检查Ingress Controller
echo ""
echo "3. Ingress Controller..."
kubectl get pods -n ingress-nginx

# 4. 检查Ingress Controller日志
echo ""
echo "4. Ingress Controller日志..."
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=100

# 5. 测试Ingress访问
echo ""
echo "5. 测试Ingress访问..."
curl -I https://yyc3.example.com
```

**解决方案**
```bash
# 1. 检查Ingress规则
kubectl get ingress yyc3-web -n <namespace> -o yaml | grep -A 10 rules

# 2. 检查Service后端
kubectl get svc -n <namespace>

# 3. 检查证书
kubectl get secret -n <namespace>

# 4. 修复Ingress配置
kubectl apply -f ingress.yaml

# 5. 重启Ingress Controller
kubectl rollout restart deployment/ingress-nginx-controller -n ingress-nginx
```

---

## 5. 网络问题排查

### 5.1 连接超时问题

**问题症状**
- 无法访问服务
- 连接超时
- 请求失败

**排查步骤**
```bash
#!/bin/bash

# 网络连接排查脚本

echo "=== 网络连接排查 ==="

# 1. 检查网络接口
echo "1. 网络接口..."
ip addr show

# 2. 检查路由表
echo ""
echo "2. 路由表..."
ip route show

# 3. 检查DNS解析
echo ""
echo "3. DNS解析..."
nslookup yyc3.example.com

# 4. 检查端口监听
echo ""
echo "4. 端口监听..."
netstat -tuln | grep 3200

# 5. 测试网络连通性
echo ""
echo "5. 网络连通性..."
ping -c 3 yyc3.example.com

# 6. 测试端口连接
echo ""
echo "6. 端口连接..."
telnet yyc3.example.com 3200

# 7. 测试HTTP连接
echo ""
echo "7. HTTP连接..."
curl -v http://yyc3.example.com:3200/health
```

**解决方案**
```bash
# 1. 检查防火墙规则
iptables -L -n

# 2. 检查SELinux状态
getenforce

# 3. 开放端口
firewall-cmd --add-port=3200/tcp --permanent
firewall-cmd --reload

# 4. 修改DNS配置
vim /etc/resolv.conf

# 5. 添加路由
ip route add 10.0.0.0/24 via 192.168.1.1
```

### 5.2 DNS解析问题

**问题症状**
- 域名无法解析
- DNS查询超时
- 解析结果不正确

**排查步骤**
```bash
#!/bin/bash

# DNS排查脚本

echo "=== DNS排查 ==="

# 1. 检查DNS配置
echo "1. DNS配置..."
cat /etc/resolv.conf

# 2. 检查DNS解析
echo ""
echo "2. DNS解析..."
nslookup yyc3.example.com

# 3. 检查DNS服务器
echo ""
echo "3. DNS服务器..."
dig @8.8.8.8 yyc3.example.com

# 4. 检查DNS缓存
echo ""
echo "4. DNS缓存..."
systemd-resolve --statistics

# 5. 测试DNS解析速度
echo ""
echo "5. DNS解析速度..."
time nslookup yyc3.example.com
```

**解决方案**
```bash
# 1. 修改DNS服务器
vim /etc/resolv.conf

# 添加Google DNS
nameserver 8.8.8.8
nameserver 8.8.4.4

# 2. 清除DNS缓存
# systemd-resolved
systemd-resolve --flush-caches

# dnsmasq
systemctl restart dnsmasq

# 3. 检查hosts文件
cat /etc/hosts

# 4. 添加hosts记录
echo "192.168.1.100 yyc3.example.com" >> /etc/hosts
```

### 5.3 端口冲突问题

**问题症状**
- 服务无法启动
- 端口已被占用
- 绑定失败

**排查步骤**
```bash
#!/bin/bash

# 端口冲突排查脚本

echo "=== 端口冲突排查 ==="

# 1. 检查端口占用
echo "1. 端口占用..."
netstat -tuln | grep 3200

# 2. 检查进程占用
echo ""
echo "2. 进程占用..."
lsof -i :3200

# 3. 检查端口范围
echo ""
echo "3. 端口范围..."
sysctl net.ipv4.ip_local_port_range

# 4. 检查TIME_WAIT连接
echo ""
echo "4. TIME_WAIT连接..."
netstat -an | grep TIME_WAIT | wc -l

# 5. 检查端口监听
echo ""
echo "5. 端口监听..."
ss -tuln | grep 3200
```

**解决方案**
```bash
# 1. 查找占用端口的进程
lsof -i :3200

# 2. 终止占用端口的进程
kill -9 <PID>

# 3. 修改应用端口
# 在配置文件中修改端口号
PORT=3201

# 4. 调整端口范围
sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# 5. 优化TIME_WAIT连接
sysctl -w net.ipv4.tcp_tw_reuse=1
sysctl -w net.ipv4.tcp_fin_timeout=30
```

---

## 6. 存储问题排查

### 6.1 挂载失败问题

**问题症状**
- Pod无法启动
- 存储卷无法挂载
- 数据无法访问

**排查步骤**
```bash
#!/bin/bash

# 存储挂载排查脚本

NAMESPACE=${1:-"yyc3-production"}

echo "=== 存储挂载排查 ==="
echo "命名空间: $NAMESPACE"
echo ""

# 1. 检查PV状态
echo "1. PV状态..."
kubectl get pv

# 2. 检查PVC状态
echo ""
echo "2. PVC状态..."
kubectl get pvc -n $NAMESPACE

# 3. 检查StorageClass
echo ""
echo "3. StorageClass..."
kubectl get storageclass

# 4. 检查Pod挂载
echo ""
echo "4. Pod挂载..."
kubectl get pod -n $NAMESPACE -o jsonpath='{.items[*].spec.volumes[*].name}'

# 5. 检查存储事件
echo ""
echo "5. 存储事件..."
kubectl get events -n $NAMESPACE --field-selector reason=FailedMount
```

**解决方案**
```bash
# 1. 检查PV绑定状态
kubectl get pv <pv-name> -o yaml | grep -A 5 status

# 2. 检查PVC绑定状态
kubectl get pvc <pvc-name> -n <namespace> -o yaml | grep -A 5 status

# 3. 重新创建PVC
kubectl delete pvc <pvc-name> -n <namespace>
kubectl apply -f pvc.yaml

# 4. 检查存储类配置
kubectl get storageclass <storage-class-name> -o yaml

# 5. 检查节点存储
df -h
```

### 6.2 容量不足问题

**问题症状**
- 无法写入数据
- 磁盘空间不足
- 性能下降

**排查步骤**
```bash
#!/bin/bash

# 存储容量排查脚本

echo "=== 存储容量排查 ==="

# 1. 检查磁盘使用
echo "1. 磁盘使用..."
df -h

# 2. 检查目录大小
echo ""
echo "2. 目录大小..."
du -sh /var/lib/docker /var/log /tmp

# 3. 检查inode使用
echo ""
echo "3. inode使用..."
df -i

# 4. 检查大文件
echo ""
echo "4. 大文件..."
find / -type f -size +1G 2>/dev/null | head -10

# 5. 检查日志大小
echo ""
echo "5. 日志大小..."
du -sh /var/log/*
```

**解决方案**
```bash
# 1. 清理日志文件
find /var/log -type f -name "*.log" -mtime +7 -delete

# 2. 清理Docker资源
docker system prune -a

# 3. 清理临时文件
rm -rf /tmp/*

# 4. 扩展磁盘容量
# LVM扩展
lvextend -L +10G /dev/mapper/vg0-lv0
resize2fs /dev/mapper/vg0-lv0

# 5. 压缩日志
logrotate -f /etc/logrotate.conf
```

### 6.3 权限问题

**问题症状**
- 无法读写文件
- 权限被拒绝
- 访问失败

**排查步骤**
```bash
#!/bin/bash

# 存储权限排查脚本

echo "=== 存储权限排查 ==="

# 1. 检查文件权限
echo "1. 文件权限..."
ls -la /data

# 2. 检查目录权限
echo ""
echo "2. 目录权限..."
ls -ld /data

# 3. 检查用户组
echo ""
echo "3. 用户组..."
groups

# 4. 检查SELinux上下文
echo ""
echo "4. SELinux上下文..."
ls -Z /data

# 5. 检查挂载选项
echo ""
echo "5. 挂载选项..."
mount | grep /data
```

**解决方案**
```bash
# 1. 修改文件权限
chmod 755 /data

# 2. 修改文件所有者
chown -R yyc3:yyc3 /data

# 3. 修改SELinux上下文
chcon -R -t svirt_sandbox_file_t /data

# 4. 修改挂载选项
mount -o remount,rw /data

# 5. 添加用户到组
usermod -a -G yyc3 yyc3
```

---

## 7. 应用问题排查

### 7.1 应用启动失败

**问题症状**
- 应用无法启动
- 启动报错
- 启动超时

**排查步骤**
```bash
#!/bin/bash

# 应用启动排查脚本

echo "=== 应用启动排查 ==="

# 1. 检查应用进程
echo "1. 应用进程..."
ps aux | grep node

# 2. 检查应用日志
echo ""
echo "2. 应用日志..."
tail -100 /var/log/yyc3/application.log

# 3. 检查应用配置
echo ""
echo "3. 应用配置..."
cat /etc/yyc3/config.json

# 4. 检查环境变量
echo ""
echo "4. 环境变量..."
env | grep -E "NODE_ENV|PORT|DATABASE_URL"

# 5. 检查端口监听
echo ""
echo "5. 端口监听..."
netstat -tuln | grep 3200
```

**解决方案**
```bash
# 1. 查看应用日志
tail -f /var/log/yyc3/application.log

# 2. 检查应用配置
cat /etc/yyc3/config.json | jq .

# 3. 重启应用
systemctl restart yyc3-web

# 4. 手动启动应用
cd /opt/yyc3-web
npm start

# 5. 调试模式启动
NODE_ENV=development npm start
```

### 7.2 应用运行时错误

**问题症状**
- 应用报错
- 功能异常
- 性能下降

**排查步骤**
```bash
#!/bin/bash

# 应用运行时排查脚本

echo "=== 应用运行时排查 ==="

# 1. 检查应用日志
echo "1. 应用日志..."
tail -100 /var/log/yyc3/application.log | grep -i error

# 2. 检查应用性能
echo ""
echo "2. 应用性能..."
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3200/health

# 3. 检查应用连接
echo ""
echo "3. 应用连接..."
netstat -an | grep 3200 | head -10

# 4. 检查应用资源
echo ""
echo "4. 应用资源..."
ps aux | grep node | grep yyc3

# 5. 检查应用依赖
echo ""
echo "5. 应用依赖..."
cd /opt/yyc3-web
npm list --depth=0
```

**解决方案**
```bash
# 1. 查看错误日志
tail -f /var/log/yyc3/application.log | grep -i error

# 2. 检查应用健康状态
curl http://localhost:3200/health

# 3. 重启应用
systemctl restart yyc3-web

# 4. 更新应用依赖
cd /opt/yyc3-web
npm update

# 5. 回滚应用版本
cd /opt/yyc3-web
git checkout v1.0.0
npm install
systemctl restart yyc3-web
```

### 7.3 配置问题

**问题症状**
- 配置不生效
- 配置错误
- 行为异常

**排查步骤**
```bash
#!/bin/bash

# 应用配置排查脚本

echo "=== 应用配置排查 ==="

# 1. 检查配置文件
echo "1. 配置文件..."
cat /etc/yyc3/config.json

# 2. 检查环境变量
echo ""
echo "2. 环境变量..."
env | sort

# 3. 检查配置差异
echo ""
echo "3. 配置差异..."
diff /etc/yyc3/config.json /etc/yyc3/config.json.bak

# 4. 验证配置语法
echo ""
echo "4. 配置语法..."
cat /etc/yyc3/config.json | jq empty

# 5. 检查配置权限
echo ""
echo "5. 配置权限..."
ls -la /etc/yyc3/config.json
```

**解决方案**
```bash
# 1. 备份当前配置
cp /etc/yyc3/config.json /etc/yyc3/config.json.bak

# 2. 编辑配置文件
vim /etc/yyc3/config.json

# 3. 验证配置
cat /etc/yyc3/config.json | jq empty

# 4. 重启应用
systemctl restart yyc3-web

# 5. 验证配置生效
curl http://localhost:3200/config
```

---

## 8. 性能问题排查

### 8.1 响应慢问题

**问题症状**
- 页面加载慢
- API响应慢
- 用户体验差

**排查步骤**
```bash
#!/bin/bash

# 性能排查脚本

echo "=== 性能排查 ==="

# 1. 检查响应时间
echo "1. 响应时间..."
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3200/health

# 2. 检查CPU使用
echo ""
echo "2. CPU使用..."
top -bn1 | grep node

# 3. 检查内存使用
echo ""
echo "3. 内存使用..."
ps aux | grep node | grep yyc3

# 4. 检查磁盘IO
echo ""
echo "4. 磁盘IO..."
iostat -x 1 3

# 5. 检查网络IO
echo ""
echo "5. 网络IO..."
sar -n DEV 1 3
```

**解决方案**
```bash
# 1. 优化应用代码
# 添加缓存
# 优化数据库查询
# 使用CDN

# 2. 增加资源
# 增加CPU
# 增加内存
# 增加带宽

# 3. 使用负载均衡
# 配置Nginx负载均衡
# 配置Kubernetes Service

# 4. 启用压缩
# 启用Gzip压缩
# 启用Brotli压缩

# 5. 使用CDN
# 配置CDN加速
# 预加载静态资源
```

### 8.2 吞吐量低问题

**问题症状**
- 并发能力差
- 请求处理慢
- 系统负载高

**排查步骤**
```bash
#!/bin/bash

# 吞吐量排查脚本

echo "=== 吞吐量排查 ==="

# 1. 压力测试
echo "1. 压力测试..."
ab -n 1000 -c 10 http://localhost:3200/health

# 2. 检查连接数
echo ""
echo "2. 连接数..."
netstat -an | grep 3200 | wc -l

# 3. 检查请求队列
echo ""
echo "3. 请求队列..."
ss -ltn | grep 3200

# 4. 检查系统负载
echo ""
echo "4. 系统负载..."
uptime

# 5. 检查进程数
echo ""
echo "5. 进程数..."
ps aux | wc -l
```

**解决方案**
```bash
# 1. 增加应用实例
# 使用Docker Compose扩展
docker-compose up -d --scale yyc3-web=3

# 使用Kubernetes扩展
kubectl scale deployment yyc3-web --replicas=3

# 2. 优化应用代码
# 使用异步处理
# 使用连接池
# 使用缓存

# 3. 优化数据库
# 添加索引
# 优化查询
# 使用读写分离

# 4. 使用消息队列
# 使用Redis队列
# 使用RabbitMQ
# 使用Kafka

# 5. 使用CDN
# 配置CDN加速
# 预加载静态资源
```

### 8.3 资源占用高问题

**问题症状**
- CPU占用高
- 内存占用高
- 磁盘占用高

**排查步骤**
```bash
#!/bin/bash

# 资源占用排查脚本

echo "=== 资源占用排查 ==="

# 1. 检查CPU使用
echo "1. CPU使用..."
top -bn1 | head -20

# 2. 检查内存使用
echo ""
echo "2. 内存使用..."
free -h

# 3. 检查磁盘使用
echo ""
echo "3. 磁盘使用..."
df -h

# 4. 检查进程资源
echo ""
echo "4. 进程资源..."
ps aux --sort=-%cpu | head -10
ps aux --sort=-%mem | head -10

# 5. 检查连接数
echo ""
echo "5. 连接数..."
netstat -an | wc -l
```

**解决方案**
```bash
# 1. 优化应用代码
# 减少内存泄漏
# 优化算法
# 使用缓存

# 2. 限制资源使用
# Docker资源限制
docker run -m 512m --cpus="1.0" yyc3-web

# Kubernetes资源限制
resources:
  limits:
    memory: "512Mi"
    cpu: "1"
  requests:
    memory: "256Mi"
    cpu: "0.5"

# 3. 清理无用资源
# 清理Docker镜像
docker system prune -a

# 清理日志文件
find /var/log -type f -name "*.log" -mtime +7 -delete

# 4. 监控资源使用
# 使用Prometheus监控
# 使用Grafana可视化

# 5. 自动扩缩容
# Kubernetes HPA
kubectl autoscale deployment yyc3-web --cpu-percent=80 --min=2 --max=10
```

---

## 9. 安全问题排查

### 9.1 漏洞问题

**问题症状**
- 存在安全漏洞
- 依赖版本过旧
- 配置不当

**排查步骤**
```bash
#!/bin/bash

# 安全漏洞排查脚本

echo "=== 安全漏洞排查 ==="

# 1. 检查npm漏洞
echo "1. npm漏洞..."
npm audit

# 2. 检查Docker镜像漏洞
echo ""
echo "2. Docker镜像漏洞..."
trivy image yyc3-web:latest

# 3. 检查系统漏洞
echo ""
echo "3. 系统漏洞..."
apt-get update
apt-get audit

# 4. 检查配置安全
echo ""
echo "4. 配置安全..."
grep -r "password" /etc/yyc3/

# 5. 检查权限
echo ""
echo "5. 权限检查..."
ls -la /etc/yyc3/
```

**解决方案**
```bash
# 1. 修复npm漏洞
npm audit fix

# 2. 更新依赖
npm update

# 3. 更新Docker镜像
docker pull yyc3-web:latest

# 4. 更新系统
apt-get update
apt-get upgrade

# 5. 修复配置
# 移除硬编码密码
# 使用环境变量
# 使用密钥管理
```

### 9.2 权限问题

**问题症状**
- 权限过大
- 权限不足
- 未授权访问

**排查步骤**
```bash
#!/bin/bash

# 权限排查脚本

echo "=== 权限排查 ==="

# 1. 检查用户权限
echo "1. 用户权限..."
id

# 2. 检查文件权限
echo ""
echo "2. 文件权限..."
ls -la /etc/yyc3/

# 3. 检查进程权限
echo ""
echo "3. 进程权限..."
ps aux | grep yyc3

# 4. 检查网络权限
echo ""
echo "4. 网络权限..."
iptables -L -n

# 5. 检查sudo权限
echo ""
echo "5. sudo权限..."
sudo -l
```

**解决方案**
```bash
# 1. 最小权限原则
# 只授予必要的权限
chmod 644 /etc/yyc3/config.json
chown yyc3:yyc3 /etc/yyc3/config.json

# 2. 使用非root用户运行
# Dockerfile
USER yyc3

# Kubernetes
securityContext:
  runAsNonRoot: true
  runAsUser: 1000

# 3. 限制sudo权限
# 编辑sudoers
visudo

# 4. 使用RBAC
# Kubernetes RBAC
kubectl create rolebinding yyc3-admin \
  --clusterrole=admin \
  --user=yyc3 \
  --namespace=yyc3-production

# 5. 审计权限
# 定期审查权限
# 记录权限变更
```

### 9.3 配置安全问题

**问题症状**
- 硬编码密码
- 敏感信息泄露
- 配置不当

**排查步骤**
```bash
#!/bin/bash

# 配置安全排查脚本

echo "=== 配置安全排查 ==="

# 1. 检查硬编码密码
echo "1. 硬编码密码..."
grep -r "password" /etc/yyc3/

# 2. 检查敏感信息
echo ""
echo "2. 敏感信息..."
grep -r "api_key\|secret\|token" /etc/yyc3/

# 3. 检查配置文件权限
echo ""
echo "3. 配置文件权限..."
ls -la /etc/yyc3/config.json

# 4. 检查环境变量
echo ""
echo "4. 环境变量..."
env | grep -i "password\|secret\|token"

# 5. 检查日志
echo ""
echo "5. 日志检查..."
grep -i "password\|secret\|token" /var/log/yyc3/application.log
```

**解决方案**
```bash
# 1. 使用环境变量
# .env文件
DATABASE_URL=postgresql://user:password@localhost:5432/db

# 2. 使用密钥管理
# Kubernetes Secrets
kubectl create secret generic yyc3-secret \
  --from-literal=database-url=postgresql://user:password@localhost:5432/db

# 3. 使用Vault
# HashiCorp Vault
vault kv put secret/yyc3/database url=postgresql://user:password@localhost:5432/db

# 4. 加密敏感信息
# 使用openssl加密
echo "password" | openssl enc -aes-256-cbc -salt -out password.enc

# 5. 审计配置
# 定期审查配置
# 记录配置变更
```

---

## 10. 常见问题FAQ

### 10.1 部署相关

**Q: 部署失败怎么办？**

A: 按照以下步骤排查：
```bash
# 1. 检查部署状态
kubectl get deployment yyc3-web -n yyc3-production

# 2. 查看部署详情
kubectl describe deployment yyc3-web -n yyc3-production

# 3. 查看Pod状态
kubectl get pods -n yyc3-production

# 4. 查看Pod日志
kubectl logs -n yyc3-production -l app=yyc3-web

# 5. 查看事件
kubectl get events -n yyc3-production
```

**Q: 如何回滚部署？**

A: 使用以下命令回滚：
```bash
# 回滚到上一个版本
kubectl rollout undo deployment/yyc3-web -n yyc3-production

# 回滚到指定版本
kubectl rollout undo deployment/yyc3-web -n yyc3-production --to-revision=2

# 查看回滚历史
kubectl rollout history deployment/yyc3-web -n yyc3-production
```

**Q: 如何快速扩容？**

A: 使用以下命令扩容：
```bash
# 手动扩容
kubectl scale deployment yyc3-web --replicas=5 -n yyc3-production

# 自动扩容
kubectl autoscale deployment yyc3-web --cpu-percent=80 --min=2 --max=10 -n yyc3-production
```

### 10.2 容器相关

**Q: 容器无法启动怎么办？**

A: 按照以下步骤排查：
```bash
# 1. 查看容器状态
docker ps -a

# 2. 查看容器日志
docker logs yyc3-web

# 3. 查看容器详情
docker inspect yyc3-web

# 4. 进入容器调试
docker exec -it yyc3-web sh

# 5. 重新创建容器
docker stop yyc3-web
docker rm yyc3-web
docker run -d --name yyc3-web -p 3200:3200 yyc3-web:latest
```

**Q: 如何清理Docker资源？**

A: 使用以下命令清理：
```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a
```

### 10.3 网络相关

**Q: 无法访问服务怎么办？**

A: 按照以下步骤排查：
```bash
# 1. 检查服务状态
kubectl get svc yyc3-web -n yyc3-production

# 2. 检查服务端点
kubectl get endpoints yyc3-web -n yyc3-production

# 3. 检查Pod状态
kubectl get pods -n yyc3-production -l app=yyc3-web

# 4. 测试服务连接
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://yyc3-web.yyc3-production.svc.cluster.local:3200/health

# 5. 检查网络策略
kubectl get networkpolicies -n yyc3-production
```

**Q: DNS解析失败怎么办？**

A: 按照以下步骤排查：
```bash
# 1. 检查DNS配置
cat /etc/resolv.conf

# 2. 测试DNS解析
nslookup yyc3-web.yyc3-production.svc.cluster.local

# 3. 检查CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# 4. 查看CoreDNS日志
kubectl logs -n kube-system -l k8s-app=kube-dns

# 5. 重启CoreDNS
kubectl rollout restart deployment/coredns -n kube-system
```

### 10.4 性能相关

**Q: 应用响应慢怎么办？**

A: 按照以下步骤排查：
```bash
# 1. 检查响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3200/health

# 2. 检查资源使用
kubectl top pods -n yyc3-production
kubectl top nodes

# 3. 检查应用日志
kubectl logs -n yyc3-production -l app=yyc3-web --tail=100

# 4. 压力测试
ab -n 1000 -c 10 http://localhost:3200/health

# 5. 检查数据库
# 检查数据库连接
# 检查数据库查询
# 检查数据库索引
```

**Q: 内存占用高怎么办？**

A: 按照以下步骤排查：
```bash
# 1. 检查内存使用
kubectl top pods -n yyc3-production

# 2. 检查内存限制
kubectl get pod -n yyc3-production -o jsonpath='{.items[*].spec.containers[*].resources}'

# 3. 检查内存泄漏
# 使用heapdump
# 使用memory profiler

# 4. 优化应用代码
# 减少内存泄漏
# 使用缓存
# 优化数据结构

# 5. 增加内存限制
kubectl set resources deployment yyc3-web --limits=memory=1Gi -n yyc3-production
```

---

## 📄 文档标尾

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」




## 概述

### 概述

本文档提供了实用的技巧和方法，帮助开发者提高工作效率和代码质量。

#### 适用场景

- 日常开发工作
- 代码优化和重构
- 问题排查和调试
- 性能优化和调优

#### 预期收益

- 提高开发效率
- 减少代码错误
- 优化系统性能
- 提升代码可维护性



## 核心概念

### 核心概念

#### 关键术语

- **技巧**：经过实践验证的有效方法
- **最佳实践**：业界公认的优秀做法
- **模式**：可重复使用的解决方案
- **原则**：指导设计的基本准则

#### 核心原理

1. **DRY原则**（Don't Repeat Yourself）
   - 避免代码重复
   - 提取公共逻辑
   - 使用函数和类封装

2. **KISS原则**（Keep It Simple, Stupid）
   - 保持简单
   - 避免过度设计
   - 优先可读性

3. **YAGNI原则**（You Aren't Gonna Need It）
   - 只实现当前需要的功能
   - 避免过度工程
   - 保持代码精简



## 实施步骤

### 实施步骤

#### 步骤1：准备工作

```bash
# 安装必要工具
npm install -g typescript eslint prettier

# 初始化项目
npm init -y
npm install --save-dev typescript @types/node
```

#### 步骤2：配置环境

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### 步骤3：编写代码

```typescript
// 创建主文件
// src/index.ts
function main() {
  console.log('Hello, YYC³!');
}

main();
```

#### 步骤4：测试验证

```bash
# 运行代码
npm run dev

# 运行测试
npm test
```



## 代码示例

### 代码示例

#### 示例1：基础用法

```typescript
// 简单示例
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const message = greet('YYC³');
console.log(message); // 输出: Hello, YYC³!
```

#### 示例2：高级用法

```typescript
// 异步操作
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// 使用示例
fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### 示例3：错误处理

```typescript
// 自定义错误类
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 使用示例
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', '邮箱格式不正确');
  }
}

try {
  validateEmail('invalid-email');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`验证失败: ${error.field} - ${error.message}`);
  }
}
```



## 注意事项

### 注意事项

#### 常见陷阱

1. **异步操作错误**
```typescript
// ❌ 错误：没有等待异步操作
async function processData() {
  const data = fetchData(); // 忘记await
  console.log(data); // 输出Promise对象
}

// ✅ 正确：使用await
async function processData() {
  const data = await fetchData();
  console.log(data); // 输出实际数据
}
```

2. **内存泄漏**
```typescript
// ❌ 错误：没有清理事件监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []); // 缺少清理函数

// ✅ 正确：清理事件监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### 性能注意事项

1. **避免不必要的重渲染**
```typescript
// ❌ 错误：每次都创建新对象
<Component data={{ value: 1 }} />

// ✅ 正确：使用useMemo缓存
const memoizedData = useMemo(() => ({ value: 1 }), []);
<Component data={memoizedData} />
```

2. **避免大对象传递**
```typescript
// ❌ 错误：传递整个大对象
<Component user={user} />

// ✅ 正确：只传递需要的属性
<Component userName={user.name} userId={user.id} />
```



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```



## 常见问题

### 常见问题

#### Q1: 如何处理异步错误？

**A**: 使用try-catch捕获异步错误：

```typescript
async function handleRequest() {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### Q2: 如何优化React组件性能？

**A**: 使用以下优化技术：

1. **React.memo**：避免不必要的重渲染
2. **useMemo**：缓存计算结果
3. **useCallback**：缓存函数引用
4. **代码分割**：懒加载组件

```typescript
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  return <div>{processedData}</div>;
});
```

#### Q3: 如何管理应用状态？

**A**: 根据应用复杂度选择合适的状态管理方案：

1. **简单应用**：使用React Context API
2. **中等应用**：使用Zustand或Redux Toolkit
3. **复杂应用**：使用Redux + 中间件

```typescript
// Zustand示例
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));
```



## 案例分析

### 案例分析

#### 案例1：性能优化

**问题**：页面加载时间过长，用户体验差。

**分析**：
- 首次内容绘制(FCP)：3.2秒
- 最大内容绘制(LCP)：5.8秒
- 累积布局偏移(CLS)：0.25

**解决方案**：
1. 实现代码分割和懒加载
2. 优化图片加载（使用WebP格式，添加loading="lazy"）
3. 启用Gzip压缩
4. 使用CDN加速静态资源

**结果**：
- FCP：1.2秒（↓62.5%）
- LCP：2.1秒（↓63.8%）
- CLS：0.08（↓68%）

#### 案例2：错误处理改进

**问题**：错误信息不清晰，难以定位问题。

**分析**：
- 错误信息过于简单
- 缺少错误上下文
- 没有错误追踪

**解决方案**：
1. 实现自定义错误类
2. 添加错误堆栈追踪
3. 集成错误监控工具（Sentry）
4. 实现错误日志记录

**结果**：
- 错误定位时间减少70%
- 错误解决率提高40%
- 用户投诉减少60%

#### 案例3：代码重构

**问题**：代码重复率高，维护困难。

**分析**：
- 代码重复率：35%
- 函数平均长度：120行
- 圈复杂度：15

**解决方案**：
1. 提取公共逻辑到工具函数
2. 使用设计模式重构
3. 拆分大函数
4. 添加单元测试

**结果**：
- 代码重复率：8%（↓77%）
- 函数平均长度：35行（↓71%）
- 圈复杂度：5（↓67%）



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```


## 相关文档

- [🔖 YYC³ Docker容器化部署技巧](YYC3-Cater-部署发布/技巧类/01-YYC3-Cater--技巧类-Docker容器化部署技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ 灰度发布风险控制技巧](YYC3-Cater-部署发布/技巧类/05-YYC3-Cater--技巧类-灰度发布风险控制技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ K8s部署运维技巧](YYC3-Cater-部署发布/技巧类/02-YYC3-Cater--技巧类-K8s部署运维技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ CI/CD流水线搭建与优化技巧](YYC3-Cater-部署发布/技巧类/03-YYC3-Cater--技巧类-CI_CD流水线搭建与优化技巧.md) - YYC3-Cater-部署发布/技巧类
- [🔖 YYC³ 智能化需求优先级排序方法](YYC3-Cater-需求规划/技巧类/03-YYC3-Cater--技巧类-智能化需求优先级排序方法.md) - YYC3-Cater-需求规划/技巧类
