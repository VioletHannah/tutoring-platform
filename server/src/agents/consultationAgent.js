const { User, TeacherProfile, StudentProfile, Booking } = require('../models');
const { Op } = require('sequelize');

const MOCK_PROMPTS = {
  greetings: [
    '您好！我是家教AI助手，可以帮您找到最合适的家教老师。',
    '请告诉我您的基本需求：\n1️⃣ 学生的年级？\n2️⃣ 需要辅导什么科目？\n3️⃣ 对老师有什么特别要求？（如教学风格、性别偏好、价格预算等）'
  ],
  clarifySubject: [
    '请问需要辅导哪个科目呢？我们有数学、英语、物理、化学、生物、语文、历史、地理、政治、计算机等科目的老师。',
    '请说明想找哪个科目的老师？'
  ],
  clarifyGrade: [
    '请问学生目前几年级呢？这能帮我更好地推荐合适的老师。',
    '方便告诉我学生所在的年级吗？'
  ],
  clarifyStyle: [
    '请问您更偏好哪种教学风格？比如：\n• 引导式启发教学\n• 严格系统化训练\n• 趣味互动式教学\n• 考试冲刺强化训练',
    '对老师的性别有偏好吗？比如希望是男老师还是女老师？'
  ],
  clarifyBudget: [
    '您的预算范围大概是多少？我们老师的课时费从80元到250元每小时不等。',
    '对课时费有什么要求吗？例如：100-150元/小时'
  ],
  match: [
    '根据您的需求，我为您找到了以下匹配的老师：',
    '太好了！以下老师非常符合您的要求，来看看：'
  ],
  insufficient: [
    '抱歉，目前没有完全匹配您需求的老师。您可以尝试：\n• 放宽筛选条件\n• 调整价格范围\n• 更换科目',
    '暂时没有找到符合条件的老师。试试调整一下需求？'
  ],
  bookingPrompt: [
    '有中意的老师吗？您可以直接告诉我"预约XX老师"，我来帮您安排时间！',
    '需要我帮您联系其中的某位老师进行预约吗？'
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseIntent(message) {
  const m = message.toLowerCase();

  if (/预约|约课|订课|book/.test(m)) return 'book';
  if (/数学|物理|化学|生物|英语|语文|历史|地理|政治|计算机|编程/.test(m)) return 'subject';
  if (/年级|初一|初二|初三|高一|高二|高三|小学|幼儿园/.test(m)) return 'grade';
  if (/价格|预算|费用|便宜|贵/.test(m)) return 'budget';
  if (/男老师|女老师|男教师|女教师/.test(m)) return 'gender';
  if (/风格|严格|启发|引导|趣味|冲刺|系统/.test(m)) return 'style';
  if (/你好|您好|hi|hello|帮助|帮我|找老师|家教|辅导/.test(m)) return 'greeting';
  if (/更多|再来|还有|其他|换个|推荐/.test(m)) return 'more';

  return 'unknown';
}

function extractSubject(message) {
  const subjects = ['数学', '英语', '物理', '化学', '生物', '语文', '历史', '地理', '政治', '计算机'];
  for (const s of subjects) {
    if (message.includes(s)) return s;
  }
  return null;
}

function extractGrade(message) {
  const grades = [
    '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
    '初一', '初二', '初三', '高一', '高二', '高三'
  ];
  const match = message.match(/(小学[一二三四五六]年级|初[一二三]|高[一二三])/);
  return match ? match[0] : null;
}

async function searchTeachersByCriteria(criteria) {
  const where = { isOnline: true };
  if (criteria.subject) where.subjects = { [Op.like]: `%${criteria.subject}%` };
  if (criteria.gender) where.gender = criteria.gender;
  if (criteria.minPrice || criteria.maxPrice) {
    where.hourlyRate = {};
    if (criteria.minPrice) where.hourlyRate[Op.gte] = criteria.minPrice;
    if (criteria.maxPrice) where.hourlyRate[Op.lte] = criteria.maxPrice;
  }
  if (criteria.minExperience) where.teachingExperience = { [Op.gte]: criteria.minExperience };

  const { rows: teachers } = await TeacherProfile.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'status'], where: { status: 'active' } }],
    order: [['rating', 'DESC']],
    limit: 3
  });
  return teachers;
}

function buildTeacherCard(teacher) {
  const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : JSON.parse(teacher.subjects || '[]');
  return {
    type: 'teacher_card',
    userId: teacher.userId,
    fullName: teacher.fullName,
    education: teacher.education,
    teachingExperience: teacher.teachingExperience,
    hourlyRate: teacher.hourlyRate,
    subjects,
    rating: teacher.rating,
    totalReviews: teacher.totalReviews,
    introduction: teacher.introduction ? teacher.introduction.slice(0, 100) + '...' : '',
    highlight: teacher.highlight || ''
  };
}

