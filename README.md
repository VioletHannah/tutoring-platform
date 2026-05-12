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
- ✅ 🤖 AI 智能档案分析 — 自动生成教学风格标签与亮点总结
- ✅ 预约管理（接受/拒绝/完成/取消预约）

**学生端**
- ✅ 教师搜索筛选（科目、价格、性别、经验等）
- ✅ 教师详情页 — 完整档案、证书、AI 分析标签、学生评价
- ✅ 预约课程（选择科目、日期、时间，自动计算费用）
- ✅ 我的预约（查看、取消、筛选状态）
- ✅ ⭐ 课后评价 — 评分 + 文字评价，自动更新教师评分

**🤖 AI Agent 层**
- ✅ AI 咨询助手 — 对话式交互界面
- ✅ 多轮需求澄清 — AI 通过对话引导补全匹配条件
- ✅ 智能教师匹配 — Agent 自动调用检索工具筛选 Top 3 教师
- ✅ 教师卡片嵌入 — 聊天中直接展示匹配结果，支持一键预约

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
│   │   │   ├── consultationAgent.js  # 对话引擎
│   │   │   ├── conversation.js       # 会话状态管理
│   │   │   └── profileAnalyzer.js    # 档案分析器
│   │   ├── config/            # 配置文件
│   │   ├── controllers/       # 控制器（auth/teacher/booking/agent）
│   │   ├── middlewares/       # 中间件（auth/role/validator/errorHandler）
│   │   ├── models/            # 数据模型（User/TeacherProfile/StudentProfile/Institution/Booking）
│   │   ├── routes/            # 路由定义
│   │   ├── utils/             # 工具函数
│   │   └── validators/        # Joi 验证规则
│   ├── scripts/               # 工具脚本
│   │   └── seed.js            # 种子数据脚本
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

创建数据库：

```sql
CREATE DATABASE tutoring_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

配置后端环境变量：

```bash
cp server/.env.example server/.env
# 编辑 server/.env，填入数据库连接信息
```

### 4. 初始化数据

```bash
cd server
npm run seed      # 填充示例数据（2学生 + 6教师 + 1机构 + 5预约）
```

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

种子脚本预置了以下账号，密码统一为 `password123`：

| 角色 | 账号 | 说明 |
|------|------|------|
| 学生 | zhang_parent@example.com | 张妈妈（初二学生家长） |
| 学生 | li_parent@example.com | 李爸爸（小五学生家长） |
| 教师 | wang_teacher@example.com | 王明哲 — 数学/物理 ¥120/小时 |
| 教师 | chen_teacher@example.com | 陈雨涵 — 英语/语文 ¥100/小时 |
| 教师 | liu_teacher@example.com | 刘建国 — 化学/生物 ¥200/小时 博士 |
| 教师 | zhao_teacher@example.com | 赵思远 — 计算机/数学 ¥80/小时 |
| 教师 | sun_teacher@example.com | 孙美玲 — 物理/数学 ¥150/小时 |
| 教师 | zhou_teacher@example.com | 周文博 — 数理化全能 ¥250/小时 |
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

### 预约 (`/api/bookings`)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /bookings | 创建预约 | 学生 |
| GET | /bookings | 获取我的预约列表 | 需要登录 |
| GET | /bookings/:id | 获取预约详情 | 需要登录 |
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

### 4. 页面评价不显示
赵老师（`/teachers/7`）有一条测试评价。其他教师的评价数来自种子数据预设，实际评价内容为空。可通过以下步骤添加：
- 以学生身份登录，对已完成的课程提交评价
- 或运行 `npm run seed` 扩展种子脚本

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