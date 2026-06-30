import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Navigation, Info, User, Phone, 
  Award, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Activity
} from 'lucide-react';
import Header from '../components/Header';
import { getComplaints, Complaint, getCurrentAdmin } from '../lib/storage';

export interface WardData {
  number: number;
  name: string;
  zone: 'West Zone' | 'East Zone' | 'Central Zone' | 'North Zone' | 'South Zone';
  engineer: string;
  phone: string;
  swachhScore: number;
  activeIssues: number;
  criticalIssues: number;
  potholes: number;
  garbage: number;
  water: number;
  lights: number;
  colorClass: string; // Tailwind bg-color representing heat level
  fillColor: string;  // SVG fill color representation
  strokeColor: string;// SVG stroke color
  coordinates: string;// SVG polygon points for interactive map
}

export const INDIA_WARDS_DATA: WardData[] = [
  {
    number: 8,
    name: 'Connaught Place / Parliament St',
    zone: 'North Zone',
    engineer: 'Shri Nilesh Patel',
    phone: '+91 99999 00008',
    swachhScore: 88,
    activeIssues: 12,
    criticalIssues: 3,
    potholes: 5,
    garbage: 2,
    water: 3,
    lights: 2,
    colorClass: 'bg-amber-100 text-amber-900 border-amber-200',
    fillColor: '#FEF3C7', // amber-100
    strokeColor: '#D97706', // amber-600
    coordinates: '100,50 250,50 220,180 80,150'
  },
  {
    number: 12,
    name: 'Bandra West / Carter Road',
    zone: 'West Zone',
    engineer: 'Shri Rajesh Solanki',
    phone: '+91 99999 00012',
    swachhScore: 68,
    activeIssues: 31,
    criticalIssues: 14,
    potholes: 12,
    garbage: 8,
    water: 7,
    lights: 4,
    colorClass: 'bg-red-100 text-red-900 border-red-200',
    fillColor: '#FEE2E2', // red-100
    strokeColor: '#DC2626', // red-600
    coordinates: '80,150 220,180 180,310 50,280'
  },
  {
    number: 5,
    name: 'Indiranagar / Double Road',
    zone: 'South Zone',
    engineer: 'Shri Hitesh Chudasama',
    phone: '+91 99999 00005',
    swachhScore: 96,
    activeIssues: 4,
    criticalIssues: 0,
    potholes: 1,
    garbage: 1,
    water: 2,
    lights: 0,
    colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    fillColor: '#D1FAE5', // emerald-100
    strokeColor: '#059669', // emerald-600
    coordinates: '250,50 380,80 340,210 220,180'
  },
  {
    number: 15,
    name: 'Nungambakkam / Greams Road',
    zone: 'East Zone',
    engineer: 'Shri Ketan Trivedi',
    phone: '+91 99999 00015',
    swachhScore: 54,
    activeIssues: 42,
    criticalIssues: 19,
    potholes: 16,
    garbage: 14,
    water: 8,
    lights: 4,
    colorClass: 'bg-red-100 text-red-900 border-red-200',
    fillColor: '#FEE2E2', // red-100
    strokeColor: '#DC2626', // red-600
    coordinates: '180,310 340,210 400,340 120,380'
  },
  {
    number: 3,
    name: 'Salt Lake / Sector V',
    zone: 'Central Zone',
    engineer: 'Shri Paresh Shah',
    phone: '+91 99999 00003',
    swachhScore: 82,
    activeIssues: 18,
    criticalIssues: 5,
    potholes: 6,
    garbage: 4,
    water: 5,
    lights: 3,
    colorClass: 'bg-amber-100 text-amber-900 border-amber-200',
    fillColor: '#FEF3C7', // amber-100
    strokeColor: '#D97706', // amber-600
    coordinates: '380,80 480,120 450,260 340,210'
  },
  {
    number: 2,
    name: 'Navrangpura / Ashram Road, Ahmedabad (Gujarat)',
    zone: 'West Zone',
    engineer: 'Shri Paresh Shah',
    phone: '+91 99999 00002',
    swachhScore: 91,
    activeIssues: 10,
    criticalIssues: 2,
    potholes: 3,
    garbage: 2,
    water: 3,
    lights: 2,
    colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    fillColor: '#D1FAE5', // emerald-100
    strokeColor: '#059669', // emerald-600
    coordinates: '450,260 550,230 520,350 400,340'
  },
  {
    number: 6,
    name: 'Adajan / Pal, Surat (Gujarat)',
    zone: 'West Zone',
    engineer: 'Shri Vijay Rupani',
    phone: '+91 99999 00006',
    swachhScore: 85,
    activeIssues: 15,
    criticalIssues: 4,
    potholes: 5,
    garbage: 4,
    water: 4,
    lights: 2,
    colorClass: 'bg-blue-100 text-blue-900 border-blue-200',
    fillColor: '#DBEAFE', // blue-100
    strokeColor: '#2563EB', // blue-600
    coordinates: '120,380 250,390 220,480 60,450'
  },
  {
    number: 9,
    name: 'Amin Marg / Kalavad Rd, Rajkot (Gujarat)',
    zone: 'West Zone',
    engineer: 'Shri Mansukh Mandaviya',
    phone: '+91 99999 00009',
    swachhScore: 79,
    activeIssues: 19,
    criticalIssues: 6,
    potholes: 7,
    garbage: 5,
    water: 4,
    lights: 3,
    colorClass: 'bg-amber-100 text-amber-900 border-amber-200',
    fillColor: '#FEF3C7', // amber-100
    strokeColor: '#D97706', // amber-600
    coordinates: '250,390 400,340 370,450 220,480'
  },
  {
    number: 11,
    name: 'Alkapuri / Race Course, Vadodara (Gujarat)',
    zone: 'West Zone',
    engineer: 'Shri Harsh Sanghavi',
    phone: '+91 99999 00011',
    swachhScore: 84,
    activeIssues: 14,
    criticalIssues: 3,
    potholes: 4,
    garbage: 3,
    water: 4,
    lights: 3,
    colorClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    fillColor: '#E0E7FF', // indigo-100
    strokeColor: '#4F46E5', // indigo-600
    coordinates: '400,340 520,350 480,460 370,450'
  },
  {
    number: 1,
    name: 'Sector 21 / Vidhan Sabha, Gandhinagar (Gujarat)',
    zone: 'West Zone',
    engineer: 'Shri Bhupendra Patel',
    phone: '+91 99999 00001',
    swachhScore: 94,
    activeIssues: 5,
    criticalIssues: 1,
    potholes: 1,
    garbage: 1,
    water: 2,
    lights: 1,
    colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    fillColor: '#D1FAE5', // emerald-100
    strokeColor: '#059669', // emerald-600
    coordinates: '480,120 580,140 550,230 450,260'
  }
];

