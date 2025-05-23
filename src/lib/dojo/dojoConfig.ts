import { createDojoConfig } from "@dojoengine/core";
 
import manifest from "../../../manifest_dev.json";
 
export const dojoConfig = createDojoConfig({
    masterAddress: "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec",
    masterPrivateKey: "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912",
    accountClassHash: "0x07dc7899aa655b0aae51eadff6d801a58e97dd99cf4666ee59e704249e51adf2",
    feeTokenAddress: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    manifest,
});