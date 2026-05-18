# 家教信息平台 (Tutoring Platform)

基于 Agent 即服务架构的个性化课外辅导供需对接平台。采用 React + Node.js + MySQL 技术栈，深度整合 AI Agent 能力，实现从需求理解、智能匹配到预约排期的全链路自动化。

## 📋 项目简介

本平台面向"个性化课外辅导供需对接"场景，为家长和学生提供 AI 驱动的家教匹配服务。用户无需在海量信息中检索，而是直接与 AI 助手对话，由 AI 完成需求理解、信息筛选与最终撮合。

### 主要功能

**用户系统**
- ✅ 多角色注册登录（学生/教师/机构）
- ✅ 基于 JWT 的身份认证与角色权限管理

**教师端**
- ✅ 教师档案编辑（基本信息、擅长科目、个人简介、在线状态）
- ✅ 头像与证书资质上传
- ✅ 📄 教学材料上传与管理（证书、学历证明、教学经历等）
- ✅ 🤖 AI 智能档案分析 — 自动生成教学风格标签与亮点总结
- ✅ 🤖 AI 材料审核 — 上传材料后自动审核、评分、生成摘要
- ✅ 预约管理（接受/拒绝/完成/取消预约）

**学生端**
- ✅ 教师搜索筛选（科目、价格、性别、经验等）
- ✅ 教师详情页 — 完整档案、证书、AI 分析标签、学生评价
- ✅ 预约课程（选择科目、日期、时间，自动计算费用）
- ✅ 🤖 AI 自动排期 — 设置偏好条件，自动生成推荐课表
- ✅ 我的预约（查看、取消、筛选状态）
- ✅ ⭐ 课后评价 — 评分 + 文字评价，自动更新教师评分

**🤖 AI Agent 层**
- ✅ AI 咨询助手 — 对话式交互界面
- ✅ 多轮需求澄清 — AI 通过对话引导补全匹配条件
- ✅ 智能教师匹配 — Agent 自动调用检索工具筛选 Top 3 教师
- ✅ 教师卡片嵌入 — 聊天中直接展示匹配结果，支持一键预约
- ✅ AI 自动排期 — 设置周频次、星期偏好、时间段，自动生成课表并批量预约
- ✅ AI 材料审核 — 自动审核教师上传的资质材料，提炼亮点与风险标记

## 🛠️ 技术栈

### 前端
- **React 18** — UI 框架
- **Vite** — 构建工具
- **Ant Design 5** — UI 组件库
- **React Router v6** — 路由管理
- **Zustand** — 状态管理
- **Axios** — HTTP 客户端
- **Tailwind CSS** — 样式工具

### 后端
- **Node.js 18+** — 运行环境
- **Express** — Web 框架
- **Sequelize** — ORM 工具
- **MySQL 8.0 / MariaDB** — 数据库
- **JWT** — 身份认证
- **Bcrypt** — 密码加密
- **Multer** — 文件上传
- **Joi** — 参数验证

### Agent 引擎
- **意图解析** — 正则 + 关键词匹配识别用户意图
- **状态机对话管理** — 多阶段对话流程控制
- **Tool Calling** — Agent 自动调用后端 API 完成搜索与预约
- **档案分析** — 规则引擎提取教学风格标签与亮点
- **教材审核** — AI 自动审核教师上传的资质材料，生成摘要与评分
- **🤖 AI 自动排期** — 按偏好条件（星期、时段、频次）自动生成推荐课表

## 📦 项目结构

