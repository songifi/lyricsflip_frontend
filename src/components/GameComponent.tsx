'use client'
import React, { useEffect } from 'react';
import { useStore } from '../store';

const GameComponent = () => {
  // Destructuring values from the store with hooks
  const { 
    game: { score, level, isPlaying },
    user: { username, preferences: { theme } },
  } = useStore();

  // Destructuring actions from the store
  const { 
    game: { incrementScore, startGame, endGame },
    user: { toggleTheme },
  } = useStore();

  useEffect(() => {
    // Example of using the store in a component
    if (isPlaying) {
      const timer = setInterval(() => {
        incrementScore(1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isPlaying, incrementScore]);

  return (
    <div className={`game-container ${theme}`}>
      <h1>Game Component</h1>
      {username && <p>Welcome, {username}!</p>}
      <p>Score: {score}</p>
      <p>Level: {level}</p>
      <button onClick={() => isPlaying ? endGame() : startGame()}>
        {isPlaying ? 'End Game' : 'Start Game'}
      </button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

export default GameComponent;