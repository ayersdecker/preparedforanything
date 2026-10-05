import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, CloudLightning, Compass, ExternalLink, Flame, Info, Layers, Loader2, LocateFixed, Map, MapPin, Mountain, Package, Radio, RefreshCw, Search, ShieldCheck, Snowflake, Sun, Waves, Wind, X } from 'lucide-react';
import { getRisksForState, MONTH_NAMES, SAFETY_TIPS } from '../lib/riskData';
import { HAZARD_COLORS, HAZARD_TYPES, locateVisitor, readSavedLocation, searchLocations, STATES, stateLocation, type VisitorLocation } from '../lib/visitorData';
import { useWeatherAlerts } from '../lib/useWeatherAlerts';
import '../visitor.css';

const DisasterMap = lazy(() => import('../components/DisasterMap'));
const severityOrder = { extreme: 0, high: 1, moderate: 2, low: 3 };

function HazardIcon({ type, size = 24 }: { type: string; size?: number }) {
  const Icon = type.includes('Flood') || type === 'Tsunami' ? Waves
    : type === 'Wildfire' || type === 'Volcanic Eruption' ? Flame
    : type.includes('Winter') || type.includes('Ice') || type === 'Avalanche' ? Snowflake
    : type === 'Extreme Heat' || type === 'Drought' ? Sun
    : type === 'Earthquake' || type === 'Landslide' ? Mountain
    : type === 'Severe Thunderstorm' ? CloudLightning : Wind;
  return <Icon size={size} aria-hidden="true" />;
}

