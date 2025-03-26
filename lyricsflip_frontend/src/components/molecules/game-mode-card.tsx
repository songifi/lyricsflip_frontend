'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/atoms/card';
import { GameOption } from '../organisms/game-mode-selection';

interface GameCardProps {
  game: GameOption;
  onSelect?: () => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const { title, description, icon, color, bgPattern, bgColor, borderColor } =
    game;

  return (
    <Card
      className={cn(
        'relative overflow-hidden px-5 py-5 lg:p-10 transition-transform hover:scale-[1.02] cursor-pointer rounded-md border max-w-[20rem] mx-auto sm:max-w-none w-full',
        bgColor,
        borderColor,
      )}
      onClick={onSelect}
    >
      <div className="absolute inset-0 z-0 ">
        <Image src={bgPattern} alt="" fill priority className="object-cover" />
      </div>
      <CardContent className="relative z-10 flex flex-col gap-5 p-0 lg:max-w-[21rem] lg:px-3">
        <div
          className={cn(
            'rounded-full w-12 h-12 items-center flex justify-center',
            color,
          )}
        >
          <Image
            src={icon}
            alt={title}
            width={24}
            height={24}
            priority
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-1 ">
          <h3 className="text-darkgeist  font-sans text-sm md:text-xl font-semibold leading-[30px]">
            {title}
          </h3>
          <p className="text-darkgeist  font-sans text-xs md:text-sm font-normal leading-[26px]">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
