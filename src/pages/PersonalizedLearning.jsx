import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  LockKeyhole,
  RotateCcw,
  Target,
  Trophy,
} from 'lucide-react';
import {
  applyAssessmentResult,
  buildPersonalizedPlan,
  createAssessmentQuestions,
  getDailyMinuteOptions,
  getGoalOptions,
  getLanguageConfig,
  getLanguageOptions,
  getLevelOptions,
  getPersonalizationSummary,
  loadProfile,
  recordLearningSession,
  saveProfile,
} from '../services/personalizationService';
import { LANGUAGES } from '../data/learningLibraryData';
import './personalizedLearning.css';

function Setup({ onComplete }) {
  const [goal, setGoal] = useState('interview');
  const [language, setLanguage] = useState('python');
  const [level, setLevel] = useState('beginner');
  const [dailyMinutes, setDailyMinutes] = useState(30);

  const submit = () => {
    onComplete(saveProfile({ goal, language, level, dailyMinutes, assessmentComplete: false, assessmentScores: {} }));
  };

  return (
    <div className="personalized-shell setup-shell">
      <div className="setup-panel">
        <span className="eyebrow">PERSONALIZED LEARNING</span>
        <h1>Build a path around how you want to learn.</h1>
        <p className="setup-lead">Choose your destination, starting point, and daily pace. The roadmap will adapt as you learn.</p>

        <div className="setup-grid">
          <label className="field-card">
            <span>Primary goal</span>
            <select value={goal} onChange={(event) => setGoal(event.target.value)}>
              {getGoalOptions().map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <small>{getGoalOptions().find((option) => option.id === goal)?.description}</small>
          </label>

          <label className="field-card">
            <span>Learning language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {getLanguageOptions().map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <small>Recommendations and assessments will use this language.</small>
          </label>

          <label className="field-card">
            <span>Current level</span>
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              {getLevelOptions().map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <small>Used to set the initial difficulty and assessment starting point.</small>
          </label>

          <label className="field-card">
            <span>Daily learning time</span>
            <select value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value))}>
              {getDailyMinuteOptions().map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
            </select>
            <small>Your plan is sized to this daily target.</small>
          </label>
        </div>

        <button className="primary-action" onClick={submit}>
          Create my learning path <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Assessment({ profile, onComplete }) {
  const questions = useMemo(() => createAssessmentQuestions(profile.language, 6), [profile.language]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const current = questions[index];
  if (!current) {
    onComplete([]);
    return null;
  }

  const choose = (option) => {
    setAnswers((previous) => ({ ...previous, [current.id]: option }));
  };

  const submitCurrent = () => {
    if (!answers[current.id]) return;
    if (index < questions.length - 1) {
      setSubmitted(false);
      setIndex((previous) => previous + 1);
      return;
    }
    const results = questions.map((question) => ({
      moduleId: question.moduleId,
      correct: answers[question.id] === question.answer,
    }));
    onComplete(results);
  };

  const isLast = index === questions.length - 1;
  const selected = answers[current.id];

  return (
    <div className="personalized-shell">
      <div className="assessment-panel">
        <div className="assessment-topline">
          <span className="eyebrow">BASELINE ASSESSMENT</span>
          <span className="assessment-count">{index + 1} / {questions.length}</span>
        </div>
        <div className="assessment-progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        <h1>Let’s find where you should start.</h1>
        <p className="assessment-question">{current.question}</p>

        <div className="assessment-options">
          {current.options.map((option) => (
            <button
              key={option}
              className={`assessment-option ${selected === option ? 'selected' : ''}`}
              onClick={() => { choose(option); setSubmitted(true); }}
            >
              <span className="option-radio">{selected === option ? <Check size={14} /> : null}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>

        {submitted && selected && (
          <div className="assessment-hint">
            Choose your answer, then continue. We use the pattern of your answers to set review priority rather than treating one mistake as failure.
          </div>
        )}

        <div className="assessment-footer">
          <span>{getLanguageConfig(profile.language).label} assessment</span>
          <button className="primary-action compact" disabled={!selected} onClick={submitCurrent}>
            {isLast ? 'Finish assessment' : 'Next question'} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ title, eyebrow, module, actionLabel, onAction, tone = '' }) {
  if (!module) return null;
  return (
    <div className={`plan-card ${tone}`}>
      <div className="plan-card-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{module.description}</p>
      </div>
      <button className="secondary-action" onClick={onAction}>
        {actionLabel} <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default function PersonalizedLearning() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const nextPlan = buildPersonalizedPlan(profile);
    setPlan(nextPlan);
  }, [profile]);

  const progressStorage = 'code_companion_learning_progress_v1';
  const markComplete = (moduleId) => {
    try {
      const raw = localStorage.getItem(progressStorage);
      const parsed = raw ? JSON.parse(raw) : {};
      const ids = Array.isArray(parsed?.[profile.language]) ? parsed[profile.language] : [];
      if (!ids.includes(moduleId)) {
        parsed[profile.language] = [...ids, moduleId];
        localStorage.setItem(progressStorage, JSON.stringify(parsed));
      }
      recordLearningSession(Math.min(profile.dailyMinutes, 15));
      setPlan(buildPersonalizedPlan(profile, { completedIds: parsed[profile.language] }));
    } catch {
      // The learning experience should still work if browser storage is unavailable.
    }
  };

  const handleAssessment = (results) => {
    const next = applyAssessmentResult(profile, results);
    setProfile(next);
    setAssessmentMode(false);
  };

  if (!profile.createdAt) return <Setup onComplete={setProfile} />;
  if (!profile.assessmentComplete && assessmentMode) return <Assessment profile={profile} onComplete={handleAssessment} />;

  const language = getLanguageConfig(profile.language);
  const summary = plan ? getPersonalizationSummary(profile, plan) : '';
  const completedMap = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(progressStorage) || '{}');
      return Array.isArray(parsed?.[profile.language]) ? parsed[profile.language] : [];
    } catch { return []; }
  })();

  return (
    <div className="personalized-page">
      <header className="personalized-header">
        <div>
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h1>Good to see you back.</h1>
          <p>{summary}</p>
        </div>
        <button className="secondary-action" onClick={() => setProfile(saveProfile({ ...profile, assessmentComplete: false }))}>
          <RotateCcw size={15} /> Retake assessment
        </button>
      </header>

      <section className="profile-strip">
        <div className="profile-main">
          <div className="profile-icon"><Target size={18} /></div>
          <div>
            <strong>{language.label}</strong>
            <span>{profile.level} · {profile.dailyMinutes} min/day</span>
          </div>
        </div>
        <div className="profile-stat"><span>Roadmap</span><strong>{plan?.progressPercent || 0}%</strong></div>
        <div className="profile-stat"><span>Mastery</span><strong>{plan?.averageMastery || 0}%</strong></div>
        <div className="profile-stat"><span>Streak</span><strong><Flame size={14} /> {plan?.currentStreak || 0}d</strong></div>
      </section>

      <section className="today-grid">
        <PlanCard
          eyebrow="NEXT UP"
          title="Continue your path"
          module={plan?.nextModule}
          actionLabel="Open lesson"
          onAction={() => markComplete(plan?.nextModule?.id)}
        />
        {plan?.needsReview?.[0] && (
          <PlanCard
            eyebrow="REVIEW"
            title="Strengthen a weak spot"
            module={plan.needsReview[0]}
            actionLabel="Review topic"
            tone="review-card"
            onAction={() => markComplete(plan.needsReview[0].id)}
          />
        )}
      </section>

      <section className="dashboard-grid">
        <div className="section-card path-card">
          <div className="section-card-header">
            <div>
              <span className="eyebrow">CURATED SEQUENCE</span>
              <h2>Your adaptive roadmap</h2>
            </div>
            <BookOpen size={18} />
          </div>
          <div className="roadmap-list">
            {plan?.recommendations?.map((module, index) => {
              const isComplete = completedMap.includes(module.id);
              return (
                <button key={module.id} className={`roadmap-row ${isComplete ? 'completed' : ''}`} onClick={() => markComplete(module.id)}>
                  <span className="roadmap-number">{isComplete ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span>
                  <span className="roadmap-copy">
                    <strong>{module.title.replace(/^Module \d+ — /, '')}</strong>
                    <small>{module.description}</small>
                  </span>
                  <span className="roadmap-status">{isComplete ? 'Done' : 'Open'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div>
              <span className="eyebrow">RECOMMENDATIONS</span>
              <h2>Why these are next</h2>
            </div>
            <Trophy size={18} />
          </div>
          <div className="reason-list">
            <div><strong>Goal aligned</strong><span>Your path is weighted toward {profile.goal === 'interview' ? 'interview and problem-solving' : profile.goal === 'projects' ? 'project-building' : 'your selected goal'}.</span></div>
            <div><strong>Mastery aware</strong><span>Topics below 75% mastery are pushed back into review before you move too far ahead.</span></div>
            <div><strong>Paced to you</strong><span>Your daily plan is sized to {profile.dailyMinutes} minutes instead of a fixed course schedule.</span></div>
          </div>
        </div>

        <div className="section-card review-section">
          <div className="section-card-header">
            <div>
              <span className="eyebrow">SPACED REVIEW</span>
              <h2>Needs attention</h2>
            </div>
            <RotateCcw size={18} />
          </div>
          {plan?.needsReview?.length ? (
            <div className="review-list">
              {plan.needsReview.map((module) => (
                <button key={module.id} onClick={() => markComplete(module.id)}>
                  <span>{module.title.replace(/^Module \d+ — /, '')}</span>
                  <span>{module.mastery}% mastery <ChevronRight size={14} /></span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">No review topics yet. Complete the assessment and more lessons to build a stronger mastery profile.</div>
          )}
        </div>

        <div className="section-card session-card">
          <div className="section-card-header">
            <div>
              <span className="eyebrow">TODAY'S SESSION</span>
              <h2>{profile.dailyMinutes}-minute focus</h2>
            </div>
            <Clock3 size={18} />
          </div>
          <div className="session-steps">
            <div><span>01</span><strong>Learn</strong><small>Concept explanation</small></div>
            <div><span>02</span><strong>Practice</strong><small>Targeted example</small></div>
            <div><span>03</span><strong>Check</strong><small>Quick mastery review</small></div>
          </div>
          <p className="session-note">Short, focused sessions keep the roadmap moving without forcing you through content you already know.</p>
        </div>
      </section>

      {!profile.assessmentComplete && (
        <section className="assessment-banner">
          <div>
            <span className="eyebrow">MAKE IT MORE PRECISE</span>
            <h2>Take the baseline assessment</h2>
            <p>Six questions are enough to move your roadmap from a generic sequence to an adaptive starting point.</p>
          </div>
          <button className="primary-action" onClick={() => setAssessmentMode(true)}>Start assessment <ArrowRight size={15} /></button>
        </section>
      )}
    </div>
  );
}
