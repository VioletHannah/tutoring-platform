# 🚀 快速启动指南

## 前置要求

在开始之前，请确保您的系统已安装：

1. **Node.js 18+** - [下载地址](https://nodejs.org/)
2. **MySQL 8.0+** - [下载地址](https://dev.mysql.com/downloads/)
3. **Git** (可选) - 用于版本控制

## 5分钟快速启动

### 步骤 1：创建数据库

打开MySQL命令行或客户端工具，执行：

```sql
CREATE DATABASE tutoring_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 步骤 2：配置后端

1. 进入server目录：
```bash
cd server
```

2. 安装依赖（需要已安装Node.js）：
```bash
npm install
```

3. 配置环境变量：
   - 复制 `.env.example` 文件为 `.env`
   - 修改数据库密码：将 `DB_PASSWORD=root` 改为您的MySQL密码

### 步骤 3：配置前端

1. 进入client目录：
```bash
cd ../client
```

2. 安装依赖：
```bash
npm install
```

### 步骤 4：启动服务

**启动后端**（在server目录）：
```bash
npm run dev
```

看到以下信息表示后端启动成功：
```
✅ Database connection established successfully.
✅ Database models synced
🚀 Server running on port 5000
```

**启动前端**（新开一个终端，在client目录）：
```bash
npm run dev
```

看到以下信息表示前端启动成功：
```
  VITE v5.0.8  ready in 500 ms
  
  ➜  Local:   http://localhost:5173/
```

### 步骤 5：访问应用

打开浏览器，访问：**http://localhost:5173**

## 🎯 快速测试

### 1. 注册教师账号

1. 点击"注册"按钮
2. 填写信息，选择角色为"教师（提供家教）"
3. 注册成功后会自动登录

### 2. 完善教师档案

1. 点击顶部导航的"预约管理"或用户菜单中的"个人中心"
2. 填写教学信息：
   - 姓名、性别、年龄
   - 教学经验、时薪
   - 擅长科目（数学、英语等）
   - 个人简介

### 3. 注册学生账号

1. 退出当前账号
2. 重新注册，选择角色为"学生（需要家教）"

### 4. 搜索并预约教师

1. 点击"找老师"
2. 使用筛选条件搜索教师
3. 点击教师卡片查看详情
4. 填写预约信息并提交

### 5. 教师处理预约

1. 切换到教师账号
2. 在"预约管理"页面查看收到的预约请求
3. 选择"接受"或"拒绝"

## ⚠️ 常见问题

### Q1: 后端启动失败，提示"Unable to connect to the database"

**解决方案：**
- 检查MySQL服务是否启动
- 检查 `server/.env` 中的数据库配置是否正确
- 确认数据库 `tutoring_platform` 已创建

### Q2: 前端无法访问API

**解决方案：**
- 确保后端服务已启动（端口5000）
- 检查浏览器控制台是否有错误信息
- 确认 `client/.env.development` 中的API地址正确

### Q3: npm install 很慢

**解决方案：**
使用淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q4: 端口被占用

**解决方案：**
- 后端：修改 `server/.env` 中的 `PORT`
- 前端：修改 `client/vite.config.js` 中的 `server.port`

## 📦 项目结构概览

```
tutoring-platform/
├── client/          # 前端项目（React + Vite）
│   ├── src/
│   │   ├── pages/   # 页面组件
│   │   ├── api/     # API接口
│   │   └── store/   # 状态管理
│   └── package.json
├── server/          # 后端项目（Node.js + Express）
│   ├── src/
│   │   ├── models/      # 数据模型
│   │   ├── controllers/ # 控制器
│   │   └── routes/      # 路由
│   └── package.json
└── docs/            # 文档
```

## 🎉 下一步

恭喜！您已成功启动家教信息平台。

**推荐继续：**

1. 📖 阅读 [README.md](README.md) 了解详细功能
2. 📚 查看 [API文档](docs/API.md) 了解接口详情
3. 🛠️ 根据需求扩展功能
4. 🚀 部署到生产环境

**需要帮助？**
- 查看完整文档：[README.md](README.md)
- 提交Issue：[GitHub Issues](#)

祝您使用愉快！ 🎓
