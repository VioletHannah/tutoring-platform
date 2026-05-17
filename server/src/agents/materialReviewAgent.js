/**
 * AI Material Review Agent
 *
 * 职责：
 * - 分析教师上传的材料
 * - 判断材料是否可信、是否需要人工复核
 * - 提炼材料摘要和审核建议
 *
 * 本阶段实现基于规则引擎的审核逻辑，不依赖真实大模型 API。
 */

/**
 * 关键词配置
 */
const KEYWORDS = {
  // 证书类关键词
  certificate: [
    '证书', '资格', '合格', '認定', 'certificate', 'qualification',
    '奖状', '获奖', '荣誉', '认证', '资格证书', '教师资格证',
    '专业技能', '职称', '评审', '通过', '成绩优秀'
  ],
  // 学历类关键词
  education: [
    '大学', '学院', '高校', '学位', '卒業', '在学', '毕业',
    'university', 'degree', 'graduate', 'bachelor', 'master',
    '博士', '硕士', '本科', '大专', '学历', '成绩单', '毕业证',
    '学生证', '学籍', '入学', '年级', '专业'
  ],
  // 教学经历类关键词
  experience: [
    '教学', '授课', '家教', '指導', 'tutoring', 'teaching', 'lesson',
    '老师', '教师', '讲师', '辅导', '培训', '讲课', '课程',
    '学生', '班级', '任教', '教学经验', '工作经历', '简历'
  ],
  // 个人介绍类关键词
  self_intro: [
    '简历', '个人', '简介', '自我介绍', '教学理念', '风格',
    'resume', 'profile', 'bio', 'introduction', 'philosophy',
    '目标', '规划', '优势', '特长', '自我介绍'
  ],
  // 风险词（出现则高概率拒绝）
  risk: [
    '伪造', '假证', 'fake', 'forged', ' counterfeit', '欺骗',
    '虚假', '作弊', '代考', '代写'
  ]
};

/**
 * 计算文本与材料类型的匹配度
 * @param {string} text - 提取的文本
 * @param {string} materialType - 材料类型
 * @returns {number} 基础分数 (0-40)
 */
