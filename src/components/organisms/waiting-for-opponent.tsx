'use client';

import { Copy, Lightbulb, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import { useModalStore } from '@/store/modal-store';
import { useAccount } from "@starknet-react/core";
import { ErrorBoundary } from '../atoms/error-boundary';
import LoadingSpinner from '../atoms/loading-spinner';
import { useRoundActivation } from '@/lib/dojo/hooks/useRoundActivation';
import { RoundStatus } from '@/lib/dojo/types';

interface WaitingForOpponentProps {
  onStart?: () => void;
}

const WaitingForOpponentContent = React.memo(function WaitingForOpponentContent({ onStart }: WaitingForOpponentProps) {
  const { modalPayload, closeModal } = useModalStore();
  const { account } = useAccount();
  
  const roundId = modalPayload?.roundId;
  const roundIdBigInt = roundId ? BigInt(roundId) : null;
  
  const { round, playersCount, isLoading, error, ensureActive, goToGame, isActive } = useRoundActivation({ roundId: roundIdBigInt });
  
  // Add ref to prevent multiple auto-start attempts
  const hasAutoStarted = useRef(false);
  
  // Memoize derived values to prevent unnecessary re-renders
  const roundInfo = useMemo(() => {
    const stateNumber = round?.state ? Number(round.state) : null;
    const isInProgress = stateNumber === RoundStatus.IN_PROGRESS;
    
    return {
      hasRound: !!round,
      roundState: round?.state,
      roundStateNumber: stateNumber,
      creatorAddress: round?.creator,
      isInProgress
    };
  }, [round]);

  // Add state monitoring for automatic redirection
  const [hasRedirected, setHasRedirected] = useState(false);

  // Removed excessive debug logging to prevent performance issues
  
  const [isCopied, setIsCopied] = useState(false);
  const totalPlayers = 2;
  const [localError, setLocalError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🚀 KEY ADDITION: Monitor round state for automatic redirection
  useEffect(() => {
    if (isActive && !hasRedirected && roundId) {
      console.log('[WaitingForOpponent] 🚀 ROUND STARTED! Redirecting to multiplayer game...');
      
      setHasRedirected(true); // Prevent multiple redirections
      closeModal(); // Close the waiting modal
      goToGame(BigInt(roundId)); // Use the goToGame helper
    }
  }, [isActive, roundId, hasRedirected, closeModal, goToGame]);

  // Separate useEffect for component mounting/unmounting
  useEffect(() => {
    console.log('WaitingForOpponent mounted');
    console.log('roundId from modalPayload:', roundId);
    console.log('creatorAddress (from round):', roundInfo.creatorAddress);
    console.log('current account:', account?.address);

    if (!roundId) {
      setLocalError('No round ID provided');
    }

    return () => {
      console.log('WaitingForOpponent unmounted');
      mountedRef.current = false;
      
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, [roundId, roundInfo.creatorAddress, account?.address]);

  // Separate useEffect for auto-start logic to prevent infinite re-renders
  useEffect(() => {
    const minPlayersRequired = 2;
    
    if (
      roundId && 
      account?.address === roundInfo.creatorAddress && 
      playersCount >= minPlayersRequired &&
      !isActive &&
      !isLoading &&
      !hasAutoStarted.current
    ) {
      console.log('[WaitingForOpponent] Auto-starting round as creator with sufficient players');
      hasAutoStarted.current = true;
      
      // Call ensureActive directly to avoid handleGameStart dependency
      ensureActive(BigInt(roundId))
        .then((result) => {
          console.log('[WaitingForOpponent] Auto-start result:', result);
          if (onStart) {
            onStart();
          }
        })
        .catch((err) => {
          console.error('[WaitingForOpponent] Auto-start failed:', err);
          hasAutoStarted.current = false; // Reset so user can manually try
          if (mountedRef.current) {
            setLocalError(err instanceof Error ? err.message : 'Failed to auto-start game');
          }
        });
    }
  }, [roundId, account?.address, roundInfo.creatorAddress, playersCount, isActive, isLoading]); // Remove ensureActive and onStart to prevent re-renders

  const handleCopyCode = useCallback(() => {
    if (!mountedRef.current || !roundId) return;

    try {
      navigator.clipboard
        .writeText(roundId)
        .then(() => {
          if (mountedRef.current) {
            setIsCopied(true);
            if (copyTimeoutRef.current) {
              clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                setIsCopied(false);
              }
            }, 2000);
          }
        })
        .catch((err) => {
          throw new Error('Failed to copy invite code');
        });
    } catch (err) {
      if (mountedRef.current) {
        setLocalError(err instanceof Error ? err.message : 'Failed to copy invite code');
        console.error('Error copying code:', err);
      }
    }
  }, [roundId]);

  const handleGameStart = useCallback(async () => {
    console.log('[WaitingRoom] Attempting to start game:', {
      roundId,
      isLoading,
      mounted: mountedRef.current,
      account: account?.address,
      creatorAddress: roundInfo.creatorAddress
    });

    if (!roundId) {
      console.error('[WaitingRoom] No round ID available');
      return;
    }

    try {
      console.log('[WaitingRoom] Starting round:', roundId);
      const result = await ensureActive(BigInt(roundId));
      console.log('[WaitingRoom] Round activation result:', result);
      
      // Force immediate navigation after successful start
      console.log('[WaitingRoom] 🚀 FORCING IMMEDIATE NAVIGATION...');
      setHasRedirected(true);
      closeModal();
      goToGame(BigInt(roundId));
      
      if (onStart) {
        onStart();
      }
    } catch (err) {
      console.error('[WaitingRoom] Failed to start round:', err);
      if (mountedRef.current) {
        setLocalError(err instanceof Error ? err.message : 'Failed to start game');
      }
    }
  }, [roundId, ensureActive, onStart, account?.address, roundInfo.creatorAddress]);

  const [timeLeft, setTimeLeft] = useState(120);
  useEffect(() => {
    if (!mountedRef.current) return;

    if (timeLeft <= 0) {
      if (mountedRef.current) {
        setLocalError('Time expired waiting for opponent');
      }
      return;
    }

    const timerId = setInterval(() => {
      if (mountedRef.current) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error || localError) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Error
        </h2>
        <p className="text-sm text-red-600 mb-4">
          {error || localError}
        </p>
        <button
          onClick={() => setLocalError(null)}
          className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!roundId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-sm text-red-600">No round ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col gap-[4px]">
        <h1 className="text-[24px] font-[600]">
          Your wager challenge has been created
        </h1>
        <p className="text-[14px] font-[400] text-[#120029]">
          Waiting for others to join
        </p>
      </div>
      
      <div className="flex justify-center items-center space-x-3 my-5">
        <h1 className="sm:text-[12px] text-[10px] font-[800]">
          {roundId}
        </h1>
        <span
          className="hover:cursor-pointer w-fit relative"
          onClick={handleCopyCode}
          title={isCopied ? 'Copied!' : 'Copy to clipboard'}
        >
          <Copy color="#9747FF" />
          {isCopied && (
            <span className="absolute -top-6 -right-2 bg-[#9747FF] text-white text-xs px-2 py-1 rounded">
              Copied!
            </span>
          )}
        </span>
      </div>
      
      <div className="flex flex-col gap-[12px] mt-4">
        <div className="flex w-full border-b border-black/30 justify-between text-[16px] font-[400]">
          <span className="p-[12px] text-[#636363]">Time Remaining</span>
          <span className="font-[500]">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex w-full border-b border-black/30 justify-between text-[16px] font-[400]">
          <span className="p-[12px] text-[#636363]">Players Joined</span>
          <span className="font-[500]">
            {playersCount}/{totalPlayers}
          </span>
        </div>
      </div>
      
      <div className="border-[0.5px] p-[16px] rounded-[12px] gap-[17px] bg-[#F0F0F0] flex flex-col mt-5">
        <div className="flex space-x-1 items-center text-[#9747FF]">
          <Lightbulb size={16} />
          <span className="text-[12px] font-[500]">INSTRUCTION</span>
        </div>
        <p className="text-[16px] bg-white font-[400] text-[#08090A] border p-[16px] rounded-[8px] border-[#DBE1E7]">
          A card displaying a lyric from a song will appear along with a list
          of possible answers. Your goal is to score the highest point amongst
          your challengers.
        </p>
      </div>
      
      <div className="w-full flex flex-col justify-center items-center gap-[8px] mt-20">
        <div className="flex flex-col gap-[8px] justify-center w-full items-center">
          {isLoading ? (
            <>
              <LoadingSpinner size="md" />
              <span className="text-[20px] font-[500] text-[#000000]">
                Game is starting...
              </span>
            </>
          ) : (
            <>
              <span className="text-[20px] font-[500] text-[#000000]">
                {playersCount === totalPlayers
                  ? 'All players joined!'
                  : 'Waiting for opponents...'}
              </span>
              <span className="text-[16px] font-[400] text-[#666666]">
                {playersCount} joined, {totalPlayers - playersCount} left
              </span>
              {(!isLoading && (playersCount === totalPlayers || account?.address === roundInfo.creatorAddress)) && (
                <button
                  className="mt-4 text-[16px] font-[500] w-full max-w-[200px] hover:bg-transparent hover:border border-[#9747FF] hover:text-[#9747FF] transition-colors duration-200 rounded-full bg-[#9747FF] text-white py-[12px]"
                  onClick={handleGameStart}
                  disabled={isLoading}
                >
                  {account?.address === roundInfo.creatorAddress ? 'Start Round' : 'Start Game'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="w-full mt-8">
        <button
          type="button"
          onClick={handleCopyCode}
          className="w-full rounded-full bg-transparent border border-[#9747FF] hover:bg-[#9747FF] text-[#9747FF] py-[16px] hover:text-white text-[16px] font-[600] transition-all duration-200"
        >
          Share Invite Code
        </button>
      </div>
    </>
  );
});

export default React.memo(function WaitingForOpponent(props: WaitingForOpponentProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error in WaitingForOpponent:', error, errorInfo);
      }}
    >
      <WaitingForOpponentContent {...props} />
    </ErrorBoundary>
  );
});
