import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number
  maxScore?: number
  className?: string
}

export function ScoreBadge({ score, maxScore, className }: ScoreBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-sm', className)}>
      <span className="font-bold">{score}</span>
      {maxScore && (
        <>
          <span className="text-purple-200">|</span>
          <span>{maxScore}</span>
        </>
      )}
    </div>
  );
}

