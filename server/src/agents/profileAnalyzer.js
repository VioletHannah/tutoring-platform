function analyzeProfile(profile) {
  const tags = [];
  const highlights = [];
  const intro = (profile.introduction || '').toLowerCase();

  // Style tags from introduction keywords
  const stylePatterns = {
    '引导式教学': ['引导', '启发', '发现问题', '自己解决', '独立思考'],
    '耐心细致': ['耐心', '细致', '认真', '细心'],
    '系统化训练': ['系统', '体系', '知识网络', '框架', '结构化'],
    '趣味互动': ['趣味', '游戏', '互动', '活泼', '生动', '情景'],
    '应试冲刺': ['考试', '冲刺', '备考', '高分', '提分', '刷题', '真题'],
    '动手实践': ['实践', '实验', '动手', '项目', '操作'],
    '逻辑思维': ['逻辑', '思维', '推理', '思考'],
    '因材施教': ['因材施教', '个性化', '定制', '针对性']
  };

  for (const [tag, keywords] of Object.entries(stylePatterns)) {
    if (keywords.some(k => intro.includes(k))) {
      tags.push(tag);
    }
  }

  // Education tags
  if (profile.education === '博士') {
    tags.push('博士学历');
    highlights.push('博士学历，具备深厚的专业理论功底');
  } else if (profile.education === '硕士') {
    tags.push('硕士学历');
    highlights.push('硕士学历，学术背景扎实');
  } else if (profile.education === '本科' && profile.teachingExperience >= 3) {
    highlights.push('本科毕业，拥有丰富的实战教学经验');
  }

  // Experience tags
  if (profile.teachingExperience >= 5) {
    tags.push(`${profile.teachingExperience}年教龄`);
    highlights.push(`${profile.teachingExperience}年教学经验，累计辅导过大量学生`);
  } else if (profile.teachingExperience >= 3) {
    tags.push('经验丰富');
    highlights.push(`${profile.teachingExperience}年教学经验，具备成熟的教学方法`);
  } else if (profile.teachingExperience >= 1) {
    tags.push('有经验');
  }

  // Subject expertise
  const subjects = Array.isArray(profile.subjects) ? profile.subjects : (profile.subjects || []);
  if (subjects.length >= 3) {
    tags.push('多科目辅导');
    highlights.push(`擅长多科目教学：${subjects.join('、')}`);
  } else if (subjects.length === 2) {
    highlights.push(`擅长${subjects.join('和')}的双科辅导`);
  }

  // High rating tag
  if (profile.rating >= 4.5 && profile.totalReviews >= 10) {
    tags.push('好评如潮');
    highlights.push(`家长评分 ${profile.rating} 分（${profile.totalReviews}条评价）`);
  }

  // Price tier tag
  if (profile.hourlyRate >= 200) {
    tags.push('资深讲师');
  } else if (profile.hourlyRate <= 100) {
    tags.push('性价比高');
  }

  // If no style tags found, add default
  if (tags.filter(t => stylePatterns[t]).length === 0) {
    tags.push('认真负责');
  }

  // Generate profile summary
  let summary = '';
  if (profile.fullName) {
    summary += `${profile.fullName}老师`;
    if (profile.teachingExperience) summary += `，${profile.teachingExperience}年教学经验`;
    if (profile.education) summary += `，${profile.education}学历`;
    if (subjects.length > 0) summary += `，擅长${subjects.join('、')}`;
    summary += '。';
  }
  if (highlights.length > 0) {
    summary += ' ' + highlights[0] + '。';
  }
  if (tags.length > 0) {
    summary += ` 教学风格标签：${tags.join('、')}。`;
  }

  return {
    tags: [...new Set(tags)],
    highlights: summary,
    analyzedAt: new Date()
  };
}

module.exports = { analyzeProfile };