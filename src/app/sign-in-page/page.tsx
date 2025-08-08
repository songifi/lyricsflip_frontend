"use client";
import Image from 'next/image';
import { useConnect } from "@starknet-react/core";
import { getWalletConfig } from "@/lib/dojo/config";
import ControllerConnector from "@cartridge/connector/controller";

export default function SignUpPage() {
  const { connect, connectors } = useConnect();
  const walletConfig = getWalletConfig();

  const handleConnect = async () => {
    try {
      if (!walletConfig.useKatanaAccounts) {
        const controller = ControllerConnector.fromConnectors(connectors as any);
        // Retry a few times if the controller iframe/keychain isn’t ready yet
        for (let attempt = 0; attempt < 5; attempt += 1) {
          try {
            await connect({ connector: controller });
            return;
          } catch (e: any) {
            const msg = String(e?.message || e);
            if (!/not ready|timeout waiting for keychain|The message port closed|Could not establish connection/i.test(msg)) {
              throw e;
            }
            await new Promise((r) => setTimeout(r, 700));
          }
        }
        // Final attempt
        await connect({ connector: controller });
        return;
      }
      const first = connectors[0];
      if (first) {
        await connect({ connector: first });
      }
    } catch (err) {
      console.error('Connect failed:', err);
    }
  };
  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
      {/* Left Column - Sign Up Form */}
      <div className="bg-white flex min-w-0 flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="w-full max-w-none whitespace-normal">
          <h1 className="text-[#090909] text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            Have fun guessing the lyrics to your favourite song
          </h1>
          <p className="text-[#121212] mt-4 text-sm text-muted-foreground md:text-base break-normal whitespace-normal">
            You could have fun, wager against yourself or wager against friends
            and earn while you are at it.
          </p>

          <div className="mt-8 space-y-4">
            <button className="bg-[#DBE1E7] cursor-pointer text-[#090909] rounded-full flex w-full items-center justify-center gap-2 py-6">
              <Image
                src="/image3.png"
                width={24}
                height={24}
                alt="Argent logo"
                className="h-6 w-6"
              />
              <span>Continue with Argent</span>
            </button>

            <button className="bg-[#DBE1E7] cursor-pointer text-[#090909] rounded-full flex w-full items-center justify-center gap-2 py-6">
              <Image
                src="/image2.png"
                width={24}
                height={24}
                alt="OKX logo"
                className="h-6 w-6"
              />
              <span>Continue with OKX</span>
            </button>

            <button className="bg-[#DBE1E7] cursor-pointer text-[#090909] rounded-full flex w-full items-center justify-center gap-2 py-6">
              <Image
                src="/image1.png"
                width={24}
                height={24}
                alt="Braavos logo"
                className="h-6 w-6"
              />
              <span>Continue with Braavos</span>
            </button>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <span className="bg-[#DBE1E7] w-full h-[1px]"></span>
            <span className="text-[#666666] mr px-2 text-muted-foreground">
              OR
            </span>
            <span className="bg-[#DBE1E7] w-full h-[1px]"></span>
          </div>
        <div className="mt-8 w-full mx-auto">
          <button onClick={handleConnect} className="mt-8 w-full cursor-pointer rounded-full bg-purple-600 py-6 hover:bg-purple-700">
            Connect Wallet
          </button>
        </div>
        </div>
      </div>

      {/* Right Column - Brand */}
      <div className="hidden bg-purple-600 md:flex md:flex-col md:items-center md:justify-center">
        <div className="text-4xl font-bold md:text-5xl lg:text-6xl">
          <span className="text-white">Lyric</span>
          <span className="text-cyan-300">Flip</span>
        </div>
      </div>
    </div>
  );
}
