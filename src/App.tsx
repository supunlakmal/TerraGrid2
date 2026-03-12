import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { polygonToCells, cellToBoundary, cellToParent, getResolution, getRes0Cells, cellToChildren } from 'h3-js';
import { LatLngExpression } from 'leaflet';
import { Trophy, Search } from 'lucide-react';

type PlayerId = 'player';

interface Player {
  id: PlayerId;
  color: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
  color: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AF', name: 'Afghanistan', color: '#e3000f' },
  { code: 'AL', name: 'Albania', color: '#e41e20' },
  { code: 'DZ', name: 'Algeria', color: '#006233' },
  { code: 'AD', name: 'Andorra', color: '#10069f' },
  { code: 'AO', name: 'Angola', color: '#cc092f' },
  { code: 'AG', name: 'Antigua and Barbuda', color: '#ce1126' },
  { code: 'AR', name: 'Argentina', color: '#74acdf' },
  { code: 'AM', name: 'Armenia', color: '#d90012' },
  { code: 'AU', name: 'Australia', color: '#00008b' },
  { code: 'AT', name: 'Austria', color: '#ed2939' },
  { code: 'AZ', name: 'Azerbaijan', color: '#00b5e2' },
  { code: 'BS', name: 'Bahamas', color: '#00778b' },
  { code: 'BH', name: 'Bahrain', color: '#ce1126' },
  { code: 'BD', name: 'Bangladesh', color: '#006a4e' },
  { code: 'BB', name: 'Barbados', color: '#00267f' },
  { code: 'BY', name: 'Belarus', color: '#c8313e' },
  { code: 'BE', name: 'Belgium', color: '#000000' },
  { code: 'BZ', name: 'Belize', color: '#171696' },
  { code: 'BJ', name: 'Benin', color: '#008751' },
  { code: 'BT', name: 'Bhutan', color: '#ffcc33' },
  { code: 'BO', name: 'Bolivia', color: '#007934' },
  { code: 'BA', name: 'Bosnia and Herzegovina', color: '#002395' },
  { code: 'BW', name: 'Botswana', color: '#00cbff' },
  { code: 'BR', name: 'Brazil', color: '#009c3b' },
  { code: 'BN', name: 'Brunei', color: '#f7e017' },
  { code: 'BG', name: 'Bulgaria', color: '#00966e' },
  { code: 'BF', name: 'Burkina Faso', color: '#ef2b2d' },
  { code: 'BI', name: 'Burundi', color: '#ce1126' },
  { code: 'CV', name: 'Cabo Verde', color: '#003893' },
  { code: 'KH', name: 'Cambodia', color: '#032ea1' },
  { code: 'CM', name: 'Cameroon', color: '#007a5e' },
  { code: 'CA', name: 'Canada', color: '#ff0000' },
  { code: 'CF', name: 'Central African Republic', color: '#003082' },
  { code: 'TD', name: 'Chad', color: '#002664' },
  { code: 'CL', name: 'Chile', color: '#0039a6' },
  { code: 'CN', name: 'China', color: '#ee1c25' },
  { code: 'CO', name: 'Colombia', color: '#fcd116' },
  { code: 'KM', name: 'Comoros', color: '#3d8e33' },
  { code: 'CG', name: 'Congo', color: '#009543' },
  { code: 'CR', name: 'Costa Rica', color: '#002b7f' },
  { code: 'HR', name: 'Croatia', color: '#ff0000' },
  { code: 'CU', name: 'Cuba', color: '#002a8f' },
  { code: 'CY', name: 'Cyprus', color: '#d57800' },
  { code: 'CZ', name: 'Czechia', color: '#11457e' },
  { code: 'DK', name: 'Denmark', color: '#c60c30' },
  { code: 'DJ', name: 'Djibouti', color: '#6ab2e7' },
  { code: 'DM', name: 'Dominica', color: '#006b3f' },
  { code: 'DO', name: 'Dominican Republic', color: '#002d62' },
  { code: 'EC', name: 'Ecuador', color: '#ffdd00' },
  { code: 'EG', name: 'Egypt', color: '#ce1126' },
  { code: 'SV', name: 'El Salvador', color: '#0047ab' },
  { code: 'GQ', name: 'Equatorial Guinea', color: '#3e9a00' },
  { code: 'ER', name: 'Eritrea', color: '#009a44' },
  { code: 'EE', name: 'Estonia', color: '#0072ce' },
  { code: 'SZ', name: 'Eswatini', color: '#3e5eb9' },
  { code: 'ET', name: 'Ethiopia', color: '#078930' },
  { code: 'FJ', name: 'Fiji', color: '#68bfe5' },
  { code: 'FI', name: 'Finland', color: '#002f6c' },
  { code: 'FR', name: 'France', color: '#0055a4' },
  { code: 'GA', name: 'Gabon', color: '#009e60' },
  { code: 'GM', name: 'Gambia', color: '#ce1126' },
  { code: 'GE', name: 'Georgia', color: '#ff0000' },
  { code: 'DE', name: 'Germany', color: '#000000' },
  { code: 'GH', name: 'Ghana', color: '#ce1126' },
  { code: 'GR', name: 'Greece', color: '#0d5eaf' },
  { code: 'GD', name: 'Grenada', color: '#ce1126' },
  { code: 'GT', name: 'Guatemala', color: '#4997d0' },
  { code: 'GN', name: 'Guinea', color: '#ce1126' },
  { code: 'GW', name: 'Guinea-Bissau', color: '#ce1126' },
  { code: 'GY', name: 'Guyana', color: '#009e60' },
  { code: 'HT', name: 'Haiti', color: '#00205b' },
  { code: 'HN', name: 'Honduras', color: '#00bce4' },
  { code: 'HU', name: 'Hungary', color: '#ce2939' },
  { code: 'IS', name: 'Iceland', color: '#003897' },
  { code: 'IN', name: 'India', color: '#ff9933' },
  { code: 'ID', name: 'Indonesia', color: '#ff0000' },
  { code: 'IR', name: 'Iran', color: '#239f40' },
  { code: 'IQ', name: 'Iraq', color: '#ce1126' },
  { code: 'IE', name: 'Ireland', color: '#169b62' },
  { code: 'IL', name: 'Israel', color: '#0038b8' },
  { code: 'IT', name: 'Italy', color: '#009246' },
  { code: 'JM', name: 'Jamaica', color: '#007749' },
  { code: 'JP', name: 'Japan', color: '#bc002d' },
  { code: 'JO', name: 'Jordan', color: '#ce1126' },
  { code: 'KZ', name: 'Kazakhstan', color: '#00afca' },
  { code: 'KE', name: 'Kenya', color: '#000000' },
  { code: 'KI', name: 'Kiribati', color: '#ce1126' },
  { code: 'KP', name: 'North Korea', color: '#ed1c27' },
  { code: 'KR', name: 'South Korea', color: '#0047a0' },
  { code: 'KW', name: 'Kuwait', color: '#007a3d' },
  { code: 'KG', name: 'Kyrgyzstan', color: '#e8112d' },
  { code: 'LA', name: 'Laos', color: '#ce1126' },
  { code: 'LV', name: 'Latvia', color: '#9e3039' },
  { code: 'LB', name: 'Lebanon', color: '#ed1c24' },
  { code: 'LS', name: 'Lesotho', color: '#00205b' },
  { code: 'LR', name: 'Liberia', color: '#bf0a30' },
  { code: 'LY', name: 'Libya', color: '#239e46' },
  { code: 'LI', name: 'Liechtenstein', color: '#002b7f' },
  { code: 'LT', name: 'Lithuania', color: '#fdb913' },
  { code: 'LU', name: 'Luxembourg', color: '#00a1de' },
  { code: 'MG', name: 'Madagascar', color: '#fc3d32' },
  { code: 'MW', name: 'Malawi', color: '#000000' },
  { code: 'MY', name: 'Malaysia', color: '#010066' },
  { code: 'MV', name: 'Maldives', color: '#d21034' },
  { code: 'ML', name: 'Mali', color: '#14b53a' },
  { code: 'MT', name: 'Malta', color: '#cf142b' },
  { code: 'MH', name: 'Marshall Islands', color: '#003893' },
  { code: 'MR', name: 'Mauritania', color: '#006233' },
  { code: 'MU', name: 'Mauritius', color: '#ea2839' },
  { code: 'MX', name: 'Mexico', color: '#006847' },
  { code: 'FM', name: 'Micronesia', color: '#75b2dd' },
  { code: 'MD', name: 'Moldova', color: '#003da5' },
  { code: 'MC', name: 'Monaco', color: '#ce1126' },
  { code: 'MN', name: 'Mongolia', color: '#e31c23' },
  { code: 'ME', name: 'Montenegro', color: '#c40308' },
  { code: 'MA', name: 'Morocco', color: '#c1272d' },
  { code: 'MZ', name: 'Mozambique', color: '#007168' },
  { code: 'MM', name: 'Myanmar', color: '#fecb00' },
  { code: 'NA', name: 'Namibia', color: '#003580' },
  { code: 'NR', name: 'Nauru', color: '#002b7f' },
  { code: 'NP', name: 'Nepal', color: '#dc143c' },
  { code: 'NL', name: 'Netherlands', color: '#ae1c28' },
  { code: 'NZ', name: 'New Zealand', color: '#00247d' },
  { code: 'NI', name: 'Nicaragua', color: '#0067c6' },
  { code: 'NE', name: 'Niger', color: '#e05206' },
  { code: 'NG', name: 'Nigeria', color: '#008751' },
  { code: 'MK', name: 'North Macedonia', color: '#ce2029' },
  { code: 'NO', name: 'Norway', color: '#ba0c2f' },
  { code: 'OM', name: 'Oman', color: '#db161b' },
  { code: 'PK', name: 'Pakistan', color: '#01411c' },
  { code: 'PW', name: 'Palau', color: '#4aadd6' },
  { code: 'PA', name: 'Panama', color: '#005293' },
  { code: 'PG', name: 'Papua New Guinea', color: '#ce1126' },
  { code: 'PY', name: 'Paraguay', color: '#d52b1e' },
  { code: 'PE', name: 'Peru', color: '#d91023' },
  { code: 'PH', name: 'Philippines', color: '#0038a8' },
  { code: 'PL', name: 'Poland', color: '#dc143c' },
  { code: 'PT', name: 'Portugal', color: '#006600' },
  { code: 'QA', name: 'Qatar', color: '#8d1b3d' },
  { code: 'RO', name: 'Romania', color: '#002b7f' },
  { code: 'RU', name: 'Russia', color: '#d52b1e' },
  { code: 'RW', name: 'Rwanda', color: '#00a1ce' },
  { code: 'KN', name: 'Saint Kitts and Nevis', color: '#00a000' },
  { code: 'LC', name: 'Saint Lucia', color: '#66ccff' },
  { code: 'VC', name: 'Saint Vincent', color: '#0072c6' },
  { code: 'WS', name: 'Samoa', color: '#ce1126' },
  { code: 'SM', name: 'San Marino', color: '#5eb6e4' },
  { code: 'ST', name: 'Sao Tome and Principe', color: '#12ad2b' },
  { code: 'SA', name: 'Saudi Arabia', color: '#006c35' },
  { code: 'SN', name: 'Senegal', color: '#00853f' },
  { code: 'RS', name: 'Serbia', color: '#c6363c' },
  { code: 'SC', name: 'Seychelles', color: '#003f87' },
  { code: 'SL', name: 'Sierra Leone', color: '#1eb53a' },
  { code: 'SG', name: 'Singapore', color: '#ed2939' },
  { code: 'SK', name: 'Slovakia', color: '#0b4ea2' },
  { code: 'SI', name: 'Slovenia', color: '#005ce6' },
  { code: 'SB', name: 'Solomon Islands', color: '#0051ba' },
  { code: 'SO', name: 'Somalia', color: '#418fde' },
  { code: 'ZA', name: 'South Africa', color: '#007749' },
  { code: 'SS', name: 'South Sudan', color: '#000000' },
  { code: 'ES', name: 'Spain', color: '#aa151b' },
  { code: 'LK', name: 'Sri Lanka', color: '#ffbe29' },
  { code: 'SD', name: 'Sudan', color: '#d21034' },
  { code: 'SR', name: 'Suriname', color: '#377e3f' },
  { code: 'SE', name: 'Sweden', color: '#006aa7' },
  { code: 'CH', name: 'Switzerland', color: '#ff0000' },
  { code: 'SY', name: 'Syria', color: '#ce1126' },
  { code: 'TW', name: 'Taiwan', color: '#fe0000' },
  { code: 'TJ', name: 'Tajikistan', color: '#cc0000' },
  { code: 'TZ', name: 'Tanzania', color: '#1eb53a' },
  { code: 'TH', name: 'Thailand', color: '#a51931' },
  { code: 'TL', name: 'Timor-Leste', color: '#dc241f' },
  { code: 'TG', name: 'Togo', color: '#006a4e' },
  { code: 'TO', name: 'Tonga', color: '#c10000' },
  { code: 'TT', name: 'Trinidad and Tobago', color: '#ce1126' },
  { code: 'TN', name: 'Tunisia', color: '#e70013' },
  { code: 'TR', name: 'Turkey', color: '#e30a17' },
  { code: 'TM', name: 'Turkmenistan', color: '#009900' },
  { code: 'TV', name: 'Tuvalu', color: '#5b9ce6' },
  { code: 'UG', name: 'Uganda', color: '#000000' },
  { code: 'UA', name: 'Ukraine', color: '#0057b7' },
  { code: 'AE', name: 'United Arab Emirates', color: '#00732f' },
  { code: 'GB', name: 'United Kingdom', color: '#012169' },
  { code: 'US', name: 'United States', color: '#b22234' },
  { code: 'UY', name: 'Uruguay', color: '#0038a8' },
  { code: 'UZ', name: 'Uzbekistan', color: '#0099b5' },
  { code: 'VU', name: 'Vanuatu', color: '#d21034' },
  { code: 'VA', name: 'Vatican City', color: '#ffe000' },
  { code: 'VE', name: 'Venezuela', color: '#00247d' },
  { code: 'VN', name: 'Vietnam', color: '#da251d' },
  { code: 'YE', name: 'Yemen', color: '#ce1126' },
  { code: 'ZM', name: 'Zambia', color: '#198a00' },
  { code: 'ZW', name: 'Zimbabwe', color: '#006400' }
];

