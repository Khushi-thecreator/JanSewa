import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Languages, Users, PlusCircle, Camera, Menu, X, LogOut, User as UserIcon, UserPlus } from 'lucide-react';
import { getCurrentUser, logoutUser, User, getCurrentAdmin } from '../lib/storage';
import { useLanguage, Language } from '../context/LanguageContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Poll for user updates on mount or path change
  useEffect(() => {
    setUser(getCurrentUser());
    setIsAdmin(!!getCurrentAdmin());
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/');
  };

  const handleAuthClick = () => {
    setIsMenuOpen(false);
    if (user) {
      navigate('/dashboard');
    } else if (location.pathname === '/') {
      const element = document.getElementById('auth-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('auth-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    return isActive(path)
      ? 'text-blue-950 font-bold hover:text-blue-900 transition-colors border-b-2 border-blue-900 pb-1 text-xs xl:text-sm'
      : 'text-slate-600 hover:text-blue-900 transition-colors py-1 text-xs xl:text-sm font-semibold';
  };

  const getMobileLinkClass = (path: string) => {
    return isActive(path)
      ? 'text-blue-900 font-bold bg-blue-50/50 px-3 py-2 rounded-lg transition-colors'
      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-blue-900 text-white p-2.5 rounded-xl shadow-md shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">JanSewa</h1>
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">Gov</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide uppercase truncate">{t('nav.portal_subtitle')}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <div className="flex gap-5 xl:gap-6 items-center">
              <Link to="/" className={getLinkClass('/')}>{t('nav.home')}</Link>
              <Link to="/gallery" className={getLinkClass('/gallery')}>{t('nav.gallery')}</Link>
              <Link to="/standards" className={getLinkClass('/standards')}>{t('nav.standards')}</Link>
              {isAdmin && <Link to="/map" className={getLinkClass('/map')}>{t('nav.map')}</Link>}
              {user && <Link to="/dashboard" className={getLinkClass('/dashboard')}>{language === 'English' ? 'Dashboard' : 'डैशबोर्ड'}</Link>}
              <Link to="/notifications" className={getLinkClass('/notifications')}>{t('nav.alerts')}</Link>
              <Link to="/help" className={getLinkClass('/help')}>{t('nav.help')}</Link>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 xl:gap-4">
              <div className="relative">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 pl-8 pr-5 rounded-lg text-xs font-semibold cursor-pointer focus:ring-1 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                </select>
                <Languages className="absolute left-2.5 top-2.5 text-slate-500 w-3.5 h-3.5 pointer-events-none" />
              </div>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700 max-w-[110px] truncate" title={user.name}>{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <Link to="/admin" className="text-slate-600 hover:text-blue-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{t('nav.officer_login')}</span>
                </Link>
              )}
              <Link to="/report" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-orange-600/30 transition-all flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                {t('nav.report_issue')}
              </Link>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            {user ? (
              <button 
                onClick={handleAuthClick}
                className="bg-orange-600 text-white p-2 rounded-lg text-xs font-bold shadow-md cursor-pointer" 
                aria-label="User Profile"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleAuthClick}
                className="bg-orange-600 text-white p-2 rounded-lg text-xs font-bold shadow-md cursor-pointer" 
                aria-label="Login or Sign Up"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              aria-label="Toggle main menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Responsive Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white shadow-inner animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div className="flex flex-col space-y-2.5 text-sm font-semibold text-slate-600">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={getMobileLinkClass('/')}
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/gallery" 
                onClick={() => setIsMenuOpen(false)}
                className={getMobileLinkClass('/gallery')}
              >
                {t('nav.gallery')}
              </Link>
              <Link 
                to="/standards" 
                onClick={() => setIsMenuOpen(false)}
                className={getMobileLinkClass('/standards')}
              >
                {t('nav.standards')}
              </Link>
              {isAdmin && (
                <Link 
                  to="/map" 
                  onClick={() => setIsMenuOpen(false)}
                  className={getMobileLinkClass('/map')}
                >
                  {t('nav.map')}
                </Link>
              )}
              {user && (
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className={getMobileLinkClass('/dashboard')}
                >
                  {language === 'English' ? 'Citizen Dashboard' : 'नागरिक डैशबोर्ड'}
                </Link>
              )}
              <Link 
                to="/notifications" 
                onClick={() => setIsMenuOpen(false)}
                className={getMobileLinkClass('/notifications')}
              >
                {t('nav.alerts')}
              </Link>
              <Link 
                to="/help" 
                onClick={() => setIsMenuOpen(false)}
                className={getMobileLinkClass('/help')}
              >
                {t('nav.help')}
              </Link>
            </div>
            
            <hr className="border-slate-100" />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <div className="relative w-full sm:w-auto">
                <select 
                  value={language} 
                  onChange={(e) => {
                    setLanguage(e.target.value as Language);
                    setIsMenuOpen(false);
                  }}
                  className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-9 pr-8 rounded-xl text-xs font-semibold cursor-pointer focus:ring-1 focus:ring-blue-900"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                </select>
                <Languages className="absolute left-3 top-3 text-slate-500 w-3.5 h-3.5 pointer-events-none" />
              </div>

              <div className="flex flex-col gap-2 w-full">
                {user ? (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{user.name}</span>
                        <span className="text-[10px] text-slate-500">{user.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    {t('nav.officer_login')}
                  </Link>
                )}
                <Link 
                  to="/report" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {t('nav.report_issue')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
