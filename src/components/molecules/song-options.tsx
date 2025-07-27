'use client';

interface SongOption {
  title: string;
  artist: string;
}

interface SongOptionsProps {
  options: SongOption[];
  onSelect: (option: SongOption, index: number) => void;
  selectedOption?: SongOption | null;
  isCorrect?: boolean | null; // Changed: simple boolean to indicate if the selected answer was correct
}

export function SongOptions({
  options,
  onSelect,
  selectedOption = null,
  isCorrect = null, // Changed: renamed from correctOption to isCorrect
}: SongOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {options.map((option, index) => {
        const isSelected = selectedOption?.title === option.title;

        // Removed debug logging to reduce console noise

        let buttonClasses =
          'text-left p-4 rounded-lg transition-all duration-200 ';

        // Simplified logic: show feedback only on the selected option
        if (isSelected && isCorrect === true) {
          // Selected option is correct - show green
          buttonClasses += 'bg-green-100 border-2 border-green-500';
        } else if (isSelected && isCorrect === false) {
          // Selected option is wrong - show red
          buttonClasses += 'bg-red-100 border-2 border-red-500';
        } else if (isSelected) {
          // Selected but no feedback yet - show selected state
          buttonClasses += 'bg-blue-100 border-2 border-blue-500';
        } else {
          // Default state
          buttonClasses += 'bg-purple-50 border border-purple-100 hover:border-purple-300';
        }

        return (
          <button
            key={index}
            onClick={() => onSelect(option, index)}
            className={buttonClasses}
            disabled={selectedOption !== null}
          >
            <h3 className="font-medium text-gray-900">{option.title}</h3>
            <p className="text-sm text-gray-600">{option.artist}</p>
          </button>
        );
      })}
    </div>
  );
}
