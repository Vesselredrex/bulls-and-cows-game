export type HighScore = Readonly<{
  base: number;
  length: number;
  attempts: number;
  elapsedSeconds: number;
  completedAt: string;
}>;

export function getTopScores(
  scores: readonly HighScore[],
  base: number,
  length: number,
): HighScore[] {
  return scores
    .filter((score) => score.base === base && score.length === length)
    .sort((a, b) => a.attempts - b.attempts || a.elapsedSeconds - b.elapsedSeconds)
    .slice(0, 5);
}

const STORAGE_KEY = 'bulls-and-cows-high-scores';

function isHighScore(value: unknown): value is HighScore {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const score = value as Record<string, unknown>;

  return (
    typeof score.base === 'number' &&
    [2, 8, 10, 16].includes(score.base) &&
    typeof score.length === 'number' &&
    Number.isInteger(score.length) &&
    score.length >= 2 &&
    score.length <= Math.min(6, score.base) &&
    typeof score.attempts === 'number' &&
    Number.isInteger(score.attempts) &&
    score.attempts > 0 &&
    typeof score.elapsedSeconds === 'number' &&
    Number.isFinite(score.elapsedSeconds) &&
    score.elapsedSeconds >= 0 &&
    typeof score.completedAt === 'string'
  );
}

export function loadHighScores(): HighScore[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return [];
    }

    const data: unknown = JSON.parse(saved);

    return Array.isArray(data) ? data.filter(isHighScore) : [];
  } catch (error) {
    console.error('Failed to load high scores:', error);
    return [];
  }
}

export function saveHighScore(score: HighScore): boolean {
  try {
    const previous = loadHighScores();

    const otherScores = previous.filter(
      (entry) => entry.base !== score.base || entry.length !== score.length,
    );

    const bestScores = getTopScores([...previous, score], score.base, score.length);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherScores, ...bestScores]));

    return true;
  } catch (error) {
    console.error('Failed to save high score:', error);
    return false;
  }
}
