const fs = require('fs');
const path = 'artifacts/iic-study-app/src/components/RoutineRevisionBadge.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove the "if (!status) return null;"
code = code.replace("  // Nothing to show if no bucket yet (lesson completed today — due tomorrow)\n  if (!status) return null;\n\n", "");

// 2. Change `status.isDoneForNow` to `status?.isDoneForNow`
code = code.replace("if (status.isDoneForNow) {", "if (status?.isDoneForNow) {");

// 3. Update the `isDoneForNow` block content to be a clickable button
const isDoneForNowRegex = /    const nextLabel = status\.nextDueAt \? formatDate\(status\.nextDueAt\) : '—';\n    return \([\s\S]*?    \);\n  }/;
const isDoneForNowReplacement = `    const nextLabel = status?.nextDueAt ? formatDate(status.nextDueAt) : '—';
    return (
      <button
        onClick={() => onGoToRevision?.(lessonId, lessonTitle)}
        className="mt-3 w-full rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2.5 active:scale-[0.98] transition text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 size={15} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-emerald-700">🎉 Revision ho gayi!</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 truncate">Agli revision: <span className="font-bold">{nextLabel}</span>. Tap to open Hub.</p>
        </div>
        <ChevronRight size={14} className="text-emerald-400 shrink-0" />
      </button>
    );
  }`;
code = code.replace(isDoneForNowRegex, isDoneForNowReplacement);


// 4. Update NOTES and MCQ blocks to use optional chaining for status
code = code.replace("if (status.isDueToday && status.stage === 'NOTES') {", "if (status?.isDueToday && status.stage === 'NOTES') {");
code = code.replace("if (status.isDueToday && status.stage === 'MCQ') {", "if (status?.isDueToday && status.stage === 'MCQ') {");

// 5. Update the fallback logic (previously "Bucket exists but not yet due") to also handle no bucket yet, and be clickable
const fallbackRegex = /  \/\/ Bucket exists but not yet due \([\s\S]*?ko Revision Hub mein milega\n      <\/p>\n    <\/div>\n  \);\n};\n/;
const fallbackReplacement = `  // Bucket exists but not yet due, OR no bucket yet (just completed)
  const nextLabel = status?.nextDueAt ? formatDate(status.nextDueAt) : 'kal';
  return (
    <button
      onClick={() => onGoToRevision?.(lessonId, lessonTitle)}
      className="mt-3 w-full rounded-xl bg-indigo-50 border border-indigo-200 p-3 flex items-center gap-2.5 active:scale-[0.98] transition text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
        <Brain size={15} className="text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-indigo-700">Revision Hub Unlocked</p>
        <p className="text-[10px] text-indigo-500 mt-0.5 truncate">
          Scheduled for <span className="font-bold">{nextLabel}</span>. Tap to open Hub.
        </p>
      </div>
      <ChevronRight size={14} className="text-indigo-400 shrink-0" />
    </button>
  );
};
`;
code = code.replace(fallbackRegex, fallbackReplacement);

fs.writeFileSync(path, code);
