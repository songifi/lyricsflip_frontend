import { useGameService } from "@/hooks/useGameService";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

export const AdminConfig = () => {
    const { setCardsPerRound, isLoading, error } = useGameService();
    const [cardsPerRound, setCardsPerRoundValue] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numCards = parseInt(cardsPerRound);
        if (isNaN(numCards) || numCards <= 0) {
            alert("Please enter a valid number of cards");
            return;
        }
        await setCardsPerRound(numCards);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Admin Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="cardsPerRound" className="block text-sm font-medium text-gray-700">
                        Cards Per Round
                    </label>
                    <Input
                        id="cardsPerRound"
                        type="number"
                        value={cardsPerRound}
                        onChange={(e) => setCardsPerRoundValue(e.target.value)}
                        min="1"
                        required
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Configuration"}
                </Button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
}; 