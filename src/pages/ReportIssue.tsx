import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Camera, MapPin, AlertCircle, ArrowRight, ArrowLeft, RotateCcw, 
  Sparkles, Lock, Mail, User as UserIcon, CheckCircle2 
} from 'lucide-react';
import Header from '../components/Header';
import { addComplaint, getCurrentUser, signupUser, signinUser, User, getUsers, setCurrentUser } from '../lib/storage';
import { useFormAutoSave } from '../hooks/useFormAutoSave';
import { useLanguage } from '../context/LanguageContext';
import VoiceRecorder from '../components/VoiceRecorder';
import { STATES_AND_UTS } from '../lib/statesData';
import { googleSignIn, getAccessToken, sendWelcomeEmail, sendComplaintEmail, initAuth } from '../lib/firebaseAuth';

const CAPITAL_COORDINATES: Record<string, { lat: string, lng: string }> = {
  'Amaravati': { lat: '16.5062', lng: '80.6480' },
  'Itanagar': { lat: '27.0844', lng: '93.6053' },
  'Dispur': { lat: '26.1433', lng: '91.7898' },
  'Patna': { lat: '25.5941', lng: '85.1376' },
  'Raipur': { lat: '21.2514', lng: '81.6296' },
  'Panaji': { lat: '15.4909', lng: '73.8278' },
  'Gandhinagar': { lat: '23.2156', lng: '72.6369' },
  'Chandigarh': { lat: '30.7333', lng: '76.7794' },
  'Shimla': { lat: '31.1048', lng: '77.1734' },
  'Ranchi': { lat: '23.3441', lng: '85.3096' },
  'Bengaluru': { lat: '12.9716', lng: '77.5946' },
  'Thiruvananthapuram': { lat: '8.5241', lng: '76.9366' },
  'Bhopal': { lat: '23.2599', lng: '77.4126' },
  'Mumbai': { lat: '19.0760', lng: '72.8777' },
  'Imphal': { lat: '24.8170', lng: '93.9368' },
  'Shillong': { lat: '25.5788', lng: '91.8831' },
  'Aizawl': { lat: '23.7307', lng: '92.7173' },
  'Kohima': { lat: '25.6751', lng: '94.1086' },
  'Bhubaneswar': { lat: '20.2961', lng: '85.8245' },
  'Jaipur': { lat: '26.9124', lng: '75.7873' },
  'Gangtok': { lat: '27.3314', lng: '88.6138' },
  'Chennai': { lat: '13.0827', lng: '80.2707' },
  'Hyderabad': { lat: '17.3850', lng: '78.4867' },
  'Agartala': { lat: '23.8315', lng: '91.2868' },
  'Lucknow': { lat: '26.8467', lng: '80.9462' },
  'Dehradun': { lat: '30.3165', lng: '78.0322' },
  'Kolkata': { lat: '22.5726', lng: '88.3639' },
  'Port Blair': { lat: '11.6234', lng: '92.7265' },
  'Daman': { lat: '20.3974', lng: '72.8328' },
  'New Delhi': { lat: '28.6139', lng: '77.2090' },
  'Srinagar': { lat: '34.0837', lng: '74.7973' },
  'Leh': { lat: '34.1526', lng: '77.5771' },
  'Kavaratti': { lat: '10.5667', lng: '72.6417' },
  'Puducherry': { lat: '11.9416', lng: '79.8083' },
};