// Dynamically adjust H3 resolution based on map zoom level
const getH3ResForZoom = (zoom: number): number => {
  if (zoom <= 2) return 0;
  if (zoom <= 4) return 1;
  if (zoom <= 6) return 2;
  if (zoom <= 8) return 3;
  if (zoom <= 9) return 4;
  return 7; // Always use resolution 7 for zoom 10+
};

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// --- MOCK DATABASE (Simulating Supabase) ---
type DbHex = { hex_id: string; owner_id: string; claimed_at: number; country_color: string; country_code?: string; country_name?: string };

const MOCK_DB = {
  hexes: {} as Record<string, DbHex>
};

try {
  const saved = localStorage.getItem('supabase_mock_hexes');
  if (saved) MOCK_DB.hexes = JSON.parse(saved);
} catch (e) {}

const saveDb = () => localStorage.setItem('supabase_mock_hexes', JSON.stringify(MOCK_DB.hexes));

// --- MOCK API ENDPOINTS ---
type ViewportHex = { cell: string; owner: string | null; color: string | null; countryCode: string | null; countryName: string | null; isAggregated: boolean; opacity: number };

const apiGetHexesInBounds = async (polygon: number[][], zoom: number): Promise<ViewportHex[]> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency

  const targetRes = getH3ResForZoom(zoom);
  let visibleCells: string[] = [];
  try {
    visibleCells = polygonToCells(polygon, targetRes, false);
  } catch (e) {
    const res0 = getRes0Cells();
    visibleCells = targetRes === 0 ? res0 : res0.flatMap(c => cellToChildren(c, targetRes));
  }

  visibleCells = visibleCells.slice(0, 3000); // Prevent browser crash
  const visibleSet = new Set(visibleCells);
  const results: ViewportHex[] = [];

  if (zoom >= 10) {
    for (const cell of visibleCells) {
      const claim = MOCK_DB.hexes[cell];
      results.push({
        cell,
        owner: claim ? claim.owner_id : null,
        color: claim ? claim.country_color : null,
        countryCode: claim ? (claim.country_code || null) : null,
        countryName: claim ? (claim.country_name || null) : null,
        isAggregated: false,
        opacity: claim ? 0.4 : 0.1
      });
    }
  } else {
    const aggregated: Record<string, { counts: Record<string, number>, colors: Record<string, string>, codes: Record<string, string>, names: Record<string, string>, totalClaimed: number }> = {};

    for (const [hexId, claim] of Object.entries(MOCK_DB.hexes)) {
      try {
        const claimRes = getResolution(hexId);
        if (claimRes >= targetRes) {
           const parent = cellToParent(hexId, targetRes);
           if (visibleSet.has(parent)) {
             if (!aggregated[parent]) aggregated[parent] = { counts: {}, colors: {}, codes: {}, names: {}, totalClaimed: 0 };
             aggregated[parent].counts[claim.owner_id] = (aggregated[parent].counts[claim.owner_id] || 0) + 1;
             aggregated[parent].colors[claim.owner_id] = claim.country_color;
             if (claim.country_code) aggregated[parent].codes[claim.owner_id] = claim.country_code;
             if (claim.country_name) aggregated[parent].names[claim.owner_id] = claim.country_name;
             aggregated[parent].totalClaimed++;
           }
        }
      } catch (e) {}
    }

    for (const cell of visibleCells) {
      const data = aggregated[cell];
      if (data) {
        const dominantOwner = Object.keys(data.counts).reduce((a, b) => data.counts[a] > data.counts[b] ? a : b);
        results.push({
          cell,
          owner: dominantOwner,
          color: data.colors[dominantOwner],
          countryCode: data.codes[dominantOwner] || null,
          countryName: data.names[dominantOwner] || null,
          isAggregated: true,
          opacity: Math.min(0.8, 0.2 + (data.totalClaimed * 0.02))
        });
      } else {
        results.push({
          cell,
          owner: null,
          color: null,
          countryCode: null,
          countryName: null,
          isAggregated: true,
          opacity: 0.05
        });
      }
    }
  }
  return results;
};

