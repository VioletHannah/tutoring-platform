# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

### 通用响应格式

**成功响应：**
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* response data */ }
}
```

**错误响应：**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["error detail 1", "error detail 2"]
}
```

## 认证接口 (Authentication)

### 1. 用户注册

**POST** `/auth/register`

**请求体：**
```json
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "password": "password123",
  "role": "student"
}
```

**参数说明：**
- `username` (必填): 用户名，3-50字符
- `email` (必填): 邮箱地址
- `phone` (可选): 手机号，10-20位数字
- `password` (必填): 密码，至少6位字符
- `role` (必填): 角色，可选值：`student`, `teacher`, `institution`

**响应：**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "student",
      "status": "pending"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用户登录

**POST** `/auth/login`

**请求体：**
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "student",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 获取当前用户信息

**GET** `/auth/me`

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "message": "User info retrieved successfully",
  "data": {
    "id": 1,
    "username": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "role": "student",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "studentProfile": { /* ... */ }
  }
}
```

### 4. 修改密码

**PUT** `/auth/password`

**请求头：**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

## 教师接口 (Teachers)

### 1. 搜索教师列表

**GET** `/teachers`

**查询参数：**
- `subject` (可选): 科目，如"数学"
- `minPrice` (可选): 最低价格
- `maxPrice` (可选): 最高价格
- `gender` (可选): 性别，`male` / `female` / `other`
- `minExperience` (可选): 最少教学经验（年）
- `education` (可选): 学历关键词
- `sortBy` (可选): 排序字段，`rating` / `hourlyRate` / `teachingExperience`
- `order` (可选): 排序方式，`ASC` / `DESC`
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10

**示例请求：**
```
GET /teachers?subject=数学&minPrice=100&maxPrice=300&page=1&limit=10
```

**响应：**
```json
{
  "success": true,
  "message": "Teachers retrieved successfully",
  "data": {
    "teachers": [
      {
        "id": 1,
        "userId": 2,
        "fullName": "李老师",
        "gender": "male",
        "age": 30,
        "education": "硕士",
        "teachingExperience": 5,
        "hourlyRate": 200.00,
        "subjects": ["数学", "物理"],
        "introduction": "经验丰富的数学教师...",
        "avatarUrl": "/uploads/avatar-123.jpg",
        "isOnline": true,
        "rating": 4.8,
        "totalReviews": 25,
        "user": {
          "id": 2,
          "username": "李老师",
          "email": "teacher@example.com",
          "status": "active"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 2. 获取教师详情

**GET** `/teachers/:id`

**路径参数：**
- `id`: 用户ID

**响应：** 同上单个教师对象

### 3. 创建/更新教师档案

**POST** `/teachers/profile` (创建)  
**PUT** `/teachers/profile` (更新)

**权限：** 仅教师角色

**请求头：**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "fullName": "李老师",
  "gender": "male",
  "age": 30,
  "education": "硕士",
  "teachingExperience": 5,
  "hourlyRate": 200,
  "subjects": ["数学", "物理"],
  "introduction": "经验丰富的数学教师，擅长...",
  "availableTimes": [
    {
      "day": "Monday",
      "slots": [
        { "start": "09:00", "end": "12:00" },
        { "start": "14:00", "end": "17:00" }
      ]
    }
  ]
}
```

## 预约接口 (Bookings)

### 1. 创建预约

**POST** `/bookings`

**权限：** 仅学生角色

**请求头：**
```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "teacherId": 2,
  "subject": "数学",
  "bookingDate": "2024-12-20",
  "startTime": "14:00:00",
  "endTime": "16:00:00",
  "location": "线上授课",
  "note": "希望重点讲解代数部分"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "teacherId": 2,
    "subject": "数学",
    "bookingDate": "2024-12-20",
    "startTime": "14:00:00",
    "endTime": "16:00:00",
    "location": "线上授课",
    "note": "希望重点讲解代数部分",
    "status": "pending",
    "totalAmount": 400.00,
    "student": { /* ... */ },
    "teacher": { /* ... */ }
  }
}
```

### 2. 获取我的预约列表

**GET** `/bookings`

**请求头：**
```
Authorization: Bearer {token}
```

**查询参数：**
- `status` (可选): 预约状态
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期
- `page` (可选): 页码
- `limit` (可选): 每页数量

### 3. 接受预约

**PUT** `/bookings/:id/accept`

**权限：** 仅教师角色

**请求体：**
```json
{
  "teacherReply": "可以，期待与您的课程"
}
```

### 4. 拒绝预约

**PUT** `/bookings/:id/reject`

**权限：** 仅教师角色

**请求体：**
```json
{
  "teacherReply": "抱歉，该时段已有安排"
}
```

### 5. 取消预约

**PUT** `/bookings/:id/cancel`

**权限：** 学生或教师

### 6. 完成预约

**PUT** `/bookings/:id/complete`

**权限：** 仅教师角色

## 错误码

| HTTP状态码 | 说明 |
|-----------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱已注册） |
| 500 | 服务器内部错误 |

## 认证说明

大部分接口需要在请求头中携带JWT Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token在登录或注册成功后获得，有效期默认7天。
