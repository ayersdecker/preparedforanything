import { useState } from 'react';
import { Building2, ExternalLink, HeartHandshake, MapPin, Radio, Search, ShieldCheck } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import { clearSavedLocation, readSavedLocation, saveVisitorState, stateLocation, STATES } from '../lib/visitorData';

type Jurisdiction = 'Federal' | 'Statewide' | 'County/Regional' | 'City/Local';

interface Resource {
  jurisdiction: Jurisdiction;
  category: string;
  title: string;
  description: string;
  url: string;
  publisher: string;
}

const RESOURCES: Resource[] = [
  {
    jurisdiction: 'Federal',
    category: 'Preparedness',
    title: 'Ready.gov',
    description: 'Practical guidance for emergency plans, alerts, evacuation, and household preparedness.',
    url: 'https://www.ready.gov/',
    publisher: 'U.S. Department of Homeland Security',
  },
  {
    jurisdiction: 'Federal',
    category: 'Weather alerts',
    title: 'National Weather Service alerts',
    description: 'Check official watches, warnings, and advisories issued by the National Weather Service.',
    url: 'https://www.weather.gov/alerts',
    publisher: 'National Weather Service',
  },
  {
    jurisdiction: 'Federal',
    category: 'Disaster assistance',
    title: 'FEMA disaster assistance',
    description: 'Review assistance programs and apply for help after a federally declared disaster.',
    url: 'https://www.disasterassistance.gov/',
    publisher: 'Federal Emergency Management Agency',
  },
  {
    jurisdiction: 'Statewide',
    category: 'Emergency management',
    title: 'State emergency management agencies',
    description: 'Find the official emergency management agency for your state or territory.',
    url: 'https://www.usa.gov/state-emergency-management',
    publisher: 'USAGov',
  },
  {
    jurisdiction: 'Statewide',
    category: 'State government',
    title: 'State and local government directory',
    description: 'Start with your state government portal to find official statewide services and alerts.',
    url: 'https://www.usa.gov/state-local-governments',
    publisher: 'USAGov',
  },
  {
    jurisdiction: 'County/Regional',
    category: 'Emergency management',
    title: 'FEMA locations and disaster information',
    description: 'Look up FEMA-related information by location, including disaster and recovery resources.',
    url: 'https://www.fema.gov/locations',
    publisher: 'Federal Emergency Management Agency',
  },
  {
    jurisdiction: 'County/Regional',
    category: 'Community support',
    title: 'Find local help through 211',
    description: 'Search for nearby food, housing, utility, health, and other community services; availability varies by area.',
    url: 'https://www.211.org/',
    publisher: '211 network',
  },
  {
    jurisdiction: 'County/Regional',
    category: 'Shelters',
    title: 'Find an open Red Cross shelter',
    description: 'Check the Red Cross shelter finder during an active disaster; confirm current availability before traveling.',
    url: 'https://www.redcross.org/get-help/disaster-relief-and-recovery-services/find-an-open-shelter.html',
    publisher: 'American Red Cross',
  },
  {
    jurisdiction: 'City/Local',
    category: 'Local government',
    title: 'Find your city or county government',
    description: 'Use the official directory to reach local government websites and services.',
    url: 'https://www.usa.gov/local-governments',
    publisher: 'USAGov',
  },
];

const JURISDICTIONS = ['All jurisdictions', 'Federal', 'Statewide', 'County/Regional', 'City/Local'] as const;