async function processMessage(userMessage, conversationState) {
  const text = userMessage || '';
  const intent = parseIntent(text);
  const extracted = {
    subject: extractSubject(text),
    grade: extractGrade(text),
    keywords: text
  };

  // Merge extracted info into conversation state
  if (extracted.subject) conversationState.subject = extracted.subject;
  if (extracted.grade) conversationState.grade = extracted.grade;

  // Detect budget
  const priceMatch = text.match(/(\d+)\s*[-~到至]\s*(\d+)\s*(?:元|块)?/);
  if (priceMatch) {
    conversationState.minPrice = parseInt(priceMatch[1]);
    conversationState.maxPrice = parseInt(priceMatch[2]);
  }

  // Detect gender preference
  if (/男老师|男教师/.test(text)) conversationState.gender = 'male';
  if (/女老师|女教师/.test(text)) conversationState.gender = 'female';

  // Try to match if enough info
  const hasSubject = !!conversationState.subject;
  const hasEnoughInfo = hasSubject && conversationState.stage >= 2;

  if (intent === 'more') {
    conversationState.offset = (conversationState.offset || 0) + 3;
    const teachers = await searchTeachersByCriteria(conversationState);
    if (teachers.length > 0) {
      return {
        text: '为您推荐更多老师：',
        cards: teachers.map(buildTeacherCard),
        state: conversationState
      };
    }
    return { text: '没有更多老师了。要不要试试调整筛选条件？', state: conversationState };
  }

  if (conversationState.stage === 0 || intent === 'greeting') {
    conversationState.stage = 1;
    return {
      text: pick(MOCK_PROMPTS.greetings),
      state: conversationState
    };
  }

  if (conversationState.stage === 1) {
    if (!hasSubject && !conversationState.subject) {
      conversationState.stage = 1;
      return {
        text: pick(MOCK_PROMPTS.clarifySubject),
        state: conversationState
      };
    }

    conversationState.stage = 2;
    if (!conversationState.grade) {
      return {
        text: pick(MOCK_PROMPTS.clarifyGrade),
        state: conversationState
      };
    }
  }

  if (conversationState.stage === 2) {
    conversationState.stage = 3;
    if (!conversationState.minPrice && !conversationState.gender) {
      return {
        text: pick(MOCK_PROMPTS.clarifyStyle),
        state: conversationState
      };
    }
  }

  // Match teachers
  const teachers = await searchTeachersByCriteria(conversationState);

  if (teachers.length === 0) {
    conversationState.stage = 1;
    return {
      text: pick(MOCK_PROMPTS.insufficient),
      state: conversationState
    };
  }

  // Add personalized highlights
  const cards = teachers.map(t => {
    const teacher = t.toJSON();
    const highlights = [];
    if (teacher.rating >= 4.8) highlights.push('⭐ 高评分');
    if (teacher.teachingExperience >= 3) highlights.push(`📚 ${teacher.teachingExperience}年经验`);
    if (teacher.education === '博士' || teacher.education === '硕士') highlights.push(`🎓 ${teacher.education}`);
    teacher.highlight = highlights.join(' · ');
    return buildTeacherCard(teacher);
  });

  conversationState.stage = 4;
  return {
    text: pick(MOCK_PROMPTS.match),
    cards,
    state: conversationState
  };
}

async function handleBookRequest(message, conversationState) {
  const nameMatch = message.match(/预约(.{1,6}老师|.{2,4})/);
  const teacherName = nameMatch ? nameMatch[1].replace(/老师$/, '') : null;

  if (!teacherName) {
    return { text: '请告诉我您想预约哪位老师？例如"预约王老师"', state: conversationState };
  }

  const teachers = await TeacherProfile.findAll({
    where: {
      [Op.or]: [
        { fullName: { [Op.like]: `%${teacherName}%` } },
      ]
    },
    include: [{ model: User, as: 'user', where: { status: 'active' } }],
    limit: 5
  });

  if (teachers.length === 0) {
    return { text: `抱歉，没有找到名字包含"${teacherName}"的老师。请再次确认老师姓名。`, state: conversationState };
  }

  if (teachers.length === 1) {
    const t = teachers[0];
    conversationState.selectedTeacher = {
      userId: t.userId,
      fullName: t.fullName,
      hourlyRate: t.hourlyRate,
      subjects: t.subjects
    };
    conversationState.stage = 'booking';
    return {
      text: `好的，${t.fullName}老师，课时费 ¥${t.hourlyRate}/小时。请告诉我您希望的上课时间和日期？（例如：周六下午2点）`,
      state: conversationState
    };
  }

  return {
    text: `找到 ${teachers.length} 位名字相似的老师：\n${teachers.map((t, i) => `${i + 1}. ${t.fullName}（¥${t.hourlyRate}/小时）`).join('\n')}\n请确认是哪一位？`,
    state: conversationState
  };
}

module.exports = { processMessage, handleBookRequest, parseIntent };