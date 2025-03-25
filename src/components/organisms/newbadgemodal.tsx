'use client';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

interface BadgeModalProps {
  onClose: () => void;
}

const BadgeModal = ({ onClose }: BadgeModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-end px-8 bg-[#0000004f]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-2xl shadow-lg relative px-[2em] py-[2em] justify-between h-[90vh] flex flex-col gap-[4em] m text-center"
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black border rounded-full p-1"
          onClick={onClose}
        >
          <IoClose size={24} />
        </button>

        <div className="flex flex-col items-center justify-center h-[90vh]">
          {/* Badge Image */}
          <div className="flex justify-center">
            <img src="/newbadge.png" alt="Badge" className="w-[10em]" />
          </div>

          {/* Title */}
          <h2 className="text-[32px] font-bold mt-4">
            You Just earned a new badge
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm mt-2">
            You just earned yourself a new badge. "Music Connoisseur". 
            Well done 👏
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <button className="cursor-pointer border hover:bg-purple-600 hover:text-[#fff] border-purple-600 text-purple-600 px-4 py-4 w-[50%] rounded-full">
            Share
          </button>
          <button className="cursor-pointer hover:bg-white border border-purple-600  hover:text-purple-600 bg-purple-600 text-white px-6 py-4 rounded-full w-[50%]">
            Play Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BadgeModal;
