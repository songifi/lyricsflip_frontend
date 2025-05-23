import { Rounds } from '../typescript/models.gen';
import { BigNumberish } from 'starknet';

export interface RoundValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RoundValidationOptions {
  maxPlayers?: number;
  minWagerAmount?: bigint;
  maxWagerAmount?: bigint;
}

export const validateRound = (
  round: Rounds | undefined,
  options: RoundValidationOptions = {}
): RoundValidationResult => {
  // Default options
  const {
    maxPlayers = 6,
    minWagerAmount = BigInt(0),
    maxWagerAmount = BigInt(1000000) * BigInt(1e18), // 1M STRK
  } = options;

  // Check if round exists
  if (!round) {
    return {
      isValid: false,
      error: 'Round not found',
    };
  }

  // Check round state
  if (round.round.state !== BigInt(0)) {
    return {
      isValid: false,
      error: 'Round is not in waiting state',
    };
  }

  // Check player count
  const currentPlayers = BigInt(round.round.players_count.toString());
  if (currentPlayers >= BigInt(maxPlayers)) {
    return {
      isValid: false,
      error: `Round is full (${currentPlayers}/${maxPlayers} players)`,
    };
  }

  // Check wager amount
  const wagerAmount = BigInt(round.round.wager_amount.toString());
  if (wagerAmount < minWagerAmount) {
    return {
      isValid: false,
      error: `Wager amount too low (minimum: ${Number(minWagerAmount) / 1e18} STRK)`,
    };
  }

  if (wagerAmount > maxWagerAmount) {
    return {
      isValid: false,
      error: `Wager amount too high (maximum: ${Number(maxWagerAmount) / 1e18} STRK)`,
    };
  }

  // Check if round has started
  const startTime = BigInt(round.round.start_time.toString());
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  if (startTime > currentTime) {
    return {
      isValid: false,
      error: 'Round has not started yet',
    };
  }

  // Check if round has ended
  const endTime = BigInt(round.round.end_time.toString());
  if (endTime < currentTime) {
    return {
      isValid: false,
      error: 'Round has already ended',
    };
  }

  return {
    isValid: true,
  };
};

export const validateRoundId = (roundId: string): RoundValidationResult => {
  try {
    // Handle hex format
    if (roundId.startsWith('0x')) {
      // Convert hex to BigInt
      const id = BigInt(roundId);
      if (id <= BigInt(0)) {
        return {
          isValid: false,
          error: 'Invalid round ID',
        };
      }
      return {
        isValid: true,
      };
    }
    
    // Handle decimal format
    const id = BigInt(roundId);
    if (id <= BigInt(0)) {
      return {
        isValid: false,
        error: 'Invalid round ID',
      };
    }
    return {
      isValid: true,
    };
  } catch (e) {
    return {
      isValid: false,
      error: 'Invalid round ID format. Please enter a valid hex or decimal number.',
    };
  }
}; 