export default function WardMap() {
  const [selectedWardNum, setSelectedWardNum] = useState<number>(12); // Default to Ward 12
  const [filterZone, setFilterZone] = useState<string>('All');
  const [localComplaints, setLocalComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Checked in useEffect

  // Load actual local storage complaints to plot them as overlays!
  useEffect(() => {
    const adminSession = getCurrentAdmin();
    setIsAdmin(!!adminSession);
    const list = getComplaints();
    setLocalComplaints(list);
  }, []);

  if (!isAdmin) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6 bg-slate-100">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Administrative GIS Restricted</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This dynamic GIS Heatmap and ward telemetry console is restricted to verified municipal officers, ward engineers, and sanitization inspectors. 
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-[11px] text-slate-600 space-y-2">
              <p className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-red-600">Officer Authorization Required</p>
              <p>Standard citizen accounts do not possess credentials to access live municipal telemetry. Please sign in via the Officer Portal to view active GIS hotspots.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link 
                to="/admin" 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors"
              >
                Log In as Municipal Officer
              </Link>
              <Link 
                to="/" 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeWard = INDIA_WARDS_DATA.find(w => w.number === selectedWardNum) || INDIA_WARDS_DATA[1];

  // Filter wards by zone
  const filteredWards = INDIA_WARDS_DATA.filter(w => {
    const zoneMatch = filterZone === 'All' || w.zone === filterZone;
    const searchMatch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        `ward ${w.number}`.includes(searchQuery.toLowerCase());
    return zoneMatch && searchMatch;
  });

  // Calculate dynamic live pins count for the selected ward based on actual local storage data
  const wardNormalizedName = `Ward ${activeWard.number}`;
  const actualWardComplaints = localComplaints.filter(c => 
    c.ward && c.ward.toLowerCase().includes(wardNormalizedName.toLowerCase())
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      
      {/* Educational Banner explaining the Ward Heatmap */}
      <div className="bg-slate-900 text-slate-100 py-6 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-600 text-[10px] font-bold uppercase tracking-widest text-white">
              <Activity className="w-3 h-3 animate-pulse" />
              Live GIS Triage System
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              National Swachh (JanSewa) GIS Ward Heatmap
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>What is a Ward Heatmap?</strong> It is an administrative GIS mapping system used under 
              the Swachh Bharat Mission. By monitoring active grievance density, municipal dispatchers identify 
              <strong> "Hotspots" (High Density zones)</strong>. Wards with a low Swachh Index Score 
              automatically receive heightened resource allocations, daily cleaning crew deployments, and emergency audits.
            </p>
          </div>
          <Link 
            to="/standards" 
            className="self-start md:self-center bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 shadow shrink-0"
          >
            Review Civic Standards <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-180px)]">
        
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Filter Municipal Wards</h2>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search ward name, road..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>

            {/* Zone filters */}
            <div className="flex gap-1">
              {['All', 'West Zone', 'Central Zone', 'East Zone'].map((zone) => (
                <button
                  key={zone}
                  onClick={() => setFilterZone(zone)}
                  className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    filterZone === zone 
                      ? 'bg-blue-900 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {zone.replace(' Zone', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Ward list */}
          <div className="flex-1 p-4 space-y-3.5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Select Ward to Inspect</p>
            <div className="space-y-2">
              {filteredWards.map((w) => {
                const isSelected = w.number === selectedWardNum;
                return (
                  <button
                    key={w.number}
                    onClick={() => setSelectedWardNum(w.number)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-250 shadow-sm ring-1 ring-blue-900/10' 
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-900 text-white font-mono font-black text-xs h-5 w-5 rounded-md flex items-center justify-center">
                          {w.number}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs truncate max-w-[170px]">{w.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{w.zone} • Engineer: {w.engineer}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        w.swachhScore >= 90 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        w.swachhScore >= 75 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {w.swachhScore}% Swachh
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1 font-semibold">{w.activeIssues} Active Tickets</p>
                    </div>
                  </button>
                );
              })}
              {filteredWards.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No wards match your query.
                </div>
              )}
            </div>
          </div>

          {/* Quick info footer inside sidebar */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-blue-900 shrink-0" />
              <span>Red wards indicate high pothole and drainage counts needing urgent public support.</span>
            </div>
          </div>
        </aside>

        {/* Map and details on the right */}
        <main className="flex-1 bg-slate-100 flex flex-col">
          
          {/* Main Simulated Map Canvas */}
          <div className="flex-1 min-h-[350px] relative bg-slate-200 overflow-hidden flex items-center justify-center border-b border-slate-200">
            <div className="absolute inset-0 bg-slate-300 opacity-30 pointer-events-none" style={{backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: '16px 16px'}}></div>

            {/* Simulated Vector Ward Map */}
            <div className="relative w-full max-w-xl aspect-square sm:aspect-video p-4 z-10">
              <svg 
                viewBox="0 0 550 420" 
                className="w-full h-full drop-shadow-md select-none transition-all"
              >
                <g id="rmc-wards" className="cursor-pointer">
                  {INDIA_WARDS_DATA.map((w) => {
                    const isSelected = w.number === selectedWardNum;
                    return (
                      <polygon
                        key={w.number}
                        points={w.coordinates}
                        fill={w.fillColor}
                        stroke={w.strokeColor}
                        strokeWidth={isSelected ? '3.5' : '1.5'}
                        onClick={() => setSelectedWardNum(w.number)}
                        className="transition-all duration-300 hover:brightness-95 hover:opacity-90"
                      />
                    );
                  })}
                </g>

                {/* SVG Text Labels placed strategically in center coordinates */}
                <text x="130" y="100" fill="#78350F" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 8</text>
                <text x="120" y="220" fill="#7F1D1D" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 12 (Critical)</text>
                <text x="290" y="120" fill="#065F46" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono font-bold">Ward 5 (Swachh)</text>
                <text x="250" y="300" fill="#7F1D1D" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 15</text>
                <text x="400" y="180" fill="#78350F" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 3</text>
              </svg>

              {/* Dynamic Interactive Marker corresponding to the selected Ward */}
              {activeWard.number === 12 && (
                <div className="absolute top-[50%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-10 w-10 rounded-full bg-red-600/30 animate-ping"></div>
                    <div className="h-6 w-6 rounded-full bg-red-600 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black">12</div>
                  </div>
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">Kalavad Rd Hotspot</span>
                </div>
              )}

              {activeWard.number === 8 && (
                <div className="absolute top-[28%] left-[26%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-10 w-10 rounded-full bg-amber-500/30 animate-ping"></div>
                    <div className="h-6 w-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black">8</div>
                  </div>
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">Amin Marg Station</span>
                </div>
              )}

              {activeWard.number === 5 && (
                <div className="absolute top-[35%] left-[54%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black">5</div>
                  </div>
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">Raiya Clean Zone</span>
                </div>
              )}

              {activeWard.number === 15 && (
                <div className="absolute top-[68%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-10 w-10 rounded-full bg-red-600/30 animate-ping"></div>
                    <div className="h-6 w-6 rounded-full bg-red-600 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black">15</div>
                  </div>
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">Gondal Rd Pileup</span>
                </div>
              )}

              {activeWard.number === 3 && (
                <div className="absolute top-[45%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black">3</div>
                  </div>
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">Junction Plot Station</span>
                </div>
              )}
            </div>

            {/* Floating Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3.5 shadow-md text-[10px] font-bold text-slate-700 space-y-1.5 z-20">
              <p className="uppercase text-[9px] text-slate-400 mb-1 tracking-wider">Heat Legend</p>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3 bg-red-100 border border-red-400 rounded"></span>
                <span>Critical Zone (&gt; 25 Grievances)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3 bg-amber-100 border border-amber-400 rounded"></span>
                <span>Moderate Zone (10-25 Grievances)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3 bg-emerald-100 border border-emerald-400 rounded"></span>
                <span>Swachh Green Zone (&lt; 10 Grievances)</span>
              </div>
            </div>
          </div>

          {/* Ward Summary Panel below Map */}
          <div className="p-6 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-blue-900 text-white font-mono font-black text-sm px-2 py-0.5 rounded">
                    Ward {activeWard.number}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">{activeWard.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active subdivision boundaries administered under regional municipal zone guidelines.
                </p>
              </div>

              {/* Swachh Bharat Score */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
                <Award className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Swachh score</div>
                  <div className="text-sm font-black text-slate-900">{activeWard.swachhScore}% Efficiency</div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potholes IRC-82</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{activeWard.potholes} active</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Garbage SBM-2.0</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{activeWard.garbage} hotspots</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Water Potable IS-10500</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{activeWard.water} points</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lights IS-1944</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{activeWard.lights} outages</span>
              </div>
            </div>

            {/* Ward Officer detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="h-10 w-10 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-extrabold">Subdivisional Ward Engineer</p>
                  <p className="text-sm font-bold text-slate-900">{activeWard.engineer}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-900 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-extrabold">Citizen Helpline (Mobile)</p>
                  <p className="text-sm font-bold text-slate-900">{activeWard.phone}</p>
                </div>
              </div>
            </div>

            {/* Actual Live Storage complaints plotted for the ward */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Live Registered Complaints under Ward {activeWard.number} ({actualWardComplaints.length})
              </h4>
              
              {actualWardComplaints.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {actualWardComplaints.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                      <div className="min-w-0">
                        <span className="font-mono text-[9px] text-slate-400 block">{item.id}</span>
                        <p className="font-extrabold text-slate-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.landmark}</p>
                      </div>
                      <Link 
                        to={`/track?id=${item.id}`} 
                        className="bg-white border border-slate-200 text-blue-900 px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0"
                      >
                        Track Status
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                  No active custom citizen complaints submitted for Ward {activeWard.number} in local storage yet.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
