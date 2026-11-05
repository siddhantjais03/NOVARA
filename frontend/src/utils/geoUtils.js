/**
 * NOVARA Logistics & Geolocation Utilities
 *
 * Configured Demonstration Dispatch Origin & Approximate City-Level Destination Mapping
 * IMPORTANT:
 * 1. BKC Mumbai is a configured demonstration fulfillment hub, not a verified physical warehouse.
 * 2. Destination coordinates are approximate city-level centroids. Exact customer GPS or street-level
 *    tracking is never claimed without hardware telematics.
 */

export const DEMO_DISPATCH_ORIGIN = {
  name: 'NOVARA Flagship Atelier & Fulfillment Hub',
  note: 'Configured Demonstration Dispatch Origin',
  address: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051',
  lat: 19.0657,
  lng: 72.8687,
  city: 'Mumbai',
  state: 'Maharashtra'
};

// Approximate city-level centroids for major logistics hubs across India
const CITY_COORDINATES = {
  mumbai: { lat: 18.9220, lng: 72.8347, label: 'Mumbai (Approximate City Centroid)' },
  bombay: { lat: 18.9220, lng: 72.8347, label: 'Mumbai (Approximate City Centroid)' },
  delhi: { lat: 28.6139, lng: 77.2090, label: 'Delhi NCR (Approximate City Centroid)' },
  'new delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi (Approximate City Centroid)' },
  noida: { lat: 28.5355, lng: 77.3910, label: 'Noida (Approximate City Centroid)' },
  gurgaon: { lat: 28.4595, lng: 77.0266, label: 'Gurugram (Approximate City Centroid)' },
  gurugram: { lat: 28.4595, lng: 77.0266, label: 'Gurugram (Approximate City Centroid)' },
  bengaluru: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru (Approximate City Centroid)' },
  bangalore: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru (Approximate City Centroid)' },
  hyderabad: { lat: 17.3850, lng: 78.4867, label: 'Hyderabad (Approximate City Centroid)' },
  chennai: { lat: 13.0827, lng: 80.2707, label: 'Chennai (Approximate City Centroid)' },
  madras: { lat: 13.0827, lng: 80.2707, label: 'Chennai (Approximate City Centroid)' },
  kolkata: { lat: 22.5726, lng: 88.3639, label: 'Kolkata (Approximate City Centroid)' },
  calcutta: { lat: 22.5726, lng: 88.3639, label: 'Kolkata (Approximate City Centroid)' },
  pune: { lat: 18.5204, lng: 73.8567, label: 'Pune (Approximate City Centroid)' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad (Approximate City Centroid)' },
  jaipur: { lat: 26.9124, lng: 75.7873, label: 'Jaipur (Approximate City Centroid)' },
  lucknow: { lat: 26.8467, lng: 80.9462, label: 'Lucknow (Approximate City Centroid)' },
  chandigarh: { lat: 30.7333, lng: 76.7794, label: 'Chandigarh (Approximate City Centroid)' },
  surat: { lat: 21.1702, lng: 72.8311, label: 'Surat (Approximate City Centroid)' },
  kochi: { lat: 9.9312, lng: 76.2673, label: 'Kochi (Approximate City Centroid)' },
  cochin: { lat: 9.9312, lng: 76.2673, label: 'Kochi (Approximate City Centroid)' },
  goa: { lat: 15.2993, lng: 74.1240, label: 'Goa (Approximate Region Centroid)' },
  indore: { lat: 22.7196, lng: 75.8577, label: 'Indore (Approximate City Centroid)' },
  bhopal: { lat: 23.2599, lng: 77.4126, label: 'Bhopal (Approximate City Centroid)' },
  nagpur: { lat: 21.1458, lng: 79.0882, label: 'Nagpur (Approximate City Centroid)' },
  patna: { lat: 25.5941, lng: 85.1376, label: 'Patna (Approximate City Centroid)' },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar (Approximate City Centroid)' },
  guwahati: { lat: 26.1445, lng: 91.7362, label: 'Guwahati (Approximate City Centroid)' }
};

/**
 * Resolves approximate city-level coordinates from customer's shipping address.
 * Falls back to national central logistics centroid if the city is unindexed.
 */
export const getApproximateCityCoordinates = (shippingAddress = {}) => {
  const city = (shippingAddress.city || '').toLowerCase().trim();
  const state = (shippingAddress.state || '').toLowerCase().trim();

  // 1. Direct city match
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.includes(key)) {
      return {
        ...coords,
        resolvedName: shippingAddress.city || key,
        isApproximate: true
      };
    }
  }

  // 2. State-level fallback
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (state.includes(key)) {
      return {
        ...coords,
        resolvedName: `${shippingAddress.city || ''}, ${shippingAddress.state || ''}`.trim(),
        isApproximate: true
      };
    }
  }

  // 3. Fallback: Central India Regional Hub (Nagpur)
  return {
    lat: 21.1458,
    lng: 79.0882,
    label: `${shippingAddress.city || 'Domestic Destination'} (Approximate Regional Centroid)`,
    resolvedName: shippingAddress.city || 'India Destination',
    isApproximate: true
  };
};

/**
 * Generates an aesthetic curved geodesic trajectory between origin and destination.
 */
export const generateRouteWaypoints = (origin, destination, numPoints = 25) => {
  const points = [];
  const lat1 = origin.lat;
  const lon1 = origin.lng;
  const lat2 = destination.lat;
  const lon2 = destination.lng;

  // Midpoint curvature offset
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;

  // Arc bend
  const curveFactor = 0.08;
  const ctrlLat = midLat + dLon * curveFactor;
  const ctrlLon = midLon - dLat * curveFactor;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bézier curve
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    const lon = (1 - t) * (1 - t) * lon1 + 2 * (1 - t) * t * ctrlLon + t * t * lon2;
    points.push([lat, lon]);
  }

  return points;
};

