'use client';

import { GameCard } from '../molecules/game-mode-card';

export type GameOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgPattern: string;
  bgColor: string;
  borderColor: string;
};

const gameOptions: GameOption[] = [
  {
    id: 'quick-game',
    title: 'Quick Game',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    icon: '/quick.svg',
    color: 'bg-[#9747FF]',
    bgPattern: '/cardline.svg',
    bgColor: 'bg-[#EDE9F2]', // First card background
    borderColor: 'border-[#E0D9E8]', // First card border
  },
  {
    id: 'single-player',
    title: 'Wager (Single Player)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    icon: '/wagersingle.svg',
    color: 'bg-[#3F8AB6]',
    bgPattern: '/card2line.svg',
    bgColor: 'bg-[#E1EDF4]', // Second card background
    borderColor: 'border-[#D2E4EF]', // Second card border
  },
  {
    id: 'multi-player',
    title: 'Wager (Multi Player)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    icon: '/wagermulti.svg',
    color: 'bg-[#DF7A16]',
    bgPattern: '/card3line.svg',

    bgColor: 'bg-[#F6EDE5]', // Third card background
    borderColor: 'border-[ #EFE0D2]', // Third card border
  },
  {
    id: 'challenge',
    title: 'Join a Challenge',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    icon: '/join.svg',
    color: 'bg-[#7D1D3F]',
    bgPattern: '/card4line.svg',
    bgColor: 'bg-[#F2E6EA]', // Last card background (assuming same as third unless you specify otherwise)
    borderColor: 'border-[#EAD7DD]', // Last card border
  },
];

interface GameOptionsProps {
  onSelectGame?: (gameId: string) => void;
}

export function GameOptions({ onSelectGame }: GameOptionsProps) {
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 w-full">
        {gameOptions.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onSelect={onSelectGame ? () => onSelectGame(game.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
