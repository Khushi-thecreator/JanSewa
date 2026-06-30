import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User as UserIcon, MapPin, Mail, Calendar, Sparkles, CheckCircle2, 
  Clock, AlertTriangle, ShieldCheck, ChevronRight, ArrowLeft, Camera, 
  Send, ThumbsUp, LogOut, Loader2, Link2, Info, ArrowUpRight
} from 'lucide-react';
import Header from '../components/Header';
import { 
  getCurrentUser, 
  logoutUser, 
  getComplaints, 
  upvoteComplaint, 
  hasVoted, 
  getNearbyComplaints, 
  User, 
  Complaint 
} from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';
import { googleSignIn, getAccessToken, sendWelcomeEmail, googleSignOut } from '../lib/firebaseAuth';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // Authentication states
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [isGoogleLinking, setIsGoogleLinking] = useState(false);
  const [googleStatusMsg, setGoogleStatusMsg] = useState('');
  const [googleStatusError, setGoogleStatusError] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Complaints & stats
  const [complaints, setComplaints] = useState<Complaint[]>(() => getComplaints());
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearbyIssues, setNearbyIssues] = useState<(Complaint & { distanceKm: number })[]>([]);

  // Force redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Retrieve user location and nearby complaints
  useEffect(() => {
    if (user) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
            setUserCoords(coords);
            const nearby = getNearbyComplaints(coords.lat, coords.lon, 8);
            setNearbyIssues(nearby);
          },
          (error) => {
            // Fallback: search using some coordinates or just use 0,0
            console.log('Location unavailable for nearby panel, loading standard nearby feed.');
            const fallbackCoords = { lat: 28.6289, lon: 77.215 };
            setUserCoords(fallbackCoords);
            const nearby = getNearbyComplaints(fallbackCoords.lat, fallbackCoords.lon, 8);
            setNearbyIssues(nearby);
          }
        );
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  // Filter complaints filed by this specific logged-in user
  const userComplaints = complaints.filter(
    c => c.email && c.email.toLowerCase() === user.email.toLowerCase()
  );

  const pendingComplaints = userComplaints.filter(c => c.status === 'Pending');
  const activeComplaints = userComplaints.filter(c => c.status === 'In Progress');
  const resolvedComplaints = userComplaints.filter(c => c.status === 'Resolved');

  const handleLogout = () => {
    logoutUser();
    googleSignOut().catch(err => console.log('Cleaned Google state'));
    setUser(null);
    navigate('/');
  };

  const handleLinkGoogle = async () => {
    setIsGoogleLinking(true);
    setGoogleStatusMsg('');
    setGoogleStatusError('');
    try {
      const result = await googleSignIn();
      if (result) {
        const { user: firebaseUser, accessToken } = result;
        setGoogleStatusMsg(
          language === 'English'
            ? 'Successfully connected Google Account! Gmail features are now active.'
            : 'सफलतापूर्वक गूगल खाता कनेक्ट किया गया! जीमेल अलर्ट अब सक्रिय हैं।'
        );
        // Automatically dispatch welcome confirmation email using the new token!
        await sendWelcomeEmail(accessToken, firebaseUser.email || user.email, user.name);
      }
    } catch (err: any) {
      console.error('Google link error:', err);
      setGoogleStatusError(
        language === 'English'
          ? 'Failed to link Google account. Popup was closed or blocked.'
          : 'गूगल खाता लिंक करने में विफल। पॉपअप बंद या ब्लॉक कर दिया गया था।'
      );
    } finally {
      setIsGoogleLinking(false);
    }
  };

  const handleSendTestEmail = async () => {
    const token = getAccessToken();
    if (!token) {
      setGoogleStatusError(
        language === 'English' 
          ? 'Gmail account is not linked. Please connect Google Account first.' 
          : 'जीमेल खाता लिंक नहीं है। कृपया पहले गूगल खाता कनेक्ट करें।'
      );
      return;
    }

    setIsSendingTestEmail(true);
    setGoogleStatusMsg('');
    setGoogleStatusError('');

    try {
      // Dynamic import to send test mail
      const { sendGmailEmail } = await import('../lib/firebaseAuth');
      const subject = 'JanSewa India - Real-time Notification Test';
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">JanSewa India</h2>
          <p><strong>Namaste ${user.name},</strong></p>
          <p>This is a live diagnostic email verifying that your JanSewa account is successfully connected to your Google Mail via secure SSO OAuth.</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 12px; margin: 15px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Grievance Alerting Status:</strong> ACTIVE 🟢</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">You will receive instant structured receipts whenever you file street defects, drainage issues, or safety hazards on our portal.</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 25px;">JanSewa India National Civic Redressal Cell • MoHUA</p>
        </div>
      `;
      await sendGmailEmail(token, user.email, subject, htmlBody);
      setGoogleStatusMsg(
        language === 'English'
          ? 'Test email alert successfully sent to your inbox!'
          : 'परीक्षण ईमेल अलर्ट आपके इनबॉक्स में सफलतापूर्वक भेजा गया!'
      );
    } catch (err: any) {
      console.error('Error sending test email:', err);
      setGoogleStatusError(
        language === 'English'
          ? 'Failed to send test email. Token may be expired. Please click Link Google Account again.'
          : 'परीक्षण ईमेल भेजने में विफल। टोकन समाप्त हो सकता है। कृपया पुनः गूगल खाता लिंक करें।'
      );
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleUpvote = (id: string) => {
    if (hasVoted(id)) return;
    upvoteComplaint(id);
    setComplaints(getComplaints());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 animate-pulse" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
            <AlertTriangle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb back navigation */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'English' ? 'Back to Public Portal' : 'सार्वजनिक पोर्टल पर वापस जाएं'}</span>
          </Link>
        </div>

        {/* Dashboard Title Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/15">
                <UserIcon className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {language === 'English' ? `Namaste, ${user.name}` : `नमस्ते, ${user.name}`}
                  </h2>
                  <span className="text-xl">👋</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>{user.ward}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link 
                to="/report" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'English' ? 'File New Incident' : 'नई शिकायत दर्ज करें'}</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'English' ? 'Logout' : 'लॉगआउट'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Main user metrics and their filed complaints (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Metric Overview Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">{language === 'English' ? 'Total Filed' : 'कुल शिकायतें'}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{userComplaints.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">{language === 'English' ? 'Resolved' : 'समाधान'}</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedComplaints.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">{language === 'English' ? 'Active Work' : 'सक्रिय कार्य'}</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{activeComplaints.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">{language === 'English' ? 'Pending SLA' : 'लंबित SLA'}</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{pendingComplaints.length}</p>
              </div>
            </div>

            {/* List of Filed Complaints */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {language === 'English' ? 'Your Filed Grievances' : 'आपकी दर्ज शिकायतें'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'English' 
                      ? 'Track live resolution statuses or review SLA completion timelines' 
                      : 'सक्रिय समाधान स्थिति ट्रैक करें या समय सीमा की समीक्षा करें'}
                  </p>
                </div>
                <span className="bg-blue-50 border border-blue-100 text-blue-900 text-xs font-extrabold px-3 py-1 rounded-full shrink-0">
                  {userComplaints.length} {language === 'English' ? 'Tickets' : 'टिकट'}
                </span>
              </div>

              {userComplaints.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto border border-dashed border-slate-200">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {language === 'English' ? 'No Grievances Filed' : 'कोई शिकायत नहीं मिली'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {language === 'English' 
                        ? 'Your registered account does not have any reported street defects or safety hazards yet.' 
                        : 'आपके पंजीकृत खाते में अभी तक कोई रिपोर्ट की गई सड़क दोष या सुरक्षा खतरे नहीं हैं।'}
                    </p>
                  </div>
                  <Link 
                    to="/report"
                    className="inline-flex bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                  >
                    {language === 'English' ? 'File Your First Complaint' : 'अपनी पहली शिकायत दर्ज करें'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {userComplaints.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-slate-150 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all bg-slate-50/40 relative overflow-hidden"
                    >
                      {/* Priority flag corner */}
                      <div className="absolute top-0 right-0">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-bl-xl border-l border-b border-slate-150 uppercase tracking-wider text-white ${
                          item.priority === 'Emergency' ? 'bg-red-600' :
                          item.priority === 'High' ? 'bg-orange-600' :
                          item.priority === 'Medium' ? 'bg-amber-600' : 'bg-slate-500'
                        }`}>
                          {item.priority}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-5">
                        {/* Image wrapper */}
                        {item.photoPreview && (
                          <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-3xs">
                            <img src={item.photoPreview} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Content text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1.5 text-[10px] text-slate-400 font-bold uppercase">
                              <span className="text-blue-950 font-extrabold">{item.id}</span>
                              <span className="text-slate-300">•</span>
                              <span>{item.date} {item.time}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-orange-600">{item.category}</span>
                            </div>
                            <h4 className="text-base font-black text-slate-900 leading-tight mb-2 truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{item.landmark}</span>
                            </p>
                          </div>

                          {/* Visual Progress Stepper for Citizen */}
                          <div className="bg-white border border-slate-200/60 rounded-xl p-3 mb-3.5">
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                              {language === 'English' ? 'SLA Milestone Tracker' : 'SLA मील का पत्थर ट्रैकर'}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-bold text-slate-500">
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold bg-emerald-500`}>✓</div>
                                <span className="text-emerald-800 text-[9px]">{language === 'English' ? 'Logged' : 'दर्ज'}</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 border-l border-slate-100">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${
                                  item.status !== 'Pending' ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}>{item.status !== 'Pending' ? '✓' : '2'}</div>
                                <span className={`${item.status !== 'Pending' ? 'text-emerald-800' : 'text-slate-400'} text-[9px]`}>
                                  {language === 'English' ? 'Inspected' : 'निरीक्षण'}
                                </span>
                              </div>
                              <div className="flex flex-col items-center gap-1 border-l border-slate-100">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${
                                  item.status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}>{item.status === 'Resolved' ? '✓' : '3'}</div>
                                <span className={`${item.status === 'Resolved' ? 'text-emerald-800' : 'text-slate-400'} text-[9px]`}>
                                  {language === 'English' ? 'Resolved' : 'समाधान'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                            <div>{getStatusBadge(item.status)}</div>
                            <Link 
                              to={`/complaint/${item.id}`}
                              className="text-xs font-extrabold text-blue-900 hover:text-blue-950 flex items-center gap-0.5 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                            >
                              <span>{language === 'English' ? 'Live Resolution Feed' : 'सक्रिय समाधान फ़ीड'}</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Google/Gmail link center and Profile Statistics (4 columns) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Interactive Gmail Notification Center Widget */}
            <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl pointer-events-none opacity-40"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="bg-orange-50 text-orange-600 p-2.5 rounded-2xl border border-orange-100 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                {getAccessToken() ? (
                  <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ● {language === 'English' ? 'Gmail Synced' : 'जीमेल सिंक्ड'}
                  </span>
                ) : (
                  <span className="bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ⚠️ {language === 'English' ? 'Alerts Idle' : 'अलर्ट निष्क्रिय'}
                  </span>
                )}
              </div>

              <h4 className="text-base font-black text-slate-900 mb-1">
                {language === 'English' ? 'Gmail Notifications Hub' : 'जीमेल अलर्ट सेंटर'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                {language === 'English' 
                  ? 'Connect with secure Google Accounts single sign-on to authorize instant, high-priority municipal receipts.' 
                  : 'सटीक ईमेल रसीदें प्राप्त करने के लिए सुरक्षित गूगल खाते से कनेक्ट करें।'}
              </p>

              {/* Status messages */}
              {googleStatusMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{googleStatusMsg}</span>
                </div>
              )}

              {googleStatusError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{googleStatusError}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {!getAccessToken() ? (
                  <button
                    onClick={handleLinkGoogle}
                    disabled={isGoogleLinking}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleLinking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                    ) : (
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                    )}
                    <span>{isGoogleLinking ? 'Linking Account...' : 'Link Google/Gmail Account'}</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold truncate flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Authenticated: {user.email}</span>
                    </div>

                    <button
                      onClick={handleSendTestEmail}
                      disabled={isSendingTestEmail}
                      className="w-full bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingTestEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Notification'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information details */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
                {language === 'English' ? 'Verified Account Credentials' : 'सत्यापित खाता विवरण'}
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">{language === 'English' ? 'Citizen ID' : 'नागरिक आईडी'}</span>
                  <span className="font-mono text-slate-700 font-bold">CN-IN-{(user.name.slice(0, 3) + user.ward.slice(5, 8)).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">{language === 'English' ? 'Authority Desk' : 'प्राधिकरण डेस्क'}</span>
                  <span className="text-slate-700 font-bold">{user.ward.split('(')[0].trim()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 text-right">
                  <span className="text-slate-400 font-semibold text-left">{language === 'English' ? 'Registered Email' : 'पंजीकृत ईमेल'}</span>
                  <span className="text-slate-700 font-bold truncate max-w-[150px]" title={user.email}>{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400 font-semibold">{language === 'English' ? 'SLA Class' : 'SLA श्रेणी'}</span>
                  <span className="text-slate-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>High Priority Citizen</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Ward Consensus Nearby Feed */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                  {language === 'English' ? 'Ward Consensus Feed' : 'वार्ड आम सहमति फीड'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {language === 'English' ? 'Upvote nearby public defects to boost resolving priority' : 'समाधान प्राथमिकता बढ़ाने के लिए वोट करें'}
                </p>
              </div>

              {nearbyIssues.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No nearby issues found.</p>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {nearbyIssues.map(issue => (
                    <div key={issue.id} className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150 transition-colors flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-extrabold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded uppercase mb-1 inline-block">
                          {issue.category}
                        </span>
                        <h5 className="text-[11px] font-black text-slate-900 truncate leading-tight mb-0.5">{issue.title}</h5>
                        <p className="text-[9px] text-slate-400 truncate">{issue.landmark}</p>
                      </div>
                      <button
                        onClick={() => handleUpvote(issue.id)}
                        disabled={hasVoted(issue.id)}
                        className={`p-2 rounded-lg shrink-0 transition-all flex flex-col items-center gap-0.5 border ${
                          hasVoted(issue.id)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-blue-900'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-[8px] font-black">{issue.upvotes}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
