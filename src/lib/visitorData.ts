import { getRisksForState } from './riskData';

export const STATES = [
  ['AL', 'Alabama', 32.8, -86.8], ['AK', 'Alaska', 64.2, -152.5],
  ['AZ', 'Arizona', 34.3, -111.7], ['AR', 'Arkansas', 34.8, -92.2],
  ['CA', 'California', 36.8, -119.4], ['CO', 'Colorado', 39, -105.5],
  ['CT', 'Connecticut', 41.6, -72.7], ['DE', 'Delaware', 39, -75.5],
  ['FL', 'Florida', 28.5, -82], ['GA', 'Georgia', 32.7, -83.4],
  ['HI', 'Hawaii', 20.8, -156.3], ['ID', 'Idaho', 44.1, -114.7],
  ['IL', 'Illinois', 40, -89], ['IN', 'Indiana', 40, -86.1],
  ['IA', 'Iowa', 42.1, -93.5], ['KS', 'Kansas', 38.5, -98],
  ['KY', 'Kentucky', 37.8, -85.7], ['LA', 'Louisiana', 31.2, -92.1],
  ['ME', 'Maine', 45.3, -69.4], ['MD', 'Maryland', 39, -76.7],
  ['MA', 'Massachusetts', 42.2, -71.5], ['MI', 'Michigan', 44.3, -85.6],
  ['MN', 'Minnesota', 46, -94.6], ['MS', 'Mississippi', 32.7, -89.7],
  ['MO', 'Missouri', 38.6, -92.5], ['MT', 'Montana', 46.9, -110.4],
  ['NE', 'Nebraska', 41.5, -99.9], ['NV', 'Nevada', 39.3, -116.6],
  ['NH', 'New Hampshire', 43.7, -71.6], ['NJ', 'New Jersey', 40.1, -74.5],
  ['NM', 'New Mexico', 34.5, -106], ['NY', 'New York', 43, -75],
  ['NC', 'North Carolina', 35.8, -79.8], ['ND', 'North Dakota', 47.5, -100.5],
  ['OH', 'Ohio', 40.4, -82.8], ['OK', 'Oklahoma', 35.6, -97.5],
  ['OR', 'Oregon', 43.8, -120.6], ['PA', 'Pennsylvania', 41, -77.2],
  ['RI', 'Rhode Island', 41.6, -71.5], ['SC', 'South Carolina', 33.8, -80.9],
  ['SD', 'South Dakota', 44.4, -100.2], ['TN', 'Tennessee', 35.8, -86.7],
  ['TX', 'Texas', 31, -99.9], ['UT', 'Utah', 39.3, -111.7],
  ['VT', 'Vermont', 44, -72.7], ['VA', 'Virginia', 37.5, -79],
  ['WA', 'Washington', 47.4, -120.7], ['WV', 'West Virginia', 38.6, -80.6],
  ['WI', 'Wisconsin', 44.5, -89.5], ['WY', 'Wyoming', 43, -107.3],
  ['DC', 'District of Columbia', 38.9, -77],
] as const;

export interface VisitorLocation {
  state: string;
  label: string;
  latitude: number;
  longitude: number;
}

export function stateLocation(code: string): VisitorLocation {
  const state = STATES.find(([abbreviation]) => abbreviation === code);
  if (!state) throw new Error('Choose a supported US state.');
  return { state: state[0], label: state[1], latitude: state[2], longitude: state[3] };
}

export function readSavedLocation(): VisitorLocation | null {
  try {
    const code = localStorage.getItem('pfa-visitor-state');
    return code ? stateLocation(code) : null;
  } catch {
    return null;
  }
}

export async function searchLocations(query: string, signal: AbortSignal): Promise<VisitorLocation[]> {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&countryCode=US`, { signal });
  if (!response.ok) throw new Error('City search is unavailable. You can still choose a state.');
  const data = await response.json();
  return (data.results ?? []).flatMap((result: { country_code: string; admin1: string; name: string; latitude: number; longitude: number }) => {
    const state = STATES.find(([, name]) => name === result.admin1);
    return result.country_code === 'US' && state
      ? [{ state: state[0], label: `${result.name}, ${state[0]}`, latitude: result.latitude, longitude: result.longitude }]
      : [];
  });
}

export async function locateVisitor(latitude: number, longitude: number, signal: AbortSignal): Promise<VisitorLocation> {
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`, { signal });
  if (!response.ok) throw new Error('Location lookup is unavailable. Please choose your state.');
  const data = await response.json();
  const state = STATES.find(([code, name]) => data.principalSubdivisionCode === `US-${code}` || data.principalSubdivision === name);
  if (data.countryCode !== 'US' || !state) throw new Error('Coverage currently includes US states and DC. Please choose a state to explore.');
  return { state: state[0], label: `${data.city || data.locality || state[1]}, ${state[0]}`, latitude, longitude };
}

export const HAZARD_COLORS: Record<string, string> = {
  Wildfire: '#c93627', Earthquake: '#8854ba', Hurricane: '#007f91',
  Tornado: '#5265c7', Flood: '#1674b8', 'Flash Flood': '#1674b8',
  Tsunami: '#007f91', 'Extreme Heat': '#b65b00', Drought: '#9a7400',
  'Winter Storm': '#317e9b', 'Ice Storm': '#317e9b',
  'Severe Thunderstorm': '#5265c7', 'Volcanic Eruption': '#c93627',
  Landslide: '#477947', Avalanche: '#317e9b', 'Dust Storm': '#9a7400',
};

export const HAZARD_TYPES = [...new Set(STATES.flatMap(([code]) => getRisksForState(code).map(risk => risk.type)))].sort();