const apiClaimHex = async (hexId: string, userId: string, color: string, code: string, name: string): Promise<DbHex> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  if (MOCK_DB.hexes[hexId]) {
    throw new Error("Hex already claimed");
  }
  const newClaim = { hex_id: hexId, owner_id: userId, claimed_at: Date.now(), country_color: color, country_code: code, country_name: name };
  MOCK_DB.hexes[hexId] = newClaim;
  saveDb();
  return newClaim;
};

const apiGetStats = () => {
  const stats: Record<string, number> = {};
  for (const claim of Object.values(MOCK_DB.hexes)) {
    stats[claim.owner_id] = (stats[claim.owner_id] || 0) + 1;
  }
  return stats;
};

function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: any, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds(), map.getZoom()),
    zoomend: () => onBoundsChange(map.getBounds(), map.getZoom()),
  });

  useEffect(() => {
    onBoundsChange(map.getBounds(), map.getZoom());
  }, [map, onBoundsChange]);

  return null;
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    try {
      const saved = localStorage.getItem('terraGridCountry');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewportData, setViewportData] = useState<ViewportHex[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setStats(apiGetStats());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      try {
        localStorage.setItem('terraGridCountry', JSON.stringify(selectedCountry));
      } catch (e) {
        console.error("Failed to save country to local storage", e);
      }
    }
  }, [selectedCountry]);

  const players: Record<PlayerId, Player> = {
    player: {
      id: 'player',
      color: selectedCountry ? selectedCountry.color : '#3b82f6',
      name: selectedCountry ? `You (${selectedCountry.name})` : 'You',
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setMapReady(true);
        },
        () => setMapReady(true)
      );
    } else {
      setMapReady(true);
    }
  }, []);

  const handleBoundsChange = useCallback(async (bounds: any, zoom: number) => {
    setZoomLevel(zoom);
    setIsSyncing(true);

    const nw = bounds.getNorthWest();
    const ne = bounds.getNorthEast();
    const se = bounds.getSouthEast();
    const sw = bounds.getSouthWest();

    // Normalize longitudes to prevent h3-js errors when panning across the world
    const normalizeLng = (lng: number) => {
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;
      return lng;
    };

    const nwl = normalizeLng(nw.lng);
    const nel = normalizeLng(ne.lng);
    const sel = normalizeLng(se.lng);
    const swl = normalizeLng(sw.lng);

    // Add a small buffer to the polygon to ensure edges are covered
    const latBuffer = Math.abs(nw.lat - se.lat) * 0.1;
    let lngDiff = sel - nwl;
    if (lngDiff < 0) lngDiff += 360; // Handle antimeridian crossing
    const lngBuffer = lngDiff * 0.1;

    const polygon = [
      [nw.lat + latBuffer, normalizeLng(nwl - lngBuffer)],
      [ne.lat + latBuffer, normalizeLng(nel + lngBuffer)],
      [se.lat - latBuffer, normalizeLng(sel + lngBuffer)],
      [sw.lat - latBuffer, normalizeLng(swl - lngBuffer)],
      [nw.lat + latBuffer, normalizeLng(nwl - lngBuffer)], // close polygon
    ];

    try {
      const data = await apiGetHexesInBounds(polygon, zoom);
      setViewportData(data);
    } catch (e) {
      console.error("Error fetching hexes:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleHexClick = async (hexId: string, isAggregated: boolean, currentOwner: string | null) => {
    if (zoomLevel < 10 || !selectedCountry || isAggregated || currentOwner) return;
    
    // Optimistic UI Update
    setViewportData(prev => prev.map(h => 
      h.cell === hexId ? { ...h, owner: 'player', color: selectedCountry.color, countryCode: selectedCountry.code, countryName: selectedCountry.name, opacity: 0.2 } : h
    ));

    try {
      await apiClaimHex(hexId, 'player', selectedCountry.color, selectedCountry.code, selectedCountry.name);
      setStats(apiGetStats());
    } catch (e) {
      console.error(e);
      // Revert optimistic update
      setViewportData(prev => prev.map(h => 
        h.cell === hexId ? { ...h, owner: null, color: null, countryCode: null, countryName: null, opacity: 0.1 } : h
      ));
    }
  };

  if (!mapReady) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading Map...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-sans">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={center} zoom={12} maxZoom={12} className="w-full h-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={12}
          />
          <MapEvents onBoundsChange={handleBoundsChange} />
          
          {(() => {
            return viewportData.map(hex => {
              const boundary = cellToBoundary(hex.cell);
              const positions: LatLngExpression[] = boundary.map(p => [p[0], p[1]]);
              
              let fillColor = '#334155'; // slate-700
              let color = '#475569'; // slate-600

              if (hex.owner && hex.color) {
                fillColor = hex.color;
                color = hex.isAggregated ? 'transparent' : hex.color;
              }

              return (
                <Polygon
                  key={hex.cell}
                  positions={positions}
                  pathOptions={{
                    color,
                    weight: hex.isAggregated ? 1 : (zoomLevel >= 10 ? 2 : 0),
                    fillColor,
                    fillOpacity: hex.opacity,
                  }}
                  eventHandlers={{
                    click: () => handleHexClick(hex.cell, hex.isAggregated, hex.owner),
                  }}
                >
                  {hex.countryCode && (
                    <Tooltip direction="center" permanent className="custom-tooltip">
                      <div className="flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
                        <span className="text-xl leading-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {getFlagEmoji(hex.countryCode)}
                        </span>
                        {zoomLevel >= 11 && hex.countryName && (
                          <span className="text-[8px] font-bold text-white uppercase tracking-wider mt-0.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,0.9)' }}>
                            {hex.countryName}
                          </span>
                        )}
                      </div>
                    </Tooltip>
                  )}
                </Polygon>
              );
            });
          })()}
        </MapContainer>
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl pointer-events-auto flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Conquer & Fight Back</h1>
            <p className="text-sm text-slate-400">
              {zoomLevel >= 10 ? "Click any hex to claim it!" : "Zoom in to level 10 to claim hexes"}
            </p>
            <p className="text-xs text-slate-500">
              {zoomLevel >= 10 ? `Visible Hexes: ${viewportData.length} | ` : ''}Zoom: {zoomLevel}
              {isSyncing && <span className="ml-2 text-emerald-400">Syncing...</span>}
            </p>
          </div>

          {/* Stats */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl pointer-events-auto min-w-[200px]">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Your Stats
            </h2>
            <div className="flex flex-col gap-2">
              {Object.values(players).map(p => {
                const count = stats[p.id] || 0;
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {selectedCountry ? (
                        <span className="text-lg leading-none">{getFlagEmoji(selectedCountry.code)}</span>
                      ) : (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      )}
                      <span className="text-slate-200">{p.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
            {selectedCountry && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-colors"
              >
                Change Country
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Country Selection Modal */}
      {(!selectedCountry || isModalOpen) && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="text-center mb-6 relative">
              {selectedCountry && (
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Select Your Country</h2>
              <p className="text-slate-400">Choose the country you represent. Your claimed hexes will display its flag.</p>
            </div>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto p-2">
              {COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(country => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsModalOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-700 hover:border-slate-500 transition-all text-left group"
                >
                  <span className="text-2xl leading-none drop-shadow-md group-hover:scale-110 transition-transform shrink-0">
                    {getFlagEmoji(country.code)}
                  </span>
                  <span className="text-slate-200 font-medium text-sm truncate">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