export default function ReportIssue() {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedValue = location.state?.preselectedCategory || '';
  const { t, language } = useLanguage();

  
  const {
    step,
    setStep,
    category,
    setCategory,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    landmark,
    setLandmark,
    description,
    setDescription,
    citizenName,
    setCitizenName,
    email,
    setEmail,
    photoPreview,
    setPhotoPreview,
    photoName,
    setPhotoName,
    priority,
    setPriority,
    clearDraft,
  } = useFormAutoSave(preselectedValue);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [selectedStateIndex, setSelectedStateIndex] = useState(6); // Default to Gujarat (Index 6)
  const [authWard, setAuthWard] = useState('Ward 09 (Amin Marg / Kalavad Rd, Rajkot, Gujarat)');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // AI Categorization State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');

  const handleVoiceTranscript = (text: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${text}` : text;
    });
  };

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const initCamera = async () => {
      if (isCameraActive) {
        setCameraError('');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err: any) {
          console.error('Error accessing camera:', err);
          setCameraError('Could not access camera. Please check permissions or upload a file instead.');
          setIsCameraActive(false);
        }
      }
    };

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoPreview(dataUrl);
        setPhotoName(`Camera_Capture_${Date.now()}.jpg`);
        stopCamera();
      }
    }
  };

  // Pre-fill citizen details from user session if available
  useEffect(() => {
    const active = getCurrentUser();
    if (active) {
      setCurrentUser(active);
      if (!citizenName) setCitizenName(active.name);
      if (!email) setEmail(active.email);
    }

    // Connect Google Auth state
    const unsubscribe = initAuth((firebaseUser, token) => {
      const existingUsers = getUsers();
      let localUser = existingUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
      if (localUser) {
        setCurrentUser(localUser);
        if (!citizenName) setCitizenName(localUser.name);
        if (!email) setEmail(localUser.email);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [citizenName, email, setCitizenName, setEmail]);

  // Automatically capture user's current GPS coordinates on component mount (New Report Start)
  useEffect(() => {
    if (!latitude && !longitude) {
      if (navigator.geolocation) {
        setIsLocating(true);
        setLocationError('');
        setLocationSuccess(false);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toFixed(6));
            setLongitude(position.coords.longitude.toFixed(6));
            setIsLocating(false);
            setLocationSuccess(true);
            if (!landmark) {
              setLandmark('Detected GPS Spot, India');
            }
          },
          (error) => {
            setIsLocating(false);
            console.log('Auto geolocation lookup on report start was declined or timed out.');
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }
  }, []);

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
        setAuthSuccess('Account registered! You can now file your complaint.');
        setCurrentUser(res.user);
        setCitizenName(res.user.name);
        setEmail(res.user.email);
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
        setAuthSuccess('Welcome back! You can now file your complaint.');
        setCurrentUser(res.user);
        setCitizenName(res.user.name);
        setEmail(res.user.email);
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
          // New sign up via Google
          const signupRes = signupUser(
            firebaseUser.displayName || 'Google Citizen',
            firebaseUser.email,
            authWard,
            '' // No password for Google SSO
          );
          if (signupRes.success && signupRes.user) {
            localUser = signupRes.user;
            setAuthSuccess('Successfully registered and joined JanSewa via Google SSO!');
            // Send welcome email via Gmail!
            await sendWelcomeEmail(accessToken, firebaseUser.email, firebaseUser.displayName || 'Google Citizen');
          } else {
            throw new Error(signupRes.error || 'Failed to create local account for Google SSO');
          }
        } else if (localUser) {
          setCurrentUser(localUser);
          setAuthSuccess(`Welcome back, ${localUser.name}! (Signed in with Google)`);
        }

        if (localUser) {
          setCitizenName(localUser.name);
          setEmail(localUser.email);
        }
      }
    } catch (err: any) {
      console.error('Google SSO login failed in report:', err);
      setAuthError('Google Sign-In failed or was cancelled.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleAICategorize = async () => {
    if (!description.trim()) {
      setAiError('Please enter an issue description first so the AI can analyze it.');
      return;
    }

    setIsAnalyzing(true);
    setAiError('');
    setAiFeedback('');

    try {
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error('AI Server responded with an error');
      }

      const data = await response.json();
      if (data.category) {
        setCategory(data.category);
        setAiFeedback(`AI detected this is related to "${data.category}". (${data.reason})`);
      } else {
        setAiError('AI was unable to determine a category. Please choose manually.');
      }
    } catch (err: any) {
      console.error('AI Categorization Error:', err);
      // Fallback rule-based matching if backend fails
      const descLower = description.toLowerCase();
      let fallbackCategory = 'Something Else';
      let fallbackReason = 'Rule-based fallback used because of server/API limitations.';

      if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('pipeline') || descLower.includes('contamination') || descLower.includes('supply')) {
        fallbackCategory = 'Water Supply';
        fallbackReason = 'Detected water or supply terms in description.';
      } else if (descLower.includes('garbage') || descLower.includes('clean') || descLower.includes('sanitation') || descLower.includes('waste') || descLower.includes('dump') || descLower.includes('litter') || descLower.includes('sweep') || descLower.includes('dirt')) {
        fallbackCategory = 'Sanitation';
        fallbackReason = 'Detected sanitation or garbage terms in description.';
      } else if (descLower.includes('road') || descLower.includes('pothole') || descLower.includes('street') || descLower.includes('bridge') || descLower.includes('asphalt') || descLower.includes('tar') || descLower.includes('flyover')) {
        fallbackCategory = 'Roads';
        fallbackReason = 'Detected road or pothole terms in description.';
      }

      setCategory(fallbackCategory);
      setAiFeedback(`AI fallback detected category: "${fallbackCategory}". Reason: ${fallbackReason}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetForm = () => {
    if (confirm('Are you sure you want to clear all form fields and reset your draft?')) {
      clearDraft();
      setStep(1);
      setCategory('');
      setLatitude('');
      setLongitude('');
      setLandmark('');
      setDescription('');
      if (currentUser) {
        setCitizenName(currentUser.name);
        setEmail(currentUser.email);
      } else {
        setCitizenName('');
        setEmail('');
      }
      setPhotoPreview('');
      setPhotoName('');
      setPriority('Medium');
      setLocationSuccess(false);
      setLocationError('');
      setAiFeedback('');
      setAiError('');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setIsLocating(false);
        setLocationSuccess(true);
        if (!landmark) {
          setLandmark('Detected GPS Spot, India');
        }
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access in browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('Failed to retrieve location.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSetMockLocation = () => {
    setLatitude('28.628900');
    setLongitude('77.215000');
    setLandmark('Ward 08 (Connaught Place, New Delhi)');
    setLocationSuccess(true);
    setLocationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to custom persistent storage
    const newComplaint = addComplaint({
      category,
      title: `${category} issue near ${landmark || 'Location'}`,
      description,
      latitude: latitude || '28.628900',
      longitude: longitude || '77.215000',
      landmark: landmark || 'Ward 08 (Connaught Place, New Delhi)',
      photoPreview: photoPreview || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=300&fit=crop',
      citizenName: citizenName || currentUser?.name || 'Anonymous Citizen',
      email: email || currentUser?.email || 'N/A',
      ward: currentUser?.ward || 'Ward 08 (Connaught Place, New Delhi)',
      priority
    });

    // Clear local storage draft upon successful submit
    clearDraft();

    // Check if we have Google Gmail auth token to dispatch instant alert
    const token = getAccessToken();
    const userEmail = email || currentUser?.email;
    if (token && userEmail && userEmail !== 'N/A') {
      sendComplaintEmail(
        token,
        userEmail,
        citizenName || currentUser?.name || 'Anonymous Citizen',
        newComplaint,
        window.location.origin
      ).catch(err => console.error('Error dispatching complaint receipt email:', err));
    }

    // Navigate with the new complaint object!
    navigate('/submitted', {
      state: {
        complaint: newComplaint
      }
    });
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-40 py-8 lg:py-12">
        <div className="max-w-5xl mx-auto">
          
          {!currentUser ? (
            /* User is NOT logged in: Beautiful tabbed login/register card block */
            <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl mt-8">
              <div className="text-center mb-8">
                <span className="text-xs font-black text-blue-900 uppercase tracking-widest bg-blue-100/80 px-3.5 py-1.5 rounded-full mb-3 inline-block">
                  Citizen Credentials Required
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Sign In to Log Grievances
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  To ensure accountability and prevent fake complaint filings, JanSewa requires all citizens to authenticate. Your ward engineer will use these details to contact you.
                </p>
              </div>

              {/* Form Navigation Tabs */}
              <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
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
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900"
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
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900"
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
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-900"
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
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-900 cursor-pointer"
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
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-900 cursor-pointer"
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
                  className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-md transition-colors"
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
            </div>
          ) : (
            /* User is logged in: Let them file the complaint */
            <>
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">{t('report.title')}</h1>
                  <p className="text-lg text-slate-600">
                    {language === 'English' ? (
                      <>Representing {currentUser.ward}. Help us keep your city clean and safe.</>
                    ) : (
                      <>प्रतिनिधित्व {currentUser.ward}। अपने शहर को स्वच्छ और सुरक्षित रखने में हमारी मदद करें।</>
                    )}
                  </p>
                </div>
                
                {/* Draft Auto-save Indicator */}
                <div className="flex items-center gap-2 self-start sm:self-center bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-900 shadow-sm animate-fade-in shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{language === 'English' ? 'Draft Auto-Saved' : 'प्रारूप स्वतः सहेजा गया'}</span>
                  <button 
                    type="button" 
                    onClick={handleResetForm}
                    className="ml-2 hover:text-red-600 text-slate-500 flex items-center gap-1 border-l border-blue-200 pl-2 transition-colors"
                    title="Reset form and draft"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {language === 'English' ? 'Reset' : 'रीसेट'}
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900">
                    {language === 'English' ? `Step ${step} of 2` : `चरण ${step}/2`}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    {step === 1 ? (language === 'English' ? 'Categorize the issue' : 'समस्या का वर्गीकरण करें') : (language === 'English' ? 'Upload Evidence' : 'साक्ष्य अपलोड करें')}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-900 rounded-full transition-all duration-500 ease-out`} style={{ width: step === 1 ? '50%' : '100%' }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  {step === 1 ? (
                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 text-white text-sm">1</span>
                        {language === 'English' ? 'Select Issue Category' : 'शिकायत श्रेणी का चयन करें'}
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {['Sanitation', 'Roads', 'Water Supply', 'Streetlights', 'Parks', 'Stray Animals', 'Drainage and Sewerage', 'Illegal Construction', 'Something Else'].map((cat) => (
                          <label key={cat} className="relative group cursor-pointer">
                            <input 
                              type="radio" 
                              name="category" 
                              value={cat} 
                              className="peer sr-only" 
                              checked={category === cat}
                              onChange={(e) => setCategory(e.target.value)} 
                            />
                            <div className="p-4 h-full rounded-xl border-2 border-slate-200 bg-slate-50 peer-checked:border-blue-900 peer-checked:bg-blue-50 transition-all flex flex-col justify-center">
                              <h3 className="font-bold text-slate-900 text-sm">{cat}</h3>
                            </div>
                          </label>
                        ))}
                      </div>
                      {category === 'Something Else' && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2 animate-fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-blue-800" />
                          <span>Please select this option if your grievance doesn't fall under other specific categories. You'll be able to describe the issue in detail in the next step.</span>
                        </div>
                      )}
                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => setStep(2)}
                          disabled={!category}
                          className="px-8 py-3.5 rounded-lg bg-blue-900 text-white font-bold text-lg shadow-lg disabled:opacity-50 flex items-center gap-2">
                          Next Step <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100 h-full flex flex-col">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 text-white text-sm">2</span>
                        Upload Photo & Pin Location
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                        {/* Left Column: Photo Upload & Description */}
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Photo Evidence</label>
                            {!photoPreview ? (
                              isCameraActive ? (
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 bg-black flex flex-col justify-between">
                                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-mono z-10 animate-pulse">
                                    LIVE CAMERA
                                  </div>
                                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4 z-10">
                                    <button
                                      type="button"
                                      onClick={capturePhoto}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
                                    >
                                      <Camera className="w-4 h-4" />
                                      Capture Snapshot
                                    </button>
                                    <button
                                      type="button"
                                      onClick={stopCamera}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <label className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                      <Camera className="w-8 h-8 text-blue-900 mb-2" />
                                      <p className="mb-1 text-sm font-bold text-slate-700">Upload Photo</p>
                                      <p className="text-xs text-slate-400">Click or drag & drop image</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setIsCameraActive(true)}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl py-3 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                  >
                                    <Camera className="w-4 h-4 shrink-0" />
                                    Take Live Photo with Camera
                                  </button>
                                  {cameraError && (
                                    <p className="text-[10px] text-red-600 font-semibold">{cameraError}</p>
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="space-y-3">
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 group">
                                  <img src={photoPreview} alt="Evidence preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <label className="bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 flex items-center gap-1 shadow-md">
                                      Upload New
                                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPhotoPreview('');
                                        setIsCameraActive(true);
                                      }}
                                      className="bg-blue-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-blue-800 flex items-center gap-1 shadow-md"
                                    >
                                      <Camera className="w-3.5 h-3.5" />
                                      Retake Live
                                    </button>
                                  </div>
                                  {photoName && (
                                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded truncate max-w-[90%] font-mono">
                                      {photoName}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPhotoPreview('');
                                      setPhotoName('');
                                    }}
                                    className="text-xs text-red-600 hover:underline font-semibold"
                                  >
                                    Remove Photo
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 font-sans">Priority Level</label>
                            <select
                              id="priority-select"
                              value={priority}
                              onChange={(e) => setPriority(e.target.value as any)}
                              className="w-full rounded-xl border-slate-200 border p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white font-semibold text-slate-700"
                            >
                              <option value="Low">Low (Non-urgent improvement)</option>
                              <option value="Medium">Medium (Standard resolution queue)</option>
                              <option value="High">High (Urgent attention needed)</option>
                              <option value="Emergency">Emergency (Immediate hazard / safety concern)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">Select priority to help municipal engineers triage requests correctly.</p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-bold text-slate-700 font-sans">Issue Description</label>
                              <button
                                type="button"
                                onClick={handleAICategorize}
                                disabled={isAnalyzing || !description.trim()}
                                className="text-xs font-bold text-blue-900 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1 bg-blue-50 border border-blue-100/60 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                <Sparkles className={`w-3.5 h-3.5 text-blue-900 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                {isAnalyzing ? 'AI Classifying...' : 'Detect Category with AI'}
                              </button>
                            </div>
                            <textarea
                              rows={4}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Provide descriptive details about the problem (e.g. water pipeline leakage, open garbage bin, broken asphalt, or street lamp issues)..."
                              className="w-full rounded-xl border-slate-200 border p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                            />
                            
                            {/* Voice Note Recorder with AI Speech-to-Text */}
                            <VoiceRecorder onTranscriptComplete={handleVoiceTranscript} />
                            
                            {aiFeedback && (
                              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
                                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="font-semibold">{aiFeedback}</span>
                              </div>
                            )}

                            {aiError && (
                              <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2 animate-fade-in">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span className="font-semibold">{aiError}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Location Details */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Incident Location Setup</label>
                            
                            {/* Toggle Mode Tab Bar */}
                            <div className="grid grid-cols-2 bg-slate-150 p-1 rounded-xl mb-3 border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setLocationMode('gps')}
                                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${locationMode === 'gps' ? 'bg-white text-blue-900 shadow-sm font-extrabold border border-slate-100' : 'text-slate-600 hover:text-slate-900'}`}
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                On-Site GPS (Auto)
                              </button>
                              <button
                                type="button"
                                onClick={() => setLocationMode('manual')}
                                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${locationMode === 'manual' ? 'bg-white text-blue-900 shadow-sm font-extrabold border border-slate-100' : 'text-slate-600 hover:text-slate-900'}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Remote / Manual Entry
                              </button>
                            </div>

                            {locationMode === 'gps' ? (
                              // GPS Auto Detect mode
                              <div className="space-y-4 animate-fade-in">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">Auto-Detect GPS Signals</p>
                                    <p className="text-[10px] text-slate-500">Perfect if you are reporting right from the incident spot.</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={isLocating}
                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg shadow-sm border transition-all ${
                                      isLocating 
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : locationSuccess
                                          ? 'bg-emerald-600 text-white border-transparent'
                                          : 'bg-orange-600 hover:bg-orange-700 text-white border-transparent'
                                    }`}
                                  >
                                    <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-bounce text-slate-400' : ''}`} />
                                    {isLocating ? 'Detecting...' : locationSuccess ? 'GPS Secured ✓' : 'Detect My Location'}
                                  </button>
                                </div>

                                {/* Read-only Coordinates Display for Auto GPS */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Latitude (Sensor)</label>
                                    <input
                                      type="text"
                                      readOnly
                                      value={latitude}
                                      placeholder="Auto-detected"
                                      className="w-full rounded-xl border-slate-200 border p-2.5 text-xs focus:outline-none font-mono bg-slate-100 text-slate-500 cursor-not-allowed"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Longitude (Sensor)</label>
                                    <input
                                      type="text"
                                      readOnly
                                      value={longitude}
                                      placeholder="Auto-detected"
                                      className="w-full rounded-xl border-slate-200 border p-2.5 text-xs focus:outline-none font-mono bg-slate-100 text-slate-500 cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Fully Manual entry mode
                              <div className="space-y-4 animate-fade-in">
                                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                                  <span className="font-bold">Reporting Remotely?</span> You can type in the exact GPS coordinates and landmark details manually below.
                                </div>

                                {/* State/UT coordinates prefill utility */}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quick Coordinate Prefills (All India Capitals)</label>
                                  <select
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val && CAPITAL_COORDINATES[val]) {
                                        setLatitude(CAPITAL_COORDINATES[val].lat);
                                        setLongitude(CAPITAL_COORDINATES[val].lng);
                                        setLandmark(`${val} Capital District, India`);
                                        setLocationSuccess(true);
                                        setLocationError('');
                                      }
                                    }}
                                    className="w-full rounded-xl border-slate-200 border p-2.5 text-xs bg-white text-slate-700 font-medium focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                                  >
                                    <option value="">-- Choose State Capital Preset --</option>
                                    {Object.keys(CAPITAL_COORDINATES).sort().map((city) => (
                                      <option key={city} value={city}>
                                        {city} ({CAPITAL_COORDINATES[city].lat}°, {CAPITAL_COORDINATES[city].lng}°)
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Fully Editable Coordinates Input */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Manual Latitude</label>
                                    <input
                                      type="text"
                                      value={latitude}
                                      onChange={(e) => {
                                        setLatitude(e.target.value);
                                        setLocationSuccess(true);
                                      }}
                                      placeholder="e.g. 28.613900"
                                      className="w-full rounded-xl border-slate-300 border p-2.5 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none font-mono bg-white font-semibold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Manual Longitude</label>
                                    <input
                                      type="text"
                                      value={longitude}
                                      onChange={(e) => {
                                        setLongitude(e.target.value);
                                        setLocationSuccess(true);
                                      }}
                                      placeholder="e.g. 77.209000"
                                      className="w-full rounded-xl border-slate-300 border p-2.5 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none font-mono bg-white font-semibold"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Manual Address Typing System (Available in both modes but highly emphasized) */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Landmark / Street Address / Locality
                              </label>
                              <input
                                type="text"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                placeholder="e.g. Amin Marg, near Kotecha Chowk"
                                className="w-full rounded-xl border-slate-300 border p-2.5 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none font-semibold text-slate-800 bg-white"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">
                                Be as descriptive as possible (e.g., house number, shop names) to help inspectors navigate.
                              </p>
                            </div>

                            {/* Success Message */}
                            {locationSuccess && (
                              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
                                <span className="font-bold text-emerald-600">✓</span>
                                <span>Grievance coordinates successfully locked. Incident is mapped correctly.</span>
                              </div>
                            )}

                            {/* Error Message with Fallback */}
                            {locationError && (
                              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex flex-col gap-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-red-600">✕</span>
                                  <span>{locationError}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleSetMockLocation}
                                  className="text-[11px] font-bold text-blue-900 hover:underline text-left self-start mt-1 flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3 text-blue-900" /> Use Sample New Delhi GPS Coordinates Fallback
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Citizen Contact Details for Email Alerts Section (Pre-populated) */}
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 md:p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-blue-900 shrink-0" />
                            <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
                              Citizen Contact & Email Alerts Setup
                            </h4>
                          </div>
                          <p className="text-xs text-blue-800/90 mb-4 max-w-2xl leading-relaxed">
                            These details were automatically filled from your active citizen session. Your local ward engineer will use these to post-resolve updates.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Your Full Name</label>
                              <input
                                type="text"
                                required
                                readOnly
                                value={citizenName}
                                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email Address (For Status Alerts)</label>
                              <input
                                type="email"
                                required
                                readOnly
                                value={email}
                                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg border border-slate-300 font-bold flex items-center gap-2">
                          <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                        <button 
                          onClick={handleSubmit} 
                          disabled={!category || !description}
                          className="px-8 py-3.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                          Submit Complaint <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" /> AI Classification
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enter your issue's description in Step 2 and click <span className="font-bold text-blue-900">Detect Category with AI</span> to automatically identify if it relates to <span className="font-bold">Water Supply, Sanitation, or Roads</span>.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" /> Helpful Tips
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600 list-disc list-inside">
                      <li>Choose the most specific category for faster SLA resolution.</li>
                      <li>Clear photos help our on-field teams trace the spot 3x faster.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
