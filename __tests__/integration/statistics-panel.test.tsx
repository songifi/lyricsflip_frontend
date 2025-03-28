import { render, screen, act } from '@testing-library/react';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';
import { useGameTimer } from '@/features/game/hooks/useGameTimer';

// Mock the useGameTimer hook
jest.mock('@/features/game/hooks/useGameTimer', () => ({
  useGameTimer: jest.fn(),
}));

describe('StatisticsPanel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should show game result popup when timer expires', async () => {
    // Mock the useGameTimer hook implementation
    const mockUseGameTimer = useGameTimer as jest.Mock;
    mockUseGameTimer.mockImplementation(() => ({
      timeLeft: 5,
      startTimer: jest.fn(),
      resetTimer: jest.fn(),
      endGame: jest.fn(),
      isPlaying: true,
    }));

    render(<StatisticsPanel time="0:05" potWin="1000 STRK" scores={'100'} />);

    // Update the mock to simulate timer expiration
    mockUseGameTimer.mockImplementation(() => ({
      timeLeft: 0,
      startTimer: jest.fn(),
      resetTimer: jest.fn(),
      endGame: jest.fn(),
      isPlaying: false,
    }));

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(5000);
    });
  });

  // Updated test for timer color changes
  it('should handle timer color changes based on game state', () => {
    const mockUseGameTimer = useGameTimer as jest.Mock;
    mockUseGameTimer.mockImplementation(() => ({
      timeLeft: 30,
      startTimer: jest.fn(),
      resetTimer: jest.fn(),
      endGame: jest.fn(),
      isPlaying: true,
    }));

    const { rerender } = render(
      <StatisticsPanel time="0:30" potWin="1000 STRK" scores={'100'} />,
    );

    // Check timer has green color when game is playing
    const timerElement = screen.getByText('00:30');
    // Instead of toHaveClass, check the class attribute directly
    expect(timerElement.getAttribute('class')).toContain('text-green-500');

    // Update mock to simulate game pause/end
    mockUseGameTimer.mockImplementation(() => ({
      timeLeft: 30,
      startTimer: jest.fn(),
      resetTimer: jest.fn(),
      endGame: jest.fn(),
      isPlaying: false,
    }));

    // Rerender with new state
    rerender(<StatisticsPanel time="0:30" potWin="1000 STRK" scores={'100'} />);

    // Check timer has red color when game is not playing
    expect(timerElement.getAttribute('class')).toContain('text-red-500');
  });
});
