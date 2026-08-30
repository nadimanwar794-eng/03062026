import type { MCQItem } from '../types';

const MAX_OPTION_CHARS = 180;

const stripOptionLabel = (value: string): string =>
  value.trim().replace(/^(?:[A-Da-d]|[1-4])\s*[\).:-]\s*/, '').trim();

const plainTextLength = (value: string): number =>
  value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length;

const isMatchQuestion = (question: string): boolean =>
  /match\s+(?:the\s+)?(?:following\s+)?(?:pairs|columns)|मिलान|सुमेलित|सुमेलित\s*कीजिए|कूट/i.test(question);

const hasStatementQuestion = (question: string, statements?: string[]): boolean =>
  Boolean(statements?.some(Boolean)) ||
  /(?:statement|कथन)\s*(?:1|2|i|ii)\s*[\).:-]/i.test(question);

/**
 * Challenge 2.0 accepts only the latest four-option MCQ shape.
 *
 * Statement/matching questions are intentionally rejected for challenge
 * publishing. The shared McqQuestionDisplay still supports those fields for
 * legacy/non-challenge surfaces.
 */
export function sanitizeChallengeQuestion(q: Partial<MCQItem>): MCQItem | null {
  const question = typeof q.question === 'string' ? q.question.trim() : '';
  const rawOptions = Array.isArray(q.options) ? q.options : [];
  const options = rawOptions
    .slice(0, 4)
    .map((option) => typeof option === 'string' ? stripOptionLabel(option) : '');
  const correctAnswer = Number(q.correctAnswer);

  if (!question || rawOptions.length !== 4) return null;
  if (hasStatementQuestion(question, q.statements) || isMatchQuestion(question)) return null;
  if (options.some((option) => !option || option.includes('\n') || plainTextLength(option) > MAX_OPTION_CHARS)) {
    return null;
  }
  if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) return null;

  return {
    ...q,
    question,
    options,
    correctAnswer,
    explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
    // A challenge question has no statement block in the latest format.
    statements: undefined,
  } as MCQItem;
}

export function sanitizeChallengeQuestions(questions: unknown): MCQItem[] {
  if (!Array.isArray(questions)) return [];
  return questions
    .map((question) => sanitizeChallengeQuestion((question || {}) as Partial<MCQItem>))
    .filter((question): question is MCQItem => question !== null);
}

export function getChallengeQuestionSummary(questions: unknown): {
  accepted: number;
  rejected: number;
} {
  const total = Array.isArray(questions) ? questions.length : 0;
  const accepted = sanitizeChallengeQuestions(questions).length;
  return { accepted, rejected: Math.max(0, total - accepted) };
}