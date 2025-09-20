---
title: 开源自动化神器n8n：安装与初体验
description: 开源自动化神器n8n：安装与初体验
date: 2025-09-20 22:49:41
updated: 2025-09-20 22:49:41
image: https://oss.helong.online/bucket-IMG/78982bbaa34bc0182addfcbc2244a3d25d443855510ffa62161af74958a3d4f4.png
# type: story
categories: [工具]
tags: [工具, n8n]
---

n8n是一款强大且灵活的开源工作流自动化工具。可以通过不同节点的连接自动协同工作。

n8n的核心魅力在于其**可视化工作流编辑器**。无需编写复杂的代码，只需通过拖放预置的“节点”（Node）——每个节点代表一个特定的操作或应用（如Gmail、Slack、Twitter、Notion、数据库等）——然后用线条将它们连接起来，就能构建出复杂的自动化流程。这种方式非常直观，让非开发者也能轻松上手，同时也为开发者提供了极高的效率和灵活性。

在追求效率的时代，手动在多个应用之间重复“复制、粘贴”已成为工作流程中最大的瓶颈之一。n8n 可以将我们从繁琐重复的任务中解放出来，聚焦于真正重要的事情。本文将带你从零开始，一步步完成 n8n 的部署与核心使用。

::link-card
---
title: N8N 官方文档
icon: https://si.helong.online/docs.n8n.io.ico
link: https://docs.n8n.io/
class: gradient-card active
---
::

::alert{type="warning"}
注意，本文主要关注服务器部署，因为本机部署的 n8n 无法对公网上的第三方服务进行回调，也不能提供 Webook 给第三方服务唤起。
::

## 部署N8N - 最小化部署

::alert
n8n 分为云服务器版和自托管版本

云服务版：官方提供的开箱即用的云服务版本，注册账号购买会员即可开始使用，本文不做说明。

自托管版：官方在 Github 开源的版本，支持 Docker 和 npx (需要有 node.js 环境)，本文介绍一在服务器上使用 Docker 安装 n8n,也可以在本地进行部署。
::

| 前置条件      | 说明 |
|------|------|
|服务器	|最好使用海外服务器进行部署，否则将无法使用部分海外访问的节点, 如果启用 UFW 需确保 5678/443 端口放行|
|Docker + Nginx	|Debian 11 x64|
|已注册域名	|例如 helong.online|

n8n 建议使用 Docker 来满足大多数自托管需求。它提供了一个干净、隔离的环境，避免了操作系统和工具不兼容的问题，并使数据库和环境管理更加简单。

您还可以通过 Docker Compose 在 Docker 中使用 n8n 。您可以在 n8n-hosting 存储库中找到适用于各种架构的 Docker Compose 配置。

### 域名解析

在域名服务商将域名解析到服务器，不再过多赘述，例如我将n8n.helong.online解析到服务器

### 安装 Docker 、Nginx 、 Certbot

```bash
sudo apt-get update
sudo apt-get install docker.io nginx certbot python3-certbot-nginx -y
```
### Nginx配置反向代理

```bash
vim /etc/nginx/sites-available/n8n
```

添加配置：

```[/etc/nginx/sites-available/n8n]
server {
    listen 80;
    server_name n8n.youshutech.top;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 使用 Certbot 申请证书

```bash
sudo certbot --nginx -d n8n.youshutech.top
```
### 部署 n8n

首先创建数据卷

```bash
docker volume create n8n_data
```

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  --dns 8.8.8.8 \
  --dns 1.1.1.1 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_HOST=n8n.helong.online \
  -e N8N_EDITOR_BASE_URL=https://n8n.helong.online \
  -e WEBHOOK_TUNNEL_URL=https://n8n.helong.online \
  -e WEBHOOK_URL=https://n8n.helong.online \
  -e N8N_PROTOCOL=https \
  -e N8N_PORT=5678 \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -e N8N_RUNNERS_ENABLED=true \
  -e DB_SQLITE_POOL_SIZE=5 \
  -e N8N_BLOCK_ENV_ACCESS_IN_NODE=false \
  -e EXPRESS_TRUST_PROXY=true \
  n8nio/n8n
```

有几点需要注意的：

1. 在最开始我使用host网络时 Telegram 节点出现 DNS 解析问题，所以手动指定 DNS 服务器，此问题得以解决
  ```
  --dns 8.8.8.8 \
  --dns 1.1.1.1 \
  ```

