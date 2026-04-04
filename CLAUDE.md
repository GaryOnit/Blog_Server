# Blog Server Project

## 项目概述

这是一个基于 Express.js 和 MongoDB 的博客后端服务器，提供用户认证、文章管理、评论、专栏等功能，使用 JWT + RSA 加密进行身份验证，并支持 Socket.IO 实时通信。

## 技术栈

- **框架**: Express.js 4.16.1
- **数据库**: MongoDB (Mongoose 5.11.5)
- **认证**: JWT (express-jwt 6.0.0, jsonwebtoken 8.5.1) + RSA 加密
- **实时通信**: Socket.IO 3.1.1, WebSocket (ws 7.4.3)
- **文件上传**: Multer 1.4.4
- **其他**: CORS, Axios, jQuery

## 项目结构

```
Blog_Server/
├── app.js                 # Express 应用主入口
├── config.js              # 配置文件（端口、路径、文件大小限制等）
├── socket.js              # Socket.IO 配置
├── package.json           # 项目依赖
│
├── bin/                   # 启动脚本
├── auth/                  # RSA 密钥存储目录
│   ├── public.cer         # 公钥
│   └── private.cer        # 私钥
│
├── models/                # Mongoose 数据模型
│   ├── User.js            # 用户模型
│   ├── Article.js         # 文章模型
│   ├── Comment.js         # 评论模型
│   ├── Column.js          # 专栏模型
│   └── Key.js             # 密钥模型
│
├── core/                  # 核心业务逻辑
│   ├── rsaControl.js      # RSA 加密控制
│   ├── sendToken.js       # Token 生成与发送
│   ├── statusControl.js   # 状态控制
│   ├── userControl.js     # 用户控制逻辑
│   └── util/              # 工具函数
│
├── routes/                # 路由定义
│   ├── index.js           # 主路由
│   ├── admin.js           # 管理员路由（登录/注册）
│   ├── user.js            # 用户路由
│   ├── bus.js             # RESTful 资源路由
│   ├── getPubKey.js       # 获取公钥路由
│   ├── upload.js          # 文件上传路由
│   ├── search.js          # 文章搜索路由
│   ├── artLikes.js        # 文章点赞路由
│   └── ai.js              # AI 对话路由（DeepSeek 流式转发）
│
├── middleware/            # 中间件
│   └── resource.js        # 资源中间件（动态路由处理）
│
├── plugins/               # 插件配置
│   ├── db.js              # MongoDB 数据库连接
│   ├── POPULATE_MAP.js    # 关联查询映射
│   ├── POP_GET_MAP.js     # GET 请求关联映射
│   ├── POP_POST_MAP.js    # POST 请求关联映射
│   ├── POP_PUT_MAP.js     # PUT 请求关联映射
│   ├── QUE_MAP.js         # 查询映射
│   └── RESOURCE_POST_MAP.js # 资源 POST 映射
│
├── public/                # 静态资源目录
├── uploads/               # 文件上传目录
└── views/                 # 视图模板（HBS）
```

## 核心功能

### 1. 认证系统
- 使用 RSA 非对称加密 + JWT 进行身份验证
- Token 吊销机制（通过数据库验证用户是否存在）
- 公钥获取接口供前端加密敏感信息

### 2. RESTful API
- 动态资源路由：`/api/rest/:resource`
- 支持标准 CRUD 操作（GET, POST, PUT, DELETE）
- 自动关联查询（通过 POPULATE_MAP 配置）

### 3. 路由权限控制
以下路由无需 Token 验证：
- GET `/api/rest/*` - 公开资源读取
- `/admin/*` - 登录注册
- `/upload/*` - 文件上传
- `/keys` - 获取公钥
- `/articles/search` - 文章搜索
- `/articles/likes` - 文章点赞
- `/api/ai/*` - AI 对话（无需登录）

### 4. 文件上传
- 最大文件大小：10MB (10240000 bytes)
- 上传路径：`/public`
- 访问 URL：`http://127.0.0.1:3000/`

### 5. 实时通信
- Socket.IO 支持实时消息推送
- WebSocket 连接

### 6. 错误处理
- 统一错误处理中间件
- 自定义错误消息映射
- 参数验证错误提示
- 重复键错误处理

## 配置信息

```javascript
{
  host: '127.0.0.1',
  port: 3000,
  maxFileSize: 10240000,  // 10MB
  uploadURL: 'http://127.0.0.1:3000/'
}
```

## 启动命令

```bash
npm start  # 使用 nodemon 启动开发服务器
```

## API 端点

- `POST /admin/login` - 用户登录
- `POST /admin/register` - 用户注册
- `GET /keys` - 获取 RSA 公钥
- `GET /user` - 获取用户信息
- `GET /api/rest/:resource` - 获取资源列表
- `POST /api/rest/:resource` - 创建资源
- `PUT /api/rest/:resource/:id` - 更新资源
- `DELETE /api/rest/:resource/:id` - 删除资源
- `POST /upload` - 文件上传
- `GET /articles/search` - 文章搜索
- `POST /articles/likes` - 文章点赞
- `POST /api/ai/chat` - AI 对话（DeepSeek 流式接口）

## 数据模型

- **User**: 用户（用户名、密码、邮箱、昵称、头像等）
- **Article**: 文章（标题、内容、作者、专栏、点赞数等）
- **Comment**: 评论（内容、作者、文章关联等）
- **Column**: 专栏（名称、描述、作者等）
- **Key**: 密钥管理

## CORS 配置

- 允许所有来源跨域请求
- 支持携带 Cookie
- 预检请求缓存 20 天
- 允许的请求头：`x-requested-with, Authorization, token, content-type`

## 注意事项

1. RSA 密钥文件需要放在 `/auth` 目录下
2. MongoDB 连接配置在 `plugins/db.js` 中
3. 文件上传限制为 10MB
4. JWT 使用 RS256 算法签名
5. 所有需要认证的接口都需要在请求头中携带 Token
6. DeepSeek API Key 存放在 `.env` 文件的 `DEEPSEEK_API_KEY` 变量中，通过 `dotenv` 在 `app.js` 顶部加载，**不得硬编码**

## AI 对话功能

### 接口：`POST /api/ai/chat`
- **无需 Token**，已加入 JWT unless 白名单
- **请求体**：
  ```json
  { "messages": [...], "articleContext": "<html string>" }
  ```
- **响应**：`text/event-stream`，SSE 格式流式透传 DeepSeek 响应
- `articleContext` 为文章 HTML 原文，后端自动去除标签后截取前 3000 字符注入 system prompt
- 使用 `axios` 的 `responseType: 'stream'` 实现流式转发，无需额外依赖
- API Key 从 `process.env.DEEPSEEK_API_KEY` 读取（model: `deepseek-chat`，baseURL: `https://api.deepseek.com`）
