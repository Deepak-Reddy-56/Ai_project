import { LEARNING_DATA, LANGUAGES } from '../data/learningLibraryData';

export const PERSONALIZATION_STORAGE_KEY = 'code_companion_personalization_v1';
export const LEARNING_ACTIVITY_KEY = 'code_companion_learning_activity_v1';

const DEFAULT_PROFILE = {
  version: 2,
  goal: 'interview',
  language: 'python',
  level: 'beginner',
  dailyMinutes: 30,
  assessmentComplete: false,
  assessmentScores: {},
  assessmentHistory: [],
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
  return LEVELS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }));
}

export function getDailyMinuteOptions() {
  return DAILY_MINUTES;
}

export function getLanguageOptions() {
  return LANGUAGES.map(({ id, label }) => ({ id, label }));
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...parsed, assessmentHistory: Array.isArray(parsed.assessmentHistory) ? parsed.assessmentHistory : [] };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  const requestedLanguage = profile?.language || DEFAULT_PROFILE.language;
  const requestedLevel = profile?.level || DEFAULT_PROFILE.level;
  const requestedMinutes = Number(profile?.dailyMinutes);
  const normalized = {
    ...DEFAULT_PROFILE,
    ...profile,
    language: LEARNING_DATA[requestedLanguage] ? requestedLanguage : DEFAULT_PROFILE.language,
    level: LEVELS.includes(requestedLevel) ? requestedLevel : DEFAULT_PROFILE.level,
    dailyMinutes: DAILY_MINUTES.includes(requestedMinutes) ? requestedMinutes : DEFAULT_PROFILE.dailyMinutes,
    assessmentHistory: Array.isArray(profile?.assessmentHistory) ? profile.assessmentHistory : [],
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

  if (profile.goal === 'interview' && /loop|function|data structure|object|error|condition|operator/i.test(module.title)) score += 8;
  if (profile.goal === 'projects' && /function|data structure|object|error|input|output/i.test(module.title)) score += 8;
  if (profile.goal === 'fundamentals' && index < 6) score += 8;
  if (profile.goal === 'career' && /function|data structure|object|error|debug/i.test(module.title)) score += 8;

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
    .filter((item) => item.mastery > 0 && item.mastery < 75)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);
  const recommended = ranked
    .filter((item) => !nextModule || item.module.id !== nextModule.module.id)
    .slice(0, 5);

  const completedCount = modules.filter((module) => completedSet.has(module.id)).length;
  const averageMastery = modules.length
    ? Math.round(modules.reduce((sum, module) => sum + Number(assessmentScores[module.id] ?? (completedSet.has(module.id) ? 70 : 0)), 0) / modules.length)
    : 0;

  let currentStreak = 0;
  const activityDates = new Set(activity.sessions.map((session) => String(session.at || '').slice(0, 10)).filter(Boolean));
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

function takeDistractors(pool, correct, count = 3) {
  return pool.filter((item) => item !== correct).slice(0, count);
}

function createConceptQuestion(module, allConcepts, index) {
  const concept = module.concepts?.[index % module.concepts.length];
  if (!concept) return null;
  const correct = concept.desc;
  const distractors = takeDistractors(allConcepts.map((item) => item.desc), correct, 3);
  return {
    id: `assessment-${module.id}-concept-${index}`,
    moduleId: module.id,
    type: 'concept',
    question: `Which statement about ${concept.name} is correct?`,
    answer: correct,
    options: [correct, ...distractors],
    explanation: `${concept.name}: ${concept.desc}`,
  };
}

function createModuleQuestion(module, allModules) {
  const correct = module.summary;
  const distractors = takeDistractors(allModules.map((item) => item.summary), correct, 3);
  return {
    id: `assessment-${module.id}-summary`,
    moduleId: module.id,
    type: 'understanding',
    question: `Which explanation best matches ${module.title.replace(/^Module \d+ — /, '')}?`,
    answer: correct,
    options: [correct, ...distractors],
    explanation: correct,
  };
}

export function createAssessmentQuestions(languageId, count = 10) {
  const modules = getModules(languageId);
  if (!modules.length) return [];

  const allConcepts = modules.flatMap((module) => (module.concepts || []).map((concept) => ({ ...concept, moduleId: module.id })));
  const pool = [];

  modules.forEach((module) => {
    const conceptQuestion = createConceptQuestion(module, allConcepts, 0);
    const understandingQuestion = createModuleQuestion(module, modules);
    if (conceptQuestion) pool.push(conceptQuestion);
    pool.push(understandingQuestion);
  });

  // Keep the assessment representative: every module gets priority before we repeat a module.
  const representative = modules.map((module) => pool.find((question) => question.moduleId === module.id)).filter(Boolean);
  const remaining = pool.filter((question) => !representative.includes(question));
  const selected = [...representative, ...remaining].slice(0, Math.max(1, Math.min(count, pool.length)));

  // Deterministic shuffle keeps the assessment stable on rerender while preventing all correct answers from being first.
  return selected.map((question, questionIndex) => {
    const offset = (questionIndex * 2 + 1) % question.options.length;
    const rotated = [...question.options.slice(offset), ...question.options.slice(0, offset)];
    return { ...question, options: rotated };
  });
}

export function applyAssessmentResult(profile, results) {
  const updatedScores = { ...(profile.assessmentScores || {}) };
  const correctCount = results.filter((result) => result.correct).length;
  const total = results.length || 1;
  const scorePercent = Math.round((correctCount / total) * 100);
  const now = new Date().toISOString();

  for (const result of results) {
    const current = Number(updatedScores[result.moduleId] || 0);
    updatedScores[result.moduleId] = result.correct
      ? Math.min(100, Math.max(65, current + 20))
      : Math.max(20, current - 15 || 35);
  }

  const history = Array.isArray(profile.assessmentHistory) ? profile.assessmentHistory : [];
  return saveProfile({
    ...profile,
    version: 2,
    assessmentComplete: true,
    assessmentScores: updatedScores,
    assessmentHistory: [...history.slice(-9), { at: now, scorePercent, correctCount, total, results }],
  });
}

export function getPersonalizationSummary(profile, plan) {
  const language = getLanguageConfig(profile.language);
  if (!plan.nextModule) return `You have completed the ${language.label} roadmap. Keep your skills sharp with review and challenge sessions.`;
  if (plan.needsReview.length) return `Your next step is ${plan.nextModule.title.replace(/^Module \d+ — /, '')}. I also found ${plan.needsReview.length} topic${plan.needsReview.length === 1 ? '' : 's'} that need reinforcement.`;
  return `Your path is focused on ${GOALS[profile.goal]?.label.toLowerCase() || 'your goal'}. Start with ${plan.nextModule.title.replace(/^Module \d+ — /, '')}, then continue through the recommended sequence.`;
}
