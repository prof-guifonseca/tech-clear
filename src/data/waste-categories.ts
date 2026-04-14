import { WasteCategoryInfo, WasteItem } from '@/types/waste';

export const WASTE_CATEGORIES: WasteCategoryInfo[] = [
  {
    id: 'papel',
    name: 'Papel e Papelao',
    color: '#0055BF',
    conamaColor: 'Azul',
    icon: '📄',
    xpBase: 10,
    tip: 'Papeis limpos e secos sao 100% reciclaveis. Evite papeis plastificados ou engordurados!',
  },
  {
    id: 'plastico',
    name: 'Plastico',
    color: '#ED1C24',
    conamaColor: 'Vermelho',
    icon: '🧴',
    xpBase: 10,
    tip: 'Lave as embalagens plasticas antes de descartar. Plastico limpo vale mais na reciclagem!',
  },
  {
    id: 'vidro',
    name: 'Vidro',
    color: '#009639',
    conamaColor: 'Verde',
    icon: '🫙',
    xpBase: 12,
    tip: 'O vidro e 100% reciclavel e pode ser reciclado infinitas vezes sem perder qualidade!',
  },
  {
    id: 'metal',
    name: 'Metal',
    color: '#FFD700',
    conamaColor: 'Amarelo',
    icon: '🥫',
    xpBase: 12,
    tip: 'Uma lata de aluminio reciclada economiza 95% da energia necessaria para produzir uma nova!',
  },
  {
    id: 'organico',
    name: 'Organico',
    color: '#8B4513',
    conamaColor: 'Marrom',
    icon: '🍌',
    xpBase: 8,
    tip: 'Residuos organicos podem virar adubo atraves da compostagem. A natureza agradece!',
  },
  {
    id: 'rejeito',
    name: 'Rejeito',
    color: '#808080',
    conamaColor: 'Cinza',
    icon: '🗑️',
    xpBase: 5,
    tip: 'Rejeitos sao residuos que nao podem ser reciclados. Tente reduzir o consumo desses itens!',
  },
];

export const WASTE_ITEMS: WasteItem[] = [
  { id: 'garrafa-pet', name: 'Garrafa PET', icon: '🍶', category: 'plastico', weight: 30, difficulty: 'facil', funFact: 'Uma garrafa PET leva 400 anos para se decompor na natureza!' },
  { id: 'jornal', name: 'Jornal Velho', icon: '📰', category: 'papel', weight: 150, difficulty: 'facil', funFact: 'Cada tonelada de papel reciclado salva 17 arvores!' },
  { id: 'pote-vidro', name: 'Pote de Vidro', icon: '🫙', category: 'vidro', weight: 250, difficulty: 'facil', funFact: 'O vidro leva cerca de 4.000 anos para se decompor!' },
  { id: 'lata-aluminio', name: 'Lata de Aluminio', icon: '🥫', category: 'metal', weight: 15, difficulty: 'facil', funFact: 'O Brasil e campeao mundial em reciclagem de latas de aluminio!' },
  { id: 'casca-banana', name: 'Casca de Banana', icon: '🍌', category: 'organico', weight: 50, difficulty: 'facil', funFact: 'A casca de banana se decompoe em ate 2 anos e e otima para compostagem!' },
  { id: 'caixa-papelao', name: 'Caixa de Papelao', icon: '📦', category: 'papel', weight: 200, difficulty: 'facil', funFact: 'O papelao pode ser reciclado ate 7 vezes antes de perder qualidade!' },
  { id: 'copo-isopor', name: 'Copo de Isopor', icon: '🥤', category: 'rejeito', weight: 5, difficulty: 'medio', funFact: 'O isopor leva mais de 150 anos para se decompor e nao e reciclavel na maioria das cidades.' },
  { id: 'garrafa-vidro', name: 'Garrafa de Vidro', icon: '🍾', category: 'vidro', weight: 350, difficulty: 'facil', funFact: 'Vidro reciclado pode virar nova garrafa em apenas 30 dias!' },
  { id: 'saco-plastico', name: 'Sacola Plastica', icon: '🛍️', category: 'plastico', weight: 8, difficulty: 'facil', funFact: 'Uma sacola plastica pode levar ate 1.000 anos para se decompor!' },
  { id: 'latinha-refri', name: 'Latinha de Refrigerante', icon: '🥤', category: 'metal', weight: 15, difficulty: 'facil', funFact: 'Uma latinha reciclada volta as prateleiras em apenas 60 dias!' },
  { id: 'papel-amassado', name: 'Papel Amassado', icon: '📝', category: 'papel', weight: 10, difficulty: 'facil', funFact: 'Reciclar papel reduz a poluicao da agua em 35% e do ar em 74%!' },
  { id: 'embalagem-salgadinho', name: 'Embalagem de Salgadinho', icon: '🍿', category: 'rejeito', weight: 5, difficulty: 'dificil', funFact: 'Embalagens metalizadas de salgadinho sao feitas de plastico + aluminio, dificeis de reciclar!' },
  { id: 'resto-comida', name: 'Resto de Comida', icon: '🍽️', category: 'organico', weight: 100, difficulty: 'facil', funFact: 'O Brasil desperica cerca de 41 mil toneladas de alimentos por dia!' },
  { id: 'garrafa-leite', name: 'Caixa de Leite', icon: '🥛', category: 'papel', weight: 30, difficulty: 'dificil', funFact: 'Caixas longa vida (Tetra Pak) podem ser recicladas! Sao feitas de papel, plastico e aluminio.' },
  { id: 'prego', name: 'Prego Enferrujado', icon: '🔩', category: 'metal', weight: 20, difficulty: 'medio', funFact: 'Metais podem ser reciclados infinitas vezes sem perder suas propriedades!' },
  { id: 'casca-ovo', name: 'Casca de Ovo', icon: '🥚', category: 'organico', weight: 10, difficulty: 'medio', funFact: 'Cascas de ovo sao ricas em calcio e podem ser usadas como adubo!' },
  { id: 'guardanapo', name: 'Guardanapo Usado', icon: '🧻', category: 'rejeito', weight: 5, difficulty: 'dificil', funFact: 'Papel contaminado com alimentos nao pode ser reciclado e vira rejeito!' },
  { id: 'tampa-garrafa', name: 'Tampa de Garrafa', icon: '⭕', category: 'plastico', weight: 3, difficulty: 'medio', funFact: 'Tampinhas de garrafa podem ser recicladas e existem campanhas solidarias para coleta-las!' },
  { id: 'espelho-quebrado', name: 'Espelho Quebrado', icon: '🪞', category: 'rejeito', weight: 200, difficulty: 'dificil', funFact: 'Espelhos nao sao reciclaveis como vidro comum por causa da camada de metal no fundo!' },
  { id: 'lata-conserva', name: 'Lata de Conserva', icon: '🥫', category: 'metal', weight: 100, difficulty: 'facil', funFact: 'Latas de aco demoram de 50 a 100 anos para se decompor. Recicle sempre!' },
];

export function getCategoryInfo(id: string): WasteCategoryInfo {
  return WASTE_CATEGORIES.find(c => c.id === id) || WASTE_CATEGORIES[0];
}
