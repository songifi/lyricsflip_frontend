import { X } from 'lucide-react';
import { useState } from 'react';
import { useModalStore } from '@/store/modal-store';
import { useSystemCalls, GameMode, ChallengeType, genreToFelt252, stringToFelt252 } from "../../lib/dojo/useSystemCalls";
import { useAccount } from "@starknet-react/core";
import { toast } from 'sonner';

export default function CreateChallenge() {
  const currency_Amount = { STRK: '18,678', USD: '5,676' };
  const [formData, setFormData] = useState({
    challengeType: 'Random' as keyof typeof ChallengeType,
    genre: '',
    year: '',
    decade: '',
    artist: '',
  });
  const [errors, setErrors] = useState({
    challengeType: '',
    genre: '',
    year: '',
    decade: '',
    artist: '',
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

  const handleChallengeTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      challengeType: value as keyof typeof ChallengeType,
      // Clear dependent fields when challenge type changes
      genre: '',
      year: '',
      decade: '',
      artist: '',
    }));
    // Clear all errors when challenge type changes
    setErrors({
      challengeType: '',
      genre: '',
      year: '',
      decade: '',
      artist: '',
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Validate based on challenge type
    switch (formData.challengeType) {
      case 'Genre':
        if (!formData.genre) {
          newErrors.genre = 'Please select a genre';
          valid = false;
        }
        break;
      case 'Year':
        if (!formData.year) {
          newErrors.year = 'Please select a year';
          valid = false;
        } else {
          const year = parseInt(formData.year);
          if (year < 1950 || year > new Date().getFullYear()) {
            newErrors.year = `Year must be between 1950 and ${new Date().getFullYear()}`;
            valid = false;
          }
        }
        break;
      case 'Artist':
        if (!formData.artist.trim()) {
          newErrors.artist = 'Please enter an artist name';
          valid = false;
        } else if (formData.artist.trim().length > 31) {
          newErrors.artist = 'Artist name too long (max 31 characters)';
          valid = false;
        }
        break;
      case 'Decade':
        if (!formData.decade) {
          newErrors.decade = 'Please select a decade';
          valid = false;
        }
        break;
      case 'GenreAndDecade':
        if (!formData.genre) {
          newErrors.genre = 'Please select a genre';
          valid = false;
        }
        if (!formData.decade) {
          newErrors.decade = 'Please select a decade';
          valid = false;
        }
        break;
      // Random type needs no additional validation
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
      console.log("Creating challenge round...");

      // Prepare challenge parameters based on type
      let challengeType: ChallengeType;
      let challengeParam1: string | undefined;
      let challengeParam2: string | undefined;

      switch (formData.challengeType) {
        case 'Random':
          challengeType = ChallengeType.Random;
          break;
        case 'Genre':
          challengeType = ChallengeType.Genre;
          challengeParam1 = genreToFelt252(formData.genre);
          break;
        case 'Year':
          challengeType = ChallengeType.Year;
          challengeParam1 = formData.year;
          break;
        case 'Artist':
          challengeType = ChallengeType.Artist;
          challengeParam1 = stringToFelt252(formData.artist.trim());
          break;
        case 'Decade':
          challengeType = ChallengeType.Decade;
          challengeParam1 = formData.decade;
          break;
        case 'GenreAndDecade':
          challengeType = ChallengeType.GenreAndDecade;
          challengeParam1 = genreToFelt252(formData.genre);
          challengeParam2 = formData.decade;
          break;
        default:
          throw new Error('Invalid challenge type');
      }

      // Create the round with Challenge mode
      const roundId = await createRound(
        GameMode.Challenge,
        challengeType,
        challengeParam1,
        challengeParam2
      );

      console.log("Challenge round created successfully with ID:", roundId.toString());
      console.log("Challenge parameters:", {
        type: formData.challengeType,
        param1: challengeParam1,
        param2: challengeParam2,
        formData
      });

      // Prepare challenge details for display
      const challengeDetails: any = { type: formData.challengeType };
      switch (formData.challengeType) {
        case 'Genre':
          challengeDetails.genre = formData.genre;
          break;
        case 'Year':
          challengeDetails.year = formData.year;
          break;
        case 'Artist':
          challengeDetails.artist = formData.artist;
          break;
        case 'Decade':
          challengeDetails.decade = formData.decade;
          break;
        case 'GenreAndDecade':
          challengeDetails.genre = formData.genre;
          challengeDetails.decade = formData.decade;
          break;
      }

      // Show success toast with round ID
      toast.success('🎉 Challenge created successfully!', {
        description: `Round ID: ${roundId.toString()} | Type: ${formData.challengeType}`,
        duration: 4000,
      });

      // Close this modal and open waiting modal with the real round ID
      closeModal();
      setTimeout(() => {
        openModal('waiting-for-opponent', {
          roundId: roundId.toString(),
          creatorAddress: account?.address,
          challengeDetails
        });
      }, 100);

    } catch (err) {
      console.error("Failed to create challenge round:", err);
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

  // Generate year options from 1950 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  // Generate decade options
  const decadeOptions = ['1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'];

  return (
    <>
      <div className="w-full flex flex-col gap-[4px]">
        <h1
          aria-label="Create Challenge"
          className="text-[24px] font-[600]"
        >
          Create Challenge
        </h1>
        <p className="text-[14px] font-[400] text-[#120029]">
          Create a custom challenge with specific filtering criteria for other players to join.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[16px] text-[#212121] text-[14px] mt-5"
      >
        {/* Challenge Type Selection */}
        <div className="flex flex-col gap-[8px]">
          <label className="font-[500]">Challenge Type</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(ChallengeType).filter(key => isNaN(Number(key))).map((type) => (
              <label key={type} className="flex items-center gap-2 p-3 border border-[#DBE2E8] rounded-[4px] cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="challengeType"
                  value={type}
                  checked={formData.challengeType === type}
                  onChange={(e) => handleChallengeTypeChange(e.target.value)}
                  disabled={isCreating}
                  className="text-[#9747FF]"
                />
                <span className="text-sm">{type === 'GenreAndDecade' ? 'Genre & Decade' : type}</span>
              </label>
            ))}
          </div>
          {errors.challengeType && (
            <p className="text-red-500 text-xs">{errors.challengeType}</p>
          )}
        </div>

        {/* Conditional Parameter Inputs */}
        {(formData.challengeType === 'Genre' || formData.challengeType === 'GenreAndDecade') && (
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
        )}

        {formData.challengeType === 'Year' && (
          <div className="flex flex-col gap-[8px]">
            <label className="font-[500]" htmlFor="year">
              Year
            </label>
            <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
              <select
                className="outline-none w-full p-[12px]"
                name="year"
                id="year"
                value={formData.year}
                onChange={handleChange}
                disabled={isCreating}
              >
                <option value="">Select a year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            {errors.year && (
              <p className="text-red-500 text-xs">{errors.year}</p>
            )}
          </div>
        )}

        {formData.challengeType === 'Artist' && (
          <div className="flex flex-col gap-[8px]">
            <label className="font-[500]" htmlFor="artist">
              Artist Name
            </label>
            <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
              <input
                type="text"
                className="outline-none w-full p-[12px]"
                name="artist"
                id="artist"
                value={formData.artist}
                onChange={handleChange}
                disabled={isCreating}
                placeholder="Enter artist name (max 31 characters)"
                maxLength={31}
              />
            </div>
            {errors.artist && (
              <p className="text-red-500 text-xs">{errors.artist}</p>
            )}
          </div>
        )}

        {(formData.challengeType === 'Decade' || formData.challengeType === 'GenreAndDecade') && (
          <div className="flex flex-col gap-[8px]">
            <label className="font-[500]" htmlFor="decade">
              Decade
            </label>
            <div className="border border-[#DBE2E8] px-[12px] rounded-[4px]">
              <select
                className="outline-none w-full p-[12px]"
                name="decade"
                id="decade"
                value={formData.decade}
                onChange={handleChange}
                disabled={isCreating}
              >
                <option value="">Select a decade</option>
                {decadeOptions.map(decade => (
                  <option key={decade} value={decade}>{decade}s</option>
                ))}
              </select>
            </div>
            {errors.decade && (
              <p className="text-red-500 text-xs">{errors.decade}</p>
            )}
          </div>
        )}

        <div className="w-full mt-8">
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
