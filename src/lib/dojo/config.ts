import { IWorld } from "@dojoengine/core";
import { createSystemCalls } from "@/lib/dojo/systemCalls";
import { setupWorld } from "@/lib/dojo/world";

export const setupDojo = async () => {
    const world = await setupWorld();
    const components = {}; // We'll define components based on your contract
    const systemCalls = createSystemCalls(world, components);

    return {
        world,
        components,
        systemCalls,
    };
}; 