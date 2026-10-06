import { expect, test } from '@playwright/test';

const alert = {
  type: 'Feature', id: 'test-alert',
  geometry: { type: 'Polygon', coordinates: [[[-121, 36], [-119, 36], [-119, 38], [-121, 38], [-121, 36]]] },
  properties: {
    event: 'Flood Warning', headline: 'Test official flood warning', areaDesc: 'Test county', severity: 'Severe',
    description: 'Flooding has been reported in the test area.', instruction: 'Do not drive through floodwaters.',
    sent: new Date().toISOString(), expires: new Date(Date.now() + 3600000).toISOString(),
  },
};

test.beforeEach(async ({ page }) => {
  await page.route('https://api.weather.gov/alerts/active?*', route => route.fulfill({ json: { features: [alert] } }));
});

test('visitor can select, change, remember, and forget a state without sign-in', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Prepared For Anything');
  await expect(page.getByRole('heading', { name: 'Every place has a different story.' })).toBeVisible();
  await expect(page.locator('.explorer-tabs')).toHaveCount(0);
  await page.getByLabel('Choose a state').selectOption('CA');
  await expect(page.getByRole('heading', { name: 'California at a glance' })).toBeVisible();
  await expect(page.locator('.hazard-card')).toHaveCount(6);
  await expect(page.locator('.hazard-card > p').first()).toHaveCSS('font-size', '16px');
  await expect(page.locator('.privacy-note')).toHaveCSS('font-size', '14px');
  await expect(page.getByLabel('Or search for a US city')).toHaveCSS('font-size', '16px');
  await expect(page.getByLabel('Choose a state')).toHaveCSS('font-size', '16px');
  await page.locator('.hazard-tips summary').first().click();
  await expect(page.getByText('Know your evacuation routes before fire season.')).toBeVisible();
  await expect(page.getByText('Flood Warning', { exact: true })).toBeVisible();
  await page.locator('.weather-alert summary').click();
  await expect(page.getByText('Do not drive through floodwaters.')).toBeVisible();
  await page.getByLabel('Choose a state').selectOption('FL');
  await expect(page.getByRole('heading', { name: 'Florida at a glance' })).toBeVisible();
  await expect(page.locator('.hazard-card')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Create account' })).toHaveCount(0);
  await expect(page.getByLabel('Advertisement')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Florida at a glance' })).toBeVisible();
  expect(await page.evaluate(() => document.cookie)).toContain('pfa-visitor-state=FL');
  await page.getByRole('button', { name: 'Forget my location' }).click();
  await expect(page.getByRole('heading', { name: 'Every place has a different story.' })).toBeVisible();
  expect(await page.evaluate(() => document.cookie)).not.toContain('pfa-visitor-state=');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('visitor-area-page.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('account, dashboard, and legacy app routes are removed', async ({ page }) => {
  for (const route of ['login', 'signup', 'dashboard', 'profile-setup', 'risk-assessment', 'kit-builder']) {
    await page.goto(`./${route}`);
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  }
});

test('city search is disambiguated and handles empty and failed responses', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/**', route => route.fulfill({ json: { results: [
    { name: 'Portland', admin1: 'Oregon', country_code: 'US', latitude: 45.5, longitude: -122.6 },
    { name: 'Portland', admin1: 'Maine', country_code: 'US', latitude: 43.6, longitude: -70.2 },
  ] } }));
  await page.goto('./');
  await page.getByLabel('Or search for a US city').fill('Portland');
  await page.getByRole('button', { name: 'Search cities' }).click();
  await page.getByRole('button', { name: 'Portland, OR' }).click();
  await expect(page.getByRole('heading', { name: 'Portland, OR at a glance' })).toBeVisible();
  await page.route('https://geocoding-api.open-meteo.com/**', route => route.fulfill({ json: {} }));
  await page.getByLabel('Or search for a US city').fill('Unknown');
  await page.getByRole('button', { name: 'Search cities' }).click();
  await expect(page.getByRole('alert')).toContainText('No supported US cities found');
  await page.route('https://geocoding-api.open-meteo.com/**', route => route.fulfill({ status: 503 }));
  await page.getByRole('button', { name: 'Search cities' }).click();
  await expect(page.getByRole('alert')).toContainText('City search is unavailable');
});

test('location permission is opt-in and denied access leaves manual selection usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', { value: {
      getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) => failure({ code: 1, message: 'Denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }),
    } });
  });
  await page.goto('./');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Use my location' }).click();
  await expect(page.getByRole('alert')).toContainText('Location permission was declined');
  await page.getByLabel('Choose a state').selectOption('TX');
  await expect(page.getByRole('heading', { name: 'Texas at a glance' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('browser location resolves a US area without storing coordinates', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 30.27, longitude: -97.74 });
  await page.route('https://api.bigdatacloud.net/**', route => route.fulfill({ json: { countryCode: 'US', principalSubdivisionCode: 'US-TX', city: 'Austin' } }));
  await page.goto('./');
  await page.getByRole('button', { name: 'Use my location' }).click();
  await expect(page.getByRole('heading', { name: 'Austin, TX at a glance' })).toBeVisible();
  expect(await page.evaluate(() => document.cookie)).toContain('pfa-visitor-state=TX');
});

test('alert failure is not displayed as all-clear, and refresh recovers', async ({ page }) => {
  await page.route('https://api.weather.gov/alerts/active?*', route => route.fulfill({ status: 503 }));
  await page.goto('./');
  await page.getByLabel('Choose a state').selectOption('CA');
  await expect(page.getByText('Alert data is unavailable.', { exact: false })).toBeVisible();
  await expect(page.getByText('No active NWS alerts returned', { exact: false })).toHaveCount(0);
  await page.route('https://api.weather.gov/alerts/active?*', route => route.fulfill({ json: { features: [] } }));
  await page.getByRole('button', { name: 'Refresh weather alerts' }).click();
  await expect(page.getByText('No active NWS alerts returned', { exact: false })).toBeVisible();
});

test('emergency kit adapts to state hazards and household size', async ({ page }) => {
  await page.goto('./emergency-kit');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Build an emergency kit');
  await page.getByLabel('State or area').selectOption('FL');
  await expect(page.getByLabel('Emergency type')).toHaveValue('Hurricane');
  await expect(page.getByText('Evacuation route and meeting-place plan')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '1 person' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '4 people' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '9 gallons' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Mark Drinking water as ready' }).check();
  await expect(page.getByText('1 of 14 items checked')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print checklist' })).toBeVisible();
  const supplyTextWidth = await page.locator('.kit-comparison-item > span').first().evaluate(element => element.getBoundingClientRect().width);
  expect(supplyTextWidth).toBeGreaterThan(200);
  expect(await page.evaluate(() => document.cookie)).toContain('pfa-visitor-state=FL');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('local resources filter by jurisdiction and keep locality out of cookies', async ({ page }) => {
  await page.goto('./resources');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Local emergency resources');
  await page.getByLabel('State or DC').selectOption('CA');
  await page.getByLabel('City or county (optional)').fill('Oakland');
  await page.getByLabel('Jurisdiction').selectOption('City/Local');
  await expect(page.getByRole('heading', { name: 'Look up official alerts for Oakland' })).toBeVisible();
  await page.getByLabel('Jurisdiction').selectOption('County/Regional');
  await expect(page.getByRole('heading', { name: 'Find county services for Oakland' })).toBeVisible();
  await page.getByLabel('Search resources').fill('211');
  await expect(page.getByRole('heading', { name: 'Find local help through 211' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Find county services for Oakland' })).toHaveCount(0);
  const cookie = await page.evaluate(() => document.cookie);
  expect(cookie).toContain('pfa-visitor-state=CA');
  expect(cookie).not.toContain('Oakland');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Forget saved state' }).click();
  expect(await page.evaluate(() => document.cookie)).not.toContain('pfa-visitor-state=');
});

test('map renders regional markers, filters hazards, and displays official polygons', async ({ page }, testInfo) => {
  await page.goto('./?tab=map');
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await expect(page.locator('.leaflet-tile').first()).toHaveAttribute('src', /https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Topo_Map\/MapServer\/tile\//);
  await expect(page.locator('.leaflet-control-attribution').getByRole('link', { name: 'Esri' })).toBeVisible();
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(51);
  await page.getByLabel('Hazard', { exact: true }).selectOption('Earthquake');
  const filtered = await page.locator('.leaflet-overlay-pane path').count();
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThan(51);
  await page.getByLabel('Choose a state').selectOption('CA');
  await page.getByRole('radio', { name: 'NWS alerts' }).check();
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(2);
  await page.locator('.disaster-map').scrollIntoViewIfNeeded();
  await page.locator('.leaflet-overlay-pane path[fill-opacity="0.2"]').click();
  await expect(page.locator('.leaflet-popup-content')).toContainText('Flood Warning');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('.disaster-map').screenshot({ path: testInfo.outputPath('disaster-map.png') });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('visitor-map-page.png'), fullPage: true });
});