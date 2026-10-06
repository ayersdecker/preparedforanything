import { useState } from 'react';
import { Printer, RotateCcw, ShieldCheck } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import { getRisksForState } from '../lib/riskData';
import { clearSavedLocation, readSavedLocation, saveVisitorState, stateLocation, STATES, type VisitorLocation } from '../lib/visitorData';

interface KitItem {
  id: string;
  category: string;
  name: string;
  quantityForOne: number;
  scale: 'person' | 'household';
  unit: string;
  note: string;
}

const GENERAL_EMERGENCIES = ['Power outage', 'Evacuation / all-hazards'];
const HOUSEHOLD_SIZES = [1, 2, 3, 4] as const;
const SEVERITY_ORDER = { extreme: 4, high: 3, moderate: 2, low: 1 };

function getPrioritizedRisks(state: string) {
  return [...getRisksForState(state)].sort((first, second) => SEVERITY_ORDER[second.severity] - SEVERITY_ORDER[first.severity]);
}

function buildKit(type: string): KitItem[] {
  const items: Omit<KitItem, 'id'>[] = [
    { category: 'Water & food', name: 'Drinking water', quantityForOne: 3, scale: 'person', unit: 'gallons', note: 'At least one gallon per person per day for three days.' },
    { category: 'Water & food', name: 'Nonperishable meals', quantityForOne: 9, scale: 'person', unit: 'meals', note: 'Choose food that needs little or no cooking.' },
    { category: 'Health & hygiene', name: 'Prescription medicines', quantityForOne: 1, scale: 'person', unit: 'personal supply', note: 'Keep an up-to-date supply and a list of medicines and allergies.' },
    { category: 'Health & hygiene', name: 'First-aid kit', quantityForOne: 1, scale: 'household', unit: 'kit', note: 'Check supplies and expiration dates regularly.' },
    { category: 'Health & hygiene', name: 'Personal hygiene supplies', quantityForOne: 1, scale: 'person', unit: 'sets', note: 'Include sanitation items and any individual care needs.' },
    { category: 'Light & communication', name: 'Flashlight or headlamp', quantityForOne: 1, scale: 'person', unit: 'each', note: 'Keep spare batteries or choose a hand-crank model.' },
    { category: 'Light & communication', name: 'Battery-powered or hand-crank weather radio', quantityForOne: 1, scale: 'household', unit: 'radio', note: 'Know how to receive official local alerts.' },
    { category: 'Light & communication', name: 'Phone power bank and charging cable', quantityForOne: 1, scale: 'person', unit: 'sets', note: 'Charge power banks before severe weather.' },
    { category: 'Documents & safety', name: 'Sturdy shoes and a whistle', quantityForOne: 1, scale: 'person', unit: 'sets', note: 'Store shoes where they can be reached quickly.' },
    { category: 'Documents & safety', name: 'Important documents in a waterproof pouch', quantityForOne: 1, scale: 'household', unit: 'set', note: 'Include IDs, insurance details, and emergency contacts.' },
    { category: 'Documents & safety', name: 'Cash in small bills', quantityForOne: 1, scale: 'household', unit: 'household supply', note: 'ATMs and card readers may be unavailable during outages.' },
    ...emergencyItems(type),
  ];

  return items.map((item, index) => ({ ...item, id: `${type}-${index}` }));
}