export default function Landing() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'map' ? 'map' : 'area';
  const [location, setLocation] = useState<VisitorLocation | null>(readSavedLocation);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VisitorLocation[]>([]);
  const [busy, setBusy] = useState<'search' | 'locate' | null>(null);
  const [error, setError] = useState('');
  const [hazard, setHazard] = useState('all');
  const [layer, setLayer] = useState<'hazards' | 'alerts'>('hazards');
  const request = useRef<AbortController | null>(null);
  const alerts = useWeatherAlerts(location?.state);
  const month = new Date().getMonth() + 1;
  const risks = location ? [...getRisksForState(location.state)].sort((first, second) => severityOrder[first.severity] - severityOrder[second.severity]) : [];
  const seasonalCount = risks.filter(risk => risk.seasonalMonths.includes(month) && risk.seasonalMonths.length < 12).length;

  useEffect(() => () => request.current?.abort(), []);

  function selectLocation(next: VisitorLocation) {
    request.current?.abort();
    request.current = null;
    setLocation(next);
    setResults([]);
    setQuery('');
    setError('');
    setBusy(null);
    try { localStorage.setItem('pfa-visitor-state', next.state); } catch { return; }
  }

  async function findCity(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) { setError('Enter at least two characters for a US city.'); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
    setBusy('search');
    setError('');
    setResults([]);
    try {
      const matches = await searchLocations(query, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      setResults(matches);
      if (!matches.length) setError('No supported US cities found. Try a nearby city or choose your state.');
    } catch (failure) {
      if (request.current === controller && (!controller.signal.aborted || timedOut)) {
        setError(timedOut ? 'Search timed out. Please choose a state or try again.' : failure instanceof Error ? failure.message : 'City search failed. Please choose a state.');
      }
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) setBusy(null);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError('This browser does not support location access. Please choose a state.'); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy('locate');
    setError('');
    setResults([]);
    navigator.geolocation.getCurrentPosition(async position => {
      if (request.current !== controller || controller.signal.aborted) return;
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
        const next = await locateVisitor(position.coords.latitude, position.coords.longitude, controller.signal);
        if (request.current === controller && !controller.signal.aborted) selectLocation(next);
      } catch (failure) {
        if (request.current === controller) {
          setError(controller.signal.aborted ? 'Location lookup timed out. Please choose a state.' : failure instanceof Error ? failure.message : 'Location lookup failed. Please choose a state.');
          setBusy(null);
        }
      } finally { window.clearTimeout(timeout); }
    }, failure => {
      if (request.current !== controller || controller.signal.aborted) return;
      setError(failure.code === 1 ? 'Location permission was declined. You can search for a city or choose a state instead.' : 'Your location could not be found. Please search for a city or choose a state.');
      setBusy(null);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  function clearLocation() {
    request.current?.abort();
    request.current = null;
    setLocation(null);
    setBusy(null);
    setError('');
    setResults([]);
    setQuery('');
    try { localStorage.removeItem('pfa-visitor-state'); } catch { return; }
  }

  return (
    <div className="visitor-explorer">
      <section className="explorer-intro">
        <div className="visitor-container intro-grid">
          <div className="intro-copy">
            <p className="eyebrow"><Compass size={16} /> A LITTLE KNOWLEDGE. A LOT MORE READY.</p>
            <h1>Prepared For Anything<span>starts with where you are.</span></h1>
            <p className="intro-description">Discover your area's hazards and what to do before they happen. Your first step to being prepared, no account needed.</p>
            <div className="intro-tags"><span><ShieldCheck size={16} /> Free to explore</span><span><MapPin size={16} /> All 50 states + DC</span></div>
          </div>
          <div className="location-tool">
            <div className="section-label"><MapPin size={19} /><h2>{location ? 'Explore another place' : 'Where are you getting prepared?'}</h2></div>
            <button className="visitor-button location-button" onClick={useMyLocation} disabled={busy !== null}>
              {busy === 'locate' ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />} {busy === 'locate' ? 'Finding your area...' : 'Use my location'}
            </button>
            <form onSubmit={findCity} className="city-search">
              <label htmlFor="visitor-city">Or search for a US city</label>
              <div className="search-input"><Search size={18} /><input id="visitor-city" value={query} onChange={event => setQuery(event.target.value)} placeholder="e.g. Austin or Portland" autoComplete="off" maxLength={100} /><button type="submit" title="Search cities" aria-label="Search cities" disabled={busy !== null}>{busy === 'search' ? <Loader2 size={19} className="animate-spin" /> : <ArrowRight size={19} />}</button></div>
            </form>
            {results.length > 0 && <ul className="city-results" aria-label="City search results">{results.map((result, index) => <li key={`${result.latitude}-${result.longitude}-${index}`}><button onClick={() => selectLocation(result)}><MapPin size={16} />{result.label}<ArrowRight size={16} /></button></li>)}</ul>}
            <div className="state-select"><label htmlFor="visitor-state">Choose a state</label><select id="visitor-state" value={location?.state || ''} onChange={event => event.target.value && selectLocation(stateLocation(event.target.value))}><option value="" disabled>Select your state</option>{STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
            {error && <p className="location-error" role="alert">{error}</p>}
            <p className="privacy-note"><Info size={14} /> Location is optional. Coordinates go to a location lookup service; only your chosen state is saved on this device.</p>
          </div>
        </div>
      </section>

      <div className="visitor-container">
        <div className="explorer-navigation">
          <nav className="explorer-tabs" aria-label="Explore preparedness">
            <button className={tab === 'area' ? 'active' : ''} aria-current={tab === 'area' ? 'page' : undefined} onClick={() => setParams({ tab: 'area' }, { preventScrollReset: true })}><Compass size={18} /> Your area</button>
            <button className={tab === 'map' ? 'active' : ''} aria-current={tab === 'map' ? 'page' : undefined} onClick={() => setParams({ tab: 'map' }, { preventScrollReset: true })}><Map size={18} /> Disaster map</button>
          </nav>
          {location ? <div className="selected-location"><MapPin size={15} /><span>{location.label}</span><button onClick={clearLocation} title="Forget my location" aria-label="Forget my location"><X size={15} /></button></div> : <span className="explorer-note">A safer tomorrow starts here</span>}
        </div>

        {tab === 'area' ? (
          <section className="area-section" aria-label="Regional preparedness">
            {!location ? (
              <div className="welcome-state">
                <div className="welcome-icons"><span style={{ color: '#c93627', background: '#ffebe6' }}><Flame size={28} /></span><span style={{ color: '#1674b8', background: '#e8f3ff' }}><Waves size={28} /></span><span style={{ color: '#8854ba', background: '#f1eafa' }}><Mountain size={28} /></span><span style={{ color: '#9a7400', background: '#fff7d6' }}><Sun size={28} /></span></div>
                <h2>Every place has a different story.</h2><p>Choose your location to discover the hazards to prepare for, their typical seasons, and practical ways to stay safer.</p>
                <div className="sample-places">{['CA', 'FL', 'TX', 'NY'].map(code => <button key={code} onClick={() => selectLocation(stateLocation(code))}><MapPin size={15} /> Explore {stateLocation(code).label}<ArrowRight size={15} /></button>)}</div>
              </div>
            ) : (
              <>
                <div className="area-heading"><div><p className="eyebrow">KNOW WHAT TO PREPARE FOR</p><h2>{location.label} at a glance</h2><p>State-level guidance for {stateLocation(location.state).label}. Local exposure varies by terrain, coast, and neighborhood.</p></div><span className="regional-badge"><ShieldCheck size={16} /> Preparedness, not a forecast</span></div>
                <div className="area-stats"><div><Layers size={23} /><strong>{risks.length}</strong><span>Regional hazards</span></div><div><Sun size={23} /><strong>{seasonalCount}</strong><span>In a typical peak season · {MONTH_NAMES[month - 1]}</span></div><div><Radio size={23} /><strong>{alerts.status === 'ready' ? alerts.alerts.length : alerts.status === 'error' ? 'Unavailable' : 'Checking'}</strong><span>Active NWS alerts statewide</span></div></div>
                <p className="data-note"><Info size={16} /> These qualitative priorities come from our educational state guide, not a measured risk score. A hazard can happen outside its typical season.</p>
                <div className="hazard-grid">{risks.map(risk => {
                  const color = HAZARD_COLORS[risk.type] || '#477947';
                  const tips = SAFETY_TIPS[risk.type] || (risk.type === 'Flash Flood' ? SAFETY_TIPS.Flood : risk.type === 'Ice Storm' ? SAFETY_TIPS['Winter Storm'] : ['Sign up for local emergency notifications.', 'Prepare water, medications, and a battery-powered radio.', 'Follow instructions from local emergency officials.']);
                  const yearRound = risk.seasonalMonths.length === 12;
                  const inSeason = risk.seasonalMonths.includes(month);
                  return <article className="hazard-card" key={risk.type} style={{ '--hazard-color': color } as CSSProperties}>
                    <div className="hazard-card-top"><span className="hazard-symbol"><HazardIcon type={risk.type} size={25} /></span><span className={`risk-priority priority-${risk.severity}`}>{risk.severity === 'extreme' ? 'Very high' : risk.severity} concern</span></div>
                    <h3>{risk.type}</h3><p>{risk.description}</p>
                    <div className="season-title"><span>{yearRound ? 'Year-round awareness' : 'Typical peak months'}</span>{!yearRound && inSeason && <span className="in-season">In season</span>}</div>
                    <div className="month-strip" aria-label={`Typical months: ${risk.seasonalMonths.map(value => MONTH_NAMES[value - 1]).join(', ')}`}>{MONTH_NAMES.map((name, index) => <span key={name} className={risk.seasonalMonths.includes(index + 1) ? 'season-month' : ''}>{name[0]}</span>)}</div>
                    <details className="hazard-tips"><summary>Ways to prepare <ChevronDown size={16} /></summary><ul>{tips.map(tip => <li key={tip}><Check size={15} /><span>{tip}</span></li>)}</ul><a href="https://www.ready.gov/be-informed" target="_blank" rel="noreferrer">Read official guidance <ExternalLink size={14} /></a></details>
                  </article>;
                })}</div>
              </>
            )}
          </section>
        ) : (
          <section className="map-section" aria-label="Disaster map explorer">
            <div className="area-heading"><div><p className="eyebrow">THE BIGGER PICTURE</p><h2>A world of hazards. A place to start.</h2><p>Explore regional hazards or official weather alerts for your selected state.</p></div></div>
            <div className="map-toolbar"><fieldset className="map-layer-switch"><legend className="sr-only">Map layer</legend><label className={layer === 'hazards' ? 'active' : ''}><input type="radio" name="map-layer" checked={layer === 'hazards'} onChange={() => setLayer('hazards')} /><Layers size={16} /> Regional hazards</label><label className={layer === 'alerts' ? 'active' : ''}><input type="radio" name="map-layer" checked={layer === 'alerts'} onChange={() => setLayer('alerts')} /><Radio size={16} /> NWS alerts</label></fieldset>{layer === 'hazards' && <div className="hazard-filter"><label htmlFor="hazard-filter">Hazard</label><select id="hazard-filter" value={hazard} onChange={event => setHazard(event.target.value)}><option value="all">Top regional concern</option>{HAZARD_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>}</div>
            <Suspense fallback={<div className="map-loading"><Loader2 className="animate-spin" size={26} /> Loading map...</div>}><DisasterMap location={location} hazard={hazard} layer={layer} alerts={alerts.alerts} onSelect={selectLocation} /></Suspense>
            {layer === 'hazards' ? <div className="map-legend">{(hazard === 'all' ? ['Wildfire', 'Tornado', 'Hurricane', 'Winter Storm', 'Flood', 'Extreme Heat', 'Earthquake'] : [hazard]).map(type => <span key={type}><i style={{ background: HAZARD_COLORS[type] }} />{type}</span>)}<p>Markers represent state overviews, not incident locations or hazard boundaries.</p></div> : <div className="map-legend"><span><i style={{ background: '#c93627' }} /> Severe / extreme alert</span><span><i style={{ background: '#b65b00' }} /> Other alerts</span><p>{!location ? 'Choose a location to load its state alerts.' : 'Only alerts with NWS-provided geometry appear on the map. All alerts appear below, including county-based alerts without polygons.'}</p></div>}
            <div className="map-area-list"><h3>{location ? `Hazards to prepare for in ${stateLocation(location.state).label}` : 'Explore a state'}</h3>{location ? <div>{risks.map(risk => <button key={risk.type} onClick={() => { setLayer('hazards'); setHazard(risk.type); }} style={{ color: HAZARD_COLORS[risk.type] }}><HazardIcon type={risk.type} size={17} />{risk.type}</button>)}</div> : <p>Choose a state above or select a regional marker.</p>}</div>
          </section>
        )}

        {location && <section className="alerts-section" aria-labelledby="alerts-heading"><div className="alerts-heading"><div><p className="eyebrow"><Radio size={15} /> FROM THE NATIONAL WEATHER SERVICE</p><h2 id="alerts-heading">Official weather alerts</h2><p>Statewide reports, not necessarily at your address. NWS alerts do not cover every disaster type.</p></div><button className="icon-button" onClick={alerts.refresh} disabled={alerts.status === 'loading'} title="Refresh weather alerts" aria-label="Refresh weather alerts"><RefreshCw size={18} className={alerts.status === 'loading' ? 'animate-spin' : ''} /></button></div>
          <div aria-live="polite">{alerts.status === 'loading' ? <p className="alert-message"><Loader2 size={18} className="animate-spin" /> Checking official alerts...</p> : alerts.status === 'error' ? <p className="alert-message alert-unavailable"><Info size={18} /> Alert data is unavailable. This does not mean there are no alerts. <a href="https://www.weather.gov/" target="_blank" rel="noreferrer">Check weather.gov <ExternalLink size={14} /></a></p> : alerts.alerts.length === 0 ? <p className="alert-message"><ShieldCheck size={19} /> No active NWS alerts returned for this state. Stay aware of local updates.</p> : <div className="alert-list">{alerts.alerts.map(alert => <details key={alert.id} className="weather-alert"><summary><span className={`alert-severity ${['Extreme', 'Severe'].includes(alert.properties.severity) ? 'alert-severe' : ''}`}>{alert.properties.severity}</span><span><strong>{alert.properties.event}</strong><small>{alert.properties.areaDesc}</small></span><ChevronDown size={18} /></summary><div className="alert-content"><h3>{alert.properties.headline}</h3><p>{alert.properties.description}</p>{alert.properties.instruction && <><h4>Official instructions</h4><p>{alert.properties.instruction}</p></>}<p className="alert-expiry">Expires {new Date(alert.properties.expires).toLocaleString()}</p></div></details>)}</div>}</div>
          {alerts.checkedAt && <p className="alert-updated">Checked {alerts.checkedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · <a href="https://www.weather.gov/" target="_blank" rel="noreferrer">weather.gov <ExternalLink size={12} /></a></p>}
        </section>}

        <section className="ready-band"><div className="ready-band-heading"><Package size={28} /><div><p className="eyebrow">SMALL STEPS, REAL PEACE OF MIND</p><h2>Start with the essentials.</h2></div></div><div className="essentials-grid"><div><span>01</span><h3>Water + food</h3><p>At least one gallon of water per person per day and several days of nonperishable food.</p></div><div><span>02</span><h3>Light + connection</h3><p>A flashlight, spare batteries, a power bank, and a battery-powered emergency radio.</p></div><div><span>03</span><h3>Health + documents</h3><p>Medications, first aid, copies of important documents, and supplies for children and pets.</p></div></div><a href="https://www.ready.gov/kit" target="_blank" rel="noreferrer" className="official-kit-link">See the Ready.gov emergency kit guide <ArrowRight size={16} /></a></section>
        <section className="account-band"><div><ShieldCheck size={25} /><div><h2>Know your risks. Make your plan.</h2><p>An account is for your next step: personal checklists and household planning.</p></div></div><Link to="/signup" className="visitor-button">Create an account <ArrowRight size={17} /></Link></section>
        <p className="visitor-disclaimer">Educational guidance only. Always follow local emergency officials. In an immediate emergency, call 911. Location search: Open-Meteo / BigDataCloud. Weather alerts: NWS.</p>
      </div>
    </div>
  );
}
