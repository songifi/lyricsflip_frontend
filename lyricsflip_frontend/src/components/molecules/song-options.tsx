"use client"

interface SongOption {
  title: string
  artist: string
}

interface SongOptionsProps {
  options: SongOption[]
  onSelect: (option: SongOption, index: number) => void
}

export function SongOptions({ options, onSelect }: SongOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option, index)}
          className="text-left p-4 rounded-lg bg-purple-50 border border-purple-100 hover:border-purple-300 transition-all duration-200"
        >
          <h3 className="font-medium text-gray-900">{option.title}</h3>
          <p className="text-sm text-gray-600">{option.artist}</p>
        </button>
      ))}
    </div>
  )
}

