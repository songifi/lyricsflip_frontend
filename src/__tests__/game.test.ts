import { useGameStore } from '@/store/game';
import { act, renderHook } from '@testing-library/react';

// Jest automatically provides these globals, so we don't need to import them
// describe, beforeEach, test, expect are available globally in Jest

describe('Game Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  test('should initialize with idle state', () => {
    const { result } = renderHook(() => useGameStore());
    expect(result.current.state).toBe('idle');
    expect(result.current.score).toBe(0);
    expect(result.current.timeElapsed).toBe(0);
  });

  test('should transition to playing state when game starts', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.startGame();
    });

    expect(result.current.state).toBe('playing');
  });

  test('should increment score', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.startGame();
      result.current.incrementScore(5);
    });

    expect(result.current.score).toBe(5);
  });

  test('should end game and update high score if current score is higher', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.startGame();
      result.current.incrementScore(10);
      result.current.endGame();
    });

    expect(result.current.state).toBe('ended');
    expect(result.current.highScore).toBe(10);
  });

  test('should not update high score if current score is lower', () => {
    const { result } = renderHook(() => useGameStore());

    // First game with high score of 20
    act(() => {
      result.current.startGame();
      result.current.incrementScore(20);
      result.current.endGame();
    });

    // Second game with lower score of 10
    act(() => {
      result.current.startGame();
      result.current.incrementScore(10);
      result.current.endGame();
    });

    expect(result.current.highScore).toBe(20);
  });

  test('should reset game state', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.startGame();
      result.current.incrementScore(10);
      result.current.updateTime(15);
      result.current.resetGame();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.score).toBe(0);
    expect(result.current.timeElapsed).toBe(0);
  });
});
