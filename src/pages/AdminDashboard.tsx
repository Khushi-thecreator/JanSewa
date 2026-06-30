import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  LayoutDashboard, 
  Building, 
  Map, 
  CheckSquare, 
  Settings, 
  Users, 
  LogOut, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Award, 
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Zap,
  Tag
} from 'lucide-react';
import ReassignModal from '../components/ReassignModal';
import { 
  getComplaints, 
  updateComplaintStatus, 
  getCurrentAdmin, 
  setCurrentAdmin, 
  logoutAdmin, 
  signinAdmin, 
  signupAdmin, 
  Admin,
  Complaint 
} from '../lib/storage';
import { STATES_AND_UTS } from '../lib/statesData';
import { INDIA_WARDS_DATA, WardData } from './WardMap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Comprehensive baseline complaint counts by category across 28 States and 8 Union Territories
const BASE_STATE_ANALYTICS: Record<string, Record<string, number>> = {
  'Andhra Pradesh': { 'Sanitation': 24, 'Roads': 18, 'Water Supply': 32, 'Streetlights': 15, 'Drainage and Sewerage': 20 },
  'Arunachal Pradesh': { 'Sanitation': 5, 'Roads': 12, 'Water Supply': 8, 'Streetlights': 4, 'Drainage and Sewerage': 3 },
  'Assam': { 'Sanitation': 14, 'Roads': 22, 'Water Supply': 19, 'Streetlights': 8, 'Drainage and Sewerage': 16 },
  'Bihar': { 'Sanitation': 42, 'Roads': 35, 'Water Supply': 28, 'Streetlights': 19, 'Drainage and Sewerage': 31 },
  'Chhattisgarh': { 'Sanitation': 12, 'Roads': 18, 'Water Supply': 15, 'Streetlights': 11, 'Drainage and Sewerage': 14 },
  'Goa': { 'Sanitation': 8, 'Roads': 6, 'Water Supply': 5, 'Streetlights': 7, 'Drainage and Sewerage': 4 },
  'Gujarat': { 'Sanitation': 35, 'Roads': 28, 'Water Supply': 22, 'Streetlights': 17, 'Drainage and Sewerage': 19 },
  'Haryana': { 'Sanitation': 22, 'Roads': 26, 'Water Supply': 18, 'Streetlights': 14, 'Drainage and Sewerage': 21 },
  'Himachal Pradesh': { 'Sanitation': 9, 'Roads': 15, 'Water Supply': 12, 'Streetlights': 8, 'Drainage and Sewerage': 7 },
  'Jharkhand': { 'Sanitation': 18, 'Roads': 20, 'Water Supply': 14, 'Streetlights': 11, 'Drainage and Sewerage': 15 },
  'Karnataka': { 'Sanitation': 38, 'Roads': 31, 'Water Supply': 29, 'Streetlights': 24, 'Drainage and Sewerage': 26 },
  'Kerala': { 'Sanitation': 19, 'Roads': 14, 'Water Supply': 16, 'Streetlights': 12, 'Drainage and Sewerage': 15 },
  'Madhya Pradesh': { 'Sanitation': 29, 'Roads': 24, 'Water Supply': 27, 'Streetlights': 18, 'Drainage and Sewerage': 21 },
  'Maharashtra': { 'Sanitation': 54, 'Roads': 42, 'Water Supply': 35, 'Streetlights': 28, 'Drainage and Sewerage': 39 },
  'Manipur': { 'Sanitation': 6, 'Roads': 9, 'Water Supply': 7, 'Streetlights': 5, 'Drainage and Sewerage': 4 },
  'Meghalaya': { 'Sanitation': 4, 'Roads': 8, 'Water Supply': 6, 'Streetlights': 3, 'Drainage and Sewerage': 5 },
  'Mizoram': { 'Sanitation': 3, 'Roads': 7, 'Water Supply': 5, 'Streetlights': 2, 'Drainage and Sewerage': 3 },
  'Nagaland': { 'Sanitation': 5, 'Roads': 8, 'Water Supply': 6, 'Streetlights': 4, 'Drainage and Sewerage': 4 },
  'Odisha': { 'Sanitation': 21, 'Roads': 19, 'Water Supply': 24, 'Streetlights': 13, 'Drainage and Sewerage': 17 },
  'Punjab': { 'Sanitation': 20, 'Roads': 24, 'Water Supply': 16, 'Streetlights': 12, 'Drainage and Sewerage': 18 },
  'Rajasthan': { 'Sanitation': 31, 'Roads': 34, 'Water Supply': 38, 'Streetlights': 19, 'Drainage and Sewerage': 22 },
  'Sikkim': { 'Sanitation': 3, 'Roads': 5, 'Water Supply': 4, 'Streetlights': 3, 'Drainage and Sewerage': 2 },
  'Tamil Nadu': { 'Sanitation': 44, 'Roads': 38, 'Water Supply': 32, 'Streetlights': 22, 'Drainage and Sewerage': 35 },
  'Telangana': { 'Sanitation': 32, 'Roads': 27, 'Water Supply': 25, 'Streetlights': 19, 'Drainage and Sewerage': 21 },
  'Tripura': { 'Sanitation': 5, 'Roads': 7, 'Water Supply': 6, 'Streetlights': 4, 'Drainage and Sewerage': 3 },
  'Uttar Pradesh': { 'Sanitation': 58, 'Roads': 49, 'Water Supply': 45, 'Streetlights': 31, 'Drainage and Sewerage': 42 },
  'Uttarakhand': { 'Sanitation': 11, 'Roads': 16, 'Water Supply': 13, 'Streetlights': 9, 'Drainage and Sewerage': 10 },
  'West Bengal': { 'Sanitation': 41, 'Roads': 32, 'Water Supply': 30, 'Streetlights': 25, 'Drainage and Sewerage': 33 },
  'Andaman and Nicobar Islands': { 'Sanitation': 3, 'Roads': 4, 'Water Supply': 5, 'Streetlights': 2, 'Drainage and Sewerage': 2 },
  'Chandigarh': { 'Sanitation': 8, 'Roads': 6, 'Water Supply': 7, 'Streetlights': 9, 'Drainage and Sewerage': 5 },
  'Dadra and Nagar Haveli and Daman and Diu': { 'Sanitation': 4, 'Roads': 5, 'Water Supply': 4, 'Streetlights': 3, 'Drainage and Sewerage': 3 },
  'Delhi': { 'Sanitation': 48, 'Roads': 41, 'Water Supply': 36, 'Streetlights': 29, 'Drainage and Sewerage': 34 },
  'Jammu and Kashmir': { 'Sanitation': 12, 'Roads': 15, 'Water Supply': 14, 'Streetlights': 8, 'Drainage and Sewerage': 11 },
  'Ladakh': { 'Sanitation': 2, 'Roads': 4, 'Water Supply': 5, 'Streetlights': 2, 'Drainage and Sewerage': 1 },
  'Lakshadweep': { 'Sanitation': 1, 'Roads': 2, 'Water Supply': 3, 'Streetlights': 1, 'Drainage and Sewerage': 1 },
  'Puducherry': { 'Sanitation': 6, 'Roads': 5, 'Water Supply': 7, 'Streetlights': 4, 'Drainage and Sewerage': 5 }
};

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(() => getCurrentAdmin());
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  
  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupBadgeId, setSignupBadgeId] = useState('');
  const [signupZone, setSignupZone] = useState('Central Zone');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Auth state messages
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Dashboard states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Reassign modal state
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Administrative Navigation & Visualizer states
  const [activeTab, setActiveTab] = useState<'triage' | 'analytics' | 'heatmap'>('triage');
  const [selectedChartState, setSelectedChartState] = useState<string>('Delhi');
  const [chartFilterType, setChartFilterType] = useState<'All' | 'State' | 'Union Territory'>('All');
  const [maxStatesToShow, setMaxStatesToShow] = useState<number>(10);

  // GIS Ward Heatmap states (integrated directly into the admin desk)
  const [selectedWardNum, setSelectedWardNum] = useState<number>(12);
  const [filterWardZone, setFilterWardZone] = useState<string>('All');
  const [wardSearchQuery, setWardSearchQuery] = useState('');

  // Helper to determine the Indian State/UT from a complaint ward string
  const findStateByWard = (wardName: string): string => {
    if (!wardName) return 'Delhi';
    const found = STATES_AND_UTS.find(s => 
      s.wards.some(w => w.toLowerCase().includes(wardName.toLowerCase())) ||
      wardName.toLowerCase().includes(s.name.toLowerCase()) ||
      (s.capital && wardName.toLowerCase().includes(s.capital.toLowerCase()))
    );
    return found ? found.name : 'Delhi';
  };

  // Helper to aggregate baseline municipal analytics with real-time user-submitted complaints
  const getAggregatedChartData = () => {
    // Deep copy baseline stats
    const stateCounts: Record<string, Record<string, number>> = JSON.parse(JSON.stringify(BASE_STATE_ANALYTICS));
    
    // Increment stats with live local complaints
    complaints.forEach(c => {
      const stateName = findStateByWard(c.ward);
      const category = c.category || 'Sanitation';
      if (!stateCounts[stateName]) {
        stateCounts[stateName] = {
          'Sanitation': 0,
          'Roads': 0,
          'Water Supply': 0,
          'Streetlights': 0,
          'Drainage and Sewerage': 0
        };
      }
      stateCounts[stateName][category] = (stateCounts[stateName][category] || 0) + 1;
    });

    // Structure data for Recharts stacked bar charts
    const formatted = Object.keys(stateCounts).map(stateName => {
      const categories = stateCounts[stateName];
      const stateMeta = STATES_AND_UTS.find(st => st.name === stateName);
      const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
      return {
        state: stateName,
        type: stateMeta ? stateMeta.type : 'State',
        'Sanitation': categories['Sanitation'] || 0,
        'Roads': categories['Roads'] || 0,
        'Water Supply': categories['Water Supply'] || 0,
        'Streetlights': categories['Streetlights'] || 0,
        'Drainage and Sewerage': categories['Drainage and Sewerage'] || 0,
        total
      };
    });

    // Apply geographic administrative filters (All vs. States vs. Union Territories)
    const filtered = formatted.filter(item => {
      if (chartFilterType === 'All') return true;
      return item.type === chartFilterType;
    });

    // Sort by complaint density descending
    filtered.sort((a, b) => b.total - a.total);

    // Slice to the user's limit for optimal chart layout readability
    return filtered.slice(0, maxStatesToShow);
  };

  // Load complaints and admin session on mount
  useEffect(() => {
    setComplaints(getComplaints());
  }, [admin]);

  // Handle logging out
  const handleSignOut = () => {
    logoutAdmin();
    setAdmin(null);
    setAuthSuccess('');
    setAuthError('');
  };

  // Pre-fill demo credentials
  const handlePreFillDemo = () => {
    setLoginEmail('admin@jansewa.gov.in');
    setLoginPassword('password123');
    setAuthTab('signin');
    setAuthError('');
  };

  // Handle Admin Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!loginEmail || !loginPassword) {
      setAuthError('Please fill out all login credentials.');
      return;
    }

    const res = signinAdmin(loginEmail, loginPassword);
    if (res.success && res.admin) {
      setAdmin(res.admin);
      setAuthSuccess(`Welcome back, ${res.admin.name}! Redirecting...`);
    } else {
      setAuthError(res.error || 'Invalid credentials.');
    }
  };

  // Handle Admin Signup submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!signupName || !signupEmail || !signupBadgeId || !signupPassword) {
      setAuthError('Please fill out all required fields.');
      return;
    }

    const res = signupAdmin(
      signupName,
      signupEmail,
      signupBadgeId,
      signupZone,
      signupPassword,
      signupPhone
    );

    if (res.success && res.admin) {
      setAdmin(res.admin);
      setAuthSuccess(`Officer account created! Welcome ${res.admin.name}.`);
    } else {
      setAuthError(res.error || 'Failed to register officer.');
    }
  };

  // Handle dynamic status change on-the-fly
  const handleStatusChange = (id: string, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
    const updated = updateComplaintStatus(id, newStatus);
    setComplaints(updated);
  };

  // Callback once reassign is confirmed inside modal
  const handleReassignConfirm = (id: string, officerName: string, officerRole: string) => {
    // Reassignment defaults to same status or 'In Progress' for active dispatches
    const activeComp = complaints.find(c => c.id === id);
    const nextStatus = activeComp?.status === 'Pending' ? 'In Progress' : (activeComp?.status || 'In Progress');
    const updated = updateComplaintStatus(id, nextStatus, officerName, officerRole);
    setComplaints(updated);
    setSelectedComplaintId(null);
  };

  // Filter complaints based on Search term and Select criteria
  const filteredComplaints = complaints.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.landmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.citizenName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Calculate dynamic dashboard stats
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Render Authentication Portal if not logged in
  if (!admin) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-3xl"></div>

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* Left Column: Portal Information banner */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Citizen Desk
              </Link>
            </div>
            
            <div className="flex items-center gap-2.5 text-blue-400">
              <ShieldCheck className="w-10 h-10 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">JanSewa Admin</h1>
                <p className="text-[10px] text-blue-400 uppercase tracking-widest font-extrabold mt-0.5">Municipal Dispatch & Triage</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Welcome to the secure administrative interface of JanSewa India. This portal is strictly restricted to designated Ward Resident Engineers, Zone Commissioners, and Municipal Command dispatchers.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Strict SLA Escalation Monitoring</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">Tickets nearing deadline thresholds trigger automated warning flags and local zone dispatch alerts.</p>
                </div>
              </div>
              <div className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs">
                <Map className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">GIS-Based Auto Dispatching</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">The command board auto-targets complaints by tracking coordinates relative to administrative ward boundaries.</p>
                </div>
              </div>
            </div>

            {/* Quick prefill demo box */}
            <div className="bg-blue-950/60 border border-blue-900/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-orange-400 font-extrabold text-[10px] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Evaluation Credentials
              </div>
              <p className="text-slate-400 text-xs">
                Use our automated prefill to login with pre-configured Commissioner credentials for instant review.
              </p>
              <button
                type="button"
                onClick={handlePreFillDemo}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/50 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400" /> Pre-fill Official Credentials
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Form box */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              {/* Form header toggle */}
              <div className="flex border-b border-slate-100 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthTab('signin'); setAuthError(''); }}
                  className={`flex-1 text-center py-2.5 rounded-xl font-bold text-xs transition-all ${
                    authTab === 'signin' 
                      ? 'bg-blue-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Officer Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                  className={`flex-1 text-center py-2.5 rounded-xl font-bold text-xs transition-all ${
                    authTab === 'signup' 
                      ? 'bg-blue-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Register New Officer
                </button>
              </div>

              {/* Error / Success messages */}
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 mb-4 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {authTab === 'signin' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Official Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400 w-4.5 h-4.5" />
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. admin@jansewa.gov.in" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Access PIN / Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400 w-4.5 h-4.5" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Secure Officer Authenticate
                  </button>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Smt. Priya Nair" 
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Badge / Employee Code</label>
                      <div className="relative">
                        <Award className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. OFFICER-2026-104" 
                          value={signupBadgeId}
                          onChange={(e) => setSignupBadgeId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Official Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. p.nair@jansewa.gov.in" 
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Phone / Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                        <input 
                          type="tel" 
                          placeholder="e.g. +91 99999 00104" 
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Designated Zone</label>
                      <select 
                        value={signupZone}
                        onChange={(e) => setSignupZone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900 h-9"
                      >
                        <option value="Central Zone">Central Zone</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Access Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                      <input 
                        type="password" 
                        required
                        placeholder="Choose high-security password" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
                  >
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    Register Administrative Officer
                  </button>
                </form>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-6 leading-relaxed text-center">
              Authorization attempts are logged persistently. Secure access cookies expire automatically. Support is available at <span className="underline cursor-pointer">it-admin@jansewa.gov.in</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Redesigned Admin Dashboard when logged in
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden font-sans">
      
      {/* Reassign Modal */}
      <ReassignModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedComplaintId(null); }} 
        complaintId={selectedComplaintId}
        onConfirm={handleReassignConfirm}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="text-slate-600 hover:text-blue-900 flex items-center gap-1 font-bold lg:hidden text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          
          <div className="flex items-center gap-2.5 text-blue-900">
            <ShieldCheck className="w-7 h-7" />
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight leading-none">JanSewa Admin</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Control Desk</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 ml-8">
            <Link to="/" className="text-slate-500 hover:text-blue-900 font-bold text-xs transition-colors">← Back to Citizen Portal</Link>
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="text-blue-900 font-black text-xs">Control Panel</span>
            <span className="text-slate-400 text-xs font-semibold cursor-not-allowed">Database Metrics</span>
            <span className="text-slate-400 text-xs font-semibold cursor-not-allowed">Smart Tenders</span>
          </nav>
        </div>

        {/* User profile dropdown box */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-blue-900 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">{admin.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{admin.zone}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-900 flex flex-col items-center justify-center font-black text-white text-xs shadow-md border border-blue-950">
              {admin.name.split(' ').pop()?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-[69px] h-[calc(100vh-69px)] overflow-y-auto">
          <div className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div>
                <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Main Functions</p>
                <nav className="space-y-1">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('triage')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      activeTab === 'triage' 
                        ? 'bg-blue-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4.5 h-4.5 animate-pulse" />
                    <span>Overview Board</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('analytics')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      activeTab === 'analytics' 
                        ? 'bg-blue-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-900'
                    }`}
                  >
                    <CheckSquare className="w-4.5 h-4.5" />
                    <span>National Analytics</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('heatmap')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      activeTab === 'heatmap' 
                        ? 'bg-blue-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-900'
                    }`}
                  >
                    <Map className="w-4.5 h-4.5" />
                    <span>GIS Heatmap</span>
                  </button>
                </nav>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Session</h4>
                <div className="text-[11px] text-slate-600 space-y-1 font-semibold">
                  <p className="text-slate-800 font-extrabold truncate">{admin.email}</p>
                  <p>ID: <span className="font-mono text-blue-900">{admin.badgeId}</span></p>
                  <p>Zone: <span>{admin.zone}</span></p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                Logout Officer
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'triage', label: 'Triage Feed', icon: LayoutDashboard },
              { id: 'analytics', label: 'Analytics', icon: CheckSquare },
              { id: 'heatmap', label: 'GIS Heatmap', icon: Map },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-900 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Welcome Dashboard Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {activeTab === 'triage' && 'Administrative Triage Workspace'}
                {activeTab === 'analytics' && 'National Analytics Intelligence'}
                {activeTab === 'heatmap' && 'Administrative Swachh GIS Workspace'}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                {activeTab === 'triage' && `Administering grievances within the ${admin.zone} and connected national grids.`}
                {activeTab === 'analytics' && 'Aggregated municipal issue volumes mapped across all states and Union Territories.'}
                {activeTab === 'heatmap' && `Inspecting Swachh index and ward live telemetry for ${admin.zone}.`}
              </p>
            </div>

            <button 
              onClick={handleSignOut}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* OVERVIEW BOARD TAB */}
          {activeTab === 'triage' && (
            <div className="space-y-6">
              {/* Dynamic Calculated Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Logged', val: totalCount, desc: 'All local records', icon: CheckSquare, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                  { label: 'Pending Action', val: pendingCount, desc: 'Unassigned/Awaiting review', icon: Clock, color: 'text-red-600 bg-red-50 border-red-100' },
                  { label: 'Active Dispatch', val: inProgressCount, desc: 'Crews assigned on-site', icon: Filter, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                  { label: 'Fully Resolved', val: resolvedCount, desc: 'Before & After verified', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.val}</span>
                      <div className={`p-2 rounded-xl border ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-bold text-slate-900 leading-none">{stat.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Triage Search & Filters Console */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <Filter className="w-4 h-4 text-slate-400" /> Filter Grievance Feed
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Search input field */}
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Complaint ID, Title, Reporter, Landmark..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  {/* Category dropdown filter */}
                  <div className="md:col-span-2 space-y-0.5">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white h-9"
                    >
                      <option value="All">All Categories</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Roads">Roads</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Streetlights">Streetlights</option>
                      <option value="Drainage and Sewerage">Drainage & Sewerage</option>
                    </select>
                  </div>

                  {/* Priority dropdown filter */}
                  <div className="md:col-span-2 space-y-0.5">
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white h-9"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Emergency">Emergency</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Status dropdown filter */}
                  <div className="md:col-span-3 space-y-0.5">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white h-9"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent Complaints ({filteredComplaints.length})</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Live database of complaints filed across local ward grids</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-4">ID & Issue Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Priority</th>
                        <th className="p-4">Assignee</th>
                        <th className="p-4">Status & Dispatch Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-150">
                      {filteredComplaints.map((item) => {
                        const getCategoryColor = (cat: string) => {
                          const lower = cat.toLowerCase();
                          if (lower.includes('sanit')) return 'bg-orange-50 text-orange-700 border-orange-200';
                          if (lower.includes('road')) return 'bg-red-50 text-red-700 border-red-200';
                          if (lower.includes('water')) return 'bg-blue-50 text-blue-700 border-blue-200';
                          if (lower.includes('light')) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
                          return 'bg-purple-50 text-purple-700 border-purple-200';
                        };

                        const getPriorityColor = (prio: string) => {
                          switch (prio) {
                            case 'Emergency': return 'bg-red-100 text-red-900 border-red-300 font-black';
                            case 'High': return 'bg-orange-100 text-orange-800 border-orange-250 font-bold';
                            case 'Medium': return 'bg-blue-50 text-blue-800 border-blue-200';
                            default: return 'bg-slate-100 text-slate-700 border-slate-200';
                          }
                        };

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            
                            {/* Column 1: ID, Title, Reporter */}
                            <td className="p-4 max-w-sm">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-blue-900 font-mono text-xs">{item.id}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold">{item.date}</span>
                                </div>
                                <p className="text-slate-800 font-bold line-clamp-2 leading-relaxed" title={item.description}>
                                  {item.title}
                                </p>
                                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-400">
                                  <span className="font-semibold text-slate-500">Rep: {item.citizenName || 'Anonymous'}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[180px]">{item.landmark}</span>
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Category Badge */}
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </td>

                            {/* Column 3: Priority Badge */}
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(item.priority || 'Medium')}`}>
                                {item.priority || 'Medium'}
                              </span>
                            </td>

                            {/* Column 4: Assigned Officer */}
                            <td className="p-4 align-middle">
                              <div className="space-y-1 max-w-[180px]">
                                {item.assignedOfficer ? (
                                  <>
                                    <p className="font-bold text-slate-800 truncate">{item.assignedOfficer}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{item.officerRole || 'Staff Engineer'}</p>
                                  </>
                                ) : (
                                  <p className="text-red-500 font-bold italic text-[11px] flex items-center gap-1">
                                    ⚠️ No Officer Dispatched
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Column 5: Actions & Status selector */}
                            <td className="p-4 align-middle">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                                  className={`text-xs font-black rounded-xl border-0 py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-blue-900 shadow-sm cursor-pointer ${
                                    item.status === 'Pending' 
                                      ? 'bg-red-50 text-red-700 ring-1 ring-red-200' 
                                      : item.status === 'In Progress'
                                        ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
                                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                  }`}
                                >
                                  <option value="Pending" className="bg-white text-red-700 font-semibold">Pending</option>
                                  <option value="In Progress" className="bg-white text-yellow-700 font-semibold">In Progress</option>
                                  <option value="Resolved" className="bg-white text-emerald-700 font-semibold">Resolved</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedComplaintId(item.id);
                                    setIsModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-900 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 justify-center shrink-0"
                                >
                                  <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>Reassign</span>
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}

                      {filteredComplaints.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            No complaints match active filter guidelines.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* RECHARTS NATIONAL ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Visualizer Intro header */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white">
                    JanSewa National Intelligence
                  </div>
                  <h3 className="text-xl font-extrabold text-white">National Grievance Category Dashboard</h3>
                  <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                    Aggregating public and local municipal ticket densities across all 28 States and 8 Union Territories. Drill-down comparison graphs power real-time budget forecasting and clean-city task force dispatch.
                  </p>
                </div>
                <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Aggregated Density</span>
                  <span className="text-xl font-mono font-black text-blue-400">{Object.values(BASE_STATE_ANALYTICS).reduce((acc, obj) => acc + Object.values(obj).reduce((s, v) => s + v, 0), 0) + complaints.length} tickets</span>
                </div>
              </div>

              {/* Main Graph Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Geographic Grievance Comparison</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Stacked volumes showing category concentration per State/UT (Sorted by total density)</p>
                  </div>

                  {/* Chart control bar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Geographic Filter</span>
                      <select
                        value={chartFilterType}
                        onChange={(e) => setChartFilterType(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white h-8 cursor-pointer"
                      >
                        <option value="All">All Regions</option>
                        <option value="State">States Only</option>
                        <option value="Union Territory">UTs Only</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Display Limit</span>
                      <select
                        value={maxStatesToShow}
                        onChange={(e) => setMaxStatesToShow(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white h-8 cursor-pointer"
                      >
                        <option value={5}>Top 5 Regions</option>
                        <option value={10}>Top 10 Regions</option>
                        <option value={15}>Top 15 Regions</option>
                        <option value={36}>All 36 Regions</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recharts Stacked Bar Chart */}
                <div className="h-80 md:h-96 w-full text-xs font-bold">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getAggregatedChartData()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="state" 
                        stroke="#64748B" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        stroke="#64748B" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          color: '#F8FAFC', 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#F8FAFC' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '15px' }}
                      />
                      <Bar dataKey="Sanitation" stackId="a" fill="#F59E0B" name="Sanitation" />
                      <Bar dataKey="Roads" stackId="a" fill="#EF4444" name="Roads" />
                      <Bar dataKey="Water Supply" stackId="a" fill="#3B82F6" name="Water Supply" />
                      <Bar dataKey="Streetlights" stackId="a" fill="#EAB308" name="Streetlights" />
                      <Bar dataKey="Drainage and Sewerage" stackId="a" fill="#8B5CF6" name="Drainage & Sewerage" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* State Specific Deep Dive Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: State Selector & Category Breakdown Pie */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">State Deep-Dive Analysis</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Toggle states to audit precise category frequencies</p>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Select Territory</label>
                      <select
                        value={selectedChartState}
                        onChange={(e) => setSelectedChartState(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white h-9 cursor-pointer"
                      >
                        {STATES_AND_UTS.map(st => (
                          <option key={st.name} value={st.name}>{st.name} ({st.type === 'State' ? 'State' : 'UT'})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pie Chart display */}
                  <div className="h-56 relative flex items-center justify-center mt-4">
                    {(() => {
                      const targetCounts = {
                        ...(BASE_STATE_ANALYTICS[selectedChartState] || {
                          'Sanitation': 0, 'Roads': 0, 'Water Supply': 0, 'Streetlights': 0, 'Drainage and Sewerage': 0
                        })
                      };
                      
                      // Merge live complaints for this state
                      complaints.filter(c => findStateByWard(c.ward) === selectedChartState).forEach(c => {
                        const cat = c.category || 'Sanitation';
                        targetCounts[cat] = (targetCounts[cat] || 0) + 1;
                      });

                      const pieData = Object.keys(targetCounts).map(cat => ({
                        name: cat,
                        value: targetCounts[cat] || 0
                      })).filter(d => d.value > 0);

                      const COLORS = {
                        'Sanitation': '#F59E0B',
                        'Roads': '#EF4444',
                        'Water Supply': '#3B82F6',
                        'Streetlights': '#EAB308',
                        'Drainage and Sewerage': '#8B5CF6'
                      };

                      if (pieData.length === 0) {
                        return <div className="text-xs font-semibold text-slate-400">No telemetry recorded for this state.</div>;
                      }

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94A3B8'} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#0F172A', 
                                color: '#F8FAFC', 
                                borderRadius: '12px', 
                                border: 'none', 
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>

                  {/* Quick Legend indicators */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500 inline-block"></span> Sanitation</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span> Roads</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block"></span> Water</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500 inline-block"></span> Lights</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500 inline-block"></span> Drainage</div>
                  </div>
                </div>

                {/* Right: Detailed State Ledger table */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{selectedChartState} Audit Ledger</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tabular statistics and efficiency weights by category</p>
                    </div>

                    {(() => {
                      const targetCounts = {
                        ...(BASE_STATE_ANALYTICS[selectedChartState] || {
                          'Sanitation': 0, 'Roads': 0, 'Water Supply': 0, 'Streetlights': 0, 'Drainage and Sewerage': 0
                        })
                      };
                      
                      // Merge live complaints
                      const liveForState = complaints.filter(c => findStateByWard(c.ward) === selectedChartState);
                      liveForState.forEach(c => {
                        const cat = c.category || 'Sanitation';
                        targetCounts[cat] = (targetCounts[cat] || 0) + 1;
                      });

                      const totalStateTickets = Object.values(targetCounts).reduce((a, b) => a + b, 0);

                      return (
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold">
                            <span className="text-slate-500">Capital Center</span>
                            <span className="text-blue-900">{STATES_AND_UTS.find(st => st.name === selectedChartState)?.capital || 'N/A'}</span>
                          </div>

                          <div className="overflow-hidden border border-slate-150 rounded-2xl">
                            <table className="w-full text-[11px] text-left border-collapse">
                              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[9px] border-b border-slate-200">
                                <tr>
                                  <th className="p-3">Category</th>
                                  <th className="p-3 text-right">Tickets</th>
                                  <th className="p-3 text-right">Share</th>
                                  <th className="p-3 text-right">Priority Index</th>
                                </tr>
                              </thead>
                              <tbody className="font-bold divide-y divide-slate-100">
                                {Object.keys(targetCounts).map(cat => {
                                  const count = targetCounts[cat] || 0;
                                  const share = totalStateTickets > 0 ? ((count / totalStateTickets) * 100).toFixed(1) : '0';
                                  const priority = cat === 'Roads' || cat === 'Drainage and Sewerage' ? '🔥 CRITICAL' : '⚡ STABLE';
                                  return (
                                    <tr key={cat} className="hover:bg-slate-50/30">
                                      <td className="p-3 text-slate-800">{cat}</td>
                                      <td className="p-3 text-right text-slate-900 font-mono">{count}</td>
                                      <td className="p-3 text-right text-slate-500 font-mono">{share}%</td>
                                      <td className="p-3 text-right text-[10px] text-slate-600 font-semibold">{priority}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                            * Priority index reflects historical infrastructure response times within municipal limits. Drainage & Roads carry immediate response triggers.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GIS HEATMAP TAB */}
          {activeTab === 'heatmap' && (
            <div className="space-y-6">
              {/* Heatmap Educational Banner */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-600 text-[10px] font-black uppercase tracking-widest text-white">
                    Live GIS Triage System
                  </div>
                  <h3 className="text-xl font-extrabold text-white">National Swachh GIS Ward Heatmap</h3>
                  <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                    By monitoring active grievance density, municipal dispatchers identify <strong>"Hotspots"</strong>. Wards with a low Swachh Index Score automatically receive heightened resource allocations.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col lg:flex-row">
                {/* Left Controls */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 p-5 bg-white">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Filter Municipal Wards</h4>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search ward name, road..." 
                      value={wardSearchQuery}
                      onChange={(e) => setWardSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900 focus:bg-white h-9"
                    />
                  </div>

                  <div className="flex gap-1 mb-4">
                    {['All', 'West Zone', 'Central Zone', 'East Zone'].map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setFilterWardZone(zone)}
                        className={`flex-1 py-1 px-1 text-[10px] font-black rounded-lg transition-all ${
                          filterWardZone === zone 
                            ? 'bg-blue-900 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {zone.replace(' Zone', '')}
                      </button>
                    ))}
                  </div>

                  <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-2">Municipal Wards List</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {(() => {
                      const filteredWards = INDIA_WARDS_DATA.filter(w => {
                        const zoneMatch = filterWardZone === 'All' || w.zone === filterWardZone;
                        const searchMatch = w.name.toLowerCase().includes(wardSearchQuery.toLowerCase()) || 
                                            `ward ${w.number}`.includes(wardSearchQuery.toLowerCase());
                        return zoneMatch && searchMatch;
                      });

                      return filteredWards.map((w) => {
                        const isSelected = w.number === selectedWardNum;
                        return (
                          <button
                            key={w.number}
                            type="button"
                            onClick={() => setSelectedWardNum(w.number)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-200 shadow-xs ring-1 ring-blue-900/10' 
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-blue-950 text-white font-mono font-black text-[10px] h-4.5 w-4.5 rounded flex items-center justify-center">
                                  {w.number}
                                </span>
                                <h5 className="font-bold text-slate-900 text-[11px] truncate max-w-[110px]">{w.name}</h5>
                              </div>
                              <p className="text-[9px] text-slate-400 font-semibold mt-1">{w.zone}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-black border ${
                                w.swachhScore >= 90 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                w.swachhScore >= 75 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                'bg-red-50 text-red-800 border-red-200'
                              }`}>
                                {w.swachhScore}%
                              </span>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Map Display & Details */}
                <div className="flex-1 bg-slate-100 flex flex-col">
                  {/* Simulated SVG Map */}
                  <div className="min-h-[300px] relative bg-slate-200 overflow-hidden flex items-center justify-center border-b border-slate-200 p-4">
                    <div className="absolute inset-0 bg-slate-300 opacity-25 pointer-events-none" style={{backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: '12px 12px'}}></div>
                    
                    {/* SVG Canvas */}
                    <div className="relative w-full max-w-md aspect-video p-2 z-10">
                      <svg viewBox="0 0 550 420" className="w-full h-full drop-shadow-sm select-none transition-all">
                        <g className="cursor-pointer">
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
                        <text x="130" y="100" fill="#78350F" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 8</text>
                        <text x="120" y="220" fill="#7F1D1D" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 12</text>
                        <text x="290" y="120" fill="#065F46" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono font-bold">Ward 5</text>
                        <text x="250" y="300" fill="#7F1D1D" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 15</text>
                        <text x="400" y="180" fill="#78350F" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">Ward 3</text>
                      </svg>

                      {/* Interactive marker pins on selected wards */}
                      {(() => {
                        const activeW = INDIA_WARDS_DATA.find(w => w.number === selectedWardNum) || INDIA_WARDS_DATA[1];
                        const getMarkerPos = (num: number) => {
                          switch (num) {
                            case 12: return { top: '50%', left: '25%' };
                            case 8: return { top: '28%', left: '26%' };
                            case 5: return { top: '35%', left: '54%' };
                            case 15: return { top: '68%', left: '50%' };
                            default: return { top: '45%', left: '70%' };
                          }
                        };
                        const pos = getMarkerPos(activeW.number);
                        return (
                          <div className="absolute z-20 flex flex-col items-center" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                            <div className="relative flex items-center justify-center">
                              <div className="absolute h-8 w-8 rounded-full bg-blue-600/30 animate-ping"></div>
                              <div className="h-5.5 w-5.5 rounded-full bg-blue-900 border-2 border-white shadow-md flex items-center justify-center text-[9px] text-white font-black">{activeW.number}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Map legend */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2 shadow-sm text-[9px] font-bold text-slate-700 space-y-1 z-20">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2 bg-red-100 border border-red-300 rounded inline-block"></span>
                        <span>Critical Zone</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2 bg-amber-100 border border-amber-300 rounded inline-block"></span>
                        <span>Moderate Zone</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2 bg-emerald-100 border border-emerald-300 rounded inline-block"></span>
                        <span>Swachh Green Zone</span>
                      </div>
                    </div>
                  </div>

                  {/* Ward Summary panel */}
                  {(() => {
                    const activeW = INDIA_WARDS_DATA.find(w => w.number === selectedWardNum) || INDIA_WARDS_DATA[1];
                    const localComplaintsForWard = complaints.filter(c => 
                      c.ward && c.ward.toLowerCase().includes(`ward ${activeW.number}`)
                    );

                    return (
                      <div className="p-5 bg-white space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <h5 className="text-sm font-extrabold text-slate-900">Ward {activeW.number} Details: {activeW.name}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">Subdivisional head officer: {activeW.engineer} • Helpline: {activeW.phone}</p>
                          </div>
                          <span className="text-xs font-black bg-blue-50 text-blue-950 border border-blue-100 px-2 py-0.5 rounded">
                            {activeW.swachhScore}% Efficiency
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Potholes</span>
                            <span className="text-sm font-black text-slate-800">{activeW.potholes} active</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Garbage</span>
                            <span className="text-sm font-black text-slate-800">{activeW.garbage} piles</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Water</span>
                            <span className="text-sm font-black text-slate-800">{activeW.water} leaks</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Outages</span>
                            <span className="text-sm font-black text-slate-800">{activeW.lights} dark</span>
                          </div>
                        </div>

                        {/* Live submitted citizen tickets in this ward */}
                        <div className="pt-2">
                          <p className="text-[9px] uppercase font-extrabold tracking-wide text-slate-400 mb-2">Live submitted citizen tickets ({localComplaintsForWard.length})</p>
                          {localComplaintsForWard.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                              {localComplaintsForWard.map(c => (
                                <div key={c.id} className="p-2 border border-slate-150 rounded-lg text-[10px] bg-slate-50 flex justify-between items-center font-bold">
                                  <div className="truncate">
                                    <span className="font-mono text-[8px] text-blue-900 block leading-none mb-0.5">{c.id}</span>
                                    <span className="text-slate-800 truncate">{c.title}</span>
                                  </div>
                                  <span className={`text-[8px] px-1 rounded uppercase ${
                                    c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                                    c.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                  }`}>{c.status}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic font-semibold">No custom citizen-reported incidents lodged in local storage for this ward.</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
