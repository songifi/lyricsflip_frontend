import { useGameStore } from '../store/game';

describe('Game State Management', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  test('initial state', () => {
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.timeLeft).toBe(300);
    expect(state.currentRound).toBe(0);
    expect(state.gameStatus).toBe('idle');
  });

  test('start game sets playing status', () => {
    useGameStore.getState().startGame({ genre: 'pop', difficulty: 'easy', duration: '5 mins', odds: 2, wagerAmount: 100 });
    const state = useGameStore.getState();
    expect(state.gameStatus).toBe('playing');
  });

  test('end game sets ended status', () => {
    useGameStore.getState().endGame();
    const state = useGameStore.getState();
    expect(state.gameStatus).toBe('ended');
  });

  test('increase score updates score and round', () => {
    useGameStore.getState().increaseScore();
    const state = useGameStore.getState();
    expect(state.score).toBe(1);
    expect(state.currentRound).toBe(1);
    expect(state.lastGuessResult).toBe('correct');
  });

  test('reset game returns to initial state', () => {
    useGameStore.getState().startGame({ genre: 'rock', difficulty: 'hard', duration: '10 mins', odds: 3, wagerAmount: 200 });
    useGameStore.getState().resetGame();
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.timeLeft).toBe(300);
    expect(state.currentRound).toBe(0);
    expect(state.gameStatus).toBe('idle');
  });
});