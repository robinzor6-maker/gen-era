import type { Product } from '@/lib/types';
import type { District, Rarity } from '@/lib/lore/generateLore';

const ANKHRON_SETS: string[][] = [
  [
    'The Archive does not forget.',
    'This artifact was sealed within the memory vault.',
    'It has been waiting for you.',
  ],
  [
    'To wear the past is to command the present.',
    'The Archive selected you before you chose it.',
  ],
  [
    '{name}.',
    'I have preserved it since before the cycle began.',
    'The past does not return.',
    'It reveals itself.',
  ],
  [
    'The memory vault recognizes you.',
    'Only those the Archive chooses may enter.',
    '{name} carries the weight of {season}.',
  ],
];

const OSYRON_SETS: string[][] = [
  [
    'Energy is not worn.',
    'It is awakened.',
    '{name} — the fire already knows you.',
  ],
  [
    'The Nile burned and this was born.',
    '{season} — the date the flame became form.',
    'Claim what the fire chose you for.',
  ],
  [
    'You entered the Flame Protocol.',
    '{name}.',
    'This is not commerce.',
    'This is transformation.',
  ],
  [
    'The revolution does not wait.',
    '{name} carries the frequency of {season}.',
    'Act — or the flame moves on.',
  ],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export function getEntityDialogueLines(
  product: Product,
  district: District,
  _rarity: Rarity,
): string[] {
  const season = product.collection?.replace(/-/g, ' ').toUpperCase() ?? 'VOID SEASON';

  const pool =
    district === 'ankhron' ? ANKHRON_SETS :
    district === 'osyron'  ? OSYRON_SETS  : null;

  if (!pool) return [];

  const set = pool[Math.abs(hash(product._id)) % pool.length];
  return set.map(l =>
    l.replace(/{name}/g, product.name).replace(/{season}/g, season),
  );
}
