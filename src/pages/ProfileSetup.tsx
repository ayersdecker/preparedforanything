import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, ChevronLeft, Check, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
  ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
  ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
  ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
  ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
  ['DC','Washington D.C.'],
];

const MEDICAL_CONDITIONS = ['Diabetes','Heart condition','Respiratory condition','Mobility limitations','Visual impairment','Hearing impairment'];
const DIETARY = ['Vegetarian','Vegan','Gluten-free','Nut allergy','Dairy-free'];
const EQUIPMENT = ['Oxygen tank','Wheelchair','Medical refrigeration needed','Generator needed'];

const step1Schema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
});

const step2Schema = z.object({
  adults: z.number().min(1, 'At least 1 adult'),
  children: z.number().min(0).max(20),
  infants: z.number().min(0).max(10),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

interface PetEntry { type: string; count: number }

export default function ProfileSetup() {
  const { currentUser, updateUserProfile, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [location, setLocation] = useState<Step1Values | null>(null);
  const [household, setHousehold] = useState<Step2Values | null>(null);
  const [pets, setPets] = useState<PetEntry[]>([]);
  const [petInput, setPetInput] = useState({ type: 'Dog', count: 1 });
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);

  const step1Form = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });
  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { adults: 1, children: 0, infants: 0 },
  });

  function toggleNeed(item: string) {
    setSpecialNeeds((prev) =>
      prev.includes(item) ? prev.filter((n) => n !== item) : [...prev, item]
    );
  }

  function addPet() {
    if (petInput.count > 0) {
      setPets((prev) => [...prev, { ...petInput }]);
      setPetInput({ type: 'Dog', count: 1 });
    }
  }

  async function handleFinish() {
    if (!location || !household) return;
    setSaving(true);
    try {
      const profileData = {
        locations: [{
          id: Math.random().toString(36).slice(2),
          label: 'Home',
          address: location.address,
          city: location.city,
          state: location.state,
          zip: location.zip,
          isPrimary: true,
        }],
        household: {
          adults: household.adults,
          children: household.children,
          infants: household.infants,
          pets,
          specialNeeds,
        },
        profileComplete: true,
      };
      if (!isDemoMode && currentUser) {
        await updateUserProfile(profileData);
      } else {
        localStorage.setItem('demoProfile', JSON.stringify(profileData));
      }
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  const steps = ['Location', 'Household', 'Special Needs'];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Set Up Your Profile</h1>
          <p className="text-text-secondary mt-1">Help us personalize your preparedness plan</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i + 1 < step ? 'bg-success text-white' :
                i + 1 === step ? 'bg-primary text-white' :
                'bg-surface-2 text-text-secondary'
              }`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i + 1 === step ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-0.5 bg-surface-2 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-surface-2 rounded-modal p-8">
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={step1Form.handleSubmit((data) => { setLocation(data); setStep(2); })} className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary mb-4">📍 Your Primary Location</h2>
              <Input
                label="Street address"
                placeholder="123 Main St"
                error={step1Form.formState.errors.address?.message}
                {...step1Form.register('address')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="Springfield"
                  error={step1Form.formState.errors.city?.message}
                  {...step1Form.register('city')}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-primary mb-1">State</label>
                  <select
                    className="w-full bg-surface-2 border border-surface-2 text-text-primary rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    {...step1Form.register('state')}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  {step1Form.formState.errors.state && (
                    <p className="mt-1 text-xs text-danger">{step1Form.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              <Input
                label="ZIP code"
                placeholder="12345"
                maxLength={10}
                error={step1Form.formState.errors.zip?.message}
                {...step1Form.register('zip')}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={step2Form.handleSubmit((data) => { setHousehold(data); setStep(3); })} className="space-y-5">
              <h2 className="text-lg font-bold text-text-primary mb-4">👥 Household Details</h2>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Adults"
                  type="number"
                  min={1}
                  max={20}
                  error={step2Form.formState.errors.adults?.message}
                  {...step2Form.register('adults', { valueAsNumber: true })}
                />
                <Input
                  label="Children"
                  type="number"
                  min={0}
                  max={20}
                  error={step2Form.formState.errors.children?.message}
                  {...step2Form.register('children', { valueAsNumber: true })}
                />
                <Input
                  label="Infants"
                  type="number"
                  min={0}
                  max={10}
                  error={step2Form.formState.errors.infants?.message}
                  {...step2Form.register('infants', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Pets</label>
                {pets.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {pets.map((pet, i) => (
                      <div key={i} className="flex items-center justify-between bg-surface-2 rounded-btn px-3 py-2 text-sm">
                        <span className="text-text-primary">{pet.count}× {pet.type}</span>
                        <button
                          type="button"
                          onClick={() => setPets((prev) => prev.filter((_, j) => j !== i))}
                          className="text-danger hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <select
                    value={petInput.type}
                    onChange={(e) => setPetInput((p) => ({ ...p, type: e.target.value }))}
                    className="flex-1 bg-surface-2 border border-surface-2 text-text-primary rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {['Dog','Cat','Bird','Fish','Rabbit','Reptile','Other'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={petInput.count}
                    onChange={(e) => setPetInput((p) => ({ ...p, count: parseInt(e.target.value) || 1 }))}
                    className="w-16 bg-surface-2 border border-surface-2 text-text-primary rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addPet}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button type="submit">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-text-primary mb-1">♿ Special Needs (Optional)</h2>
              <p className="text-sm text-text-secondary mb-4">This helps us tailor your emergency kit recommendations.</p>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Medical Conditions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {MEDICAL_CONDITIONS.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={specialNeeds.includes(item)}
                        onChange={() => toggleNeed(item)}
                        className="rounded border-surface-2 bg-surface-2 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Dietary Restrictions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={specialNeeds.includes(item)}
                        onChange={() => toggleNeed(item)}
                        className="rounded border-surface-2 bg-surface-2 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Special Equipment</h3>
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={specialNeeds.includes(item)}
                        onChange={() => toggleNeed(item)}
                        className="rounded border-surface-2 bg-surface-2 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleFinish} loading={saving}>
                  <Check className="w-4 h-4 mr-1" /> Complete Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
