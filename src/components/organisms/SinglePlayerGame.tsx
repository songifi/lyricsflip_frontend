import { useGameService } from "@/hooks/useGameService";
import { useDojo } from "@/lib/dojo/DojoProvider";
import { useEffect, useState } from "react";
import { LyricsCard } from "@/lib/dojo/types";

export const SinglePlayerGame = () => {
    const { world } = useDojo();
    const { isLoading, error } = useGameService();
    const [lyricCards, setLyricCards] = useState<LyricsCard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    useEffect(() => {
        // Fetch initial lyric cards
        const fetchLyricCards = async () => {
            try {
                // This would be replaced with actual card fetching logic
                const cards = await world.execute("lyricsflip::systems::actions::get_lyric_cards", []);
                setLyricCards(cards);
            } catch (err) {
                console.error("Failed to fetch lyric cards:", err);
            }
        };
        fetchLyricCards();
    }, [world]);

    const handleNextCard = () => {
        if (currentCardIndex < lyricCards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        }
    };

    const handlePreviousCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    };

    const currentCard = lyricCards[currentCardIndex];

    return (
        <div className="container mx-auto px-4 py-8">
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
            ) : currentCard ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">{currentCard.title}</h2>
                    <p className="text-gray-600 mb-2">Artist: {currentCard.artist}</p>
                    <p className="text-gray-600 mb-2">Year: {currentCard.year}</p>
                    <p className="text-gray-600 mb-2">Genre: {currentCard.genre}</p>
                    <div className="mt-4">
                        <p className="whitespace-pre-line">{currentCard.lyrics}</p>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handlePreviousCard}
                            disabled={currentCardIndex === 0}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextCard}
                            disabled={currentCardIndex === lyricCards.length - 1}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center">No lyric cards available</div>
            )}
        </div>
    );
}; 