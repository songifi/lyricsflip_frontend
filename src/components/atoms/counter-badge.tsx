import { cn } from '@/lib/utils';

interface CounterBadgeProps {
  count: number
  label: string
  className?: string
}

export function CounterBadge({ count, label, className }: CounterBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <span className="font-bold text-purple-600">{count}</span>
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

