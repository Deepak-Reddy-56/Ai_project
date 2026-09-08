import { LEARNING_DATA, LANGUAGES } from '../data/learningLibraryData';

export const PERSONALIZATION_STORAGE_KEY = 'code_companion_personalization_v1';
export const LEARNING_ACTIVITY_KEY = 'code_companion_learning_activity_v1';

const DEFAULT_PROFILE = {
  version: 1,
  goal: 'interview',
  language: 'python',
  level: 'beginner',
  dailyMinutes: 30,
  assessmentComplete: false,
  assessmentScores: {},
  createdAt: null,
  updatedAt: null,
};

const GOALS = {
  interview: {
    label: 'Interview & Placements',
    description: 'Build problem-solving confidence, DSA fundamentals, and interview readiness.',
  },
  projects: {
    label: 'Build Real Projects',
    description: 'Learn the concepts you need to build useful applications and portfolio projects.',
  },
  fundamentals: {
    label: 'Master Programming Fundamentals',
    description: 'Build a strong foundation before moving into advanced programming topics.',
  },
  career: {
    label: 'Career Skill Building',
    description: 'Develop practical language and software-development skills for a target role.',
  },
};

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const DAILY_MINUTES = [15, 30, 60];

export function getGoalOptions() {
  return Object.entries(GOALS).map(([id, value]) => ({ id, ...value }));
}

export function getLevelOptions() {
  return LEVELS.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
  }));
}