function localSearchUrl(area: string, stateName: string, term: string): string {
  const query = [area, stateName, term, 'official local government'].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(`site:.gov ${query}`)}`;
}

export default function Resources() {
  const [location, setLocation] = useState(readSavedLocation);
  const [localArea, setLocalArea] = useState('');
  const [jurisdiction, setJurisdiction] = useState<(typeof JURISDICTIONS)[number]>('All jurisdictions');
  const [query, setQuery] = useState('');
  const stateName = location ? stateLocation(location.state).label : '';
  const areaLabel = localArea.trim() || stateName || 'your area';

  const localResources: Resource[] = [
    {
      jurisdiction: 'City/Local',
      category: 'Emergency alerts',
      title: `Look up official alerts for ${areaLabel}`,
      description: 'Find municipal or county alert enrollment, evacuation notices, and emergency updates. Check that results come from your local government before relying on them.',
      url: localSearchUrl(localArea.trim(), stateName, 'emergency alerts evacuation'),
      publisher: 'Official .gov search',
    },
    {
      jurisdiction: 'County/Regional',
      category: 'Public services',
      title: `Find county services for ${areaLabel}`,
      description: 'Search official local-government pages for county emergency management, public health, cooling centers, and recovery information.',
      url: localSearchUrl(localArea.trim(), stateName, 'county emergency management public health'),
      publisher: 'Official .gov search',
    },
  ];

  const allResources = [...RESOURCES, ...localResources];
  const search = query.trim().toLowerCase();
  const visibleResources = allResources.filter(resource => (
    (jurisdiction === 'All jurisdictions' || resource.jurisdiction === jurisdiction)
    && (!search || `${resource.title} ${resource.description} ${resource.category} ${resource.publisher} ${resource.jurisdiction}`.toLowerCase().includes(search))
  ));

  function selectState(code: string) {
    const next = stateLocation(code);
    saveVisitorState(next.state);
    setLocation(next);
  }

  function forgetState() {
    clearSavedLocation();
    setLocation(null);
    setLocalArea('');
  }

  return (
    <div className="visitor-explorer public-page">
      <section className="explorer-intro">
        <div className="visitor-container page-intro">
          <p className="eyebrow"><HeartHandshake size={16} /> A SHORTCUT TO TRUSTED HELP</p>
          <h1>Local emergency resources<span>start with the right level of help.</span></h1>
          <p className="intro-description">Browse official federal and state starting points, then find county and city services for your community.</p>
        </div>
      </section>

      <main className="visitor-container tool-page">
        <AdSlot placement="top" />
        <section className="resource-location-panel" aria-labelledby="resource-location-heading">
          <div className="tool-panel-heading">
            <div><p className="eyebrow"><MapPin size={15} /> FIND HELP NEAR YOU</p><h2 id="resource-location-heading">Set your area</h2></div>
          </div>
          <div className="resource-location-fields">
            <div className="field-control">
              <label htmlFor="resource-state">State or DC</label>
              <select id="resource-state" value={location?.state ?? ''} onChange={event => event.target.value && selectState(event.target.value)}>
                <option value="" disabled>Choose a state</option>
                {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
              {location && <button className="clear-state-button" type="button" onClick={forgetState}>Forget saved state</button>}
            </div>
            <div className="field-control">
              <label htmlFor="resource-area">City or county (optional)</label>
              <input id="resource-area" value={localArea} onChange={event => setLocalArea(event.target.value)} maxLength={100} placeholder="e.g. Austin or Travis County" />
              <small>This is used to build lookup links only and is not saved.</small>
            </div>
          </div>
          <p className="page-source-note">Your selected state is saved in the site cookie. The city/county name stays in this page only; opening a local search sends that search query to Google. If you do not choose a state, federal resources remain available.</p>
        </section>

        <section className="resource-directory" aria-labelledby="resource-directory-heading">
          <div className="directory-heading">
            <div>
              <p className="eyebrow"><ShieldCheck size={15} /> RESOURCE DIRECTORY</p>
              <h2 id="resource-directory-heading">{stateName ? `Starting points for ${stateName}` : 'Browse trusted starting points'}</h2>
            </div>
          </div>
          <div className="resource-filters">
            <div className="field-control">
              <label htmlFor="resource-jurisdiction">Jurisdiction</label>
              <select id="resource-jurisdiction" value={jurisdiction} onChange={event => {
                const selected = JURISDICTIONS.find(scope => scope === event.target.value);
                if (selected) setJurisdiction(selected);
              }}>
                {JURISDICTIONS.map(scope => <option key={scope}>{scope}</option>)}
              </select>
            </div>
            <div className="resource-search field-control">
              <label htmlFor="resource-search">Search resources</label>
              <div><Search size={17} /><input id="resource-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search alerts, shelters, food…" /></div>
            </div>
          </div>

          <div className="resource-grid" aria-live="polite">
            {visibleResources.map(resource => (
              <article className="resource-card" key={`${resource.jurisdiction}-${resource.title}`}>
                <div className="resource-card-meta"><span className={`jurisdiction-tag jurisdiction-${resource.jurisdiction.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{resource.jurisdiction}</span><span>{resource.category}</span></div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="resource-card-footer"><small>{resource.publisher}</small><a href={resource.url} target="_blank" rel="noreferrer">Visit resource <ExternalLink size={14} /></a></div>
              </article>
            ))}
            {visibleResources.length === 0 && <p className="empty-resources">No resources match those filters. Try another search or jurisdiction.</p>}
          </div>
        </section>

        <section className="resource-caution">
          <Building2 size={20} />
          <p><strong>Check before you go.</strong> Agency coverage, shelter availability, and operating hours can change quickly. These are starting points, not a live dispatch service. Follow instructions from local officials; call 911 for immediate life-threatening emergencies.</p>
        </section>
        <AdSlot placement="content" />
      </main>
    </div>
  );
}
