import React from 'react';
import Image from 'next/image';
import { FaCircleCheck } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { Button } from '@components/atoms/button';
import { X } from 'lucide-react';

interface GameResultProps {
  isWin: boolean;
  isMultiplayer: boolean;
}

const GameResultPopup: React.FC<GameResultProps> = ({
  isWin,
  isMultiplayer,
}) => {
  return (
    <>


    
    <section className=" h-screen  w-full flex flex-col justify-center items-center">
      <main className="w-[580px] h-[960px] py-4 bg-white flex flex-col justify-center  rounded-2xl items-center  ">
        <header className="w-[580px] flex justify-end items-center pr-4 pb-4 ">
          <Button variant="outline" size="icon" className="rounded-full">
            <X className=" h-5 w-5" />
          </Button>
        </header>
        <div className=" w-[500px] h-full  flex flex-col justify-center  items-center">
          <div className="size-[200px]  ">
            <Image
              src={isWin ? '/trophy.png' : '/warning.png'}
              alt={isWin ? 'trophy' : 'lost'}
              width={200}
              height={200}
              className="w-full h-full"
            />
          </div>
          <h1 className="font-semibold text-[32px]  text-[#000000] mb-4">
            <span className="font-bold text-[#70E3C7]">368 Points</span> -{' '}
            {isWin && isMultiplayer ? (
              <span>You won🥇</span>
            ) : isWin ? (
              <span>You are amazing🔥</span>
            ) : (
              <span>You lost😞</span>
            )}
          </h1>

          {/* article for signle player or multiple player */}
          {!isMultiplayer ? (
            <article className="flex flex-col gap-3 w-[500px] text-[#202020] font-medium text-md ">
              {/* article for a single player */}
              <div className="flex justify-between items-center h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Scores</p>
                <h5 className="">10/10 (100%)</h5>
              </div>
              <div className="flex items-center justify-between h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Odds</p>
                <h5 className="flex items-center gap-2">
                  10 odds (Get everything right){' '}
                  <span>
                    {isWin ? (
                      <FaCircleCheck className=" text-green-600 size-5" />
                    ) : (
                      <MdCancel className="text-red-600 size-5" />
                    )}
                  </span>
                </h5>
              </div>
              <div className="flex justify-between items-center h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Wager Amount</p>
                <h5 className="">10,000 STRK (100 USD)</h5>
              </div>

              {isWin && (
                <div className="flex justify-between items-center h-12 py-3 border-b border-gray-200">
                  <p className="font-normal text-[#A4ACB4]">You Win</p>

                  <h5 className=" font-semibold text-[#9747FF]">
                    80,000 STRK (800 USD)
                  </h5>
                </div>
              )}
            </article>
          ) : (
            <article className="flex flex-col gap-3 w-[500px] text-[#202020] font-medium text-md ">
              {/* article for a muitlplayer */}
              <div className="flex justify-between items-center h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Winner</p>
                <h5 className="">
                  {isWin ? <span>You</span> : <span>theXaxxo (678 Pts)</span>}
                </h5>
              </div>
              <div className="flex justify-between items-center h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Prize Won</p>

                <h5 className=" font-semibold text-[#9747FF]">
                  80,000 STRK (800 USD)
                </h5>
              </div>
              <div className="flex justify-between items-center h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Wager Amount</p>
                <h5 className="">10,000 STRK (100 USD)</h5>
              </div>
              <div className="flex items-center justify-between h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Second Place</p>
                <h5 className="flex items-center gap-2">
                  {isWin ? <span>theXaxxo (345 Pts)</span> : <span>You</span>}
                </h5>
              </div>
              <div className="flex items-center justify-between h-12 py-3 border-b border-gray-200">
                <p className="font-normal text-[#A4ACB4]">Third Place</p>
                <h5 className="flex items-center gap-2">theXaxxo (345 Pts)</h5>
              </div>
            </article>
          )}
          {/* button */}
         <main className="flex items-end justify-between w-full  h-full ">
            <Button
              variant="outline"
              size="lg"
              className="w-[238px] px-2 py-6  border-[#9747FF] h-[72px] flex justify-center items-center rounded-full font-medium text-md  text-[#9747FF] "
            >
              Share
            </Button>
            <Button
              variant="purple"
              size="lg"
              className="w-[238px] px-2 py-6  h-[72px] flex justify-center items-center rounded-full font-medium text-md  text-white "
            >
              Claim Earning
            </Button>
          </main>
        </div>
      </main>
    </section>

    
    </>
  );
};

export default GameResultPopup;
