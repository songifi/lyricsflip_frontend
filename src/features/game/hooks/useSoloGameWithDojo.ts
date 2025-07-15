import { GameMode, useSystemCalls } from '@/lib/dojo/useSystemCalls';
import React from 'react';
import { toast } from 'sonner';

export default function useSoloGameWithDojo() {
  const {
    nextCard,
    submitAnswer,
    getPlayerProgress,
    getCardCount,
    createRound,
  } = useSystemCalls();

  const handleCreateRound = async () => {
    try {
      const roundId = await createRound(
        GameMode.Solo, // Use Solo mode for basic solo games
        undefined,
        undefined,
        undefined,
      );
      return roundId;
    } catch (err) {
      console.error('Failed to create round:', err);
      toast.error('Failed to create challenge', {
        description: err instanceof Error ? err.message : 'Please try again',
        duration: 4000,
      });
    }
  };

  return {
    handleCreateRound,
  };
}
