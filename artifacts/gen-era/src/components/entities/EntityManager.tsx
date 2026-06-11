import type { District } from '@/lib/lore/generateLore';
import ANKHRON from './ANKHRON';
import OSYRON from './OSYRON';

interface EntityManagerProps {
  district: District;
  visible?: boolean;
  opacity?: number;
}

export default function EntityManager({ district, visible = true, opacity = 1 }: EntityManagerProps) {
  if (district === 'ankhron') return <ANKHRON visible={visible} opacity={opacity} />;
  if (district === 'osyron')  return <OSYRON  visible={visible} opacity={opacity} />;
  return null;
}
