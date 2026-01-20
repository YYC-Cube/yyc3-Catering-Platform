---
@file: 143-YYC3-AICP-部署发布-容器化部署配置.md
@description: YYC3-AICP Docker+K8s容器化部署的配置文件、镜像构建、编排规则
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [部署发布],[容器化],[Docker]
---

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 143-YYC3-AICP-部署发布-容器化部署配置

## 概述

本文档详细描述YYC3-YYC3-AICP-部署发布-容器化部署配置相关内容，确保项目按照YYC³标准规范进行开发和实施。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景
YYC³(YanYuCloudCube)-「智能教育」项目是一个基于「五高五标五化」理念的智能化应用系统，致力于提供高质量、高可用、高安全的成长守护体系。

#### 1.2 文档目标
- 规范容器化部署配置相关的业务标准与技术落地要求
- 为项目相关人员提供清晰的参考依据
- 保障相关模块开发、实施、运维的一致性与规范性

### 2. 设计原则

#### 2.1 五高原则
- **高可用性**：确保系统7x24小时稳定运行
- **高性能**：优化响应时间和处理能力
- **高安全性**：保护用户数据和隐私安全
- **高扩展性**：支持业务快速扩展
- **高可维护性**：便于后续维护和升级

#### 2.2 五标体系
- **标准化**：统一的技术和流程标准
- **规范化**：严格的开发和管理规范
- **自动化**：提高开发效率和质量
- **智能化**：利用AI技术提升能力
- **可视化**：直观的监控和管理界面

#### 2.3 五化架构
- **流程化**：标准化的开发流程
- **文档化**：完善的文档体系
- **工具化**：高效的开发工具链
- **数字化**：数据驱动的决策
- **生态化**：开放的生态系统

### 3. 容器化部署配置

#### 3.1 Dockerfile 配置

##### 3.1.1 前端 Dockerfile

```dockerfile
# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# 安装生产依赖
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动命令
CMD ["pnpm", "start"]
```

##### 3.1.2 后端 Dockerfile

```dockerfile
# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 安装生产依赖
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# 更改文件所有者
RUN chown -R nextjs:nodejs /app

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3100

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3100

# 启动命令
CMD ["node", "dist/main.js"]
```

#### 3.2 Kubernetes 部署配置

##### 3.2.1 前端 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-catering-frontend
  namespace: yyc3-catering
  labels:
    app: yyc3-catering-frontend
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: yyc3-catering-frontend
  template:
    metadata:
      labels:
        app: yyc3-catering-frontend
        version: v1.0.0
    spec:
      containers:
      - name: frontend
        image: registry.example.com/yyc3-catering/frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: yyc3-catering-config
              key: api_base_url
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: yyc3-catering-config
              key: next_public_api_url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: config
          mountPath: /app/.env.local
          subPath: .env.local
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: yyc3-catering-config
          items:
          - key: frontend_env
            path: .env.local
```

##### 3.2.2 后端 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-catering-backend
  namespace: yyc3-catering
  labels:
    app: yyc3-catering-backend
    version: v1.0.0
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: yyc3-catering-backend
  template:
    metadata:
      labels:
        app: yyc3-catering-backend
        version: v1.0.0
    spec:
      containers:
      - name: backend
        image: registry.example.com/yyc3-catering/backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3100
          name: http
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3100"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yyc3-catering-secrets
              key: database_url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: yyc3-catering-secrets
              key: redis_url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: yyc3-catering-secrets
              key: jwt_secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3100
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3100
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      volumes:
      - name: logs
        emptyDir: {}
```

##### 3.2.3 Service 配置

```yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-catering-frontend-service
  namespace: yyc3-catering
  labels:
    app: yyc3-catering-frontend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: yyc3-catering-frontend
---
apiVersion: v1
kind: Service
metadata:
  name: yyc3-catering-backend-service
  namespace: yyc3-catering
  labels:
    app: yyc3-catering-backend
spec:
  type: ClusterIP
  ports:
  - port: 3100
    targetPort: 3100
    protocol: TCP
    name: http
  selector:
    app: yyc3-catering-backend
```

##### 3.2.4 Ingress 配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yyc3-catering-ingress
  namespace: yyc3-catering
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
spec:
  tls:
  - hosts:
    - api.yyc3-catering.com
    - www.yyc3-catering.com
    secretName: yyc3-catering-tls
  rules:
  - host: api.yyc3-catering.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: yyc3-catering-backend-service
            port:
              number: 3100
  - host: www.yyc3-catering.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: yyc3-catering-frontend-service
            port:
              number: 80