function emergencyItems(type: string): Omit<KitItem, 'id'>[] {
  const person = (category: string, name: string, quantityForOne: number, unit: string, note: string): Omit<KitItem, 'id'> => ({
    category, name, quantityForOne, scale: 'person', unit, note,
  });
  const household = (category: string, name: string, unit: string, note: string): Omit<KitItem, 'id'> => ({
    category, name, quantityForOne: 1, scale: 'household', unit, note,
  });

  switch (type) {
    case 'Hurricane':
      return [
        household('Documents & safety', 'Evacuation route and meeting-place plan', 'plan', 'Know more than one route and where household members will meet.'),
        household('Light & communication', 'NOAA Weather Radio', 'radio', 'Monitor official watches, warnings, and evacuation notices.'),
        household('Water & food', 'Waterproof go-bag', 'bag', 'Keep essentials ready to take with you if officials order an evacuation.'),
      ];
    case 'Wildfire':
      return [
        person('Health & hygiene', 'N95 respirators', 1, 'masks', 'Choose well-fitting masks for smoke and ash; follow public-health guidance.'),
        household('Documents & safety', 'Evacuation go-bag near an exit', 'bag', 'Follow evacuation orders promptly; do not wait for a fire to become visible.'),
        person('Documents & safety', 'Outdoor clothing and sturdy gloves', 1, 'sets', 'Keep protective clothing accessible for an evacuation.'),
      ];
    case 'Flood':
    case 'Flash Flood':
    case 'Tsunami':
      return [
        person('Documents & safety', 'Waterproof document bags', 1, 'bags', 'Keep essential documents and small valuables dry.'),
        household('Documents & safety', 'Route to higher ground', 'plan', 'Identify routes that avoid low crossings and flood-prone roads.'),
        household('Light & communication', 'Portable alert radio', 'radio', 'Use official alerts; move to higher ground when instructed.'),
      ];
    case 'Winter Storm':
    case 'Ice Storm':
    case 'Avalanche':
      return [
        person('Health & hygiene', 'Warm blankets and clothing layers', 1, 'sets', 'Include hats, gloves, and socks for each person.'),
        household('Documents & safety', 'Ice scraper and traction aid', 'set', 'Keep vehicle supplies accessible if travel is safe and necessary.'),
        household('Water & food', 'Shelf-stable food that needs no cooking', 'household supply', 'Power loss may make cooking appliances unavailable.'),
      ];
    case 'Earthquake':
    case 'Landslide':
    case 'Volcanic Eruption':
      return [
        person('Documents & safety', 'Protective helmet', 1, 'helmets', 'Store sturdy shoes and a flashlight near the bed.'),
        person('Health & hygiene', 'Protective work gloves', 1, 'pairs', 'Useful for handling debris after authorities say it is safe.'),
        household('Documents & safety', 'Local evacuation and reunification plan', 'plan', 'Choose an out-of-area contact and a safe meeting point.'),
      ];
    case 'Extreme Heat':
    case 'Drought':
      return [
        person('Water & food', 'Extra stored drinking water', 2, 'gallons', 'Increase water supplies when extreme heat or limited water access is possible.'),
        person('Health & hygiene', 'Oral rehydration or electrolyte supplies', 1, 'personal supply', 'Follow product directions and health-care advice.'),
        household('Documents & safety', 'Cool location and check-in plan', 'plan', 'Identify cooling locations and people who may need extra help.'),
      ];
    case 'Tornado':
    case 'Severe Thunderstorm':
    case 'Dust Storm':
      return [
        person('Documents & safety', 'Protective helmet', 1, 'helmets', 'Keep in your designated safe room or shelter area.'),
        person('Documents & safety', 'Sturdy shoes beside the bed', 1, 'pairs', 'Protect feet from broken glass and debris.'),
        household('Light & communication', 'NOAA Weather Radio', 'radio', 'Have a way to receive warnings if power or mobile service fails.'),
      ];
    case 'Power outage':
      return [
        household('Light & communication', 'Extra batteries and backup charging', 'household supply', 'Use flashlights instead of candles where possible.'),
        household('Health & hygiene', 'Cooler and ice packs for medicines', 'set', 'Ask a pharmacist how to store temperature-sensitive medication.'),
        household('Documents & safety', 'Safe generator and carbon-monoxide plan', 'plan', 'Never run a generator indoors, in a garage, or near open windows.'),
      ];
    default:
      return [
        household('Documents & safety', 'Written family communication plan', 'plan', 'Choose meeting places and an out-of-area contact.'),
        household('Documents & safety', 'Local alerts and evacuation information', 'plan', 'Sign up for alerts from local emergency management.'),
        household('Light & communication', 'Backup radio and batteries', 'set', 'Use official local instructions during an emergency.'),
      ];
  }
}

