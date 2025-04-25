declare module "@dojoengine/core" {
    export interface IWorld {
        execute: (system: string, params: any[]) => Promise<{ transaction_hash: string }>;
    }
    export function createWorld(config: { toriiUrl: string; rpcUrl: string }): Promise<IWorld>;
}

declare module "@dojoengine/torii-client" {
    export class ToriiClient {
        constructor(config: { toriiUrl: string });
    }
} 