```

#### 3.3 Helm Charts 配置

##### 3.3.1 Chart.yaml

```yaml
apiVersion: v2
name: yyc3-catering-platform
description: YYC3 Catering Platform - A Helm chart for Kubernetes
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - catering
  - platform
  - yyc3
maintainers:
  - name: YYC Team
    email: admin@0379.email
```

##### 3.3.2 values.yaml

```yaml
global:
  imageRegistry: registry.example.com
  imagePullSecrets: []
  storageClass: standard

frontend:
  enabled: true
  replicaCount: 3
  image:
    repository: yyc3-catering/frontend
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 80
    targetPort: 3000
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
    limits:
      memory: 512Mi
      cpu: 500m
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  nodeSelector: {}
  tolerations: []
  affinity: {}

backend:
  enabled: true
  replicaCount: 2
  image:
    repository: yyc3-catering/backend
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 3100
    targetPort: 3100
  resources:
    requests:
      memory: 512Mi
      cpu: 500m
    limits:
      memory: 1Gi
      cpu: 1000m
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  nodeSelector: {}
  tolerations: []
  affinity: {}

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: www.yyc3-catering.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
    - host: api.yyc3-catering.com
      paths:
        - path: /
          pathType: Prefix
          service: backend
  tls:
    - secretName: yyc3-catering-tls
      hosts:
        - www.yyc3-catering.com
        - api.yyc3-catering.com

database:
  enabled: true
  host: postgres.yyc3-catering.svc.cluster.local
  port: 5432
  database: yyc3_catering
  username: yyc3_user
  existingSecret: yyc3-catering-secrets
  existingSecretKey: database_url

redis:
  enabled: true
  host: redis.yyc3-catering.svc.cluster.local
  port: 6379
  existingSecret: yyc3-catering-secrets
  existingSecretKey: redis_url

secrets:
  enabled: true
  databaseUrl: postgresql://user:password@postgres:5432/yyc3_catering
  redisUrl: redis://redis:6379
  jwtSecret: your-jwt-secret-key-here

configMap:
  enabled: true
  apiBaseUrl: https://api.yyc3-catering.com
  nextPublicApiUrl: https://api.yyc3-catering.com
  frontendEnv: |
    NEXT_PUBLIC_API_URL=https://api.yyc3-catering.com
    NODE_ENV=production
```

##### 3.3.3 部署模板

```yaml
# templates/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "yyc3-catering-platform.fullname" . }}-frontend
  labels:
    {{- include "yyc3-catering-platform.labels" . | nindent 4 }}
    app.kubernetes.io/component: frontend
spec:
  {{- if not .Values.frontend.autoscaling.enabled }}
  replicas: {{ .Values.frontend.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "yyc3-catering-platform.selectorLabels" . | nindent 6 }}
      app.kubernetes.io/component: frontend
  template:
    metadata:
      labels:
        {{- include "yyc3-catering-platform.selectorLabels" . | nindent 8 }}
        app.kubernetes.io/component: frontend
    spec:
      containers:
      - name: frontend
        image: "{{ .Values.global.imageRegistry }}/{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: {{ .Values.configMap.nextPublicApiUrl | quote }}
        resources:
          {{- toYaml .Values.frontend.resources | nindent 10 }}
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### 3.4 镜像构建流程

##### 3.4.1 构建脚本

```bash
#!/bin/bash
# build-images.sh

set -e

REGISTRY="registry.example.com/yyc3-catering"
VERSION="${1:-latest}"
FRONTEND_TAG="${REGISTRY}/frontend:${VERSION}"
BACKEND_TAG="${REGISTRY}/backend:${VERSION}"

echo "🔨 构建前端镜像..."
docker build -t ${FRONTEND_TAG} -f docker/frontend/Dockerfile .

echo "🔨 构建后端镜像..."
docker build -t ${BACKEND_TAG} -f docker/backend/Dockerfile .

echo "📤 推送镜像到仓库..."
docker push ${FRONTEND_TAG}
docker push ${BACKEND_TAG}

echo "✅ 镜像构建完成！"
echo "前端镜像: ${FRONTEND_TAG}"
echo "后端镜像: ${BACKEND_TAG}"
```

