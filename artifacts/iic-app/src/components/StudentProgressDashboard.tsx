// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, TrendingUp, Target, Zap, Flame, BookOpen,
  AlertTriangle, CheckCircle, BarChart2, Calendar, Award, Brain,
  RefreshCw, Star, Clock, RotateCcw, FileText, Video, Layers,
  ChevronDown, ChevronUp, Trophy
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { getMistakeBankSync, MistakeEntry } from "../utils/mistakeBank";
import { getScoreLog, ScoreLogEntry } from "../utils/scoreSystem";
import { getLevelInfo, getNextLevelInfo } from "../utils/levelSystem";
import { getScoreLogFromFirebase } from "../firebase";
import { getAllBuckets, getDueItems, type TopicBucket } from "../utils/revisionTrackerV2";

interface Props {
  user: any;
  onBack: () => void;
}

const getLocalDate = (offsetDays = 0): string => {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const fmt = (n: number) => n.toLocaleString('en-IN');

const ACTIVITY_LABELS: Record<string, { label: string; color: string; isStudy: boolean }> = {
  MCQ_CORRECT:           { label: 'MCQ Sahi',      color: '#22c55e', isStudy: true },
  MCQ_WRONG:             { label: 'MCQ Galat',      color: '#f87171', isStudy: true },
  MCQ_STREAK_3:          { label: 'MCQ Streak 3x',  color: '#fb923c', isStudy: true },
  MCQ_STREAK_5:          { label: 'MCQ Streak 5x',  color: '#fbbf24', isStudy: true },
  READ_ACTIVE_30S:       { label: 'Notes Padha',    color: '#38bdf8', isStudy: true },
  READ_TTS_HIGHLIGHT:    { label: 'TTS Suna',       color: '#a78bfa', isStudy: true },
  READ_MANUAL_TOPIC_10S: { label: 'Topic Engage',   color: '#fb923c', isStudy: true },
  WRITE_ACTIVE_5MIN:     { label: 'Notes Likha',    color: '#34d399', isStudy: true },
  PDF_MILESTONE:         { label: 'PDF Padha',      color: '#f472b6', isStudy: true },
  READ_NOTES_TIME:       { label: 'Notes Time',     color: '#818cf8', isStudy: true },
  AUDIO_TTS:             { label: 'Audio Suna',     color: '#34d399', isStudy: true },
  NOTES_GK_TTS:          { label: 'GK Suna',        color: '#f472b6', isStudy: true },
  VIDEO:                 { label: 'Video Dekha',    color: '#3b82f6', isStudy: true },
  PDF:                   { label: 'PDF Read',       color: '#8b5cf6', isStudy: true },
  DAILY_LOGIN:           { label: 'Daily Login',    color: '#10b981', isStudy: false },
  MILESTONE:             { label: 'Milestone',      color: '#06b6d4', isStudy: true },
};

const PIE_COLORS = ['#6366f1','#f59e0b','#10b981','#f43f5e','#3b82f6','#a78bfa','#fb923c','#34d399'];

const TIER_META = {
  weak:     { label: 'Weak',     emoji: '🔴', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    pill: 'bg-red-100 text-red-700' },
  average:  { label: 'Average',  emoji: '🟡', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  pill: 'bg-amber-100 text-amber-700' },
  strong:   { label: 'Strong',   emoji: '🟢', bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',pill: 'bg-emerald-100 text-emerald-700' },
  mastered: { label: 'Mastered', emoji: '⭐', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', pill: 'bg-indigo-100 text-indigo-700' },
};

// ─── Revision Hub data helpers ───────────────────────────────────────────────
function getRevisionStats() {
  const all = getAllBuckets();
  const due = getDueItems();
  const todayStart = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();

  const tierCounts = { weak: 0, average: 0, strong: 0, mastered: 0 };
  let completedToday = 0;

  all.forEach(b => {
    const tier = b.lastTier || 'weak';
    if (tierCounts[tier] !== undefined) tierCounts[tier]++;
    // Completed today = nextDueAt was updated today (means session done today)
    if (b.nextDueAt && b.nextDueAt > todayStart && b.lastAttemptAt && b.lastAttemptAt >= todayStart) {
      completedToday++;
    }
  });

  const totalTracked = all.length;
  const dueCount = due.length;

  // Group by subject for the breakdown table
  const bySubject: Record<string, { name: string; weak: number; average: number; strong: number; mastered: number }> = {};
  all.forEach(b => {
    const sub = b.subjectName || b.subjectId || 'Other';
    if (!bySubject[sub]) bySubject[sub] = { name: sub, weak: 0, average: 0, strong: 0, mastered: 0 };
    const tier = b.lastTier || 'weak';
    if (bySubject[sub][tier] !== undefined) bySubject[sub][tier]++;
  });

  const subjectRows = Object.values(bySubject)
    .map(r => ({ ...r, total: r.weak + r.average + r.strong + r.mastered }))
    .sort((a, b) => b.total - a.total);

  return { all, due, tierCounts, totalTracked, dueCount, completedToday, subjectRows };
}

// ─── Today's stats from score log ────────────────────────────────────────────
function getTodayStats(log: ScoreLogEntry[]) {
  const today = getLocalDate(0);
  const todayEntries = log.filter(e => e.date === today);
  const mcqCorrect   = todayEntries.filter(e => e.activity === 'MCQ_CORRECT').length;
  const mcqWrong     = todayEntries.filter(e => e.activity === 'MCQ_WRONG').length;
  const mcqTotal     = mcqCorrect + mcqWrong;
  const accuracy     = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
  const notesRead    = todayEntries.filter(e => e.activity === 'READ_ACTIVE_30S' || e.activity === 'READ_NOTES_TIME').length;
  const videosWatched= todayEntries.filter(e => e.activity === 'VIDEO').length;
  const pdfsRead     = todayEntries.filter(e => e.activity === 'PDF' || e.activity === 'PDF_MILESTONE').length;
  const xpToday      = todayEntries.reduce((s, e) => s + (e.pts || 0), 0);
  const studyActivities = todayEntries.filter(e => ACTIVITY_LABELS[e.activity]?.isStudy).length;
  return { mcqCorrect, mcqWrong, mcqTotal, accuracy, notesRead, videosWatched, pdfsRead, xpToday, studyActivities };
}

export const StudentProgressDashboard: React.FC<Props> = ({ user, onBack }) => {
  const [log, setLog]         = useState<ScoreLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revExpanded, setRevExpanded] = useState(true);

  useEffect(() => {
    const local = getScoreLog(user?.id || '');
    setLog(local);
    setLoading(false);
    if (user?.id) {
      getScoreLogFromFirebase(user.id).then(remote => {
        if (remote.length > local.length) setLog(remote);
      }).catch(() => {});
    }
  }, [user?.id]);

  const mistakes     = useMemo(() => getMistakeBankSync(), []);
  const levelInfo    = useMemo(() => getLevelInfo(user?.totalScore || 0), [user?.totalScore]);
  const nextLevel    = useMemo(() => getNextLevelInfo(user?.totalScore || 0), [user?.totalScore]);
  const xpToNext     = nextLevel ? nextLevel.minScore - (user?.totalScore || 0) : 0;
  const xpProgress   = nextLevel
    ? Math.min(100, Math.round(((user?.totalScore || 0) - levelInfo.minScore) / (nextLevel.minScore - levelInfo.minScore) * 100))
    : 100;

  const rev = useMemo(() => getRevisionStats(), []);

  const todayStats = useMemo(() => getTodayStats(log), [log]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = getLocalDate(-i);
      const dayEntries = log.filter(e => e.date === date);
      const mcqCorrect  = dayEntries.filter(e => e.activity === 'MCQ_CORRECT').length;
      const studyPts    = dayEntries.filter(e => ACTIVITY_LABELS[e.activity]?.isStudy).reduce((s, e) => s + e.pts, 0);
      const pts         = dayEntries.reduce((s, e) => s + e.pts, 0);
      const d           = new Date(date + 'T00:00:00');
      const label       = i === 0 ? 'Aaj' : i === 1 ? 'Kal' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      days.push({ date, label, pts, mcqCorrect, studyPts });
    }
    return days;
  }, [log]);

  const mcqStats = useMemo(() => {
    const correct = log.filter(e => e.activity === 'MCQ_CORRECT').length;
    const wrong   = log.filter(e => e.activity === 'MCQ_WRONG').length;
    const total   = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, wrong, total, accuracy };
  }, [log]);

  const activityBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    log.forEach(e => {
      const meta = ACTIVITY_LABELS[e.activity];
      if (!meta?.isStudy) return;
      map[meta.label] = (map[meta.label] || 0) + e.pts;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0,6);
  }, [log]);

  const weakBySubject = useMemo(() => {
    const map: Record<string, { subject: string; topics: string[]; count: number }> = {};
    mistakes.forEach((m: MistakeEntry) => {
      const sub = m.subjectName || m.board || 'Other';
      if (!map[sub]) map[sub] = { subject: sub, topics: [], count: 0 };
      if (m.topic && !map[sub].topics.includes(m.topic)) map[sub].topics.push(m.topic);
      map[sub].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [mistakes]);

  const studyDays = useMemo(() => {
    const activeDays = new Set(log.filter(e => ACTIVITY_LABELS[e.activity]?.isStudy).map(e => e.date));
    return activeDays.size;
  }, [log]);

  const isCompetition = (user?.classLevel === 'COMPETITION' || user?.board === 'COMPETITION');

  // Revision Hub donut data
  const revDonut = [
    { name: 'Weak',     value: rev.tierCounts.weak,     fill: '#f87171' },
    { name: 'Average',  value: rev.tierCounts.average,  fill: '#fbbf24' },
    { name: 'Strong',   value: rev.tierCounts.strong,   fill: '#34d399' },
    { name: 'Mastered', value: rev.tierCounts.mastered, fill: '#818cf8' },
  ].filter(d => d.value > 0);

  const todaySummary = (() => {
    const parts = [];
    if (todayStats.mcqTotal > 0) parts.push(`${todayStats.mcqTotal} MCQs (${todayStats.accuracy}% accuracy)`);
    if (todayStats.notesRead > 0) parts.push(`${todayStats.notesRead} notes sessions`);
    if (todayStats.videosWatched > 0) parts.push(`${todayStats.videosWatched} videos`);
    if (rev.completedToday > 0) parts.push(`${rev.completedToday} revision topics`);
    if (parts.length === 0) return 'Aaj abhi padhai start nahi ki. Chalo shuru karo! 🚀';
    return `Aaj tumne ${parts.join(', ')} complete kiya. ${todayStats.xpToday > 0 ? `+${todayStats.xpToday} XP kamaya!` : ''} 💪`;
  })();

  return (
    <div className="fixed inset-0 z-[300] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-safe-top pb-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90 transition-all"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black text-slate-900 truncate">📊 Mera Progress</h1>
          <p className="text-[10px] text-slate-500 font-medium">
            {isCompetition ? 'Competition Mode' : `Class ${user?.classLevel || ''} • ${user?.board || ''}`}
          </p>
        </div>
        {loading && <RefreshCw size={16} className="text-slate-400 animate-spin" />}
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="px-4 py-4 space-y-4">

          {/* ── TODAY'S LEARNING CARD ── */}
          <div className="rounded-2xl overflow-hidden border border-indigo-100 shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-white font-black text-sm">Aaj Ka Learning Card</p>
                <p className="text-white/70 text-[10px] font-medium">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-3 grid grid-cols-2 gap-2">
              {[
                { icon: '📚', label: 'Notes Sessions',    value: todayStats.notesRead > 0 ? String(todayStats.notesRead) : '—' },
                { icon: '❓', label: 'MCQs Solve Kiye',   value: todayStats.mcqTotal > 0 ? String(todayStats.mcqTotal) : '—' },
                { icon: '🎯', label: 'MCQ Accuracy',       value: todayStats.mcqTotal > 0 ? `${todayStats.accuracy}%` : '—' },
                { icon: '🔄', label: 'Revision Complete',  value: rev.completedToday > 0 ? String(rev.completedToday) : '—' },
                { icon: '🎥', label: 'Videos Dekhe',       value: todayStats.videosWatched > 0 ? String(todayStats.videosWatched) : '—' },
                { icon: '📄', label: 'PDFs Padhe',         value: todayStats.pdfsRead > 0 ? String(todayStats.pdfsRead) : '—' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-base shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-medium truncate">{label}</p>
                    <p className={`text-sm font-black ${value === '—' ? 'text-slate-300' : 'text-slate-800'}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* XP + Streak row */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 flex items-center justify-between border-t border-orange-100">
              <div className="flex items-center gap-1.5">
                <span className="text-base">⭐</span>
                <p className="text-sm font-black text-amber-700">+{todayStats.xpToday} XP Aaj</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                <p className="text-sm font-black text-orange-700">{user?.streak || 0} Din Streak</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🏆</span>
                <p className="text-sm font-black text-indigo-700">Lv {levelInfo.level}</p>
              </div>
            </div>
            {/* Summary line */}
            <div className="bg-indigo-50 px-4 py-2.5 border-t border-indigo-100">
              <p className="text-[11px] text-indigo-700 font-medium leading-snug">💬 {todaySummary}</p>
            </div>
          </div>

          {/* ── LEVEL & XP ── */}
          <div
            className="rounded-2xl p-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${levelInfo.color}, #1e1b4b)` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{levelInfo.emoji}</span>
              <div className="flex-1">
                <p className="text-xs font-bold opacity-80 uppercase tracking-wide">Level {levelInfo.level}</p>
                <p className="text-lg font-black leading-tight">{levelInfo.label}</p>
                <p className="text-xs opacity-75">Total XP: {fmt(user?.totalScore || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">🔥 {user?.streak || 0}</p>
                <p className="text-[10px] opacity-75 font-bold">Day Streak</p>
              </div>
            </div>
            {nextLevel && (
              <div>
                <div className="flex justify-between text-[10px] font-bold opacity-80 mb-1">
                  <span>Next: Level {nextLevel.level} {nextLevel.emoji}</span>
                  <span>{xpProgress}% • {fmt(xpToNext)} XP baaki</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── REVISION HUB SNAPSHOT ── */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Header row — tap to expand/collapse */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 active:bg-slate-50 transition-colors"
              onClick={() => setRevExpanded(v => !v)}
            >
              <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                <RotateCcw size={15} className="text-violet-500" /> 🔄 Revision Hub Status
              </p>
              <div className="flex items-center gap-2">
                {rev.dueCount > 0 && (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    {rev.dueCount} due
                  </span>
                )}
                {revExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </button>

            {revExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {rev.totalTracked === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-[12px] font-bold text-slate-500">Abhi tak koi MCQ attempt nahi kiya.</p>
                    <p className="text-[11px] text-slate-400">MCQ solve karo — Revision Hub automatically track karega.</p>
                  </div>
                ) : (
                  <>
                    {/* Summary stats */}
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.entries(rev.tierCounts) as [keyof typeof TIER_META, number][]).map(([tier, count]) => {
                        const m = TIER_META[tier];
                        return (
                          <div key={tier} className={`${m.bg} border ${m.border} rounded-xl p-2 text-center`}>
                            <p className="text-base">{m.emoji}</p>
                            <p className={`text-lg font-black ${m.text}`}>{count}</p>
                            <p className={`text-[9px] font-bold ${m.text}`}>{m.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Donut + quick info */}
                    <div className="flex items-center gap-3">
                      {revDonut.length > 0 && (
                        <div className="w-24 h-24 shrink-0">
                          <PieChart width={96} height={96}>
                            <Pie data={revDonut} cx={44} cy={44} innerRadius={28} outerRadius={44} dataKey="value" startAngle={90} endAngle={-270}>
                              {revDonut.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Pie>
                          </PieChart>
                        </div>
                      )}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-600">Total topics tracked</span>
                          <span className="font-black text-slate-800">{rev.totalTracked}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-600">Aaj due hain</span>
                          <span className={`font-black ${rev.dueCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {rev.dueCount > 0 ? `${rev.dueCount} topics` : '✓ Sab done'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-600">Aaj complete kiye</span>
                          <span className="font-black text-violet-600">{rev.completedToday}</span>
                        </div>
                      </div>
                    </div>

                    {/* Due today list */}
                    {rev.dueCount > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-[11px] font-black text-red-700 mb-2 flex items-center gap-1">
                          ⏰ Aaj ka Revision Baaki Hai ({rev.dueCount} topics)
                        </p>
                        <div className="space-y-1.5">
                          {rev.due.slice(0, 4).map((b, i) => {
                            const m = TIER_META[b.lastTier || 'weak'];
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-xs">{m.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-slate-700 truncate">{b.topic}</p>
                                  <p className="text-[9px] text-slate-400 truncate">{b.chapterTitle || b.chapterId}</p>
                                </div>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${m.pill}`}>{m.label}</span>
                              </div>
                            );
                          })}
                          {rev.dueCount > 4 && (
                            <p className="text-[10px] text-red-400 font-medium text-center">+{rev.dueCount - 4} aur topics due hain</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Per-subject breakdown */}
                    {rev.subjectRows.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Subject-wise breakdown</p>
                        {rev.subjectRows.slice(0, 5).map(row => {
                          const total = row.total || 1;
                          return (
                            <div key={row.name} className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[11px] font-black text-slate-800 truncate max-w-[60%]">{row.name}</p>
                                <span className="text-[9px] font-bold text-slate-500">{row.total} topics</span>
                              </div>
                              <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                                {row.weak     > 0 && <div className="bg-red-400"    style={{ width: `${row.weak    /total*100}%` }} />}
                                {row.average  > 0 && <div className="bg-amber-400"  style={{ width: `${row.average /total*100}%` }} />}
                                {row.strong   > 0 && <div className="bg-emerald-400"style={{ width: `${row.strong  /total*100}%` }} />}
                                {row.mastered > 0 && <div className="bg-indigo-400" style={{ width: `${row.mastered/total*100}%` }} />}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {row.weak     > 0 && <span className="text-[8px] text-red-500 font-bold">🔴{row.weak}W</span>}
                                {row.average  > 0 && <span className="text-[8px] text-amber-600 font-bold">🟡{row.average}A</span>}
                                {row.strong   > 0 && <span className="text-[8px] text-emerald-600 font-bold">🟢{row.strong}S</span>}
                                {row.mastered > 0 && <span className="text-[8px] text-indigo-600 font-bold">⭐{row.mastered}M</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── QUICK STATS ── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'MCQ Try Kiye', value: fmt(mcqStats.total), icon: Brain,    color: 'indigo', bg: 'bg-indigo-50' },
              { label: 'Accuracy',      value: `${mcqStats.accuracy}%`, icon: Target, color: 'emerald',bg: 'bg-emerald-50' },
              { label: 'Study Days(30d)',value: `${studyDays}`, icon: Calendar, color: 'amber', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-1`}>
                <Icon size={18} className={`text-${color}-500`} />
                <p className={`text-lg font-black text-${color}-700`}>{value}</p>
                <p className="text-[9px] font-bold text-slate-500 text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* ── MCQ ACCURACY ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-500" /> MCQ Performance (All Time)
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-emerald-700">
                  <span>✅ Sahi: {fmt(mcqStats.correct)}</span>
                  <span>{mcqStats.total > 0 ? Math.round(mcqStats.correct/mcqStats.total*100) : 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mcqStats.total>0 ? mcqStats.correct/mcqStats.total*100 : 0}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-red-500">
                  <span>❌ Galat: {fmt(mcqStats.wrong)}</span>
                  <span>{mcqStats.total > 0 ? Math.round(mcqStats.wrong/mcqStats.total*100) : 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${mcqStats.total>0 ? mcqStats.wrong/mcqStats.total*100 : 0}%` }} />
                </div>
              </div>
              {mcqStats.total > 0 && (
                <div className="w-24 h-24 shrink-0">
                  <PieChart width={96} height={96}>
                    <Pie data={[{ value: mcqStats.correct },{ value: mcqStats.wrong }]} cx={44} cy={44} innerRadius={28} outerRadius={44} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#22c55e" /><Cell fill="#f87171" />
                    </Pie>
                  </PieChart>
                </div>
              )}
            </div>
            {mcqStats.total === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-2">Abhi tak koi MCQ try nahi kiya. Shuru karo! 🚀</p>
            )}
          </div>

          {/* ── LAST 7 DAYS BAR CHART ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <BarChart2 size={15} className="text-blue-500" /> Last 7 Days Activity
            </p>
            {last7Days.some(d => d.pts > 0) ? (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={last7Days} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number, name: string) => [fmt(v), name === 'studyPts' ? 'Study Points' : 'MCQ Sahi']}
                    contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="studyPts"   fill="#6366f1" radius={[4,4,0,0]} name="studyPts" />
                  <Bar dataKey="mcqCorrect" fill="#22c55e" radius={[4,4,0,0]} name="mcqCorrect" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-[11px] text-slate-400 text-center">Koi activity nahi mili pichle 7 din mein.<br/>Padhai shuru karo! 📚</p>
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-600"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> Study Points</span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> MCQ Sahi</span>
            </div>
          </div>

          {/* ── STREAK ── */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-4">
            <p className="text-sm font-black text-orange-800 mb-2 flex items-center gap-2">
              <Flame size={15} className="text-orange-500" /> Streak & Consistency
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-orange-600">🔥 {user?.streak || 0}</p>
                <p className="text-[10px] font-bold text-slate-500">Current Streak</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-amber-600">⭐ {user?.longestStreak || user?.streak || 0}</p>
                <p className="text-[10px] font-bold text-slate-500">Longest Streak</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] font-black text-orange-700 mb-1.5">Last 7 Days:</p>
              <div className="flex gap-1">
                {last7Days.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={`w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${d.pts > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                      {d.pts > 0 ? '✓' : '·'}
                    </div>
                    <span className="text-[8px] font-bold text-slate-400">{d.label.slice(0,2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── STUDY TYPE BREAKDOWN ── */}
          {activityBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-500" /> Padhai Ka Tarika
              </p>
              <div className="space-y-2">
                {activityBreakdown.map((item, i) => {
                  const max = activityBreakdown[0].value;
                  const pct = Math.round((item.value / max) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                        <span>{item.name}</span>
                        <span>{fmt(item.value)} pts</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── WEAK TOPICS ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" /> Weak Topics ({mistakes.length} mistakes)
            </p>
            <p className="text-[10px] text-slate-400 mb-3">Yeh topics dobara practice karo 💪</p>
            {weakBySubject.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-1">🎉</p>
                <p className="text-[11px] font-bold text-emerald-600">Koi weak topic nahi! Bahut achha!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakBySubject.slice(0, 5).map(sub => (
                  <div key={sub.subject} className="bg-red-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-black text-red-700">{sub.subject}</p>
                      <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{sub.count} mistakes</span>
                    </div>
                    {sub.topics.slice(0,3).map(t => (
                      <p key={t} className="text-[10px] text-red-500 font-medium">• {t}</p>
                    ))}
                    {sub.topics.length > 3 && (
                      <p className="text-[9px] text-red-400 font-medium">+{sub.topics.length - 3} aur topics...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── TIP ── */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-sm font-black text-indigo-800 mb-2 flex items-center gap-2">
              <BookOpen size={15} className="text-indigo-500" />
              {isCompetition ? '🏆 Competition Tip' : `📚 Class ${user?.classLevel} Tip`}
            </p>
            {isCompetition ? (
              <div className="space-y-1.5">
                <p className="text-[11px] text-indigo-700 font-medium">• Roz 50+ MCQ practice karo</p>
                <p className="text-[11px] text-indigo-700 font-medium">• Revision Hub ke weak topics pe 2x focus karo</p>
                <p className="text-[11px] text-indigo-700 font-medium">• Lucent GK regular revision karo</p>
                <p className="text-[11px] text-indigo-700 font-medium">• Current Affairs daily padhna mat bhulo</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-[11px] text-indigo-700 font-medium">• MCQ accuracy 80%+ rakho</p>
                <p className="text-[11px] text-indigo-700 font-medium">• Revision Hub ke due topics roz complete karo</p>
                <p className="text-[11px] text-indigo-700 font-medium">• Streak mat todna — consistency key hai</p>
                <p className="text-[11px] text-indigo-700 font-medium">• Roz thodi padhai ek baar mein zyada se better hai</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
