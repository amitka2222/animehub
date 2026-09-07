/**
 * Determines whether an anime has English Dub availability
 * based on explicit flag, licensing, mainstream popularity, and format.
 */
export const checkHasDub = (anime) => {
  if (!anime) return false;
  if (typeof anime.hasDub === 'boolean') return anime.hasDub;
  
  const title = (anime.title || '').toLowerCase();
  const knownDubKeywords = [
    'titan', 'hero academia', 'one piece', 'naruto', 'bleach', 'jujutsu', 
    'demon slayer', 'death note', 'fullmetal', 'hunter', 'dragon ball', 
    'slime', 're:zero', 'sword art', 'tokyo ghoul', 'cowboy bebop', 'evangelion', 
    'conan', 'shin-chan', 'doraemon', 'jojo', 'chainsaw', 'spy x family', 
    'haikyu', 'vinland', 'cyberpunk', 'solo leveling', 'fate', 'overlord', 
    'konosuba', 'mob psycho', 'frieren', 'mashle', 'youjo senki', 'danmachi',
    'classroom of the elite', 'kaiju', 'dandadan', 'delicious in dungeon'
  ];
  
  if (knownDubKeywords.some(kw => title.includes(kw))) return true;
  if (anime.season === 'TV' && anime.rank && Number(anime.rank) <= 7) return true;
  
  return false;
};
