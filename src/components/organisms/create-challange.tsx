import { X } from 'lucide-react';
import { useState } from 'react';
import { useModalStore } from '@/store/modal-store';
import { useSystemCalls, GameMode, ChallengeType, genreToFelt252 } from "../../lib/dojo/useSystemCalls";
import { useAccount } from "@starknet-react/core";
import { toast } from 'sonner';

export default function CreateChallenge() {
  const currency_Amount = { STRK: '18,678', USD: '5,676' };
  const [formData, setFormData] = useState({
    genre: '',
  });
  const [errors, setErrors] = useState({
    genre: '',
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

    setErrors(newErrors);
    return valid;
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
      console.log("Creating multiplayer round...");
      
      // Create the round with MultiPlayer mode (Challenge mode requires lyrics cards)
      const roundId = await createRound(
        GameMode.MultiPlayer, // Use MultiPlayer mode for basic multiplayer games
        undefined, // No challenge type needed for MultiPlayer mode
        undefined, // No challenge parameters needed
        undefined
      );
      
      console.log("Round created successfully with ID:", roundId.toString());
      console.log("Round parameters:", {
        mode: "MultiPlayer",
        genre: formData.genre,
      });
      
      // Show success toast with round ID
      toast.success('🎉 Challenge created successfully!', {
        description: `Round ID: ${roundId.toString()} | Genre: ${formData.genre}`,
        duration: 4000,
      });
      
      // Close this modal and open waiting modal with the real round ID
      closeModal();
      setTimeout(() => {
        openModal('waiting-for-opponent', { 
          roundId: roundId.toString(),
          creatorAddress: account?.address,
          challengeDetails: {
            genre: formData.genre,
          }
        });
      }, 100);
      
    } catch (err) {
      console.error("Failed to create round:", err);
      toast.error('Failed to create challenge', {
        description: err instanceof Error ? err.message : 'Please try again',
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
              <option value="HipHop">Hip Hop</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="RnB">R&B</option>
              <option value="Electronic">Electronic</option>
              <option value="Classical">Classical</option>
              <option value="Jazz">Jazz</option>
              <option value="Country">Country</option>
              <option value="Blues">Blues</option>
              <option value="Reggae">Reggae</option>
              <option value="Afrobeat">Afrobeat</option>
              <option value="Gospel">Gospel</option>
              <option value="Folk">Folk</option>
            </select>
          </div>
          {errors.genre && (
            <p className="text-red-500 text-xs">{errors.genre}</p>
          )}
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