```
tutoring-platform/
├── client/                     # 前端项目
│   ├── src/
│   │   ├── api/               # API 封装（auth/teacher/booking/agent）
│   │   ├── components/        # 共享组件（PrivateRoute, BookingModal, Layout）
│   │   ├── pages/             # 页面组件
│   │   │   ├── Auth/          # 登录/注册
│   │   │   ├── Chat/          # AI 咨询助手
│   │   │   ├── Home/          # 首页
│   │   │   ├── Student/       # 学生端（Dashboard, MyBookings）
│   │   │   └── Teacher/       # 教师端（List, Detail, Profile, Bookings）
│   │   ├── store/             # Zustand 状态管理
│   │   ├── utils/             # 工具函数
│   │   └── styles/            # 样式文件
│   └── package.json
├── server/                     # 后端项目
│   ├── src/
│   │   ├── agents/            # 🤖 AI Agent 引擎
│   │   │   ├── consultationAgent.js   # 对话引擎
│   │   │   ├── conversation.js        # 会话状态管理
│   │   │   ├── profileAnalyzer.js     # 档案分析器
│   │   │   └── materialReviewAgent.js # 教材审核 Agent
│   │   ├── config/            # 配置文件
│   │   ├── controllers/       # 控制器
│   │   ├── middlewares/       # 中间件（auth/role/validator/errorHandler）
│   │   ├── models/            # 数据模型（User/TeacherProfile/StudentProfile/Institution/Booking/TeacherMaterial）
│   │   ├── routes/            # 路由定义
│   │   ├── services/          # 业务服务（scheduleService 自动排课）
│   │   ├── utils/             # 工具函数
│   │   └── validators/        # Joi 验证规则
│   ├── scripts/               # 工具脚本
│   │   ├── seed.js            # 种子数据脚本（自动建表 + 填充测试数据）
│   │   └── syncDb.js          # 数据库同步脚本
│   └── package.json
└── docs/                      # 文档
    └── API.md                 # API 接口文档
```

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- MySQL 8.0+ / MariaDB 10.6+
- npm

### 1. 克隆项目

```bash
git clone git@github.com:VioletHannah/tutoring-platform.git
cd tutoring-platform
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 3. 配置数据库

**方式一：Docker（推荐）**

```bash
docker run -d --name tutoring-mysql \
  -e MYSQL_ROOT_PASSWORD=my_strong_password \
  -e MYSQL_DATABASE=tutoring_db \
  -p 3306:3306 \
  mysql:8.0
```

**方式二：本地 MySQL**

创建数据库：

```sql
CREATE DATABASE tutoring_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后配置环境变量：

```bash
cp server/.env.example server/.env
# 编辑 server/.env，填入实际的数据库连接信息
```

`.env` 示例：

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tutoring_db
DB_USER=root
DB_PASSWORD=my_strong_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
CLIENT_URL=http://localhost:5173
```

### 4. 初始化数据

种子脚本会**自动检查并创建缺失的数据库表**，然后填充示例数据（2学生 + 6教师 + 1机构 + 预约记录 + 教师资质材料）。

```bash
cd server
npm run seed
```

执行成功后会输出：

```
🚀 开始填充示例数据...
✅ 数据库连接成功
🔄 同步数据库结构...
✅ 数据库同步完成
📝 创建用户和档案...
📅 创建示例预约...
📄 创建示例材料...
🎉 示例数据填充完成！
```

> **提示**：种子脚本使用 `findOrCreate`，可重复运行而不会产生重复数据。每次运行也会自动同步数据库结构（创建缺失的表和列）。

### 5. 启动项目

**终端 1 — 后端：**

```bash
cd server
npm run dev       # http://localhost:5000
```

**终端 2 — 前端：**

```bash
cd client
npm run dev       # http://localhost:5173
```

### 6. 开始体验

- 🏠 首页：`http://localhost:5173`
- 💬 AI 助手：`http://localhost:5173/chat`
- 🔍 找老师：`http://localhost:5173/teachers`

---

## 🧪 测试账号

种子脚本预置了以下账号，密码统一为 `password123`。同时为部分教师（王明哲、刘建国、陈雨涵、赵思远）生成了已审核通过的资质材料和 AI 分析标签。

| 角色 | 账号 | 说明 |
|------|------|------|
| 学生 | zhang_parent@example.com | 张妈妈（初二学生家长） |
| 学生 | li_parent@example.com | 李爸爸（小五学生家长） |
| 教师 | wang_teacher@example.com | 王明哲 — 数学/物理 ¥120/小时, 硕士, 3年经验 |
| 教师 | chen_teacher@example.com | 陈雨涵 — 英语/语文 ¥100/小时 |
| 教师 | liu_teacher@example.com | 刘建国 — 化学/生物 ¥200/小时, 博士, 5年经验 |
| 教师 | zhao_teacher@example.com | 赵思远 — 计算机/数学 ¥80/小时 |
| 教师 | sun_teacher@example.com | 孙美玲 — 物理/数学 ¥150/小时 |
| 教师 | zhou_teacher@example.com | 周文博 — 数理化全能 ¥250/小时, 7年经验 |
| 机构 | youxue@example.com | 优学教育培训中心 |

