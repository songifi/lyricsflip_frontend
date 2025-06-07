import { X } from 'lucide-react';
import { useState } from 'react';
import { useModalStore } from '@/store/modal-store';
import { useSystemCalls } from "../../lib/dojo/useSystemCalls";
import { useAccount } from "@starknet-react/core";
import { CairoCustomEnum } from "starknet";
import { toast } from 'sonner';

export default function CreateChallenge() {
  const currency_Amount = { STRK: '18,678', USD: '5,676' };
  const [formData, setFormData] = useState({
    genre: '',
    level: '',
    duration: '',
    numbersOfPlayers: '',
    amount: '',
  });
  const [errors, setErrors] = useState({
    genre: '',
    level: '',
    duration: '',
    numbersOfPlayers: '',
    amount: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const { closeModal, openModal } = useModalStore();
  const { account } = useAccount();
  const { createRound } = useSystemCalls();

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.genre) {
      newErrors.genre = 'Please select a genre';
      valid = false;
    }
    if (!formData.level) {
      newErrors.level = 'Please select a difficulty level';
      valid = false;
    }
    if (!formData.duration) {
      newErrors.duration = 'Please select a duration';
      valid = false;
    }
    if (!formData.numbersOfPlayers) {
      newErrors.numbersOfPlayers = 'Please select number of players';
      valid = false;
    }
    if (!formData.amount) {
      newErrors.amount = 'Please enter wager amount';
      valid = false;
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const GENRE_ENUM_MAP: Record<string, string> = {
    pop: "Pop",
    rock: "Rock",
    hiphop: "HipHop",
    rnb: "Rnb",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields', {
        description: 'Check the form for any missing information',
        duration: 3000,
      });
      return;
    }
    
    try {
      setIsCreating(true);
      console.log("Creating round...");
      
      const cairoVariant = GENRE_ENUM_MAP[formData.genre];
      const genreEnum = new CairoCustomEnum({ [cairoVariant]: {} });
      
      const roundId = await createRound(genreEnum);
      console.log("Round created successfully with ID:", roundId.toString());
      
      // Show success toast with round ID
      toast.success('🎉 Round created successfully!', {
        description: `Round ID: ${roundId.toString()}`,
        duration: 3000,
      });
      
      // Close this modal and open waiting modal with the real round ID
      closeModal();
      setTimeout(() => {
        openModal('waiting-for-opponent', { 
          roundId: roundId.toString(),
          creatorAddress: account?.address 
        });
      }, 100);
      
    } catch (err) {
      console.error("Failed to create round:", err);
      toast.error('Failed to create round', {
        description: 'Please try again',
        duration: 4000,
      });
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    closeModal();
  };

  return (
    <>
      <div className="w-full flex flex-col gap-[4px]">
        <h1
          aria-label="Wager (Multi Player) "
          className="text-[24px] font-[600]"
        >
          Wager (Multi Player)
        </h1>
        <p className="text-[14px] font-[400] text-[#120029]">
          Qorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
          vulputate libero et velit interdum,
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[16px] text-[#212121] text-[14px] mt-5"
      >
        <div className="flex flex-col gap-[8px]">
          <label className="font-[500]" htmlFor="genre">
            Genre
          </label>
          <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
            <select
              className="outline-none w-full p-[12px]"
              name="genre"
              id="genre"
              value={formData.genre}
              onChange={handleChange}
              disabled={isCreating}
            >
              <option value="">Select a genre</option>
              <option value="hiphop">HipHop</option>
              <option value="afrobeats">Rock</option>
              <option value="pop">Pop</option>
            </select>
          </div>
          {errors.genre && (
            <p className="text-red-500 text-xs">{errors.genre}</p>
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="font-[500]" htmlFor="level">
            Difficulty Level
          </label>
          <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
            <select
              className="outline-none w-full p-[12px]"
              name="level"
              id="level"
              value={formData.level}
              onChange={handleChange}
              disabled={isCreating}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          {errors.level && (
            <p className="text-red-500 text-xs">{errors.level}</p>
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="font-[500]" htmlFor="duration">
            Duration
          </label>
          <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
            <select
              className="outline-none w-full p-[12px]"
              name="duration"
              id="duration"
              value={formData.duration}
              onChange={handleChange}
              disabled={isCreating}
            >
              <option value="">Select duration</option>
              <option value="15">15 sec</option>
              <option value="30">30 sec</option>
              <option value="60">60 sec</option>
            </select>
          </div>
          {errors.duration && (
            <p className="text-red-500 text-xs">{errors.duration}</p>
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="font-[500]" htmlFor="numbersOfPlayers">
            Number of Players
          </label>
          <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
            <select
              className="outline-none w-full p-[12px]"
              name="numbersOfPlayers"
              id="numbersOfPlayers"
              value={formData.numbersOfPlayers}
              onChange={handleChange}
              disabled={isCreating}
            >
              <option value="">Select players</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          {errors.numbersOfPlayers && (
            <p className="text-red-500 text-xs">{errors.numbersOfPlayers}</p>
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="font-[500]" htmlFor="amount">
            Wager Amount
          </label>
          <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
            <input
              className="outline-none appearance-none w-full p-[12px]"
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="1"
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-xs">{errors.amount}</p>
          )}
          <p className="flex space-x-2 items-center">
            <span className="font-[400] text-[12px]">Wallet Balance:</span>
            {currency_Amount &&
              Object.entries(currency_Amount).map(
                ([key, value]: [string, string]) => (
                  <span
                    key={key}
                    className="font-[500] text-[#9747FF] text-[12px]"
                  >
                    {' '}
                    {value} {key}
                  </span>
                ),
              )}
          </p>
        </div>

        <div className="w-full mt-20">
          <button
            type="submit"
            disabled={isCreating}
            className="text-[16px] font-[500] w-full hover:bg-transparent hover:border border-[#9747FF] hover:text-[#9747FF] transition-colors duration-200 rounded-full bg-[#9747FF] text-white py-[24px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Challenge...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </>
  );
}
