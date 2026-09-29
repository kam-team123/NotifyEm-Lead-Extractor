import { US_STATES } from '../data/mockData';

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface DiscoveredCandidate {
  id: string;
  name: string;
  type: string;
  category: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  source: 'OpenStreetMap Overpass' | 'Google Places' | 'Database collection';
  estimatedValue?: number;
  isExistingLead?: boolean;
}

// Fallback known coordinates for major US cities to ensure instantaneous lookup
const US_CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  'austin': { lat: 30.2672, lng: -97.7431, state: 'TX' },
  'dallas': { lat: 32.7767, lng: -96.7970, state: 'TX' },
  'houston': { lat: 29.7604, lng: -95.3698, state: 'TX' },
  'san antonio': { lat: 29.4241, lng: -98.4936, state: 'TX' },
  'miami': { lat: 25.7617, lng: -80.1918, state: 'FL' },
  'orlando': { lat: 28.5383, lng: -81.3792, state: 'FL' },
  'tampa': { lat: 27.9506, lng: -82.4572, state: 'FL' },
  'jacksonville': { lat: 30.3322, lng: -81.6557, state: 'FL' },
  'seattle': { lat: 47.6062, lng: -122.3321, state: 'WA' },
  'bellevue': { lat: 47.6101, lng: -122.2015, state: 'WA' },
  'spokane': { lat: 47.6588, lng: -117.4260, state: 'WA' },
  'los angeles': { lat: 34.0522, lng: -118.2437, state: 'CA' },
  'san francisco': { lat: 37.7749, lng: -122.4194, state: 'CA' },
  'san diego': { lat: 32.7157, lng: -117.1611, state: 'CA' },
  'san jose': { lat: 37.3382, lng: -121.8863, state: 'CA' },
  'sacramento': { lat: 38.5816, lng: -121.4944, state: 'CA' },
  'denver': { lat: 39.7392, lng: -104.9903, state: 'CO' },
  'boulder': { lat: 40.0150, lng: -105.2705, state: 'CO' },
  'colorado springs': { lat: 38.8339, lng: -104.8214, state: 'CO' },
  'new york': { lat: 40.7128, lng: -74.0060, state: 'NY' },
  'brooklyn': { lat: 40.6782, lng: -73.9442, state: 'NY' },
  'manhattan': { lat: 40.7831, lng: -73.9712, state: 'NY' },
  'charlotte': { lat: 35.2271, lng: -80.8431, state: 'NC' },
  'raleigh': { lat: 35.7796, lng: -78.6382, state: 'NC' },
  'atlanta': { lat: 33.7490, lng: -84.3880, state: 'GA' },
  'phoenix': { lat: 33.4484, lng: -112.0740, state: 'AZ' },
  'scottsdale': { lat: 33.4942, lng: -111.9261, state: 'AZ' },
  'tucson': { lat: 32.2226, lng: -110.9747, state: 'AZ' },
  'chicago': { lat: 41.8781, lng: -87.6298, state: 'IL' },
  'nashville': { lat: 36.1627, lng: -86.7816, state: 'TN' },
  'memphis': { lat: 35.1495, lng: -90.0490, state: 'TN' },
  'boston': { lat: 42.3601, lng: -71.0589, state: 'MA' },
  'las vegas': { lat: 36.1699, lng: -115.1398, state: 'NV' },
  'reno': { lat: 39.5296, lng: -119.8138, state: 'NV' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, state: 'UT' },
  'portland': { lat: 45.5152, lng: -122.6784, state: 'OR' },
  'philadelphia': { lat: 39.9526, lng: -75.1652, state: 'PA' },
  'pittsburgh': { lat: 40.4406, lng: -79.9959, state: 'PA' },
  'columbus': { lat: 39.9612, lng: -82.9988, state: 'OH' },
  'cleveland': { lat: 41.4993, lng: -81.6944, state: 'OH' },
  'cincinnati': { lat: 39.1031, lng: -84.5120, state: 'OH' },
  'indianapolis': { lat: 39.7684, lng: -86.1581, state: 'IN' },
  'detroit': { lat: 42.3314, lng: -83.0458, state: 'MI' },
  'minneapolis': { lat: 44.9778, lng: -93.2650, state: 'MN' },
  'kansas city': { lat: 39.0997, lng: -94.5786, state: 'MO' },
  'st louis': { lat: 38.6270, lng: -90.1994, state: 'MO' },
  'new orleans': { lat: 29.9511, lng: -90.0715, state: 'LA' },
  'honolulu': { lat: 21.3069, lng: -157.8583, state: 'HI' },
  'anchorage': { lat: 61.2181, lng: -149.9003, state: 'AK' },
  'boise': { lat: 43.6150, lng: -116.2023, state: 'ID' },
  'albuquerque': { lat: 35.0844, lng: -106.6504, state: 'NM' },
  'omaha': { lat: 41.2565, lng: -95.9345, state: 'NE' },
  'richmond': { lat: 37.5407, lng: -77.4360, state: 'VA' },
  'baltimore': { lat: 39.2904, lng: -76.6122, state: 'MD' },
  'milwaukee': { lat: 43.0389, lng: -87.9065, state: 'WI' },
  'birmingham': { lat: 33.5186, lng: -86.8104, state: 'AL' },
  'charleston': { lat: 32.7765, lng: -79.9311, state: 'SC' }
};