export default function EmergencyKit() {
  const [location, setLocation] = useState<VisitorLocation | null>(readSavedLocation);
  const [selectedEmergency, setSelectedEmergency] = useState(() => {
    const saved = readSavedLocation();
    return saved ? (getPrioritizedRisks(saved.state)[0]?.type ?? 'Power outage') : 'Power outage';
  });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set());

  const risks = location ? getPrioritizedRisks(location.state) : [];
  const emergencyTypes = [...risks.map(risk => risk.type), ...GENERAL_EMERGENCIES];
  const emergencyType = emergencyTypes.includes(selectedEmergency) ? selectedEmergency : (risks[0]?.type ?? 'Power outage');
  const selectedRisk = risks.find(risk => risk.type === emergencyType);
  const items = buildKit(emergencyType);
  const completedCount = items.filter(item => checkedItems.has(item.id)).length;

  function selectState(code: string) {
    const next = stateLocation(code);
    saveVisitorState(next.state);
    setLocation(next);
    setSelectedEmergency(getPrioritizedRisks(next.state)[0]?.type ?? 'Power outage');
  }

  function forgetState() {
    clearSavedLocation();
    setLocation(null);
    setSelectedEmergency('Power outage');
  }

  function toggleItem(id: string) {
    setCheckedItems(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="visitor-explorer public-page">
      <section className="explorer-intro">
        <div className="visitor-container page-intro">
          <p className="eyebrow"><ShieldCheck size={16} /> PRACTICAL PLANNING, STARTING WHERE YOU ARE</p>
          <h1>Build an emergency kit<span>for your area and your household.</span></h1>
          <p className="intro-description">Choose a local hazard or emergency type and compare standard supplies for households of one to four people. Check items as you gather them; your checklist is not saved or sent anywhere.</p>
        </div>
      </section>

      <main className="visitor-container tool-page">
        <AdSlot placement="top" />
        <section className="tool-panel" aria-labelledby="kit-settings-heading">
          <div className="tool-panel-heading">
            <div><p className="eyebrow">MAKE IT YOURS</p><h2 id="kit-settings-heading">Choose an emergency</h2></div>
            <span className="privacy-tag">Checklist stays in this tab</span>
          </div>
          <div className="kit-settings-grid">
            <div className="field-control">
              <label htmlFor="kit-state">State or area</label>
              <select id="kit-state" value={location?.state ?? ''} onChange={event => event.target.value && selectState(event.target.value)}>
                <option value="" disabled>Choose a state</option>
                {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
              <small>Only the selected state is saved in your first-party cookie.</small>
              {location && <button className="clear-state-button" type="button" onClick={forgetState}>Forget saved state</button>}
            </div>
            <div className="field-control">
              <label htmlFor="kit-emergency">Emergency type</label>
              <select id="kit-emergency" value={emergencyType} onChange={event => { setSelectedEmergency(event.target.value); setCheckedItems(new Set()); }}>
                {risks.map(risk => <option key={risk.type} value={risk.type}>{risk.type}</option>)}
                {GENERAL_EMERGENCIES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <small>{selectedRisk?.description ?? 'A practical baseline checklist for common disruptions.'}</small>
            </div>
          </div>
        </section>

        <section className="kit-checklist" aria-labelledby="kit-checklist-heading">
          <div className="checklist-heading">
            <div>
              <p className="eyebrow">{location ? `${location.label.toUpperCase()} • ${emergencyType.toUpperCase()}` : emergencyType.toUpperCase()}</p>
              <h2 id="kit-checklist-heading">Emergency kit comparison</h2>
              <p>{completedCount} of {items.length} items checked · quantities shown for household sizes 1–4</p>
            </div>
            <div className="checklist-actions">
              <button className="visitor-button secondary-button" onClick={() => setCheckedItems(new Set())}><RotateCcw size={17} /> Reset checks</button>
              <button className="visitor-button" onClick={() => window.print()}><Printer size={17} /> Print checklist</button>
            </div>
          </div>

          <div className="kit-comparison-scroll" role="region" aria-label="Emergency supplies for households of one to four people" tabIndex={0}>
            <table className="kit-comparison">
              <thead>
                <tr>
                  <th scope="col">Supply</th>
                  {HOUSEHOLD_SIZES.map(size => <th scope="col" key={size}>{size} {size === 1 ? 'person' : 'people'}</th>)}
                </tr>
              </thead>
              {Array.from(new Set(items.map(item => item.category))).map(category => (
                <tbody key={category}>
                  <tr className="kit-comparison-category"><th colSpan={5} scope="colgroup">{category}</th></tr>
                  {items.filter(item => item.category === category).map(item => (
                    <tr className={checkedItems.has(item.id) ? 'kit-comparison-done' : ''} key={item.id}>
                      <th scope="row">
                        <label className="kit-comparison-item">
                          <input
                            type="checkbox"
                            aria-label={`Mark ${item.name} as ready`}
                            checked={checkedItems.has(item.id)}
                            onChange={() => toggleItem(item.id)}
                          />
                          <span>
                            <strong>{item.name}</strong>
                            <small>{item.note}</small>
                          </span>
                        </label>
                      </th>
                      {HOUSEHOLD_SIZES.map(size => (
                        <td key={size}>{item.scale === 'person' ? item.quantityForOne * size : item.quantityForOne} {item.unit}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <div className="page-source-note">
          <strong>Planning note:</strong> This is a general educational checklist, not a substitute for instructions from local emergency officials or medical professionals. Quantities are planning estimates; adjust for household needs, including infants, pets, medications, and dietary requirements. See <a href="https://www.ready.gov/kit" target="_blank" rel="noreferrer">Ready.gov’s emergency kit guidance</a>.
        </div>
        <AdSlot placement="content" />
      </main>
    </div>
  );
}