##### 3.4.2 CI/CD 配置

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Registry
      uses: docker/login-action@v2
      with:
        registry: registry.example.com
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Frontend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./docker/frontend/Dockerfile
        push: true
        tags: |
          registry.example.com/yyc3-catering/frontend:latest
          registry.example.com/yyc3-catering/frontend:${{ github.sha }}
        cache-from: type=registry,ref=registry.example.com/yyc3-catering/frontend:buildcache
        cache-to: type=registry,ref=registry.example.com/yyc3-catering/frontend:buildcache,mode=max
    
    - name: Build and push Backend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./docker/backend/Dockerfile
        push: true
        tags: |
          registry.example.com/yyc3-catering/backend:latest
          registry.example.com/yyc3-catering/backend:${{ github.sha }}
        cache-from: type=registry,ref=registry.example.com/yyc3-catering/backend:buildcache
        cache-to: type=registry,ref=registry.example.com/yyc3-catering/backend:buildcache,mode=max
```

#### 3.5 环境变量配置

##### 3.5.1 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yyc3-catering-config
  namespace: yyc3-catering
data:
  api_base_url: "https://api.yyc3-catering.com"
  next_public_api_url: "https://api.yyc3-catering.com"
  frontend_env: |
    NEXT_PUBLIC_API_URL=https://api.yyc3-catering.com
    NEXT_PUBLIC_APP_NAME=YYC3 Catering Platform
    NEXT_PUBLIC_APP_VERSION=1.0.0
    NODE_ENV=production
```

##### 3.5.2 Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: yyc3-catering-secrets
  namespace: yyc3-catering
type: Opaque
stringData:
  database_url: "postgresql://yyc3_user:password@postgres.yyc3-catering.svc.cluster.local:5432/yyc3_catering"
  redis_url: "redis://redis.yyc3-catering.svc.cluster.local:6379"
  jwt_secret: "your-jwt-secret-key-here"
```

#### 3.6 容器编排规则

##### 3.6.1 健康检查

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
  successThreshold: 1

readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
  successThreshold: 1
```

##### 3.6.2 资源限制

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

##### 3.6.3 自动扩缩容

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: yyc3-catering-frontend-hpa
  namespace: yyc3-catering
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: yyc3-catering-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 4. 部署流程

#### 4.1 本地部署

```bash
# 1. 构建镜像
./scripts/build-images.sh

# 2. 使用 Helm 部署
helm install yyc3-catering ./helm/yyc3-catering-platform \
  --namespace yyc3-catering \
  --create-namespace \
  --values helm/yyc3-catering-platform/values-production.yaml

# 3. 验证部署
kubectl get pods -n yyc3-catering
kubectl get services -n yyc3-catering
kubectl get ingress -n yyc3-catering
```

#### 4.2 生产环境部署

```bash
# 1. 更新镜像版本
helm upgrade yyc3-catering ./helm/yyc3-catering-platform \
  --namespace yyc3-catering \
  --values helm/yyc3-catering-platform/values-production.yaml \
  --set frontend.image.tag=v1.0.1 \
  --set backend.image.tag=v1.0.1 \
  --wait

# 2. 回滚到上一个版本
helm rollback yyc3-catering -n yyc3-catering

# 3. 查看部署历史
helm history yyc3-catering -n yyc3-catering
```

### 5. 监控与日志

#### 5.1 Prometheus 配置

```yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-catering-backend-metrics
  namespace: yyc3-catering
  labels:
    app: yyc3-catering-backend
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3100"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app: yyc3-catering-backend
  ports:
  - port: 3100
    targetPort: 3100
    name: metrics
```

#### 5.2 日志收集

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: yyc3-catering
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
      </parse>
    </source>

    <match **>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      logstash_format true
      logstash_prefix yyc3-catering
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        flush_interval 5s
      </buffer>
    </match>
```

### 6. 安全配置

#### 6.1 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: yyc3-catering-network-policy
  namespace: yyc3-catering
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
    - protocol: TCP
      port: 3100
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: yyc3-catering
    ports:
    - protocol: TCP
      port: 5432
    - protocol: TCP
      port: 6379
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

#### 6.2 Pod 安全策略

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: yyc3-catering-backend
  namespace: yyc3-catering
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
  containers:
  - name: backend
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
