import { db, seedPOIData, isSeeded, type POIRecord } from './offline-db';

/** Default seed data — Nigerian POIs for initial offline use */
const DEFAULT_SEED: POIRecord[] = [
  { id: 'poi-001', name: 'Lekki Conservation Centre', category: 'tourism', lat: 6.4371, lon: 3.5437, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Nature reserve with canopy walkway', tags: ['nature', 'park', 'tourism'], trustScore: 92 },
  { id: 'poi-002', name: 'Computer Village Ikeja', category: 'shopping', lat: 6.6018, lon: 3.3515, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Largest electronics market in West Africa', tags: ['electronics', 'market', 'tech'], trustScore: 88 },
  { id: 'poi-003', name: 'Aso Rock', category: 'landmark', lat: 9.0765, lon: 7.5265, city: 'Abuja', state: 'FCT', country: 'Nigeria', description: 'Iconic monolith and presidential complex', tags: ['landmark', 'government'], trustScore: 95 },
  { id: 'poi-004', name: 'Yankari Game Reserve', category: 'tourism', lat: 9.7500, lon: 10.5000, city: 'Bauchi', state: 'Bauchi', country: 'Nigeria', description: 'Wildlife park with warm springs', tags: ['wildlife', 'nature', 'safari'], trustScore: 85 },
  { id: 'poi-005', name: 'Obudu Mountain Resort', category: 'tourism', lat: 6.3833, lon: 9.3667, city: 'Calabar', state: 'Cross River', country: 'Nigeria', description: 'Mountain resort with cable cars', tags: ['resort', 'mountain', 'tourism'], trustScore: 90 },
  { id: 'poi-006', name: 'National Theatre Lagos', category: 'culture', lat: 6.4598, lon: 3.3896, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Iconic performing arts venue', tags: ['theatre', 'arts', 'culture'], trustScore: 87 },
  { id: 'poi-007', name: 'Shoprite Ikeja City Mall', category: 'shopping', lat: 6.6005, lon: 3.3425, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Major shopping mall with supermarket', tags: ['mall', 'shopping', 'groceries'], trustScore: 91 },
  { id: 'poi-008', name: 'University of Lagos', category: 'education', lat: 6.5158, lon: 3.3890, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Premier university in Lagos', tags: ['university', 'education'], trustScore: 93 },
  { id: 'poi-009', name: 'Transcorp Hilton Abuja', category: 'hotel', lat: 9.0579, lon: 7.4951, city: 'Abuja', state: 'FCT', country: 'Nigeria', description: '5-star hotel in the capital', tags: ['hotel', 'luxury', 'hospitality'], trustScore: 94 },
  { id: 'poi-010', name: 'Oba Akran Market', category: 'market', lat: 6.6110, lon: 3.3460, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Popular commercial market area', tags: ['market', 'commerce', 'trade'], trustScore: 80 },
  { id: 'poi-011', name: 'Jabi Lake Mall', category: 'shopping', lat: 9.0360, lon: 7.4260, city: 'Abuja', state: 'FCT', country: 'Nigeria', description: 'Waterfront shopping destination', tags: ['mall', 'shopping', 'lakeside'], trustScore: 89 },
  { id: 'poi-012', name: 'Wuse Market', category: 'market', lat: 9.0580, lon: 7.4750, city: 'Abuja', state: 'FCT', country: 'Nigeria', description: 'Largest open-air market in Abuja', tags: ['market', 'food', 'trade'], trustScore: 82 },
  { id: 'poi-013', name: 'Osun-Osogbo Sacred Grove', category: 'heritage', lat: 7.7560, lon: 4.5670, city: 'Osogbo', state: 'Osun', country: 'Nigeria', description: 'UNESCO World Heritage sacred forest', tags: ['heritage', 'UNESCO', 'culture'], trustScore: 96 },
  { id: 'poi-014', name: 'Tafawa Balewa Square', category: 'landmark', lat: 6.4500, lon: 3.3920, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Historic independence ceremony ground', tags: ['landmark', 'history'], trustScore: 86 },
  { id: 'poi-015', name: 'Murtala Muhammed Airport', category: 'transport', lat: 6.5774, lon: 3.3211, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Main international airport', tags: ['airport', 'transport', 'travel'], trustScore: 88 },
  { id: 'poi-016', name: 'Balogun Market', category: 'market', lat: 6.4530, lon: 3.3900, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Massive textile and general market', tags: ['market', 'textiles', 'commerce'], trustScore: 79 },
  { id: 'poi-017', name: 'NNPC Towers', category: 'business', lat: 9.0620, lon: 7.4880, city: 'Abuja', state: 'FCT', country: 'Nigeria', description: 'Nigerian National Petroleum Corporation HQ', tags: ['oil', 'business', 'government'], trustScore: 90 },
  { id: 'poi-018', name: 'Olumo Rock', category: 'tourism', lat: 7.1020, lon: 3.3460, city: 'Abeokuta', state: 'Ogun', country: 'Nigeria', description: 'Historic rock formation and tourist attraction', tags: ['rock', 'tourism', 'history'], trustScore: 87 },
  { id: 'poi-019', name: 'Third Mainland Bridge', category: 'landmark', lat: 6.4800, lon: 3.3900, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Longest bridge in Africa over lagoon', tags: ['bridge', 'landmark', 'infrastructure'], trustScore: 91 },
  { id: 'poi-020', name: 'Zenith Bank HQ', category: 'business', lat: 6.4297, lon: 3.4220, city: 'Lagos', state: 'Lagos', country: 'Nigeria', description: 'Headquarters of Zenith Bank', tags: ['bank', 'fintech', 'business'], trustScore: 93 },
];

/** Initialize offline database with seed data if not already seeded */
export async function initOfflineData(): Promise<{ seeded: boolean; count: number }> {
  const alreadySeeded = await isSeeded();
  if (alreadySeeded) {
    const count = await db.pois.count();
    return { seeded: true, count };
  }
  const count = await seedPOIData(DEFAULT_SEED);
  return { seeded: true, count };
}

/** Import custom POI data from a JSON file or URL */
export async function importPOIData(source: string | POIRecord[]): Promise<number> {
  let data: POIRecord[];
  if (typeof source === 'string') {
    const res = await fetch(source);
    data = await res.json();
  } else {
    data = source;
  }
  return seedPOIData(data);
}

/** Clear all offline data */
export async function clearOfflineData(): Promise<void> {
  await db.pois.clear();
  await db.cachedSearches.clear();
  await db.meta.clear();
}