2. 相关域名为解析到服务器的域名

  ```
  -e N8N_HOST=n8n.helong.online \
  -e N8N_EDITOR_BASE_URL=https://n8n.helong.online \
  -e WEBHOOK_TUNNEL_URL=https://n8n.helong.online \
  -e WEBHOOK_URL=https://n8n.helong.online \
  ```
  如果不设置 WEBHOOK_TUNNEL_URL 和 WEBHOOK_URL，可能会出现`Bad Request: bad webhook: Webhook can be set up only on ports 80, 88, 443 or 8443`问题导致无法启动工作流。

3. Connection lost 问题

  ::pic
  ---
  src: https://oss.helong.online/bucket-IMG/86e258c8e03d794f774e62f5662d7efb6f7cb56d792cb1ff4b8d52c512fa2a06.png
  mirror: true
  caption: Connect Lost
  ---
  ::

  一般是Nginx配置问题，参考官方文档：
  ```
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  ```
  ::alert{type="warning"}
  如果你使用了 CDN 进行加速，需要确保 CDN 支持并开启 websocket 回源
  ::

4. 节点等位置的时间不对？

  你需要通过以下环境变量设置时区：

  ```bash
  -e GENERIC_TIMEZONE="<YOUR_TIMEZONE>" \
  -e TZ="<YOUR_TIMEZONE>" \
  ```
  TZ 环境变量设置系统时区来控制返回 date 等脚本和命令。

  GENERIC_TIMEZONE 环境变量为面向计划的节点（如 Schedule Trigger 节点） 设置正确的时区。

至此，n8n部署成功，你可以通过解析的域名进行访问，当然，如果你没有服务器？也可以使用例如 Claw Cloud Run 之类的免费平台进行托管，要注意备份好相关数据！

## 使用 PostgreSQL 数据库

默认情况下，n8n 使用 SQLite 来保存凭据 、过去的执行和工作流。n8n 还支持 PostgreSQL，可使用环境变量进行配置。

::alert{type="info"}
#title
仍然建议保留 .n8n 目录(from [Persisting the .n8n directory still recommended](https://docs.n8n.io/hosting/installation/docker/#starting-n8n))
#default
使用 PostgreSQL 时，n8n 无需将 .n8n 目录用于 SQLite 数据库文件。但是，该目录仍然包含其他重要数据，例如加密密钥、实例日志和源代码控制功能资产。虽然您可以绕过其中一些要求（例如，通过设置 N8N_ENCRYPTION_KEY 环境变量 ），但最好继续为该目录映射持久卷，以避免潜在问题。
::

使用数据库所需要的环境变量：

```
 -e DB_TYPE=postgresdb \
 -e DB_POSTGRESDB_DATABASE=<POSTGRES_DATABASE> \
 -e DB_POSTGRESDB_HOST=<POSTGRES_HOST> \
 -e DB_POSTGRESDB_PORT=<POSTGRES_PORT> \
 -e DB_POSTGRESDB_USER=<POSTGRES_USER> \
 -e DB_POSTGRESDB_SCHEMA=<POSTGRES_SCHEMA> \
 -e DB_POSTGRESDB_PASSWORD=<POSTGRES_PASSWORD> \
```

| 环境变量 | 含义 | 说明 |
|---|---|---|
|<POSTGRES_DATABASE>|指定要连接的PostgreSQL数据库的名称|无|
|<POSTGRES_HOST>|指定PostgreSQL数据库服务器的主机名或IP地址|无|
|<POSTGRES_PORT>|指定PostgreSQL数据库服务器的端口号|默认5432|
|<POSTGRES_USER>|指定用于连接PostgreSQL数据库的用户名|无|
|<POSTGRES_PASSWORD>|指定用于连接PostgreSQL数据库的密码|无|
|DB_POSTGRESDB_SCHEMA|指定在PostgreSQL数据库中使用的模式（schema）名称。|默认使用public模式|

## 如何更新

可以使用命令行来获取最新版本或特定版本：

```bash
# 最新版本
docker pull docker.n8n.io/n8nio/n8n
# 固定版本
docker pull docker.n8n.io/n8nio/n8n:1.81.0
```
拉取更新后的镜像后，停止 n8n 容器并重新启动。可以使用命令行。将以下命令中的 <container_id> 替换为在第一个命令中找到的容器 ID：

```bash
docker ps -a

docker stop <container_id>

docker rm <container_id>

```

重新运行 [部署脚本](#部署-n8n)

## 使用示例

使用N8N搭建的博客友情链接和RSS订阅服务
::pic
---
src: https://oss.helong.online/bucket-IMG/9028d08a6f87d905d3a8e7ab4a0727eb44aced28e68f9287ebe6bdd937154994.png
mirror: true
caption: 使用N8N搭建的博客友情链接和RSS订阅服务
---
::
