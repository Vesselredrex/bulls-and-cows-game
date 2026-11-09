import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTopScores,
  loadHighScores,
  saveHighScore,
  type HighScore,
} from '../src/game/highScores.js';

const createScore = (
  base: number,
  length: number,
  attempts: number,
  elapsedSeconds: number,
): HighScore => ({
  base,
  length,
  attempts,
  elapsedSeconds,
  completedAt: '2026-11-09T12:00:00.000Z',
});

describe('getTopScores', () => {
  it('filters scores by base and length', () => {
    const scores = [createScore(10, 4, 3, 40), createScore(2, 2, 1, 10), createScore(10, 5, 2, 30)];

    const result = getTopScores(scores, 10, 4);

    expect(result).toEqual([scores[0]]);
  });

  it('sorts by attempts, then by time', () => {
    const scores = [
      createScore(10, 4, 3, 20),
      createScore(10, 4, 2, 50),
      createScore(10, 4, 2, 15),
    ];

    const result = getTopScores(scores, 10, 4);

    expect(result.map((score) => score.elapsedSeconds)).toEqual([15, 50, 20]);
  });

  it('returns only the best five scores', () => {
    const scores = Array.from({ length: 8 }, (_, index) => createScore(10, 4, index + 1, 20));

    const result = getTopScores(scores, 10, 4);

    expect(result).toHaveLength(5);
    expect(result.map((score) => score.attempts)).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not modify the original array', () => {
    const scores = [createScore(10, 4, 3, 30), createScore(10, 4, 1, 10)];

    getTopScores(scores, 10, 4);

    expect(scores[0].attempts).toBe(3);
    expect(scores[1].attempts).toBe(1);
  });
});

describe('loadHighScores', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();

    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty array when no scores are saved', () => {
    expect(loadHighScores()).toEqual([]);
  });

  it('loads previously saved scores', () => {
    const score = createScore(10, 4, 3, 25);

    storage.set('bulls-and-cows-high-scores', JSON.stringify([score]));

    expect(loadHighScores()).toEqual([score]);
  });

  it('returns an empty array for invalid JSON', () => {
    storage.set('bulls-and-cows-high-scores', '{invalid-json');

    expect(loadHighScores()).toEqual([]);
  });

  it('ignores records with invalid structure', () => {
    const validScore = createScore(10, 4, 2, 15);

    storage.set(
      'bulls-and-cows-high-scores',
      JSON.stringify([{ base: 10, attempts: 'invalid' }, validScore]),
    );

    expect(loadHighScores()).toEqual([validScore]);
  });
});

describe('saveHighScore', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();

    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves a new high score', () => {
    const score = createScore(10, 4, 3, 25);

    expect(saveHighScore(score)).toBe(true);
    expect(loadHighScores()).toEqual([score]);
  });

  it('keeps only five best scores', () => {
    for (let attempts = 8; attempts >= 1; attempts--) {
      saveHighScore(createScore(10, 4, attempts, 20));
    }

    const scores = loadHighScores();

    expect(scores).toHaveLength(5);
    expect(scores.map((score) => score.attempts)).toEqual([1, 2, 3, 4, 5]);
  });

  it('ranks faster results higher when attempts are equal', () => {
    saveHighScore(createScore(10, 4, 2, 45));
    saveHighScore(createScore(10, 4, 2, 15));

    const scores = loadHighScores();

    expect(scores.map((score) => score.elapsedSeconds)).toEqual([15, 45]);
  });

  it('keeps records for different settings', () => {
    saveHighScore(createScore(10, 4, 3, 20));
    saveHighScore(createScore(2, 2, 1, 10));
    saveHighScore(createScore(10, 5, 4, 30));

    const scores = loadHighScores();

    expect(scores).toHaveLength(3);
    expect(getTopScores(scores, 2, 2)).toHaveLength(1);
    expect(getTopScores(scores, 10, 4)).toHaveLength(1);
    expect(getTopScores(scores, 10, 5)).toHaveLength(1);
  });

  it('returns false when localStorage write fails', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('Storage is blocked');
        },
      },
    });

    const score = createScore(10, 4, 3, 25);

    expect(saveHighScore(score)).toBe(false);
  });
});
