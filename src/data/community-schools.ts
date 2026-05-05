import type { School } from '@/types/community';

export const HOME_SCHOOL_ID = 'esc-tech-clear';

export const SCHOOLS: School[] = [
  { id: HOME_SCHOOL_ID, name: 'Escola Tech-Clear',         city: 'São Paulo',     state: 'SP' },
  { id: 'esc-bom-jesus', name: 'EE Bom Jesus do Cerrado',  city: 'Goiânia',       state: 'GO' },
  { id: 'esc-ondas',     name: 'Colégio Ondas do Mar',     city: 'Florianópolis', state: 'SC' },
  { id: 'esc-cangaco',   name: 'EM Sertão Verde',          city: 'Recife',        state: 'PE' },
  { id: 'esc-ipe',       name: 'EE Ipê Amarelo',           city: 'Belo Horizonte', state: 'MG' },
  { id: 'esc-juriti',    name: 'Colégio Juriti',           city: 'Manaus',        state: 'AM' },
];

export function getSchool(id: string): School | undefined {
  return SCHOOLS.find((s) => s.id === id);
}
