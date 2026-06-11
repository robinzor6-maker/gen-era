import type { Product } from '@/lib/types';

export type District = 'ankhron' | 'osyron' | 'gencore';
export type Rarity   = 'legendary' | 'epic' | 'rare';
export type StatueType = 'hoodie' | 'jacket' | 'tshirt' | 'pants' | 'cap' | 'pendant' | 'bracelet' | 'ring';

// ── Derivation helpers ───────────────────────────────────────────────────────

export function getDistrict(product: Product): District {
  const t = [product.collection ?? '', ...(product.tags ?? []), product.name].join(' ').toLowerCase();
  if (/nile|fire|osyron|flame|scorched|thermo|heat/.test(t))             return 'osyron';
  if (/ankh|horus|bracelet|ring|pendant|eye|void-eye|obsidian/.test(t)) return 'ankhron';
  return 'gencore';
}

export function getRarity(product: Product): Rarity {
  if (product.featured && product.rating >= 5.0) return 'legendary';
  if (product.featured || product.rating >= 4.8) return 'epic';
  return 'rare';
}

export function getStatueType(product: Product): StatueType {
  const t = [product.name, ...(product.tags ?? [])].join(' ').toLowerCase();
  if (/hoodie|hoody/.test(t))            return 'hoodie';
  if (/jacket/.test(t))                  return 'jacket';
  if (/pant|cargo|trouser/.test(t))      return 'pants';
  if (/cap|hat|headwear|khepresh/.test(t)) return 'cap';
  if (/tee|t-shirt|tshirt|scarab tech/.test(t)) return 'tshirt';
  if (/pendant|necklace|void eye/.test(t))  return 'pendant';
  if (/bracelet|bangle|chain/.test(t))   return 'bracelet';
  if (/ring/.test(t))                    return 'ring';
  return product.category === 'clothing' ? 'tshirt' : 'pendant';
}

export const RARITY_COLORS: Record<Rarity, string> = {
  legendary: '#fff5c0',
  epic:      '#ff6b1a',
  rare:      '#d4a853',
};

export const DISTRICT_COLORS: Record<District, { primary: string; secondary: string; label: string }> = {
  ankhron: { primary: '#00d4ff', secondary: '#1a0050', label: 'ANKHRON DISTRICT' },
  osyron:  { primary: '#ff6b1a', secondary: '#4a0000', label: 'OSYRON DISTRICT' },
  gencore: { primary: '#d4a853', secondary: '#0d0520', label: 'GEN CORE' },
};

// ── Lore template bank ───────────────────────────────────────────────────────

const ANKHRON_LINES = [
  'The Archive does not forget. This artifact was sealed within the memory vault during {season}, awaiting the hand worthy of its weight.',
  'ANKHRON speaks: "To wear the past is to command the present." This piece carries the encoded memories of {season} — a living chronicle.',
  'Recovered from the Archive layers of the {season} epoch. Its hieroglyphic signature reads: permanence, authority, passage.',
  'The ancient covenant preserved this form across seasons. {season} — the cycle the Archive breathed again.',
  'Before commerce existed, there was the Archive. This artifact predates the transaction. It simply exists — and now it has chosen you.',
];

const OSYRON_LINES = [
  'OSYRON forged this within the Flame Protocol of {season}. Every thread carries the heat signature of the revolution.',
  'Fire does not destroy — it transforms. This artifact passed through the Scorched Gates during {season}, emerging as something new.',
  'OSYRON speaks: "Energy is not worn. It is awakened." The {season} drop carries the frequency of the next era.',
  'The Nile burned and this artifact was born. {season} — the date the flame became form.',
  'A heat-reactive covenant sealed in {season}. Every time it changes, it remembers the moment of its creation.',
];

const GENCORE_LINES = [
  'The Core holds no allegiance to time. This piece stands beyond era — essential, architectural, permanent.',
  'GEN ERA CORE: the foundation beneath all mythology. {season} marks when this form was refined to its purest state.',
  'Neither Archive nor Flame. This artifact belongs to the void between — the GEN CORE frequency.',
  'Essential forms do not announce themselves. They persist. This piece simply endures.',
  'The Core does not speak in myth. It speaks in material, in weight, in silence. Calibrated.',
];

const RARITY_SUFFIXES: Record<Rarity, string[]> = {
  legendary: [
    'Only the legend-tier artifacts receive the white-gold seal. You are holding one of the rarest transmissions in the GEN ERA universe.',
    'LEGENDARY STATUS: This artifact has been invoked {reviewCount}+ times. Its energy field is fully charged.',
    'The highest rarity tier. ANKHRON and OSYRON both claim it. It belongs to neither — and both.',
  ],
  epic: [
    'EPIC-CLASS: Reserved for those who move before the crowd. {stock} remain in this cycle.',
    'Limited frequency. {stock} artifacts remain. The portal closes when the last one is claimed.',
    'Epic rarity. Rated {rating} across all registered wielders. The consensus is absolute.',
  ],
  rare: [
    'Rare classification. Enough for those who know — not enough for those who hesitate.',
    'RARE-TIER: {stock} units remain in the current cycle. Move accordingly.',
    'The rarity seal is active. {stock} remaining.',
  ],
};

// ── Public generators ────────────────────────────────────────────────────────

export function generateLore(product: Product): string {
  const district = getDistrict(product);
  const rarity   = getRarity(product);
  const season   = product.collection?.replace(/-/g, ' ').toUpperCase() ?? 'VOID SEASON';

  const templates = district === 'ankhron' ? ANKHRON_LINES
    : district === 'osyron' ? OSYRON_LINES
    : GENCORE_LINES;

  const suffixes = RARITY_SUFFIXES[rarity];
  const ti = Math.abs(hash(product._id)) % templates.length;
  const si = Math.abs(hash(product._id + rarity)) % suffixes.length;

  const fill = (s: string) => s
    .replace(/{season}/g,      season)
    .replace(/{stock}/g,       product.stock.toString())
    .replace(/{rating}/g,      product.rating.toFixed(1))
    .replace(/{reviewCount}/g, product.reviewCount.toString());

  return `${fill(templates[ti])}\n\n${fill(suffixes[si])}`;
}

export function generateShortLore(product: Product): string {
  const district = getDistrict(product);
  const rarity   = getRarity(product);
  const dlabel = {
    ankhron: 'ARCHIVE OF ANKHRON',
    osyron:  'FLAME PROTOCOL OF OSYRON',
    gencore: 'GEN CORE VAULT',
  }[district];
  const rlabel = { legendary: ' ◈ LEGENDARY', epic: ' ◈ EPIC', rare: '' }[rarity];
  return `${dlabel}${rlabel}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
