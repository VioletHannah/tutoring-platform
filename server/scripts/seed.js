require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../src/config/database');
const { User, TeacherProfile, StudentProfile, Institution, Booking } = require('../src/models');
const { hashPassword } = require('../src/utils/bcrypt');

const SAMPLE_USERS = [
  {
    role: 'student',
    username: '张妈妈',
    email: 'zhang_parent@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '张妈妈',
      gender: 'female',
      grade: '初中二年级'
    }
  },
  {
    role: 'student',
    username: '李爸爸',
    email: 'li_parent@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '李爸爸',
      gender: 'male',
      grade: '小学五年级'
    }
  },
  {
    role: 'teacher',
    username: '王老师',
    email: 'wang_teacher@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '王明哲',
      gender: 'male',
      age: 25,
      education: '硕士',
      teachingExperience: 3,
      hourlyRate: 120,
      subjects: ['数学', '物理'],
      introduction: '985大学数学系硕士，擅长引导式教学。注重培养学生的逻辑思维能力，善于启发学生自己发现问题、解决问题。曾辅导多名初中生数学成绩从及格线提升至优秀水平。教学风格：耐心细致，善于用生活实例讲解抽象概念。',
      isOnline: true,
      rating: 4.8,
      totalReviews: 23,
      availableTimes: [
        { day: '周一', slots: ['18:00-20:00', '20:00-22:00'] },
        { day: '周三', slots: ['18:00-20:00'] },
        { day: '周六', slots: ['09:00-11:00', '14:00-16:00'] }
      ]
    }
  },
  {
    role: 'teacher',
    username: '陈老师',
    email: 'chen_teacher@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '陈雨涵',
      gender: 'female',
      age: 22,
      education: '本科',
      teachingExperience: 2,
      hourlyRate: 100,
      subjects: ['英语', '语文'],
      introduction: '英语专业八级，口语流利。擅长沉浸式英语教学，通过趣味游戏和情景对话激发学生学习兴趣。辅导过小学和初中学生，对KET/PET考试备考有丰富经验。',
      isOnline: true,
      rating: 4.5,
      totalReviews: 15,
      availableTimes: [
        { day: '周二', slots: ['18:00-20:00'] },
        { day: '周四', slots: ['18:00-20:00'] },
        { day: '周日', slots: ['10:00-12:00', '14:00-16:00'] }
      ]
    }
  },
  {
    role: 'teacher',
    username: '刘老师',
    email: 'liu_teacher@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '刘建国',
      gender: 'male',
      age: 28,
      education: '博士',
      teachingExperience: 5,
      hourlyRate: 200,
      subjects: ['化学', '生物'],
      introduction: '985高校化学博士，高中时曾获化学竞赛省级一等奖。5年家教经验，辅导过50+名学生，擅长帮助学生建立知识点之间的联系，形成系统化的知识网络。针对中考和高中的重难点有独到的教学方法。',
      isOnline: true,
      rating: 4.9,
      totalReviews: 42,
      availableTimes: [
        { day: '周一', slots: ['19:00-21:00'] },
        { day: '周五', slots: ['19:00-21:00'] },
        { day: '周六', slots: ['09:00-11:00', '14:00-16:00', '16:00-18:00'] }
      ]
    }
  },
  {
    role: 'teacher',
    username: '赵老师',
    email: 'zhao_teacher@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '赵思远',
      gender: 'male',
      age: 23,
      education: '本科',
      teachingExperience: 2,
      hourlyRate: 80,
      subjects: ['计算机', '数学'],
      introduction: '计算机科学与技术专业，有丰富的编程教学经验。擅长Scratch少儿编程、Python入门等课程。课堂氛围轻松活泼，善于用项目驱动的方式引导学生动手实践。',
      isOnline: true,
      rating: 4.6,
      totalReviews: 18,
      availableTimes: [
        { day: '周三', slots: ['16:00-18:00', '18:00-20:00'] },
        { day: '周六', slots: ['10:00-12:00'] },
        { day: '周日', slots: ['10:00-12:00', '14:00-16:00'] }
      ]
    }
  },
  {
    role: 'teacher',
    username: '孙老师',
    email: 'sun_teacher@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '孙美玲',
      gender: 'female',
      age: 26,
      education: '硕士',
      teachingExperience: 4,
      hourlyRate: 150,
      subjects: ['物理', '数学'],
      introduction: '物理学硕士，4年初中物理和数学辅导经验。擅长用实验和动手操作帮助学生理解抽象的物理概念。教学理念：不刷题也能学好理科，关键是理解原理。',
      isOnline: true,
      rating: 4.7,
      totalReviews: 31,
      availableTimes: [
        { day: '周二', slots: ['18:00-20:00'] },
        { day: '周四', slots: ['18:00-20:00'] },
        { day: '周日', slots: ['09:00-11:00', '14:00-16:00'] }
      ]
    }
  },
  {
    role: 'teacher',
    username: '周老师',
    email: 'zhou_teacher@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      fullName: '周文博',
      gender: 'male',
      age: 30,
      education: '硕士',
      teachingExperience: 7,
      hourlyRate: 250,
      subjects: ['数学', '物理', '化学'],
      introduction: '7年一线教学经验，曾任某知名培训机构金牌讲师。独创"三步解题法"，帮助学生快速定位题目考点，高效解题。带过的学生中考理科平均提分30+，深受家长信赖。',
      isOnline: true,
      rating: 4.9,
      totalReviews: 67,
      availableTimes: [
        { day: '周一', slots: ['18:00-21:00'] },
        { day: '周三', slots: ['18:00-21:00'] },
        { day: '周五', slots: ['18:00-21:00'] },
        { day: '周六', slots: ['09:00-12:00', '14:00-18:00'] }
      ]
    }
  },
  {
    role: 'institution',
    username: '优学教育培训中心',
    email: 'youxue@example.com',
    password: 'password123',
    status: 'active',
    profile: {
      institutionName: '优学教育培训中心',
      description: '专注K12课外辅导15年，旗下拥有200+名专业教师。提供一对一、一对多等多种辅导形式，覆盖全科目。',
      address: '北京市海淀区中关村大街58号',
      contactPhone: '010-88886666',
      licenseNumber: 'BJ-2024-EDU-001',
      isVerified: true
    }
  }
];

