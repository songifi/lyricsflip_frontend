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
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: '/quick.svg',
    color: 'bg-[#9747FF]',
    bgPattern: '/cardline.svg',
    bgColor: 'bg-[#EDE9F2]',
    borderColor: 'border-[#E0D9E8]',
  },
  {
    id: 'single-player',
    title: 'Wager (Single Player)',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: '/wagersingle.svg',
    color: 'bg-[#3F8AB6]',
    bgPattern: '/card2line.svg',
    bgColor: 'bg-[#E1EDF4]',
    borderColor: 'border-[#D2E4EF]',
  },
  {
    id: 'multi-player',
    title: 'Wager (Multi Player)',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: '/wagermulti.svg',
    color: 'bg-[#DF7A16]',
    bgPattern: '/card3line.svg',
    bgColor: 'bg-[#F6EDE5]',
    borderColor: 'border-[#EFE0D2]',
  },
  {
    id: 'challenge',
    title: 'Join a Challenge',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: '/join.svg',
    color: 'bg-[#7D1D3F]',
    bgPattern: '/card4line.svg',
    bgColor: 'bg-[#F2E6EA]',
    borderColor: 'border-[#EAD7DD]',
  },
];

interface GameOptionsProps {
  onSelectGame?: (gameId: string) => void;
}

export function GameOptions({ onSelectGame }: GameOptionsProps) {
  const handleGameSelect = (game: GameOption) => {
    // Store selected game mode in localStorage
    localStorage.setItem('selectedGameMode', game.id);
    
    if (onSelectGame) {
      onSelectGame(game.id);
    }
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2 w-full">
      {gameOptions.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onSelect={() => handleGameSelect(game)}
        />
      ))}
    </div>
  );
}