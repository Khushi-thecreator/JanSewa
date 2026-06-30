import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Camera, Search, PlusCircle, Globe, Languages, Menu, 
  Trash2, Droplet, Lightbulb, ShieldAlert, CheckCircle2, TrendingUp, 
  HelpCircle, PhoneCall, AlertTriangle, ArrowRight, Award, Shield, 
  MapPin, Calendar, Clock, BarChart3, Users, ChevronRight, X, AlertCircle,
  Waves, Hammer, Activity, Star, Sparkles, HelpCircle as HelpIcon, Lock, Mail, User as UserIcon,
  UserPlus, LayoutDashboard
} from 'lucide-react';
import Header from '../components/Header';
import { 
  getComplaints, 
  upvoteComplaint, 
  hasVoted, 
  getCurrentUser, 
  signupUser, 
  signinUser, 
  logoutUser, 
  getNearbyComplaints,
  User,
  Complaint,
  getUsers,
  setCurrentUser
} from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';
import { STATES_AND_UTS } from '../lib/statesData';
import { googleSignIn, getAccessToken, sendWelcomeEmail, initAuth } from '../lib/firebaseAuth';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Authentication states
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [selectedStateIndex, setSelectedStateIndex] = useState(6); // Default to Gujarat (Index 6)
  const [authWard, setAuthWard] = useState('Ward 09 (Amin Marg / Kalavad Rd, Rajkot, Gujarat)');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // Location and nearby state
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [nearbyIssues, setNearbyIssues] = useState<(Complaint & { distanceKm: number })[]>([]);

  // Load complaints dynamically from local storage
  const [complaintsList, setComplaintsList] = useState(() => getComplaints());

  // Filter complaints filed by the current user
  const userComplaints = complaintsList.filter(c => c.email && user && c.email.toLowerCase() === user.email.toLowerCase());

  // Refresh user state and location on mount
  useEffect(() => {
    const activeUser = getCurrentUser();
    setUser(activeUser);
    if (activeUser) {
      triggerDetectLocation();
    }

    // Initialize Google SSO status
    const unsubscribe = initAuth((firebaseUser, token) => {
      const existingUsers = getUsers();
      let localUser = existingUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
      if (localUser) {
        setCurrentUser(localUser);
        setUser(localUser);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpvote = (id: string) => {
    if (hasVoted(id)) return; // Prevent double voting
    const updated = upvoteComplaint(id);
    setComplaintsList(updated);
    
    // Update nearby issues list if location is present
    if (userCoords) {
      const nearby = getNearbyComplaints(userCoords.lat, userCoords.lon, 5);
      setNearbyIssues(nearby);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authTab === 'signup') {
      if (!authName || !authEmail || !authPassword) {
        setAuthError('All fields are required');
        return;
      }
      const res = signupUser(authName, authEmail, authWard, authPassword);
      if (res.success && res.user) {
        setAuthSuccess('Account registered successfully! Welcome to JanSewa.');
        setUser(res.user);
        // Clear fields
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
        navigate('/dashboard');
      } else {
        setAuthError(res.error || 'Registration failed');
      }
    } else {
      if (!authEmail || !authPassword) {
        setAuthError('Email and password are required');
        return;
      }
      const res = signinUser(authEmail, authPassword);
      if (res.success && res.user) {
        setAuthSuccess('Welcome back!');
        setUser(res.user);
        setAuthEmail('');
        setAuthPassword('');
        navigate('/dashboard');
      } else {
        setAuthError(res.error || 'Invalid credentials');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const result = await googleSignIn();
      if (result) {
        const { user: firebaseUser, accessToken } = result;
        const existingUsers = getUsers();
        let localUser = existingUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());

        if (!localUser && firebaseUser.email) {
          // Create new local user since they signed up via Google first-time
          const signupRes = signupUser(
            firebaseUser.displayName || 'Google Citizen',
            firebaseUser.email,
            authWard,
            '' // No password for Google SSO
          );
          if (signupRes.success && signupRes.user) {
            localUser = signupRes.user;
            setAuthSuccess('Successfully registered and joined JanSewa via Google SSO!');
            // Send welcome email via Gmail API!
            await sendWelcomeEmail(accessToken, firebaseUser.email, firebaseUser.displayName || 'Google Citizen');
          } else {
            throw new Error(signupRes.error || 'Failed to create local account for Google SSO');
          }
        } else if (localUser) {
          setCurrentUser(localUser);
          setAuthSuccess(`Welcome back, ${localUser.name}! (Signed in with Google)`);
        }

        if (localUser) {
          setUser(localUser);
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Google SSO Sign in failed:', err);
      setAuthError('Google Sign-In failed or was cancelled.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const triggerDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      // Load with fallback coordinates (New Delhi)
      loadNearbyIssues(28.6289, 77.2150);
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserCoords({ lat, lon });
        setIsLocating(false);
        loadNearbyIssues(lat, lon);
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation failed, falling back to default coordinates:', error);
        setLocationError('Unable to detect GPS. Showing general New Delhi issues.');
        // Fallback coordinates for New Delhi
        setUserCoords({ lat: 28.6289, lon: 77.2150 });
        loadNearbyIssues(28.6289, 77.2150);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const loadNearbyIssues = (lat: number, lon: number) => {
    const nearby = getNearbyComplaints(lat, lon, 5);
    setNearbyIssues(nearby);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Pending') return 'text-red-700 bg-red-50 border-red-200 font-bold';
    if (status === 'In Progress') return 'text-amber-700 bg-amber-50 border-amber-200 font-bold';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
  };

  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'Emergency': return 'bg-red-100 text-red-900 border-red-200 font-extrabold';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
      case 'Medium': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const [scorecardTab, setScorecardTab] = useState<'national' | 'regional'>('national');
  const [scorecardStateIdx, setScorecardStateIdx] = useState<number>(6); // Default to Gujarat (Index 6)

  const nationalScoreboard = [
    { rank: 1, city: 'Indore', state: 'Madhya Pradesh', resolved: '99.5%', active: 8, score: 99 },
    { rank: 2, city: 'Surat', state: 'Gujarat', resolved: '99.1%', active: 11, score: 98 },
    { rank: 3, city: 'Navi Mumbai', state: 'Maharashtra', resolved: '98.4%', active: 14, score: 96 },
    { rank: 4, city: 'Visakhapatnam', state: 'Andhra Pradesh', resolved: '97.8%', active: 17, score: 95 },
    { rank: 5, city: 'Bhopal', state: 'Madhya Pradesh', resolved: '97.2%', active: 15, score: 94 },
    { rank: 6, city: 'Ambikapur', state: 'Chhattisgarh', resolved: '96.9%', active: 12, score: 93 },
    { rank: 7, city: 'Mysuru', state: 'Karnataka', resolved: '96.5%', active: 16, score: 92 },
    { rank: 8, city: 'New Delhi', state: 'Delhi', resolved: '95.8%', active: 24, score: 91 }
  ];

  const getRegionalLeaderboard = () => {
    const selectedState = STATES_AND_UTS[scorecardStateIdx];
    return selectedState.wards.map((wardName, idx) => {
      let charSum = 0;
      for (let i = 0; i < wardName.length; i++) {
        charSum += wardName.charCodeAt(i);
      }
      const score = 75 + (charSum % 21); // Score 75 - 95
      const resolvedSLA = 70 + (charSum % 26) + (charSum % 10) / 10;
      const activeTickets = 5 + (charSum % 25);
      return {
        rank: idx + 1,
        ward: wardName,
        resolved: `${resolvedSLA.toFixed(1)}%`,
        active: activeTickets,
        score: score
      };
    }).sort((a, b) => b.score - a.score).map((item, index) => ({ ...item, rank: index + 1 }));
  };

  const civicCategories = [
    { name: 'Sanitation', icon: Trash2, description: 'Garbage piles, dirty streets, public toilet upkeep', color: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200/40' },
    { name: 'Roads', icon: AlertTriangle, description: 'Potholes, broken footpaths, road blockages', color: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200/40' },
    { name: 'Water Supply', icon: Droplet, description: 'Leaking water pipelines, contaminated water, low pressure', color: 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200/40' },
    { name: 'Streetlights', icon: Lightbulb, description: 'Dark street lamps, broken poles, dangling wires', color: 'bg-yellow-100 text-yellow-800 border-yellow-250 hover:bg-yellow-200/40' },
    { name: 'Parks & Playgrounds', icon: Award, description: 'Overgrown weeds, broken playground swings, stray cattle', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200/40' },
    { name: 'Stray Animals', icon: ShieldAlert, description: 'Stray cattle hazard, dangerous wild dogs, containment', color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200/40' },
    { name: 'Drainage & Sewerage', icon: Waves, description: 'Overflowing drains, blocked sewers, manhole issues', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200/40' },
    { name: 'Illegal Construction', icon: Hammer, description: 'Encroachments, unauthorized building, zone violations', color: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/40' },
    { name: 'Other Grievances', icon: HelpCircle, description: 'Report any other civic defect or public utility grievance', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200/40' }
  ];

  const handleQuickCategorySelect = (categoryName: string) => {
    if (!user) {
      setAuthError('Please sign up or sign in first to report an issue.');
      // Scroll to login/signup widget
      const element = document.getElementById('auth-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    navigate('/report', { state: { preselectedCategory: categoryName } });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track?id=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/track');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setNearbyIssues([]);
    setUserCoords(null);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col antialiased">
      {/* Main Header / Navigation */}
      <Header />

      <main className="flex-grow">
        {/* Modern Redesigned Hero Section */}
        <div className="relative bg-gradient-to-b from-blue-950 via-slate-950 to-blue-900 overflow-hidden py-16 lg:py-24 border-b border-blue-900/30">
          {/* Decorative Tri-color Background Blur Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40"></div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Side: Dynamic Messaging & Empowering Title */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-blue-300 text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  Swachh Bharat Swasth Bharat
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                  {language === 'English' ? (
                    <>
                      Spot a Civic Issue? <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400">
                        Snap, File, Fixed.
                      </span>
                    </>
                  ) : (
                    <>
                      समस्या दिख रही है? <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400">
                        फोटो लें, दर्ज करें, सुधारें।
                      </span>
                    </>
                  )}
                </h1>
                
                <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xl font-medium">
                  {t('hero.subtitle')}
                </p>

                {/* Main Call to Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  {!user ? (
                    <>
                      {/* Orange Login or Sign Up Button */}
                      <button 
                        onClick={() => {
                          const element = document.getElementById('auth-section');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white h-14 px-8 rounded-2xl text-base font-extrabold shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <UserPlus className="w-5 h-5 shrink-0" />
                        {language === 'English' ? 'Login or Sign Up' : 'लॉगिन या साइन अप'}
                      </button>

                      {/* Blue Report Issue Button (replacing Verify & Register Mobile) */}
                      <Link 
                        to="/report" 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-14 px-8 rounded-2xl text-base font-extrabold shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                      >
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        {language === 'English' ? 'Report Issue' : 'समस्या रिपोर्ट करें'}
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Orange Report Issue Button */}
                      <Link 
                        to="/report" 
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white h-14 px-8 rounded-2xl text-base font-extrabold shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 animate-bounce"
                      >
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        {language === 'English' ? 'Report Issue' : 'समस्या रिपोर्ट करें'}
                      </Link>

                      {/* Go to Dashboard button */}
                      <button 
                        onClick={() => {
                          const element = document.getElementById('auth-section');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-white/10 hover:bg-white/15 border border-white/20 text-white h-14 px-8 rounded-2xl text-base font-extrabold transition-all flex items-center justify-center gap-2 backdrop-blur-xs cursor-pointer"
                      >
                        <LayoutDashboard className="w-5 h-5 text-emerald-400 shrink-0" />
                        {language === 'English' ? 'Citizen Dashboard' : 'नागरिक डैशबोर्ड'}
                      </button>
                    </>
                  )}
                  <Link 
                    to="/standards" 
                    className="bg-white/10 hover:bg-white/15 border border-white/20 text-white h-14 px-8 rounded-2xl text-base font-extrabold transition-all flex items-center justify-center gap-2 backdrop-blur-xs"
                  >
                    <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                    {t('action.view_standards')}
                  </Link>
                </div>


                {/* National Badges Row */}
                <div className="flex items-center gap-6 pt-6 border-t border-white/10 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇮🇳</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-tight block">
                      Digital India<br/><span className="text-slate-300">Initiative</span>
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-400" />
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-tight block">
                      Swachh Survekshan<br/><span className="text-slate-300">2026 Ready</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Quick Track & Status Widget Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/10 text-slate-900 relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-900 text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                  Live Grievance Hub
                </div>

                <h3 className="font-black text-xl text-slate-900 mb-2">Track & Update</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Enter your unique ticket ID below to inspect repair photos, call ward engineers, or rate completed resolutions.
                </p>

                {/* Instant Search Bar */}
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. JS-IND-2026-048" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Fetch Grievance Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Live Municipal Performance Pulse */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Resolved SLA</span>
                    <span className="text-lg font-black text-emerald-700 block mt-0.5">93.7%</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Avg Fix SLA</span>
                    <span className="text-lg font-black text-orange-700 block mt-0.5">32 Hours</span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <Link 
                    to="/map" 
                    className="inline-flex items-center gap-1 text-[11px] font-black text-blue-900 hover:text-blue-800 uppercase tracking-wider"
                  >
                    <span>Inspect Ward Map Heat index</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* User-Friendly Quick-Tap Grid of Categories with Beautiful Styling */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest bg-orange-50 px-3.5 py-1.5 rounded-full">
              Category Directory
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">
              What issue are you facing today?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Select any category to immediately prefill your grievance ticket and route it directly to the designated department.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {civicCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <button 
                  key={index}
                  onClick={() => handleQuickCategorySelect(category.name)}
                  className="w-full text-left bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-900/30 hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-4 group"
                >
                  <div className={`p-3 rounded-xl border shrink-0 transition-colors ${category.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-950 truncate">
                        {category.name}
                      </h4>
                      <span className="text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic & Beautiful Citizen Education Flow Chart */}
        <section className="bg-slate-100 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-widest bg-blue-100/70 px-3.5 py-1.5 rounded-full">
                  How JanSewa Works
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Transparent 4-Step Grievance Cycle
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Every public complaint bypasses manual municipal layers. We use live GPS pinpointing to instantly find the ward official in charge, holding them to public standards of transparency.
                </p>
                <div className="pt-2">
                  <Link 
                    to="/gallery" 
                    className="inline-flex items-center gap-1 text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-wider"
                  >
                    <span>View resolved case photos</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { step: '01', title: 'Upload & Tag', desc: 'Snap a picture from your phone. GPS automatically logs coordinates & landmarks.' },
                  { step: '02', title: 'Ward Routing', desc: 'The ticket lands instantly on the respective Subdivision Ward Engineer’s mobile app.' },
                  { step: '03', title: 'Action & Fixes', desc: 'On-site contractors repair the issue and submit visual proof back into the database.' },
                  { step: '04', title: 'Citizen Signoff', desc: 'Rate your satisfaction. If unresolved, you have the option to trigger a senior engineer audit.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
                    <span className="absolute -right-3 -top-3 text-5xl font-black text-slate-50/75 select-none pointer-events-none transition-colors group-hover:text-blue-50">
                      {item.step}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic Section: Authentication (Logged out) OR Personalized Dashboard (Logged in) */}
        <section id="auth-section" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {!user ? (
              /* Signed out: Beautiful Multi-tab Sign In / Sign Up Form */
              <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-lg">
                <div className="text-center mb-8">
                  <span className="text-xs font-black text-blue-900 uppercase tracking-widest bg-blue-100/80 px-3.5 py-1.5 rounded-full mb-3 inline-block">
                    Citizen Sign-In Area
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Join JanSewa India
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                    Register with your email to file grievances, view your personal ticket history, and upvote neighborhood issues.
                  </p>
                </div>

                {/* Form Navigation Tabs */}
                <div className="grid grid-cols-2 bg-slate-200/70 p-1.5 rounded-2xl mb-6">
                  <button 
                    onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                    className={`py-3 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all ${authTab === 'signup' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Create Account
                  </button>
                  <button 
                    onClick={() => { setAuthTab('signin'); setAuthError(''); }}
                    className={`py-3 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all ${authTab === 'signin' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span className="font-semibold">{authError}</span>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span className="font-semibold">{authSuccess}</span>
                    </div>
                  )}

                  {authTab === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Your Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                        <input 
                          type="text" 
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Aarav Patel"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. aarav.patel@example.com"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Secure Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                      <input 
                        type="password" 
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  {authTab === 'signup' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">State / Union Territory</label>
                        <select 
                          value={selectedStateIndex} 
                          onChange={(e) => {
                            const idx = parseInt(e.target.value, 10);
                            setSelectedStateIndex(idx);
                            setAuthWard(STATES_AND_UTS[idx].wards[0]);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-900 cursor-pointer"
                        >
                          {STATES_AND_UTS.map((st, idx) => (
                            <option key={st.name} value={idx}>
                              {st.name} ({st.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Your Local Ward Subdivision</label>
                        <select 
                          value={authWard} 
                          onChange={(e) => setAuthWard(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-900 cursor-pointer"
                        >
                          {STATES_AND_UTS[selectedStateIndex].wards.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-md transition-colors pt-4"
                  >
                    {authTab === 'signup' ? 'Create Account' : 'Access Dashboard'}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 px-3 text-slate-500 font-bold">Or continue with</span>
                  </div>
                </div>

                <button 
                  type="button"
                  disabled={isGoogleLoggingIn}
                  onClick={handleGoogleLogin}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-55"
                >
                  {isGoogleLoggingIn ? (
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></span>
                  ) : (
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  )}
                  <span>{isGoogleLoggingIn ? 'Connecting...' : 'Sign in with Google (Enables Gmail Alerts)'}</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center mt-5 leading-normal">
                  By logging in, you agree to JanSewa India's terms of identity verification. Anonymous logs are verified in 24 hours.
                </p>
              </div>
            ) : (
              /* Signed In: Beautiful Personal Citizen Dashboard with User's Complaints and Nearby Issues */
              <div className="space-y-12">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest bg-white/10 px-3 py-1 rounded-full text-blue-200 inline-block mb-3">
                        {language === 'English' ? 'Citizen Performance Dashboard' : 'नागरिक निष्पादन डैशबोर्ड'}
                      </span>
                      <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        <span>{language === 'English' ? `Namaste, ${user.name}!` : `नमस्ते, ${user.name}!`}</span>
                        <span className="text-2xl">🙏</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-150 mt-1 max-w-xl">
                        {language === 'English' ? (
                          <>
                            Representing <span className="font-bold underline">{user.ward}</span>. Track your active complaints or review nearby public incidents needing your upvotes.
                          </>
                        ) : (
                          <>
                            प्रतिनिधित्व <span className="font-bold underline">{user.ward}</span>. अपनी सक्रिय शिकायतों को ट्रैक करें या आस-पास की घटनाओं की समीक्षा करें जिन्हें आपके समर्थन की आवश्यकता है।
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Link 
                        to="/report"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        {t('nav.report_issue')}
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all border border-white/15"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Your Filed Grievances */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Your Filed Grievances</h3>
                        <p className="text-xs text-slate-500">List of complaints submitted under {user.email}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-full">
                        {userComplaints.length} Filed
                      </span>
                    </div>

                    {userComplaints.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">No Grievances Filed Yet</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            You have not reported any issues yet. Help make your ward safer by logging your first ticket today!
                          </p>
                        </div>
                        <Link 
                          to="/report"
                          className="inline-flex bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                        >
                          Report First Issue
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userComplaints.map((item) => (
                          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-900/30 transition-all flex flex-col sm:flex-row gap-4">
                            <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              <img src={item.photoPreview} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-bold uppercase mb-1">
                                  <span>ID: {item.id}</span>
                                  <span>{item.date}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">{item.title}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.landmark}</span>
                                </p>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-slate-100">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                                <Link 
                                  to={`/complaint/${item.id}`}
                                  className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-0.5"
                                >
                                  <span>View Details & Feedback</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: GPS Nearby Issues for Upvoting */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Verify & Support Nearby</h3>
                        <p className="text-xs text-slate-500">Upvote nearby civic issues to speed up repair SLAs</p>
                      </div>
                      <button 
                        onClick={triggerDetectLocation}
                        disabled={isLocating}
                        className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        <MapPin className={`w-3 h-3 ${isLocating ? 'animate-bounce' : ''}`} />
                        {isLocating ? 'Scanning...' : 'Refresh GPS'}
                      </button>
                    </div>

                    {locationError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                        ⚠️ {locationError}
                      </div>
                    )}

                    <div className="space-y-4">
                      {nearbyIssues.length === 0 ? (
                        <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl text-center text-xs text-slate-500 leading-normal">
                          No active grievances registered in your vicinity. Great job! Your ward is pristine.
                        </div>
                      ) : (
                        nearbyIssues.map((item) => {
                          const userVoted = hasVoted(item.id);
                          return (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-350 transition-all flex items-start gap-3.5">
                              <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                <img src={item.photoPreview} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-100/50 px-1.5 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                  <span className="text-[10px] text-orange-700 font-bold shrink-0">
                                    📍 {item.distanceKm < 1 ? `${(item.distanceKm * 1000).toFixed(0)}m` : `${item.distanceKm.toFixed(1)} km`} away
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs truncate mt-1 leading-tight">{item.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.landmark}</p>
                                
                                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                                  <button 
                                    onClick={() => handleUpvote(item.id)}
                                    disabled={userVoted}
                                    className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded border transition-all ${
                                      userVoted 
                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 cursor-default' 
                                        : 'text-blue-950 bg-blue-50 hover:bg-blue-100 border-blue-100'
                                    }`}
                                  >
                                    <TrendingUp className="w-3 h-3 text-blue-950" />
                                    <span>{userVoted ? 'Supported' : 'Support'} ({item.upvotes})</span>
                                  </button>
                                  <Link 
                                    to={`/complaint/${item.id}`}
                                    className="text-[10px] font-bold text-slate-500 hover:text-blue-900"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Polished Ward Leaderboard Panel */}
        <section className="bg-slate-950 py-16 text-white border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              <div className="lg:col-span-4 space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-orange-400" /> Swachh Scorecard
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  National Swachh Survekshan Cleanliness Index
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  We maintain a transparent public leaderboard tracking cleanliness, completion speed (SLA), and civic compliance across all of India's 28 States and 8 Union Territories.
                </p>

                {/* Scorecard Tab Toggles */}
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setScorecardTab('national')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                      scorecardTab === 'national' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    🇮🇳 National Cleanest
                  </button>
                  <button
                    type="button"
                    onClick={() => setScorecardTab('regional')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                      scorecardTab === 'regional' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    📍 State & UT Wards
                  </button>
                </div>

                {scorecardTab === 'regional' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select State / Union Territory</label>
                    <select
                      value={scorecardStateIdx}
                      onChange={(e) => setScorecardStateIdx(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {STATES_AND_UTS.map((st, idx) => (
                        <option key={st.name} value={idx}>
                          {st.name} ({st.type === 'State' ? 'State' : 'UT'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Public Service Standards</p>
                      <p className="text-slate-400 mt-0.5">Every local municipal body must satisfy Swachh Survekshan guidelines and BIS sanitation criteria.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                    {scorecardTab === 'national' 
                      ? "India's Top Cleanest Cities" 
                      : `${STATES_AND_UTS[scorecardStateIdx].name} Ward Subdivision Rankings`
                    }
                  </h4>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 bg-white/5 px-2.5 py-1 rounded">June 2026</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase font-bold border-b border-white/10 pb-2">
                        <th className="pb-2 text-center w-10">Rank</th>
                        <th className="pb-2">
                          {scorecardTab === 'national' ? 'City / State' : 'Ward Subdivision'}
                        </th>
                        <th className="pb-2 text-right">Resolved SLA</th>
                        <th className="pb-2 text-right">Active Tickets</th>
                        <th className="pb-2 text-right">Efficiency Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scorecardTab === 'national' ? (
                        nationalScoreboard.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="py-3 text-center font-bold">
                              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                            </td>
                            <td className="py-3 font-bold text-slate-100">
                              {item.city} <span className="text-[10px] font-normal text-slate-400">({item.state})</span>
                            </td>
                            <td className="py-3 text-right text-emerald-400 font-bold">{item.resolved}</td>
                            <td className="py-3 text-right text-slate-300 font-mono">{item.active}</td>
                            <td className="py-3 text-right">
                              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                {item.score}/100
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        getRegionalLeaderboard().map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="py-3 text-center font-bold">
                              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                            </td>
                            <td className="py-3 font-bold text-slate-100">{item.ward}</td>
                            <td className="py-3 text-right text-emerald-400 font-bold">{item.resolved}</td>
                            <td className="py-3 text-right text-slate-300 font-mono">{item.active}</td>
                            <td className="py-3 text-right">
                              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                {item.score}/100
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Emergency Helpdesk & toll-free block */}
        <section className="bg-white py-12 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 border border-blue-200/50 rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs">
              <div className="max-w-xl text-center md:text-left">
                <h4 className="text-blue-950 font-black text-xl flex items-center justify-center md:justify-start gap-2">
                  <PhoneCall className="w-5 h-5 text-orange-600 shrink-0" />
                  JanSewa Emergency Action Room
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                  Experiencing life-threatening hazards like high-voltage dangling wires, structural building failures, severe sewer overflows, or water contamination? Please contact our 24/7 centralized dispatch directly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <a href="tel:1800112233" className="bg-blue-950 hover:bg-blue-900 text-white text-center py-3.5 px-6 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-4 h-4" /> Call Toll-Free: 1800-11-2233
                </a>
                <Link to="/notifications" className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-center py-3.5 px-6 rounded-xl font-bold text-xs transition-colors flex items-center justify-center">
                  Disaster Advisories
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Index Navigation Map - Tour Navigation */}
        <section className="bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
              <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Sitemap
              </span>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Platform Feature Tour</h4>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { to: '/report', label: '1. File Grievance', icon: PlusCircle, color: 'text-orange-600 bg-orange-50' },
                { to: '/submitted', label: '2. Success Modal', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                { to: '/track', label: '3. Track Status', icon: Search, color: 'text-blue-900 bg-blue-50' },
                { to: '/complaint/JS-IND-2026-048', label: '4. Detail & Feedback', icon: Star, color: 'text-amber-600 bg-amber-50' },
                { to: '/admin', label: '5. Ward Admin Portal', icon: Users, color: 'text-purple-600 bg-purple-50' },
                { to: '/gallery', label: '6. Before & After Feed', icon: Award, color: 'text-indigo-600 bg-indigo-50' },
                { to: '/standards', label: '7. IRC Civic Codes', icon: Shield, color: 'text-cyan-600 bg-cyan-50' },
                { to: '/map', label: '8. GIS Triage Heatmap', icon: MapPin, color: 'text-red-600 bg-red-50' },
                { to: '/notifications', label: '9. Citizen Alerts Feed', icon: Globe, color: 'text-teal-600 bg-teal-50' }
              ].map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.to} 
                  className="p-3 bg-white hover:border-blue-950 border border-slate-200 rounded-xl transition-all shadow-xs text-center flex flex-col items-center justify-center gap-1.5"
                >
                  <div className={`p-1.5 rounded-lg ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Area */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="bg-blue-900 text-white p-1.5 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-black tracking-tight uppercase">JanSewa</h1>
            </div>
            <p className="leading-relaxed text-slate-400">
              Official Grievance Redressal and Citizen Empowerment System. Built under the Smart City Initiative of Indian Municipal Administrations.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-1.5">
              <li><Link to="/report" className="hover:text-white transition-colors">Register a Grievance</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track Complaint Status</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Before & After Photo Gallery</Link></li>
              <li><Link to="/standards" className="hover:text-white transition-colors">Know Your Civic Standards</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Zone Offices</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>North Zone Office, Connaught Place, New Delhi</li>
              <li>West Zone Office, Bandra West, Mumbai</li>
              <li>South Zone Office, Indiranagar, Bengaluru</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Citizen Care</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-orange-400 shrink-0" /> <span>Emergency: 1800-11-2233</span></li>
              <li>E-mail: support@jansewa.gov.in</li>
              <li>Grievance Redressal Desk: 24/7 Automated</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500">
          <p>© 2026 JanSewa India. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Use</span>
            <span className="hover:text-slate-400 cursor-pointer">SLA Agreement</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
