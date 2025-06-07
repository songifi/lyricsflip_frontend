'use client';

import { useState, useEffect } from 'react';
import { useModalStore } from '@/store/modal-store';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Card, CardContent } from '../atoms/card';
import { useJoinRound } from '@/lib/dojo/hooks/useJoinRound';
import { Loader2, AlertCircle } from 'lucide-react';
import { BigNumberish } from 'starknet';
import { useRoundSubscription } from '@/lib/dojo/hooks/useRoundSubscription';
import { useRoundQuery } from '@/lib/dojo/hooks/useRoundQuery';
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useStartRound } from '@/lib/dojo/hooks/useStartRound';

function RoundDetailsView({ roundId }: { roundId: bigint }) {
  // Comment out subscription for now
  // const { round, playersCount, isPlayer, isReady, error, isSubscribed } = useRoundSubscription(roundId.toString());
  const { startRound, isLoading: isStarting, error: startError } = useStartRound();
  const { closeModal } = useModalStore();

  // Comment out error and loading states for now
  // if (error) return <div className="text-red-500">{error}</div>;
  // if (!round) return <div>Loading round details...</div>;

  const handleStartRound = async () => {
    try {
      await startRound(roundId);
      // Optionally close the modal after successful start
      // closeModal();
    } catch (error) {
      console.error('Failed to start round:', error);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-xl font-bold">Join a challenge</h2>
      <div className="text-gray-500 text-sm mb-2">Invite Code: {roundId.toString()}</div>
      <div className="text-gray-500 text-sm mb-2">Genre: {/* TODO: Add genre */}</div>
      {startError && <div className="text-red-500 text-sm">{startError}</div>}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={closeModal}>Cancel</Button>
        <Button 
          disabled={isStarting} 
          onClick={handleStartRound}
        >
          {isStarting ? 'Starting...' : 'Start Round'}
        </Button>
      </div>
    </div>
  );
}

export const ChallengeModal = () => {
  const { closeModal } = useModalStore();
  const [code, setCode] = useState('');
  const [modalStep, setModalStep] = useState<'join' | 'details'>('join');
  const [joinedRoundId, setJoinedRoundId] = useState<bigint | null>(null);

  const {
    joinRound,
    isLoading: isJoining,
    error: joinError,
    isSuccess: joinSuccess,
    reset: resetJoinRoundState,
    validateRoundId: performFormatValidation,
    validation
  } = useJoinRound();

  const isLoading = isJoining;
  const displayError = joinError;

  useEffect(() => {
    resetJoinRoundState();
  }, [resetJoinRoundState]);

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
      setJoinedRoundId(roundIdToJoin);
      setModalStep('details');
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
      case 0:
        return { text: 'Waiting for players', color: 'text-green-500' };
      case 1:
        return { text: 'In progress', color: 'text-yellow-500' };
      case 2:
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
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