'use client';

import { useState, useEffect } from 'react';
import { useModalStore } from '@/store/modal-store';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Card, CardContent } from '../atoms/card';
import { useJoinRound } from '@/lib/dojo/hooks/useJoinRound';
import { Loader2, AlertCircle } from 'lucide-react';
import { BigNumberish } from 'starknet';
import { useRoundActivation } from '@/lib/dojo/hooks/useRoundActivation';
import { RoundStatus } from '@/lib/dojo/types';

function RoundDetailsView({ roundId }: { roundId: bigint }) {
  const { round, playersCount, isLoading, error, ensureActive, goToGame, isActive } = useRoundActivation({ roundId });
  const { closeModal } = useModalStore();

  const handleStartRound = async () => {
    try {
      const result = await ensureActive(roundId);
      console.log('[ChallengeModal] Round activation result:', result);

      // Close modal first, then navigate
      closeModal();
      goToGame(roundId);
    } catch (error) {
      console.error('Failed to start round:', error);
      // Error is already exposed via the error state from useRoundActivation
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-xl font-bold">Join a challenge</h2>
      <div className="text-gray-500 text-sm mb-2">Invite Code: {roundId.toString()}</div>
      <div className="text-gray-500 text-sm mb-2">Players: {playersCount}</div>
      <div className="text-gray-500 text-sm mb-2">Genre: {/* TODO: Add genre */}</div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={closeModal}>Cancel</Button>
        <Button
          disabled={isLoading}
          onClick={handleStartRound}
        >
          {isLoading ? 'Starting...' : 'Start Round'}
        </Button>
      </div>
    </div>
  );
}

export const ChallengeModal = () => {
  const { closeModal, openModal } = useModalStore();
  const [code, setCode] = useState('');
  const [modalStep, setModalStep] = useState<'join' | 'details'>('join');
  const [joinedRoundId, setJoinedRoundId] = useState<bigint | null>(null);
  const [isWaitingForRoundData, setIsWaitingForRoundData] = useState(false);
  const [roundDataError, setRoundDataError] = useState<string | null>(null);

  const {
    joinRound,
    isLoading: isJoining,
    error: joinError,
    isSuccess: joinSuccess,
    reset: resetJoinRoundState,
    validateRoundId: performFormatValidation,
    validation
  } = useJoinRound();

  // Add round query to check if round data is available
  const { round: availableRound } = useRoundActivation({ roundId: joinedRoundId });

  const isLoading = isJoining || isWaitingForRoundData;
  const displayError = joinError || roundDataError;

  useEffect(() => {
    resetJoinRoundState();
    setRoundDataError(null);
    setIsWaitingForRoundData(false);
  }, [resetJoinRoundState]);

  // Wait for round data to be available after joining
  useEffect(() => {
    if (isWaitingForRoundData && joinedRoundId && availableRound) {
      console.log('[ChallengeModal] Round data is now available, switching to details view');
      setIsWaitingForRoundData(false);
      setRoundDataError(null);
      setModalStep('details');
    }
  }, [isWaitingForRoundData, joinedRoundId, availableRound]);

  // Timeout for waiting for round data
  useEffect(() => {
    if (isWaitingForRoundData) {
      const timeout = setTimeout(() => {
        console.error('[ChallengeModal] Timeout waiting for round data');
        setIsWaitingForRoundData(false);
        setRoundDataError('Failed to load round data. Please try again.');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isWaitingForRoundData]);

  const handleCodeChange = (value: string) => {
    const newCode = value.trim();
    setCode(newCode);
    performFormatValidation(newCode);
  };

  const handleDirectJoin = async () => {
    if (!code) {
      performFormatValidation("");
      return;
    }

    if (!validation?.isValid) {
      console.log("[ChallengeModal] Format validation failed based on hook state. Error should be in joinError.");
      return;
    }

    // Clear any previous errors
    setRoundDataError(null);

    try {
      let roundIdToJoin: bigint;
      try {
        roundIdToJoin = code.startsWith('0x') ? BigInt(code) : BigInt(code);
      } catch (e) {
        console.error('[ChallengeModal] Error converting code to BigInt despite validation:', e);
        alert("Invalid challenge code format. Please enter a valid number or 0x... hex string.");
        return;
      }

      console.log('[ChallengeModal] Attempting to directly join round:', roundIdToJoin.toString());
      await joinRound(roundIdToJoin);

      // Set the round ID and start waiting for round data
      setJoinedRoundId(roundIdToJoin);
      setIsWaitingForRoundData(true);
      console.log('[ChallengeModal] Join successful, waiting for round data to be available...');

    } catch (error) {
      console.error('[ChallengeModal] Failed to join round from direct attempt (error caught in component):', error);
    }
  };

  const formatWagerAmount = (amount: BigNumberish) => {
    return Number(BigInt(amount.toString())) / 1e18;
  };

  const calculatePayout = (wagerAmount: BigNumberish, maxPlayers: number = 6) => {
    return (Number(BigInt(wagerAmount.toString())) * maxPlayers) / 1e18;
  };

  const getRoundStatus = (state: BigNumberish) => {
    switch (Number(BigInt(state.toString()))) {
      case RoundStatus.WAITING:
        return { text: 'Waiting for players', color: 'text-green-500' };
      case RoundStatus.IN_PROGRESS:
        return { text: 'In progress', color: 'text-yellow-500' };
      case RoundStatus.PENDING:
        return { text: 'Starting...', color: 'text-blue-500' };
      case RoundStatus.ENDED:
        return { text: 'Ended', color: 'text-red-500' };
      default:
        return { text: 'Unknown', color: 'text-gray-500' };
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {modalStep === 'join' ? (
        <>
          <Input
            placeholder="Enter Challenge Code"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={isLoading}
          />
          {displayError && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {displayError}
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={closeModal} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDirectJoin}
              disabled={isLoading || !code || !validation?.isValid || !!joinError}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : isWaitingForRoundData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading round data...
                </>
              ) : (
                'Join Challenge'
              )}
            </Button>
          </div>
        </>
      ) : (
        joinedRoundId && <RoundDetailsView roundId={joinedRoundId} />
      )}
    </div>
  );
}