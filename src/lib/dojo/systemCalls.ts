import { IWorld } from "@dojoengine/core";
import { SystemCalls, Genre } from "./types";

export const createSystemCalls = (world: any, components: any): SystemCalls => {
    return {
        createRound: async (genre: Genre) => {
            const tx = await world.execute("lyricsflip::systems::actions::create_round", [genre]);
            return tx.transaction_hash;
        },

        joinRound: async (roundId: string) => {
            await world.execute("lyricsflip::systems::actions::join_round", [roundId]);
        },

        startRound: async (roundId: string) => {
            await world.execute("lyricsflip::systems::actions::start_round", [roundId]);
        },

        isRoundPlayer: async (roundId: string, player: string) => {
            const result = await world.execute("lyricsflip::systems::actions::is_round_player", [roundId, player]);
            return result[0] === "1";
        },

        addLyricsCard: async (genre: Genre, artist: string, title: string, year: string, lyrics: string) => {
            const tx = await world.execute("lyricsflip::systems::actions::add_lyrics_card", [
                genre,
                artist,
                title,
                year,
                lyrics
            ]);
            return tx.transaction_hash;
        },

        setCardsPerRound: async (cardsPerRound: number) => {
            await world.execute("lyricsflip::systems::config::set_cards_per_round", [cardsPerRound]);
        },

        setAdminAddress: async (adminAddress: string) => {
            await world.execute("lyricsflip::systems::config::set_admin_address", [adminAddress]);
        }
    };
}; 