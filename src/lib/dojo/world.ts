import { DojoProvider } from "@dojoengine/core";
import { setupWorld } from "./typescript/contracts.gen";

export const initializeWorld = async (provider: DojoProvider) => {
    return setupWorld(provider);
}; 