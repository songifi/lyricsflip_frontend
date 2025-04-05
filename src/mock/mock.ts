export interface LyricData {
    text: string;
    title: string;
    artist: string;
    options: SongOption[];
  }
  
  export interface SongOption {
    title: string;
    artist: string;
  }
  
  export const MOCK_LYRICS: LyricData[] = [
    {
      text: "I got a feeling that tonight's gonna be a good night",
      title: "I Gotta Feeling",
      artist: "The Black Eyed Peas",
      options: [
        { title: "I Gotta Feeling", artist: "The Black Eyed Peas" },
        { title: "Sweet Dreams", artist: "Eurythmics" },
        { title: "Party Rock Anthem", artist: "LMFAO" },
        { title: "Happy", artist: "Pharrell Williams" },
      ],
    },
    {
      text: "Cause all of me loves all of you, love your curves and all your edges",
      title: "All of Me",
      artist: "John Legend",
      options: [
        { title: "All of Me", artist: "John Legend" },
        { title: "Someone Like You", artist: "Adele" },
        { title: "Perfect", artist: "Ed Sheeran" },
        { title: "Stay With Me", artist: "Sam Smith" },
      ],
    },
    {
      text: "Sweet dreams are made of this, who am I to disagree?",
      title: "Sweet Dreams",
      artist: "Eurythmics",
      options: [
        { title: "Sweet Dreams", artist: "Eurythmics" },
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "Billie Jean", artist: "Michael Jackson" },
        { title: "Imagine", artist: "John Lennon" },
      ],
    },
  ];