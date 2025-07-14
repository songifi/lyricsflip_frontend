'use client';
import { useEffect, useState } from 'react';

import { useGameTimer } from '@/features/game/hooks/useGameTimer';
import GameResultPopup from '../organisms/GameResultPopup';
import { formatTime } from '@/lib/utils';

interface StatisticsPanelProps {
  time: string;
  potWin?: string;
  scores: string;
  myScore?: number;
  multiplayer?: boolean;
}

export function StatisticsPanel({
  time,
  potWin,
  scores,
  myScore,
  multiplayer = false,
}: StatisticsPanelProps) {
  const [remainingTime, setRemainingTime] = useState<string>(time);
  const [showGameResult, setShowGameResult] = useState<boolean>(false);

  // Only use internal timer for single-player games
  const { timeLeft, startTimer, resetTimer, endGame, isPlaying } =
    useGameTimer();

  // For multiplayer: just use the time from props directly
  // For single-player: use the internal useGameTimer logic
  useEffect(() => {
    if (multiplayer) {
      // Multiplayer: just display the time from props, no internal timer
      setRemainingTime(time);
    } else {
      // Single-player: use internal timer logic
      const numericTimeLeft = parseInt(time, 10);
      resetTimer(numericTimeLeft);
      startTimer();
    }
  }, [time, multiplayer, resetTimer, startTimer]);

  useEffect(() => {
    if (!multiplayer) {
      // Only handle timer expiration for single-player games
      if (timeLeft > 0) {
        setRemainingTime(formatTime(parseInt(timeLeft.toString(), 10)));
      } else {
        endGame();
        setShowGameResult(true);
      }
    }
  }, [timeLeft, multiplayer, endGame]);

  // For multiplayer, update display time when props change
  useEffect(() => {
    if (multiplayer) {
      setRemainingTime(time);
    }
  }, [time, multiplayer]);

  return (
    <div className="relative">
      <div className="bg-[#F5F5F5] rounded-2xl shadow-sm p-4">
        <h3 className="text-purple-500 text-lg font-medium mb-3">STATISTICS</h3>

        <div className="bg-white rounded-xl p-4">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-base">Time Left:</span>
              <span
                className={`text-lg font-medium ${
                  multiplayer 
                    ? 'text-green-500' // Always green for multiplayer (controlled by parent)
                    : isPlaying 
                      ? 'text-green-500' 
                      : 'text-red-500'
                }`}
              >
                {remainingTime}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-base">
                {multiplayer ? "Score" : "Pot. Win"}
              </span>
              <span className="text-black text-lg font-bold">
                {multiplayer ? myScore : potWin}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-base">Scores</span>
              <span className="text-black text-lg font-bold">{scores}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Only show GameResultPopup for single-player games */}
      {showGameResult && !multiplayer && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <GameResultPopup isWin={false} isMultiplayer={multiplayer} />
        </div>
      )}
    </div>
  );
}
