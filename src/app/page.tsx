import Welcome from '@/components/atoms/welcome';
import { GameOptions } from '@/components/organisms/game-mode-selection';

export default function Home() {
  return (
    <main className="lg:max-w-[53rem] mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      <Welcome />
      <GameOptions />
    </main>
  );
}
