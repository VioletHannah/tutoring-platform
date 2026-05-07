# 家教信息平台 (Tutoring Platform)

一个连接学生和教师的在线家教信息平台，采用React + Node.js + MySQL技术栈构建。

## 📋 项目简介

本平台为学生和教师提供了一个便捷的在线预约系统，学生可以搜索和筛选符合需求的教师，教师可以管理自己的教学档案和预约请求。

### 主要功能

- ✅ 用户注册登录（学生/教师/机构/管理员多角色）
- ✅ 教师资料管理（创建/编辑档案、上传头像和证书）
- ✅ 教师搜索筛选（按科目、价格、性别、经验等）
- ✅ 预约系统（创建预约、接受/拒绝预约、取消预约）
- ✅ 基于JWT的身份认证
- ✅ 角色权限管理

## 🛠️ 技术栈

### 前端
- **React 18** - UI框架
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **React Router v6** - 路由管理
- **Zustand** - 状态管理
- **Axios** - HTTP客户端
- **Tailwind CSS** - 样式工具

### 后端
- **Node.js 18+** - 运行环境
- **Express** - Web框架
- **Sequelize** - ORM工具
- **MySQL 8.0** - 数据库
- **JWT** - 身份认证
- **Bcrypt** - 密码加密
- **Multer** - 文件上传
- **Joi** - 参数验证

## 📦 项目结构

```
tutoring-platform/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/           # API封装
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── store/         # Zustand状态管理
│   │   ├── utils/         # 工具函数
│   │   └── styles/        # 样式文件
│   └── package.json
├── server/                # 后端项目
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── models/       # 数据模型
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── middlewares/  # 中间件
│   │   ├── utils/        # 工具函数
│   │   └── validators/   # 验证规则
│   └── package.json
└── docs/                 # 文档
```

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
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

1. 创建MySQL数据库：

```sql
CREATE DATABASE tutoring_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置后端环境变量：

复制 `server/.env.example` 到 `server/.env` 并修改：

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tutoring_platform
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CLIENT_URL=http://localhost:5173
```

### 4. 初始化数据库

后端会在启动时自动同步数据库结构（开发模式）。

### 5. 启动项目

**启动后端服务：**

```bash
cd server
npm run dev
```

后端服务将运行在 `http://localhost:5000`

**启动前端服务：**

```bash
cd client
npm run dev
```

前端服务将运行在 `http://localhost:5173`

### 6. 访问应用

打开浏览器访问：`http://localhost:5173`

## 📖 API文档

### 认证接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 需要登录 |
| PUT | /api/auth/password | 修改密码 | 需要登录 |
| POST | /api/auth/logout | 登出 | 需要登录 |

### 教师接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/teachers | 搜索教师列表 | 公开 |
| GET | /api/teachers/:id | 获取教师详情 | 公开 |
| GET | /api/teachers/my-profile | 获取我的档案 | 教师 |
| POST | /api/teachers/profile | 创建教师档案 | 教师 |
| PUT | /api/teachers/profile | 更新教师档案 | 教师 |
| POST | /api/teachers/avatar | 上传头像 | 教师 |
| POST | /api/teachers/certificates | 上传证书 | 教师 |

### 预约接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/bookings | 创建预约 | 学生 |
| GET | /api/bookings | 获取我的预约列表 | 需要登录 |
| GET | /api/bookings/:id | 获取预约详情 | 需要登录 |
| PUT | /api/bookings/:id/accept | 接受预约 | 教师 |
| PUT | /api/bookings/:id/reject | 拒绝预约 | 教师 |
| PUT | /api/bookings/:id/complete | 完成预约 | 教师 |
| PUT | /api/bookings/:id/cancel | 取消预约 | 学生/教师 |

详细的API文档请参考：[docs/API.md](docs/API.md)

## 🧪 测试账号

您可以使用以下测试账号登录（需要先通过注册页面创建）：

- **学生账号**：student@example.com / password123
- **教师账号**：teacher@example.com / password123

## 📝 开发说明

### 数据库迁移

如果需要修改数据库结构，建议使用Sequelize迁移：

```bash
cd server
npx sequelize-cli migration:generate --name your-migration-name
# 编辑生成的迁移文件
npx sequelize-cli db:migrate
```

### 代码规范

项目使用ESLint进行代码规范检查。

### 目录说明

- **client/src/api/** - 封装的API调用函数
- **client/src/components/** - 可复用的React组件
- **client/src/pages/** - 页面组件
- **client/src/store/** - Zustand状态管理
- **server/src/models/** - Sequelize数据模型
- **server/src/controllers/** - 业务逻辑处理
- **server/src/routes/** - 路由定义
- **server/src/middlewares/** - Express中间件

## 🔧 常见问题

### 1. 端口被占用

修改 `server/.env` 中的 `PORT` 和 `client/vite.config.js` 中的端口配置。

### 2. 数据库连接失败

检查MySQL服务是否启动，以及 `.env` 中的数据库配置是否正确。

### 3. 前端API请求失败

确保后端服务已启动，检查 `client/.env.development` 中的 `VITE_API_BASE_URL` 配置。

## 🚢 部署

### 生产环境构建

**前端：**

```bash
cd client
npm run build
# 生成的文件在 client/dist/ 目录
```

**后端：**

```bash
cd server
# 设置环境变量 NODE_ENV=production
npm start
```

建议使用PM2、Docker或云服务（如阿里云、腾讯云）进行部署。

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过以下方式联系：
- Email: your-email@example.com
- GitHub Issues: [项目Issues页面]

---

**注意：** 这是一个MVP（最小可行产品）版本，专注于核心功能实现。后续可以扩展支付系统、评价系统、消息通知、在线授课等高级功能。
