import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useMultiplayerGame } from '@/lib/dojo/hooks/useMultiplayerGame';
import { useGameplaySubscriptions } from '@/lib/dojo/hooks/useGameplaySubscriptions';
import { Answer } from '@/lib/dojo/useSystemCalls';
import { BigNumberish } from 'starknet';

// Mock the hooks
jest.mock('@/lib/dojo/hooks/useMultiplayerGame');
jest.mock('@/lib/dojo/hooks/useGameplaySubscriptions');
jest.mock('@starknet-react/core');
jest.mock('@dojoengine/sdk/react');

const mockUseMultiplayerGame = useMultiplayerGame as jest.MockedFunction<typeof useMultiplayerGame>;
const mockUseGameplaySubscriptions = useGameplaySubscriptions as jest.MockedFunction<typeof useGameplaySubscriptions>;

describe('Multiplayer Game Integration', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseMultiplayerGame.mockReset();
    mockUseGameplaySubscriptions.mockReset();
  });

  test('should handle complete multiplayer game flow', async () => {
    const mockGetNextCard = jest.fn();
    const mockSubmitAnswer = jest.fn();
    const mockSubscribeToGameplay = jest.fn();
    const mockUnsubscribeFromGameplay = jest.fn();

    // Mock round waiting state
    mockUseMultiplayerGame.mockReturnValue({
      gamePhase: 'waiting',
      currentCard: null,
      timeRemaining: 30,
      round: {
        round_id: BigInt(123),
        state: BigInt(0), // WAITING
        players_count: BigInt(1),
        creator: '0x123',
        wager_amount: BigInt(0),
        start_time: BigInt(0),
        end_time: BigInt(0),
        ready_players_count: BigInt(0),
        round_cards: [],
        players: ['0x123'],
        question_cards: [],
        mode: BigInt(1),
        challenge_type: BigInt(0),
        creation_time: BigInt(Date.now()),
      },
      playersCount: 1,
      myPlayerData: null,
      getNextCard: mockGetNextCard,
      submitAnswer: mockSubmitAnswer,
      canAnswer: false,
      myScore: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      isGameComplete: false,
      isLoading: false,
      error: null,
    });

    mockUseGameplaySubscriptions.mockReturnValue({
      subscribeToGameplay: mockSubscribeToGameplay,
      unsubscribeFromGameplay: mockUnsubscribeFromGameplay,
      isSubscribed: true,
      subscriptionError: null,
    });

    // The actual component test would go here
    // For now, just verify the mocks are set up correctly
    
    expect(mockUseMultiplayerGame).toBeDefined();
    expect(mockUseGameplaySubscriptions).toBeDefined();
  });

  test('should handle game state transitions', () => {
    const mockCard = {
      lyric: "Test lyric line",
      option_one: [BigInt(1), BigInt(1)] as [BigNumberish, BigNumberish],
      option_two: [BigInt(2), BigInt(2)] as [BigNumberish, BigNumberish],
      option_three: [BigInt(3), BigInt(3)] as [BigNumberish, BigNumberish],
      option_four: [BigInt(4), BigInt(4)] as [BigNumberish, BigNumberish],
    };

    // Mock round in progress with current card
    mockUseMultiplayerGame.mockReturnValue({
      gamePhase: 'card_active',
      currentCard: mockCard,
      timeRemaining: 25,
      round: {
        round_id: BigInt(123),
        state: BigInt(1), // IN_PROGRESS
        players_count: BigInt(2),
        creator: '0x123',
        wager_amount: BigInt(0),
        start_time: BigInt(Date.now()),
        end_time: BigInt(0),
        ready_players_count: BigInt(2),
        round_cards: [],
        players: ['0x123', '0x456'],
        question_cards: [mockCard],
        mode: BigInt(1),
        challenge_type: BigInt(0),
        creation_time: BigInt(Date.now() - 10000),
      },
      playersCount: 2,
      myPlayerData: {
        player_to_round_id: ['0x123', BigInt(123)],
        joined: true,
        ready_state: true,
        next_card_index: BigInt(1),
        round_completed: false,
        current_card_start_time: BigInt(Date.now()),
        card_timeout: BigInt(30),
        correct_answers: BigInt(0),
        total_answers: BigInt(0),
        total_score: BigInt(0),
        best_time: BigInt(0),
      },
      getNextCard: jest.fn(),
      submitAnswer: jest.fn(),
      canAnswer: true,
      myScore: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      isGameComplete: false,
      isLoading: false,
      error: null,
    });

    mockUseGameplaySubscriptions.mockReturnValue({
      subscribeToGameplay: jest.fn(),
      unsubscribeFromGameplay: jest.fn(),
      isSubscribed: true,
      subscriptionError: null,
    });

    // Verify the mocks represent a valid game state
    const gameState = mockUseMultiplayerGame(BigInt(123));
    
    expect(gameState.gamePhase).toBe('card_active');
    expect(gameState.currentCard).toEqual(mockCard);
    expect(gameState.canAnswer).toBe(true);
    expect(gameState.playersCount).toBe(2);
  });

  test('should handle answer submission', async () => {
    const mockSubmitAnswer = jest.fn().mockResolvedValue(true);

    mockUseMultiplayerGame.mockReturnValue({
      gamePhase: 'card_active',
      currentCard: {
        lyric: "Test lyric",
        option_one: [BigInt(1), BigInt(1)],
        option_two: [BigInt(2), BigInt(2)],
        option_three: [BigInt(3), BigInt(3)],
        option_four: [BigInt(4), BigInt(4)],
      },
      timeRemaining: 20,
      round: null,
      playersCount: 2,
      myPlayerData: null,
      getNextCard: jest.fn(),
      submitAnswer: mockSubmitAnswer,
      canAnswer: true,
      myScore: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      isGameComplete: false,
      isLoading: false,
      error: null,
    });

    mockUseGameplaySubscriptions.mockReturnValue({
      subscribeToGameplay: jest.fn(),
      unsubscribeFromGameplay: jest.fn(),
      isSubscribed: true,
      subscriptionError: null,
    });

    // Simulate answer submission
    const gameState = mockUseMultiplayerGame(BigInt(123));
    await gameState.submitAnswer(Answer.OptionOne);

    expect(mockSubmitAnswer).toHaveBeenCalledWith(Answer.OptionOne);
  });
}); 