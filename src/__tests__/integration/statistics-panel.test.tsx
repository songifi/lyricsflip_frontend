import { render } from '@testing-library/react';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Dojo hooks
jest.mock('@/lib/dojo/hooks/useDojo', () => ({
  useDojo: () => ({
    account: null,
    systemCalls: {},
    execute: jest.fn(),
    world: {},
  })
}));

// Mock GameResultPopup component
jest.mock('@/components/organisms/GameResultPopup', () => ({
  __esModule: true,
  default: () => null,
}));

describe('StatisticsPanel', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <StatisticsPanel 
        time={''} 
        potWin={''} 
        scores={''} 
      />
    );
    expect(container).toBeTruthy();
  });
});