export async function geocodeAddress(query: string): Promise<GeocodingResult | null> {
  const clean = query.trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();

  // 1. Check City dictionary
  for (const [key, val] of Object.entries(US_CITY_COORDINATES)) {
    if (lower.includes(key)) {
      return {
        displayName: `${key.toUpperCase()}, ${val.state}, USA`,
        lat: val.lat,
        lng: val.lng,
        city: key.charAt(0).toUpperCase() + key.slice(1),
        state: val.state,
        country: 'United States'
      };
    }
  }

  // 2. Check All 50 US States & DC
  const stateMatch = US_STATES.find(
    s => s.code.toLowerCase() === lower || 
         lower.includes(s.name.toLowerCase()) || 
         lower.endsWith(`, ${s.code.toLowerCase()}`) || 
         lower.includes(` ${s.code.toLowerCase()} `)
  );

  if (stateMatch) {
    return {
      displayName: `${stateMatch.name}, United States`,
      lat: stateMatch.coordinates[0],
      lng: stateMatch.coordinates[1],
      city: stateMatch.name,
      state: stateMatch.code,
      country: 'United States'
    };
  }

  // 3. Attempt Nominatim geocoding
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean + ', USA')}&format=json&addressdetails=1&limit=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Notifyem-LeadFinder/1.0'
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          city: item.address?.city || item.address?.town || item.address?.village || clean,
          state: item.address?.state,
          country: item.address?.country,
          postalCode: item.address?.postcode
        };
      }
    }
  } catch {
    // Graceful fallback below
  }

  // Fallback default
  return {
    displayName: `${clean} (Estimated Search Focus)`,
    lat: 30.2672 + (Math.random() - 0.5) * 0.1,
    lng: -97.7431 + (Math.random() - 0.5) * 0.1,
    city: clean,
    state: 'US',
    country: 'United States'
  };
}

export async function discoverCandidatesAroundLocation(
  lat: number,
  lng: number,
  radiusMiles: number,
  source: 'OpenStreetMap Overpass' | 'Google Places' | 'Database collection',
  cityHint: string = 'Metro Area',
  stateHint: string = 'US'
): Promise<DiscoveredCandidate[]> {
  // Simulate high-density real estate discovery based on radius and location
  await new Promise(r => setTimeout(r, 600));

  const count = Math.min(12, Math.max(5, Math.round(radiusMiles / 4)));
  const candidates: DiscoveredCandidate[] = [];

  const candidateTemplates = [
    { name: 'Vanguard Realty Group & Co-Broker', category: 'Commercial & Retail', type: 'Brokerage Office' },
    { name: 'Heritage Hill Residential Estate', category: 'Luxury Estate', type: 'Single Family Residence' },
    { name: 'Apex Multi-Family 4-Plex Portfolio', category: 'Multi-Family 2-4 Units', type: 'Investment Property' },
    { name: 'Turnkey Craftsman Single Family', category: 'Residential Single-Family', type: 'Residential Parcel' },
    { name: 'Sunset Ridge Commercial Plaza', category: 'Commercial & Retail', type: 'Retail Center' },
    { name: 'Pre-Foreclosure Tax Notice Parcel', category: 'Distressed / Pre-Foreclosure', type: 'Tax Deed Opportunity' },
    { name: 'Off-Market FSBO Modern Townhome', category: 'FSBO (For Sale By Owner)', type: 'Direct Seller Lead' },
    { name: 'Boutique Medical & Professional Suites', category: 'Commercial & Retail', type: 'Medical Office' },
    { name: 'Parkside Duplex Value-Add', category: 'Multi-Family 2-4 Units', type: 'Residential Income' },
    { name: 'Lakeview Contemporary Architectural', category: 'Luxury Estate', type: 'Waterfront Estate' }
  ];

  for (let i = 0; i < count; i++) {
    const t = candidateTemplates[i % candidateTemplates.length];
    // Offset lat/lng within the search radius
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.2;
    const distanceDeg = (radiusMiles / 69) * (0.3 + 0.6 * Math.random());
    const cLat = lat + Math.sin(angle) * distanceDeg;
    const cLng = lng + Math.cos(angle) * (distanceDeg / Math.cos((lat * Math.PI) / 180));

    candidates.push({
      id: `cand_${Date.now()}_${i}`,
      name: `${t.name} #${100 + i * 15}`,
      type: t.type,
      category: t.category,
      address: `${1000 + i * 142} Grand Ave`,
      city: cityHint,
      state: stateHint,
      lat: Number(cLat.toFixed(5)),
      lng: Number(cLng.toFixed(5)),
      source,
      estimatedValue: Math.round(450000 + Math.random() * 2200000),
      isExistingLead: i === 0
    });
  }

  return candidates;
}
