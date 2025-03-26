// Mock data
const mockSongs = [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', category: 'Rock', plays: 15000000 },
    { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', category: 'Pop', plays: 12000000 },
    { id: 3, title: 'Shape of You', artist: 'Ed Sheeran', category: 'Pop', plays: 11000000 },
  ];
  
  const mockCategories = [
    { id: 1, name: 'Rock', songCount: 45 },
    { id: 2, name: 'Pop', songCount: 78 },
    { id: 3, name: 'Hip Hop', songCount: 62 },
  ];
  
  const mockLeaderboard = [
    { id: 1, username: 'MusicLover42', points: 4200, rank: 1 },
    { id: 2, username: 'SongMaster', points: 3800, rank: 2 },
    { id: 3, username: 'MelodyQueen', points: 3500, rank: 3 },
  ];
  
  // Mock API functions with simulated delay
  export const fetchSongs = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockSongs;
  };
  
  export const fetchCategories = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
  };
  
  export const fetchLeaderboard = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLeaderboard;
  };