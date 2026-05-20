const { User, TeacherProfile, StudentProfile } = require('../models');
const { askClaudeForTutorAdvice } = require('./claudeCodeClient');

const MAX_TEACHER_CANDIDATES = 30;
const MAX_RECOMMENDED_TEACHERS = 3;

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function compactText(value, maxLength = 180) {
  if (!value) return '';
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function toTeacherCandidate(profile) {
  const teacher = profile.toJSON ? profile.toJSON() : profile;
  const subjects = safeArray(teacher.subjects);
  const tags = safeArray(teacher.tags);

  return {
    userId: Number(teacher.userId),
    fullName: teacher.fullName,
    gender: teacher.gender,
    education: teacher.education,
    teachingExperience: Number(teacher.teachingExperience || 0),
    hourlyRate: teacher.hourlyRate === null || teacher.hourlyRate === undefined
      ? null
      : Number(teacher.hourlyRate),
    subjects,
    rating: Number(teacher.rating || 0),
    totalReviews: Number(teacher.totalReviews || 0),
    tags,
    highlights: compactText(teacher.highlights, 120),
    introduction: compactText(teacher.introduction, 220)
  };
}

function buildTeacherCard(profile, reason = '') {
  const teacher = profile.toJSON ? profile.toJSON() : profile;
  const subjects = safeArray(teacher.subjects);
  const tags = safeArray(teacher.tags);
  const highlights = [];

  if (Number(teacher.rating || 0) >= 4.8) {
    highlights.push('\u9ad8\u8bc4\u5206');
  }

  if (Number(teacher.teachingExperience || 0) >= 3) {
    highlights.push(`${teacher.teachingExperience}\u5e74\u7ecf\u9a8c`);
  }

  if (teacher.education) {
    highlights.push(teacher.education);
  }

  if (reason) {
    highlights.push(reason);
  } else if (tags.length > 0) {
    highlights.push(tags.slice(0, 2).join(' / '));
  }

  return {
    type: 'teacher_card',
    userId: Number(teacher.userId),
    fullName: teacher.fullName,
    education: teacher.education,
    teachingExperience: teacher.teachingExperience,
    hourlyRate: teacher.hourlyRate,
    subjects,
    rating: Number(teacher.rating || 0),
    totalReviews: Number(teacher.totalReviews || 0),
    introduction: compactText(teacher.introduction, 100),
    highlight: highlights.filter(Boolean).join(' \u00b7 ')
  };
}

async function getTeacherProfiles() {
  return TeacherProfile.findAll({
    where: { isOnline: true },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'status'],
      where: { status: 'active' }
    }],
    order: [
      ['rating', 'DESC'],
      ['totalReviews', 'DESC'],
      ['teachingExperience', 'DESC']
    ],
    limit: MAX_TEACHER_CANDIDATES
  });
}

async function getStudentContext(user) {
  if (!user || user.role !== 'student') {
    return null;
  }

  const profile = await StudentProfile.findOne({
    where: { userId: user.userId },
    attributes: ['fullName', 'gender', 'grade']
  });

  return {
    userId: user.userId,
    username: user.username,
    role: user.role,
    profile: profile ? profile.toJSON() : null
  };
}

function normalizeRecommendedIds(ids) {
  if (!Array.isArray(ids)) return [];

  const unique = [];
  for (const id of ids) {
    const parsed = Number(id);
    if (Number.isInteger(parsed) && !unique.includes(parsed)) {
      unique.push(parsed);
    }
    if (unique.length >= MAX_RECOMMENDED_TEACHERS) break;
  }

  return unique;
}

function extractReasonMap(recommendationReasons) {
  if (!recommendationReasons || typeof recommendationReasons !== 'object') {
    return new Map();
  }

  const entries = Object.entries(recommendationReasons)
    .map(([key, value]) => [Number(key), compactText(value, 40)])
    .filter(([key, value]) => Number.isInteger(key) && value);

  return new Map(entries);
}

async function processMessage(userMessage, conversationState, user) {
  const teacherProfiles = await getTeacherProfiles();
  const includeTeacherCatalog = !conversationState.teacherCatalogSent;
  const teacherCandidates = includeTeacherCatalog
    ? teacherProfiles.map(toTeacherCandidate)
    : [];
  const studentContext = await getStudentContext(user);
  const history = Array.isArray(conversationState.messages)
    ? conversationState.messages.slice(-8)
    : [];

  const claudeResult = await askClaudeForTutorAdvice({
    message: userMessage,
    history,
    studentContext,
    teacherCandidates,
    includeTeacherCatalog,
    claudeSessionId: conversationState.claudeSessionId,
    resumeClaudeSession: Boolean(conversationState.claudeSessionStarted)
  });

  const recommendedIds = normalizeRecommendedIds(claudeResult.recommendedTeacherIds);
  const reasonMap = extractReasonMap(claudeResult.recommendationReasons);
  const profileByUserId = new Map(
    teacherProfiles.map(profile => [Number(profile.userId), profile])
  );

  const cards = recommendedIds
    .map(id => {
      const profile = profileByUserId.get(id);
      return profile ? buildTeacherCard(profile, reasonMap.get(id)) : null;
    })
    .filter(Boolean);

  const nextState = {
    ...conversationState,
    stage: claudeResult.needsMoreInfo ? 'clarifying' : 'recommended',
    searchCriteria: claudeResult.searchCriteria || {},
    lastRecommendedTeacherIds: cards.map(card => card.userId),
    claudeSessionId: claudeResult.claudeSessionId || conversationState.claudeSessionId,
    claudeSessionStarted: Boolean(claudeResult.claudeSessionId || conversationState.claudeSessionStarted),
    teacherCatalogSent: Boolean(conversationState.teacherCatalogSent || includeTeacherCatalog)
  };

  return {
    text: claudeResult.text || '\u6211\u5df2\u7ecf\u6536\u5230\u60a8\u7684\u9700\u6c42\uff0c\u53ef\u4ee5\u518d\u8865\u5145\u4e00\u4e0b\u5b66\u751f\u5e74\u7ea7\u3001\u79d1\u76ee\u6216\u9884\u7b97\u5417\uff1f',
    cards,
    state: nextState,
    claudeSessionId: nextState.claudeSessionId
  };
}

module.exports = {
  processMessage
};
