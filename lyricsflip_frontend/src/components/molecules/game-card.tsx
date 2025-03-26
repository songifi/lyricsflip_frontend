'use client';

import { Card } from '@/components/molecules/card';
import { CloudLightningIcon as LightningBolt, Target, Users, Zap } from 'lucide-react';

interface GameCardProps {
  type: 'quick' | 'wager-single' | 'wager-multi' | 'challenge'
  title: string
  description: string
  onClick?: () => void
}

export function GameCard({ type, title, description, onClick }: GameCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'quick':
        return (
          <div className="bg-purple-600 p-2 rounded-full">
            <Zap className="h-5 w-5 text-white" />
          </div>
        );
      case 'wager-single':
        return (
          <div className="bg-blue-500 p-2 rounded-full">
            <Target className="h-5 w-5 text-white" />
          </div>
        );
      case 'wager-multi':
        return (
          <div className="bg-orange-500 p-2 rounded-full">
            <Users className="h-5 w-5 text-white" />
          </div>
        );
      case 'challenge':
        return (
          <div className="bg-pink-600 p-2 rounded-full">
            <LightningBolt className="h-5 w-5 text-white" />
          </div>
        );
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'quick':
        return 'purple';
      case 'wager-single':
        return 'blue';
      case 'wager-multi':
        return 'orange';
      case 'challenge':
        return 'pink';
    }
  };

  return (
    <Card
      variant={getVariant()}
      icon={getIcon()}
      title={title}
      description={description}
      className="cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    />
  );
}

