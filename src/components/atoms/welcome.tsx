import Image from 'next/image';
import React from 'react';

const Welcome = () => {
  const username = 'thetimileyin';

  return (
    <div className=" flex flex-col gap-5 md:gap-10 mb-6">
      <div className=" md:py-5 items-center flex justify-between md:border-b border-e-whiteSecondary2 ">
        <h2 className="text-gray font-interv text-sm md:text-[20px] font-normal leading-[32px]">
          Welcome <span className="md:hidden">👋</span>{' '}
          <br className="md:hidden" />{' '}
          <span className="hidden md:inline-block">to LyricsFlip, </span>{' '}
          <span className="md:text-purplePrimary5  text-textdark  font-bold text-base md:text-[20px] md:font-medium">
            {username}
          </span>
        </h2>
        <div className="rounded-full border p-2.5 md:hidden border-e-whiteSecondary2 ">
          <Image
            src="/bell.svg"
            alt="bell"
            width={20}
            height={20}
            priority
            className="object-cover"
          />
        </div>
      </div>
      <h2 className=" text-textdark   font-interv  text-[14px] font-medium leading-[22px] tracking-[1.12px]">
        CHOOSE YOUR PREFERRED GAME MODE
      </h2>
    </div>
  );
};

export default Welcome;