function calculateTypeMatchScore(text, materialType) {
  const lowerText = text.toLowerCase();
  const typeKeywords = KEYWORDS[materialType] || [];
  let matchCount = 0;

  for (const keyword of typeKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  // 根据匹配关键词数量计算分数（提高权重）
  if (matchCount >= 3) return 45;
  if (matchCount === 2) return 35;
  if (matchCount === 1) return 25;
  return 5;
}

/**
 * 检查风险词
 * @param {string} text - 提取的文本
 * @returns {string[]} 匹配到的风险词列表
 */
function checkRiskKeywords(text) {
  const lowerText = text.toLowerCase();
  const foundRisks = [];

  for (const risk of KEYWORDS.risk) {
    if (lowerText.includes(risk.toLowerCase())) {
      foundRisks.push(risk);
    }
  }

  return foundRisks;
}

/**
 * 计算材料与教师擅长科目的关联度
 * @param {string} text - 提取的文本
 * @param {string[]} teacherSubjects - 教师擅长科目
 * @returns {{ score: number, matchedSubjects: string[] }}
 */
function calculateSubjectRelevance(text, teacherSubjects) {
  const lowerText = text.toLowerCase();
  const matchedSubjects = [];

  for (const subject of teacherSubjects) {
    if (lowerText.includes(subject.toLowerCase())) {
      matchedSubjects.push(subject);
    }
  }

  // 每匹配一个科目加 5 分，最高 15 分
  const score = Math.min(matchedSubjects.length * 5, 15);

  return { score, matchedSubjects };
}

/**
 * 生成 AI 摘要
 * @param {string} materialType - 材料类型
 * @param {string} title - 材料标题
 * @param {string} text - 提取的文本
 * @param {string[]} highlights - 亮点列表
 * @returns {string}
 */
function generateSummary(materialType, title, text, highlights) {
  const typeNames = {
    certificate: '证书',
    education: '学历证明',
    experience: '教学经历证明',
    self_intro: '个人介绍',
    other: '材料'
  };

  const typeName = typeNames[materialType] || '材料';
  const textLength = text ? text.length : 0;

  let summary = `该材料为"${title || typeName}"`;

  if (textLength > 0 && textLength < 50) {
    summary += '，内容较为简短，AI 提取到的文字有限。';
  } else if (textLength >= 50 && textLength < 200) {
    if (highlights.length > 0) {
      summary += `，内容提及：${highlights.slice(0, 2).join('、')}等。`;
    } else {
      summary += '，内容较为简洁。';
    }
  } else if (textLength >= 200) {
    if (highlights.length > 0) {
      summary += `，主要内容包含：${highlights.slice(0, 3).join('、')}。`;
    } else {
      summary += '，内容丰富。';
    }
  }

  return summary;
}

/**
 * 生成面向平台管理员的审核建议
 * @param {string} reviewStatus - 审核状态
 * @param {string} materialType - 材料类型
 * @param {string} title - 材料标题
 * @param {number} aiScore - AI 评分
 * @param {string[]} riskFlags - 风险标记
 * @param {string} mimeType - 文件类型
 * @returns {string}
 */
function generateReviewSuggestion(reviewStatus, materialType, title, aiScore, riskFlags, mimeType) {
  const typeNames = {
    certificate: '证书材料',
    education: '学历证明材料',
    experience: '教学经历材料',
    self_intro: '个人介绍材料',
    other: '材料'
  };

  const typeName = typeNames[materialType] || '材料';

  if (reviewStatus === 'rejected') {
    if (riskFlags.length > 0) {
      return `建议拒绝，该材料存在风险标记：${riskFlags.join('、')}，可能涉及虚假信息。`;
    }
    return `建议拒绝，该${typeName}可信度较低，无法通过自动审核。`;
  }

  if (reviewStatus === 'approved') {
    if (aiScore >= 90) {
      return `建议通过，该${typeName}内容真实可信，${title ? `「${title}」` : ''}高质量。`;
    }
    if (mimeType && !['text/plain', 'image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return `建议通过，该${typeName}已上传，文件格式为 ${mimeType}。`;
    }
    return `建议通过，并在教师详情页展示为${typeName}亮点。`;
  }

  if (reviewStatus === 'need_manual_review') {
    if (mimeType && mimeType.includes('pdf')) {
      return `建议人工复核，PDF 文件暂未完整提取文本，需要人工确认内容。`;
    }
    if (mimeType && mimeType.startsWith('image')) {
      return `建议人工复核，图片材料暂无法完整识别文字，需要人工确认内容。`;
    }
    if (riskFlags.length > 0) {
      return `建议人工复核，原因是存在风险标记：${riskFlags.join('、')}。`;
    }
    return `建议人工复核，AI 无法确定材料可信度，请管理员确认${typeName}的真实性。`;
  }

  return '请管理员审核确认。';
}

/**
 * 生成亮点列表
 * @param {string} materialType - 材料类型
 * @param {string} text - 提取的文本
 * @param {string[]} matchedSubjects - 匹配的科目
 * @returns {string[]}
 */
function generateHighlights(materialType, text, matchedSubjects) {
  const highlights = [];

  // 科目关联亮点
  if (matchedSubjects.length > 0) {
    highlights.push(`材料与${matchedSubjects.join('、')}教学相关`);
  }

  // 根据材料类型添加特定亮点
  const lowerText = text.toLowerCase();

  if (materialType === 'certificate') {
    if (lowerText.includes('教师资格证')) {
      highlights.push('具备教师资格证');
    }
    if (lowerText.includes('竞赛') || lowerText.includes('获奖')) {
      highlights.push('有学科竞赛相关证书');
    }
    if (lowerText.includes('优秀') || lowerText.includes('成绩')) {
      highlights.push('有成绩优秀相关证明');
    }
  }

  if (materialType === 'education') {
    if (lowerText.includes('大学') || lowerText.includes('university')) {
      highlights.push('有高等教育学历证明');
    }
    if (lowerText.includes('硕士') || lowerText.includes('master')) {
      highlights.push('具备硕士及以上学历');
    }
    if (lowerText.includes('博士') || lowerText.includes('doctor')) {
      highlights.push('具备博士学历');
    }
  }

  if (materialType === 'experience') {
    if (lowerText.includes('一对一') || lowerText.includes('家教')) {
      highlights.push('有家教一对一辅导经验');
    }
    if (lowerText.includes('高中') || lowerText.includes('初中') || lowerText.includes('小学')) {
      highlights.push('有K12学段教学经验');
    }
    if (lowerText.includes('多年') || lowerText.includes('年')) {
      const yearMatch = text.match(/(\d+)\s*年/);
      if (yearMatch) {
        highlights.push(`有${yearMatch[1]}年以上教学经验`);
      }
    }
  }

  if (materialType === 'self_intro') {
    if (lowerText.includes('耐心') || lowerText.includes('细心')) {
      highlights.push('教学风格耐心细致');
    }
    if (lowerText.includes('系统') || lowerText.includes('体系')) {
      highlights.push('有系统性教学方法');
    }
    if (lowerText.includes('提分') || lowerText.includes('考试')) {
      highlights.push('注重应试提分');
    }
  }

  return [...new Set(highlights)];
}

/**
 * 生成标签列表
 * @param {string} materialType - 材料类型
 * @param {string} text - 提取的文本
 * @param {string[]} matchedSubjects - 匹配的科目
 * @returns {string[]}
 */
function generateTags(materialType, text, matchedSubjects) {
  const tags = [];

  // 材料类型标签
  const typeTagMap = {
    certificate: '资质证书',
    education: '学历证明',
    experience: '教学经历',
    self_intro: '个人介绍',
    other: '其他材料'
  };
  tags.push(typeTagMap[materialType] || '材料');

  // 科目标签
  matchedSubjects.forEach(subject => {
    tags.push(subject);
  });

  // 根据内容添加额外标签
  const lowerText = text.toLowerCase();

  if (materialType === 'certificate') {
    if (lowerText.includes('教师资格证')) tags.push('持证教师');
    if (lowerText.includes('英语')) tags.push('英语能力');
    if (lowerText.includes('数学')) tags.push('数学能力');
  }

  if (materialType === 'education') {
    if (lowerText.includes('硕士') || lowerText.includes('master')) tags.push('硕士学历');
    if (lowerText.includes('博士') || lowerText.includes('doctor')) tags.push('博士学历');
    if (lowerText.includes('985') || lowerText.includes('211')) tags.push('名校背景');
  }

  return [...new Set(tags)];
}

/**
 * 生成风险标记列表
 * @param {string[]} foundRisks - 匹配到的风险词
 * @param {string} text - 提取的文本
 * @param {string} mimeType - 文件类型
 * @returns {string[]}
 */
function generateRiskFlags(foundRisks, text, mimeType) {
  const riskFlags = [];

  // 风险词
  foundRisks.forEach(risk => {
    riskFlags.push(`发现风险词：${risk}`);
  });

  // 内容不足（只有文本为空时才标记为风险，内容短是正常的）
  const textLength = text ? text.length : 0;
  if (textLength === 0) {
    riskFlags.push('材料文字内容为空，可能为纯图片/PDF');
  }

  // 文件类型风险（仅当文本为空时提示）
  if (textLength === 0 && mimeType && mimeType.includes('pdf')) {
    riskFlags.push('PDF 文字提取暂不完整，需要人工复核');
  }

  return riskFlags;
}

/**
 * 主审核函数
 * @param {Object} params - 审核参数
 * @param {string} params.materialType - 材料类型
 * @param {string} params.title - 材料标题
 * @param {string} params.originalFilename - 原始文件名
 * @param {string} params.mimeType - 文件 MIME 类型
 * @param {string|null} params.extractedText - 提取的文本
 * @param {Object|null} params.teacherProfile - 教师档案（可选）
 * @returns {Object} 审核结果
 */
function reviewTeacherMaterial({
  materialType,
  title,
  originalFilename,
  mimeType,
  extractedText,
  teacherProfile
}) {
  const text = (extractedText || '').trim();
  const teacherSubjects = teacherProfile?.subjects || [];

  // 1. 检查风险词
  const foundRisks = checkRiskKeywords(text);
  const hasRiskKeywords = foundRisks.length > 0;

  // 2. 计算各项分数
  // 基础分：文本长度 (0-30分)
  let baseScore = 0;
  if (text.length >= 500) baseScore = 30;
  else if (text.length >= 200) baseScore = 25;
  else if (text.length >= 100) baseScore = 20;
  else if (text.length >= 50) baseScore = 15;
  else if (text.length >= 30) baseScore = 12;
  else if (text.length > 0) baseScore = 10;
  else baseScore = 0; // 空文本

  // 类型匹配分 (0-45分)
  const typeMatchScore = calculateTypeMatchScore(text, materialType);

  // 科目关联分 (0-15分)
  const { score: subjectScore, matchedSubjects } = calculateSubjectRelevance(text, teacherSubjects);

  // 3. 计算总分
  let aiScore = baseScore + typeMatchScore + subjectScore;

  // 如果有明确的类型匹配关键词，提高分数
  // 对于有良好关键词匹配的文本给予加分
  if (typeMatchScore >= 35 && text.length >= 30) {
    aiScore = Math.max(aiScore, 80);
  } else if (typeMatchScore >= 25 && text.length >= 30) {
    aiScore = Math.max(aiScore, 70);
  } else if (typeMatchScore >= 35 && text.length >= 20) {
    // 对于稍短但关键词很明确的文本
    aiScore = Math.max(aiScore, 70);
  } else if (typeMatchScore >= 25 && text.length >= 20) {
    aiScore = Math.max(aiScore, 60);
  }

  // 如果是图片/PDF（无文本提取），给予适度加分鼓励
  if (mimeType && mimeType.startsWith('image/') && text.length === 0) {
    aiScore = Math.max(aiScore, 40); // 图片最低40分
  }
  if (mimeType && mimeType.includes('pdf') && text.length === 0) {
    aiScore = Math.max(aiScore, 40); // PDF最低40分
  }

  // 如果有风险词，大幅降低分数
  if (hasRiskKeywords) {
    aiScore = Math.min(aiScore, 20);
  }

  // 确保分数在 0-100 范围内
  aiScore = Math.max(0, Math.min(100, aiScore));

  // 4. 确定审核状态
  let reviewStatus;
  if (hasRiskKeywords) {
    reviewStatus = 'rejected';
  } else if (aiScore >= 80) {
    reviewStatus = 'approved';
  } else if (aiScore >= 50) {
    reviewStatus = 'need_manual_review';
  } else {
    // 低于50分但没有明确风险词，需要人工复核
    reviewStatus = 'need_manual_review';
  }

  // 如果文本为空，默认需要人工复核
  if (text.length === 0 && !hasRiskKeywords) {
    reviewStatus = 'need_manual_review';
  }

  // 5. 生成各项内容
  const riskFlags = generateRiskFlags(foundRisks, text, mimeType);
  const highlights = generateHighlights(materialType, text, matchedSubjects);
  const tags = generateTags(materialType, text, matchedSubjects);
  const aiSummary = generateSummary(materialType, title, text, highlights);
  const reviewSuggestion = generateReviewSuggestion(reviewStatus, materialType, title, aiScore, riskFlags, mimeType);

  return {
    aiSummary,
    aiTags: tags,
    aiHighlights: highlights,
    aiRiskFlags: riskFlags,
    aiScore,
    reviewStatus,
    reviewSuggestion
  };
}

module.exports = {
  reviewTeacherMaterial,
  // 导出的内部函数用于测试
  calculateTypeMatchScore,
  checkRiskKeywords,
  calculateSubjectRelevance
};