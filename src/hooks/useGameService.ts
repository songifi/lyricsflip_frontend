import { useState } from 'react';
import { useDojo } from '@/lib/dojo/DojoProvider';
import { Round, Genre } from '@/lib/dojo/types';

export const useGameService = () => {
    const { world } = useDojo();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRound = async (genre: Genre, wagerAmount: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await world.execute("lyricsflip::systems::actions::create_round", [genre, wagerAmount]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create round');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const joinRound = async (roundId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await world.execute("lyricsflip::systems::actions::join_round", [roundId]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join round');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const startRound = async (roundId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await world.execute("lyricsflip::systems::actions::start_round", [roundId]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start round');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getRound = async (roundId: string): Promise<Round> => {
        setIsLoading(true);
        setError(null);
        try {
            const round = await world.execute("lyricsflip::systems::actions::get_round", [roundId]);
            return round;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get round');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createRound,
        joinRound,
        startRound,
        getRound,
        isLoading,
        error
    };
}; 