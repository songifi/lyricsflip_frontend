'use client';

import { useState, useEffect } from 'react';
import { useModalStore } from '@/store/modal-store';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Card, CardContent } from '../atoms/card';
import { useJoinRound } from '@/lib/dojo/hooks/useJoinRound';
import { useRoundSubscription } from '@/lib/dojo/hooks/useRoundSubscription';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { Rounds } from '@/lib/dojo/typescript/models.gen';
import { Loader2 } from 'lucide-react';

export default function ChallengeModal() {
  const [code, setCode] = useState('');
  const [roundId, setRoundId] = useState<bigint | null>(null);
  const { closeModal } = useModalStore();
  const { joinRound, isLoading, error, isSuccess, validateRoundId } = useJoinRound();
  const { round, isPlayer, playersCount, error: subscriptionError, isLoading: isSubscriptionLoading } = useRoundSubscription(roundId);

  useEffect(() => {
    if (code) {
      const validationResult = validateRoundId(code);
      if (validationResult.isValid) {
        try {
          // Keep the original hex format if it's a hex string
          const id = code.startsWith('0x') ? BigInt(code) : BigInt(code);
          setRoundId(id);
          console.log('[ChallengeModal] Set round ID:', code); // Log the original format
        } catch (e) {
          console.error('[ChallengeModal] Error converting round ID:', e);
          setRoundId(null);
        }
      } else {
        console.log('[ChallengeModal] Invalid round ID:', validationResult.error);
        setRoundId(null);
      }
    } else {
      setRoundId(null);
    }
  }, [code, validateRoundId]);

  const handleJoin = async () => {
    if (!roundId) {
      console.log('[ChallengeModal] No roundId available');
      return;
    }
    // Keep the original hex format
    const roundIdHex = roundId.toString(16);
    console.log('[ChallengeModal] Attempting to join round:', roundIdHex);
    try {
      await joinRound(roundId);
      console.log('[ChallengeModal] Join round call completed');
      // Wait for a short delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Check if we're now a player
      console.log('[ChallengeModal] isPlayer status:', isPlayer);
      if (isPlayer) {
        console.log('[ChallengeModal] Closing modal after successful join');
        closeModal();
      }
    } catch (e) {
      // Error is handled by useJoinRound hook
      console.error('[ChallengeModal] Failed to join round:', e);
    }
  };

  const isCodeValid = code && round !== null;
  const isButtonDisabled = false;

  return (
    <div className="space-y-4 mt-4">
      <Input
        placeholder="Enter Challenge Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={isLoading || isSubscriptionLoading}
      />
      {(error || subscriptionError) && (
        <div className="text-red-500 text-sm">
          {error || subscriptionError}
        </div>
      )}
      {isSubscriptionLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading round data...</span>
        </div>
      )}
      {round && !isSubscriptionLoading && (
        <Card>
          <CardContent className="space-y-2">
            <p>
              <strong>Wager Amount:</strong> {Number(round.round.wager_amount) / 1e18} STRK
            </p>
            <p>
              <strong>Number of Participants:</strong> {playersCount}/6
            </p>
            <p>
              <strong>Payout If Won:</strong>{' '}
              <span className="text-purple-600">
                {(Number(round.round.wager_amount) * 6) / 1e18} STRK
              </span>
            </p>
            <p>
              <strong>Creator:</strong> {round.round.creator.slice(0, 6)}...{round.round.creator.slice(-4)}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={round.round.state === BigInt(0) ? 'text-green-500' : 'text-red-500'}>
                {round.round.state === BigInt(0) ? 'Waiting for players' : 'In progress'}
              </span>
            </p>
            {isPlayer && (
              <p className="text-green-500">
                You have joined this round
              </p>
            )}
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={closeModal} disabled={isButtonDisabled}>
          Cancel
        </Button>
        <Button 
          onClick={handleJoin} 
          disabled={isButtonDisabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : isSubscriptionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Join Challenge'
          )}
        </Button>
      </div>
    </div>
  );
}