---

## 📖 API 文档

### 认证 (`/api/auth`)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /auth/register | 用户注册 | 公开 |
| POST | /auth/login | 用户登录 | 公开 |
| GET | /auth/me | 获取当前用户信息 | 需要登录 |
| PUT | /auth/password | 修改密码 | 需要登录 |
| POST | /auth/logout | 登出 | 需要登录 |

### 教师 (`/api/teachers`)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /teachers | 搜索教师列表 | 公开 |
| GET | /teachers/:id | 获取教师详情 | 公开 |
| GET | /teachers/:id/reviews | 获取教师评价列表 | 公开 |
| GET | /teachers/my-profile | 获取我的档案 | 教师 |
| POST | /teachers/profile | 创建教师档案 | 教师 |
| PUT | /teachers/profile | 更新教师档案 | 教师 |
| POST | /teachers/avatar | 上传头像 | 教师 |
| POST | /teachers/certificates | 上传证书 | 教师 |
| POST | /teachers/analyze-profile | 🤖 AI 分析档案 | 教师 |
| POST | /teachers/materials | 📄 上传教学材料 | 教师 |
| GET | /teachers/my-materials | 📄 获取我的材料列表 | 教师 |
| GET | /teachers/:id/materials/public | 📄 获取教师公开材料 | 公开 |
| POST | /teachers/materials/:id/review-again | 🤖 重新审核材料 | 教师 |

### 预约 (`/api/bookings`)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /bookings | 创建预约 | 学生 |
| GET | /bookings | 获取我的预约列表 | 需要登录 |
| GET | /bookings/:id | 获取预约详情 | 需要登录 |
| POST | /bookings/schedule/suggest | 🤖 生成推荐课表 | 学生 |
| POST | /bookings/schedule/confirm | 🤖 确认课表并创建预约 | 学生 |
| PUT | /bookings/:id/accept | 接受预约 | 教师 |
| PUT | /bookings/:id/reject | 拒绝预约 | 教师 |
| PUT | /bookings/:id/complete | 完成课程 | 教师 |
| PUT | /bookings/:id/cancel | 取消预约 | 学生/教师 |
| PUT | /bookings/:id/review | ⭐ 提交评价 | 学生 |

### Agent (`/api/agent`)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /agent/session | 创建对话会话 | 公开 |
| POST | /agent/message | 发送消息 | 公开 |
| GET | /agent/conversation/:sessionId | 获取历史记录 | 公开 |

详细文档请参考：[docs/API.md](docs/API.md)

---

## 🔧 常见问题

### 1. 端口被占用
修改 `server/.env` 中的 `PORT` 和 `client/vite.config.js` 中的端口配置。

### 2. 数据库连接失败
检查 MySQL 服务是否启动，以及 `.env` 中的数据库配置是否正确。

### 3. 前端 API 请求失败
确保后端服务已启动，检查 `client/.env.development` 中的 `VITE_API_BASE_URL` 配置。

### 4. 数据库表缺失或种子数据报错
种子脚本 `npm run seed` 内置了 `sequelize.sync()`，会自动创建缺失的表和列。如果遇到 `Table doesn't exist` 错误，重新运行 `npm run seed` 即可。

### 5. Docker MySQL 配置
确保 Docker 容器正在运行：
```bash
docker ps | grep tutoring-mysql
```
如未启动：
```bash
docker start tutoring-mysql
```
使用 Docker 时 `.env` 中 `DB_HOST=localhost` 即可，Docker 会将 3306 端口映射到宿主机。

---

## 🚢 部署

**前端构建：**

```bash
cd client
npm run build        # 输出到 client/dist/
```

**后端生产启动：**

```bash
cd server
NODE_ENV=production npm start
```

建议使用 PM2、Docker 或云服务（阿里云、腾讯云）进行部署。

---

## 📄 许可证

MIT License