const createSampleUsers = async () => {
  const createdUsers = [];
  for (const userData of SAMPLE_USERS) {
    const passwordHash = await hashPassword(userData.password);

    const [user, created] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: {
        username: userData.username,
        email: userData.email,
        passwordHash,
        role: userData.role,
        status: userData.status
      }
    });

    if (!created) {
      console.log(`  ⏭ 用户已存在: ${userData.username} (${userData.role})`);
      createdUsers.push(user);
      continue;
    }

    console.log(`  ✅ 创建用户: ${userData.username} (${userData.role})`);

    if (userData.role === 'student') {
      await StudentProfile.create({ ...userData.profile, userId: user.id });
      console.log(`     └ 创建学生档案: ${userData.profile.fullName}`);
    } else if (userData.role === 'teacher') {
      await TeacherProfile.create({ ...userData.profile, userId: user.id });
      console.log(`     └ 创建教师档案: ${userData.profile.fullName}`);
    } else if (userData.role === 'institution') {
      await Institution.create({ ...userData.profile, userId: user.id });
      console.log(`     └ 创建机构档案: ${userData.profile.institutionName}`);
    }

    createdUsers.push(user);
  }
  return createdUsers;
};

const createSampleBookings = async (users) => {
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  if (students.length === 0 || teachers.length === 0) return;

  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];

  const futureDate = (daysAhead) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return fmt(d);
  };

  const sampleBookings = [
    {
      studentId: students[0].id,
      teacherId: teachers[0].id,
      subject: '数学',
      bookingDate: futureDate(3),
      startTime: '18:00:00',
      endTime: '20:00:00',
      location: '线上腾讯会议',
      note: '希望重点讲解一元二次方程应用题，孩子这方面比较薄弱',
      status: 'accepted',
      totalAmount: 240,
      teacherReply: '好的，我会提前准备这方面的专项练习'
    },
    {
      studentId: students[0].id,
      teacherId: teachers[1].id,
      subject: '英语',
      bookingDate: futureDate(5),
      startTime: '10:00:00',
      endTime: '11:30:00',
      location: '线下 - 学生家中',
      note: '帮助孩子准备KET考试，重点提升口语和听力',
      status: 'pending',
      totalAmount: 150
    },
    {
      studentId: students[1].id,
      teacherId: teachers[2].id,
      subject: '化学',
      bookingDate: futureDate(1),
      startTime: '19:00:00',
      endTime: '21:00:00',
      location: '线上钉钉',
      note: '初三化学，孩子对化学方程式的配平总是搞不清楚',
      status: 'accepted',
      totalAmount: 400,
      teacherReply: '明白了，我会从基础的化学式书写开始帮他梳理'
    },
    {
      studentId: students[1].id,
      teacherId: teachers[3].id,
      subject: '计算机',
      bookingDate: futureDate(4),
      startTime: '16:00:00',
      endTime: '18:00:00',
      location: '线上腾讯会议',
      note: '零基础小学生，想学Scratch入门',
      status: 'completed',
      totalAmount: 160
    },
    {
      studentId: students[0].id,
      teacherId: teachers[5].id,
      subject: '物理',
      bookingDate: futureDate(7),
      startTime: '14:00:00',
      endTime: '16:00:00',
      location: '线下 - 机构教室',
      note: '初二物理，孩子说力学部分听课听不懂',
      status: 'pending',
      totalAmount: 500
    }
  ];

  for (const booking of sampleBookings) {
    const [created] = await Booking.findOrCreate({
      where: {
        studentId: booking.studentId,
        teacherId: booking.teacherId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime
      },
      defaults: booking
    });
    const studentUser = users.find(u => u.id === booking.studentId);
    const teacherUser = users.find(u => u.id === booking.teacherId);
    console.log(`  ${created ? '✅' : '⏭'} 预约: ${studentUser?.username} → ${teacherUser?.username} (${booking.subject}) [${booking.status}]`);
  }
};

const main = async () => {
  console.log('\n🚀 开始填充示例数据...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    console.log('📝 创建用户和档案...');
    const users = await createSampleUsers();

    console.log('\n📅 创建示例预约...');
    await createSampleBookings(users);

    console.log('\n🎉 示例数据填充完成！');
    console.log('\n--- 测试账户 ---');
    console.log('学生: zhang_parent@example.com / password123');
    console.log('学生: li_parent@example.com / password123');
    console.log('教师: wang_teacher@example.com / password123');
    console.log('教师: chen_teacher@example.com / password123');
    console.log('教师: liu_teacher@example.com / password123');
    console.log('教师: zhao_teacher@example.com / password123');
    console.log('教师: sun_teacher@example.com / password123');
    console.log('教师: zhou_teacher@example.com / password123');
    console.log('机构: youxue@example.com / password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 种子数据填充失败:', error.message);
    process.exit(1);
  }
};

main();