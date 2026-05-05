import type { Topic } from '@/types/community';

export const TOPICS: Topic[] = [
  {
    id: 'plastico',
    label: 'Plástico',
    icon: '♻️',
    color: '#d96355',
    description: 'Coleta, descarte correto e reuso de plástico.',
  },
  {
    id: 'organico',
    label: 'Orgânico',
    icon: '🌱',
    color: '#48d597',
    description: 'Compostagem, hortas e aproveitamento integral.',
  },
  {
    id: 'reuso',
    label: 'Reuso',
    icon: '🔁',
    color: '#7eb6ff',
    description: 'Ideias de segunda vida pra materiais.',
  },
  {
    id: 'eventos',
    label: 'Eventos',
    icon: '📅',
    color: '#d6a84b',
    description: 'Mutirões, campanhas, oficinas das escolas.',
  },
  {
    id: 'cases',
    label: 'Cases',
    icon: '🌟',
    color: '#e5c176',
    description: 'O que deu certo na prática.',
  },
  {
    id: 'duvidas',
    label: 'Dúvidas',
    icon: '💭',
    color: '#a98ed6',
    description: 'Perguntas pra outras escolas responderem.',
  },
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
