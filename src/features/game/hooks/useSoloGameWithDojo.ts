import { QuestionCard } from '@/lib/dojo/typescript/models.gen';
import { Answer, GameMode, useSystemCalls } from '@/lib/dojo/useSystemCalls';
import React, { useCallback, useRef } from 'react';
import { toast } from 'sonner';

export default function useSoloGameWithDojo() {
  const lastSubmissionTime = useRef<number>(0);

  const { nextCard, submitAnswer, createRound } = useSystemCalls();

  const handleCreateRound = async (): Promise<bigint | null> => {
    try {
      const roundId = await createRound(
        GameMode.Solo,
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
      return null;
    }
  };

  const handleSubmitAnswer = useCallback(
    async (roundId: bigint, answer: Answer): Promise<boolean> => {
      if (!roundId) {
        throw new Error('No round ID available');
      }

      const now = Date.now();
      const timeSinceLastSubmission = now - lastSubmissionTime.current;

      if (timeSinceLastSubmission < 2000) {
        throw new Error('Submission too frequent');
      }

      const isCorrect = await submitAnswer(roundId, answer);
      lastSubmissionTime.current = now;
      console.log('[handleSubmitAnswer] Answer submitted:', isCorrect);
      return true;
    },
    [submitAnswer],
  );

  const handleGetNextCard = useCallback(
    async (roundId: bigint): Promise<QuestionCard> => {
      if (!roundId) {
        throw new Error('No round ID available');
      }
      try {
        const card = await nextCard(roundId);
        return card;
      } catch (err) {
        throw err;
      }
    },
    [nextCard],
  );

  return {
    handleCreateRound,
    handleSubmitAnswer,
    handleGetNextCard,
  };
}
