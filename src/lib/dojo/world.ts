import { IWorld } from "@dojoengine/core";
import { createWorld } from "@dojoengine/sdk";
import { ToriiClient } from "@dojoengine/torii-client";

export const setupWorld = async (): Promise<IWorld> => {
    const world = await createWorld({
        toriiUrl: process.env.NEXT_PUBLIC_TORII_URL || "http://localhost:8080",
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:5050",
    });

    return world;
}; 