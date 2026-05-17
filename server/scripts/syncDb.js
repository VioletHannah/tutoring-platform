/**
 * 临时脚本：同步数据库结构
 * 添加 TeacherMaterial 表并更新 Booking 表的缺失字段
 *
 * 运行一次即可：node scripts/syncDb.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../src/config/database');

// 导入所有模型以注册它们
require('../src/models');

const syncDatabase = async () => {
  console.log('🔄 开始同步数据库...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 使用 alter: true 来更新表结构（不会删除数据）
    console.log('📊 同步模型到数据库...');
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库结构同步完成！\n');

    // 检查 TeacherMaterial 表是否存在
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = '${process.env.DB_NAME}'
      AND table_name = 'teacher_materials'
    `);
    const tableExists = results[0]?.count > 0;
    console.log(`📋 teacher_materials 表: ${tableExists ? '已存在' : '不存在（已创建）'}`);

    console.log('\n🎉 数据库同步完成！');
    console.log('\n现在可以运行 npm run seed 来填充测试数据。');

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库同步失败:', error.message);
    process.exit(1);
  }
};

syncDatabase();