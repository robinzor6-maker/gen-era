interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
}

const CATEGORIES = [
  { value: '', label: 'ALL' },
  { value: 'clothing', label: 'CLOTHING' },
  { value: 'accessories', label: 'ACCESSORIES' },
];

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <nav className="category-filter" aria-label="Filter by category">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          id={`category-filter-${cat.value || 'all'}`}
          className={`category-pill ${active === cat.value ? 'active' : ''}`}
          onClick={() => onChange(cat.value)}
          aria-pressed={active === cat.value}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
