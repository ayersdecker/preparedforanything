import { useState, useEffect, useCallback } from 'react';
import { Download, Package, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import type { KitItem } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function generateKit(adults: number, children: number, infants: number, pets: { type: string; count: number }[]): KitItem[] {
  const people = adults + children + infants;
  const totalPets = pets.reduce((s, p) => s + p.count, 0);
  const hasPets = totalPets > 0;

  const items: Omit<KitItem, 'id' | 'acquired'>[] = [
    // Water
    { name: `Water (1 gal/person/day × 3 days)`, category: 'Water', quantity: people * 3, unit: 'gallons', notes: '1 gallon per person per day' },
    ...(hasPets ? [{ name: `Pet water (0.5 gal/pet/day × 3 days)`, category: 'Water', quantity: Math.ceil(totalPets * 0.5 * 3), unit: 'gallons' }] : []),
    { name: 'Water purification tablets', category: 'Water', quantity: 1, unit: 'pack' },
    { name: 'Collapsible water containers', category: 'Water', quantity: 2, unit: 'items' },

    // Food
    { name: `Non-perishable food (3 meals/day × 3 days)`, category: 'Food', quantity: people * 9, unit: 'servings', notes: `${people * 9} total servings` },
    { name: 'Energy bars', category: 'Food', quantity: people * 3, unit: 'bars' },
    { name: 'Canned goods (vegetables, beans, soup)', category: 'Food', quantity: people * 3, unit: 'cans' },
    { name: 'Dried fruit and nuts', category: 'Food', quantity: people, unit: 'bags' },
    { name: 'Crackers / shelf-stable bread', category: 'Food', quantity: 2, unit: 'packages' },
    { name: 'Manual can opener', category: 'Food', quantity: 1, unit: 'item' },
    ...(infants > 0 ? [
      { name: 'Infant formula / baby food', category: 'Food', quantity: infants * 3, unit: 'days supply' },
    ] : []),

    // First Aid
    { name: 'Comprehensive first aid kit', category: 'First Aid', quantity: 1, unit: 'kit' },
    { name: 'Prescription medications (3-day supply)', category: 'First Aid', quantity: people, unit: 'persons\' supply' },
    { name: 'Hand sanitizer', category: 'First Aid', quantity: 2, unit: 'bottles' },
    { name: 'N95 face masks', category: 'First Aid', quantity: people * 3, unit: 'masks' },
    { name: 'Nitrile gloves', category: 'First Aid', quantity: 2, unit: 'pairs' },
    ...(infants > 0 ? [
      { name: 'Infant medications (fever reducer, etc.)', category: 'First Aid', quantity: 1, unit: 'kit' },
    ] : []),

    // Documents
    { name: 'Copies of photo IDs for all household members', category: 'Documents', quantity: people, unit: 'copies' },
    { name: 'Insurance cards (health, home, auto)', category: 'Documents', quantity: 1, unit: 'set' },
    { name: 'Emergency cash', category: 'Documents', quantity: 100, unit: 'dollars minimum', notes: 'Small bills preferred' },
    { name: 'Written emergency contact list', category: 'Documents', quantity: 1, unit: 'copy' },
    { name: 'Copies of key documents (birth cert, SS card, passport)', category: 'Documents', quantity: 1, unit: 'set', notes: 'In waterproof bag' },

    // Tools & Safety
    { name: 'Flashlight with extra batteries', category: 'Tools & Safety', quantity: 2, unit: 'flashlights' },
    { name: 'Battery-powered or hand-crank weather radio', category: 'Tools & Safety', quantity: 1, unit: 'item' },
    { name: 'Multi-tool or Swiss army knife', category: 'Tools & Safety', quantity: 1, unit: 'item' },
    { name: 'Emergency whistle', category: 'Tools & Safety', quantity: people, unit: 'whistles' },
    { name: 'Dust masks / N95 respirators', category: 'Tools & Safety', quantity: people * 3, unit: 'masks' },
    { name: 'Plastic sheeting and duct tape', category: 'Tools & Safety', quantity: 1, unit: 'set', notes: 'For shelter-in-place' },
    { name: 'Matches in waterproof container', category: 'Tools & Safety', quantity: 1, unit: 'box' },
    { name: 'Work gloves', category: 'Tools & Safety', quantity: adults, unit: 'pairs' },

    // Clothing & Bedding
    { name: 'Change of clothes per person (weather appropriate)', category: 'Clothing & Bedding', quantity: people, unit: 'sets' },
    { name: 'Rain ponchos', category: 'Clothing & Bedding', quantity: people, unit: 'ponchos' },
    { name: 'Mylar emergency blankets', category: 'Clothing & Bedding', quantity: people + 2, unit: 'blankets' },
    { name: 'Sturdy closed-toe shoes (per person)', category: 'Clothing & Bedding', quantity: people, unit: 'pairs' },
    { name: 'Warm sleeping bag or blanket', category: 'Clothing & Bedding', quantity: people, unit: 'items' },

    // Sanitation
    { name: 'Toilet paper', category: 'Sanitation', quantity: 4, unit: 'rolls', notes: 'Per day of emergency' },
    { name: 'Moist towelettes / baby wipes', category: 'Sanitation', quantity: 3, unit: 'packs' },
    { name: 'Heavy-duty garbage bags', category: 'Sanitation', quantity: 1, unit: 'box' },
    { name: 'Disinfectant wipes', category: 'Sanitation', quantity: 2, unit: 'containers' },
    { name: 'Hand soap / liquid soap', category: 'Sanitation', quantity: 2, unit: 'bottles' },
    { name: 'Personal hygiene items (toothbrush, etc.)', category: 'Sanitation', quantity: people, unit: 'sets' },
    ...(infants > 0 ? [
      { name: 'Diapers', category: 'Sanitation', quantity: infants * 30, unit: 'diapers', notes: '~10 per day per infant' },
    ] : []),

    // Communication
    { name: 'Cell phone + charger cables', category: 'Communication', quantity: adults, unit: 'phones' },
    { name: 'Portable backup battery bank', category: 'Communication', quantity: 1, unit: 'item', notes: 'High-capacity recommended' },
    { name: 'Written emergency contacts (laminated)', category: 'Communication', quantity: people, unit: 'copies' },
    { name: 'Local map (paper)', category: 'Communication', quantity: 1, unit: 'map' },
  ];

  // Pet supplies
  if (hasPets) {
    items.push(
      { name: `Pet food (3-day supply)`, category: 'Pet Supplies', quantity: totalPets * 3, unit: 'days supply' },
      { name: 'Pet water bowls', category: 'Pet Supplies', quantity: totalPets, unit: 'bowls' },
      { name: 'Pet leash(es)', category: 'Pet Supplies', quantity: Math.min(pets.filter((p) => p.type.toLowerCase().includes('dog')).reduce((s, p) => s + p.count, 0) || 1, totalPets), unit: 'leashes' },
      { name: 'Pet carrier(s)', category: 'Pet Supplies', quantity: totalPets, unit: 'carriers' },
      { name: 'Pet vaccination records (copies)', category: 'Pet Supplies', quantity: totalPets, unit: 'copies' },
      { name: 'Pet medications (if applicable)', category: 'Pet Supplies', quantity: 1, unit: 'set' }
    );
  }

  return items.map((item, i) => ({
    ...item,
    id: `item-${i}`,
    acquired: false,
  }));
}

const CATEGORY_ICONS: Record<string, string> = {
  Water: '💧',
  Food: '🥫',
  'First Aid': '🩺',
  Documents: '📄',
  'Tools & Safety': '🔦',
  'Clothing & Bedding': '👕',
  Sanitation: '🧴',
  Communication: '📱',
  'Pet Supplies': '🐾',
};

export default function KitBuilder() {
  const { userProfile } = useAuth();
  const household = userProfile?.household;

  const adults = household?.adults ?? 2;
  const children = household?.children ?? 0;
  const infants = household?.infants ?? 0;
  const pets = household?.pets ?? [];

  const [items, setItems] = useState<KitItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const stored = localStorage.getItem('kitItems');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as KitItem[];
        setItems(parsed);
        return;
      } catch {}
    }
    setItems(generateKit(adults, children, infants, pets));
  }, [adults, children, infants, pets]);

  const saveItems = useCallback((updated: KitItem[]) => {
    setItems(updated);
    localStorage.setItem('kitItems', JSON.stringify(updated));
  }, []);

  function toggleItem(id: string) {
    saveItems(items.map((item) => item.id === id ? { ...item, acquired: !item.acquired } : item));
  }

  function toggleCategory(category: string) {
    const categoryItems = items.filter((i) => i.category === category);
    const allAcquired = categoryItems.every((i) => i.acquired);
    saveItems(items.map((item) => item.category === category ? { ...item, acquired: !allAcquired } : item));
  }

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];
  const filteredItems = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);
  const acquired = items.filter((i) => i.acquired).length;
  const progress = items.length > 0 ? Math.round((acquired / items.length) * 100) : 0;

  async function downloadPDF() {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const pageW = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(20);
      doc.setTextColor(255, 107, 53);
      doc.text('Prepared For Anything', pageW / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('72-Hour Emergency Kit Checklist', pageW / 2, y, { align: 'center' });
      y += 6;
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | ${adults + children + infants} people, ${pets.length} pet types`, pageW / 2, y, { align: 'center' });
      y += 6;
      doc.text(`Completion: ${progress}% (${acquired}/${items.length} items)`, pageW / 2, y, { align: 'center' });
      y += 12;

      const catGroups = Array.from(new Set(items.map((i) => i.category)));

      for (const cat of catGroups) {
        const catItems = items.filter((i) => i.category === cat);
        if (y > 250) { doc.addPage(); y = 20; }

        doc.setFontSize(12);
        doc.setTextColor(255, 107, 53);
        doc.text(`${CATEGORY_ICONS[cat] ?? '▪'} ${cat}`, 14, y);
        y += 6;

        doc.setFontSize(10);
        for (const item of catItems) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setTextColor(item.acquired ? 100 : 30);
          const check = item.acquired ? '☑' : '☐';
          const text = `${check} ${item.name} — ${item.quantity} ${item.unit}`;
          const lines = doc.splitTextToSize(text, pageW - 28);
          doc.text(lines, 18, y);
          y += lines.length * 5 + 1;
        }
        y += 4;
      }

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Disclaimer: This checklist is for general preparedness purposes. Always follow guidance from local emergency management officials.',
        pageW / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center', maxWidth: pageW - 20 }
      );

      doc.save('emergency-kit-checklist.pdf');
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
              <Package className="w-7 h-7 text-primary" /> Emergency Kit Builder
            </h1>
            <p className="text-text-secondary mt-1">
              72-hour kit for {adults + children + infants} {adults + children + infants === 1 ? 'person' : 'people'}
              {pets.length > 0 ? ` + ${pets.reduce((s, p) => s + p.count, 0)} pet(s)` : ''}
            </p>
          </div>
          <Button onClick={downloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Kit Completion</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-surface-2 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            {acquired} of {items.length} items acquired
            {progress === 100 && ' 🎉 Great job! Your kit is complete!'}
          </p>
        </Card>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const catItems = cat === 'All' ? items : items.filter((i) => i.category === cat);
            const catAcquired = catItems.filter((i) => i.acquired).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat !== 'All' && <span>{CATEGORY_ICONS[cat] ?? '▪'}</span>}
                {cat}
                {cat !== 'All' && (
                  <span className={`ml-1 text-xs ${activeCategory === cat ? 'text-white/80' : 'text-text-secondary'}`}>
                    {catAcquired}/{catItems.length}
                  </span>
                )}
                {cat === 'All' && (
                  <span className={`ml-1 text-xs ${activeCategory === cat ? 'text-white/80' : 'text-text-secondary'}`}>
                    {progress}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Items by category */}
        {(activeCategory === 'All' ? Array.from(new Set(items.map((i) => i.category))) : [activeCategory]).map((cat) => {
          const catItems = filteredItems.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          const catAcquired = catItems.filter((i) => i.acquired).length;
          const allAcquired = catAcquired === catItems.length;

          return (
            <Card key={cat} className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-text-primary flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat] ?? '▪'}</span>
                  {cat}
                  <span className="text-xs font-normal text-text-secondary">({catAcquired}/{catItems.length})</span>
                </h2>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="text-xs text-primary hover:underline"
                >
                  {allAcquired ? 'Uncheck all' : 'Check all'}
                </button>
              </div>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 cursor-pointer group p-2 rounded-btn hover:bg-surface-2 transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`mt-0.5 flex-shrink-0 transition-colors ${item.acquired ? 'text-success' : 'text-text-secondary group-hover:text-text-primary'}`}
                    >
                      {item.acquired ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${item.acquired ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-secondary">
                          {item.quantity} {item.unit}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-info/70">• {item.notes}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-surface border border-surface-2 rounded-card">
          <p className="text-xs text-text-secondary">
            <strong className="text-warning">Note:</strong> This checklist provides general guidance for a 72-hour emergency kit.
            Your actual needs may vary based on your specific situation, health conditions, and local hazards.
            Regularly check and replace perishable items (food, water, medications). Consult local emergency management for additional recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