export function getDailyMinuteOptions() {
  return DAILY_MINUTES;
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  const normalized = {
    ...DEFAULT_PROFILE,
    ...profile,
    language: LEARNING_DATA[profile?.language] ? profile.language : DEFAULT_PROFILE.language,
    level: LEVELS.includes(profile?.level) ? profile.level : DEFAULT_PROFILE.level,
    dailyMinutes: DAILY_MINUTES.includes(Number(profile?.dailyMinutes)) ? Number(profile.dailyMinutes) : DEFAULT_PROFILE.dailyMinutes,
    updatedAt: new Date().toISOString(),
  };
  if (!normalized.createdAt) normalized.createdAt = new Date().toISOString();
  localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadActivity() {
  try {
    const raw = localStorage.getItem(LEARNING_ACTIVITY_KEY);
    if (!raw) return { moduleViews: {}, sessions: [], lastActiveAt: null };
    const parsed = JSON.parse(raw);
    return {
      moduleViews: parsed?.moduleViews && typeof parsed.moduleViews === 'object' ? parsed.moduleViews : {},
      sessions: Array.isArray(parsed?.sessions) ? parsed.sessions.slice(-50) : [],
      lastActiveAt: parsed?.lastActiveAt || null,
    };
  } catch {
    return { moduleViews: {}, sessions: [], lastActiveAt: null };
  }
}

export function recordModuleView(moduleId) {
  const activity = loadActivity();
  const current = activity.moduleViews[moduleId] || { views: 0, lastViewedAt: null };
  activity.moduleViews[moduleId] = {
    views: current.views + 1,
    lastViewedAt: new Date().toISOString(),
  };
  activity.lastActiveAt = new Date().toISOString();
  localStorage.setItem(LEARNING_ACTIVITY_KEY, JSON.stringify(activity));
}

export function recordLearningSession(durationMinutes = 0) {
  const activity = loadActivity();
  activity.sessions.push({
    at: new Date().toISOString(),
    durationMinutes: Math.max(0, Number(durationMinutes) || 0),
  });
  activity.lastActiveAt = new Date().toISOString();
  localStorage.setItem(LEARNING_ACTIVITY_KEY, JSON.stringify(activity));
}

export function getLanguageConfig(languageId) {
  return LANGUAGES.find((language) => language.id === languageId) || LANGUAGES[0];
}

export function getModules(languageId) {
  return LEARNING_DATA[languageId] || LEARNING_DATA.python || [];
}

export function getCompletedIds(languageId) {
  try {
    const raw = localStorage.getItem('code_companion_learning_progress_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.[languageId]) ? parsed[languageId] : [];
  } catch {
    return [];
  }
}

function moduleBasePriority(module, index, completedSet, assessmentScores, activity, profile) {
  let score = 0;
  const mastery = Number(assessmentScores[module.id] ?? 0);
  const views = Number(activity.moduleViews[module.id]?.views ?? 0);
  const completed = completedSet.has(module.id);

  if (!completed) score += 50;
  if (mastery > 0 && mastery < 70) score += (70 - mastery) * 1.2;
  if (views >= 3 && mastery < 80) score += 12;
  if (mastery >= 85) score -= 35;
  if (index === 0 && !completed) score += 10;

  if (profile.goal === 'interview') {
    if (/loop|function|data structure|object|error|condition|operator/i.test(module.title)) score += 8;
  }
  if (profile.goal === 'projects') {
    if (/function|data structure|object|error|input|output/i.test(module.title)) score += 8;
  }
  if (profile.goal === 'fundamentals') {
    if (index < 6) score += 8;
  }
  if (profile.goal === 'career') {
    if (/function|data structure|object|error|debug/i.test(module.title)) score += 8;
  }

  return score;
}

export function buildPersonalizedPlan(profile, progressOverrides = {}) {
  const modules = getModules(profile.language);
  const completedIds = progressOverrides.completedIds || getCompletedIds(profile.language);
  const completedSet = new Set(completedIds);
  const assessmentScores = progressOverrides.assessmentScores || profile.assessmentScores || {};
  const activity = loadActivity();

  const ranked = modules
    .map((module, index) => ({
      module,
      index,
      completed: completedSet.has(module.id),
      mastery: Number(assessmentScores[module.id] ?? (completedSet.has(module.id) ? 70 : 0)),
      score: moduleBasePriority(module, index, completedSet, assessmentScores, activity, profile),
    }))
    .sort((a, b) => b.score - a.score);

  const nextModule = ranked.find((item) => !item.completed) || ranked[0] || null;
  const needsReview = ranked
    .filter((item) => item.completed && item.mastery < 75)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);
  const recommended = ranked
    .filter((item) => !nextModule || item.module.id !== nextModule.module.id)
    .slice(0, 5);

  const completedCount = modules.filter((module) => completedSet.has(module.id)).length;
  const averageMastery = modules.length
    ? Math.round(
        modules.reduce((sum, module) => sum + Number(assessmentScores[module.id] ?? (completedSet.has(module.id) ? 70 : 0)), 0) / modules.length,
      )
    : 0;

  let currentStreak = 0;
  const activityDates = new Set(
    activity.sessions.map((session) => String(session.at || '').slice(0, 10)).filter(Boolean),
  );
  const cursor = new Date();
  while (activityDates.has(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    nextModule: nextModule?.module || null,
    needsReview: needsReview.map((item) => ({ ...item.module, mastery: item.mastery })),
    recommendations: recommended.map((item) => ({ ...item.module, mastery: item.mastery, completed: item.completed })),
    completedCount,
    totalModules: modules.length,
    progressPercent: modules.length ? Math.round((completedCount / modules.length) * 100) : 0,
    averageMastery,
    currentStreak,
  };
}

export function createAssessmentQuestions(languageId, count = 6) {
  const modules = getModules(languageId);
  if (!modules.length) return [];

  const candidates = modules.slice(0, Math.min(modules.length, 8));
  const questions = candidates.map((module, index) => {
    const distractors = candidates
      .filter((candidate) => candidate.id !== module.id)
      .slice(0, 3)
      .map((candidate) => candidate.title.replace(/^Module \d+ — /, ''));

    return {
      id: `assessment-${module.id}`,
      moduleId: module.id,
      question: `Which topic best matches this description? ${module.description}`,
      answer: module.title.replace(/^Module \d+ — /, ''),
      options: [
        module.title.replace(/^Module \d+ — /, ''),
        ...distractors,
      ].sort((a, b) => a.localeCompare(b)),
      explanation: module.summary,
      index,
    };
  });

  return questions.slice(0, count);
}

export function applyAssessmentResult(profile, results) {
  const updatedScores = { ...(profile.assessmentScores || {}) };
  for (const result of results) {
    updatedScores[result.moduleId] = result.correct ? Math.min(100, Math.max(60, Number(updatedScores[result.moduleId] || 0) + 25)) : Math.max(20, Number(updatedScores[result.moduleId] || 50) - 20);
  }
  return saveProfile({
    ...profile,
    assessmentComplete: true,
    assessmentScores: updatedScores,
  });
}

export function getPersonalizationSummary(profile, plan) {
  const language = getLanguageConfig(profile.language);
  if (!plan.nextModule) {
    return `You have completed the ${language.label} roadmap. Keep your skills sharp with review and challenge sessions.`;
  }
  if (plan.needsReview.length) {
    return `Your next step is ${plan.nextModule.title.replace(/^Module \d+ — /, '')}. I also found ${plan.needsReview.length} completed topic${plan.needsReview.length === 1 ? '' : 's'} that could use a quick review.`;
  }
  return `Your path is focused on ${GOALS[profile.goal]?.label.toLowerCase() || 'your goal'}. Start with ${plan.nextModule.title.replace(/^Module \d+ — /, '')}, then continue through the recommended sequence.`;
}
