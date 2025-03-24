'use client';

import { ScoreBadge } from '../atoms/score-badge';
import { Card } from './card';



interface SongCardProps {
  title: string
  artist: string
  score?: number
  maxScore?: number
  onClick?: () => void
}

export function SongCard({ title, artist, score, maxScore, onClick }: SongCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="p-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{artist}</p>
        {score && (
          <div className="absolute bottom-3 right-3">
            <ScoreBadge score={score} maxScore={maxScore} />
          </div>
        )}
      </div>
    </Card>
  );
}

