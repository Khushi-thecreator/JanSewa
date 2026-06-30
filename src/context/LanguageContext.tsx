import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'English' | 'Hindi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<Language, Record<string, string>> = {
  English: {
    // Navigation
    "nav.home": "Home",
    "nav.gallery": "Resolution Gallery",
    "nav.standards": "Civic Standards",
    "nav.map": "Ward Map",
    "nav.alerts": "Alerts",
    "nav.help": "Help & FAQ",
    "nav.officer_login": "Officer Login",
    "nav.logout": "Logout",
    "nav.report_issue": "Report Issue",
    "nav.portal_subtitle": "National Swachh & Civic Redressal",

    // Hero Section
    "hero.badge": "LATEST STAKEHOLDER UPDATE",
    "hero.title": "Transparent & Actionable Civic Redressal for India",
    "hero.subtitle": "Report civic issues such as potholes, waste accumulation, streetlights, or drainage failures. Track dynamic real-time progress and receive certified resolution evidence.",
    "hero.pothole_pioneer": "Pothole Pioneer Campaign Active in Delhi & Gujarat subdivisions",
    "hero.active_campaign": "Active Campaign",
    "hero.file_complaint": "File a New Complaint",
    "hero.quick_report": "Report Anonymously",
    "hero.track_complaint": "Track Existing Complaint",
    "hero.admin_portal": "Enter Admin Portal",

    // Dashboard & Stats
    "dashboard.title": "Real-time Swachh Grievance Feed",
    "dashboard.subtitle": "Consolidated public ledger tracking response metrics across municipality subdivisions",
    "stats.filed": "Total Grievances",
    "stats.resolved": "Fully Resolved",
    "stats.active": "In Progress",
    "stats.pending": "Pending Audit",
    "stats.pothole_resolved": "Pothole Campaign Resolved",

    // Citizen Desk
    "citizen.title": "Your Citizen Action Desk",
    "citizen.subtitle": "Track your active complaints or review nearby public incidents needing your upvotes.",
    "citizen.filed_count": "Grievances Filed",
    "citizen.no_complaints": "No complaints filed from your account yet.",
    "citizen.need_help": "Need help or immediate redressal? Contact your Ward Engineer listed in the Ward Map.",
    "citizen.login_title": "Register or Sign In",
    "citizen.login_desc": "To ensure accountability and prevent fake complaint filings, JanSewa requires all citizens to authenticate.",

    // Form labels and actions
    "form.name": "Your Full Name",
    "form.email": "Your Email Address",
    "form.phone": "Mobile Number",
    "form.ward": "Your Registered Ward subdivision",
    "form.potholes": "Potholes & Roads",
    "form.garbage": "Garbage & Waste Accumulation",
    "form.water": "Water Contamination or Leakage",
    "form.lights": "Streetlight Malfunction",
    "form.drainage": "Drainage and Sewerage Overflow",
    "form.placeholder_name": "e.g. Smt. Priya Nair",
    "form.placeholder_email": "e.g. priya.nair@mail.in",
    "form.placeholder_phone": "e.g. +91 99999 00104",
    "form.auth_btn": "Login or Sign Up",
    "form.already_registered": "Already have an account? Sign in",
    "form.not_registered": "Need a new account? Register",
    "form.select_ward_first": "Please select your Ward first to see active issues.",

    // Report Issue Form
    "report.title": "Submit a New Civic Grievance",
    "report.subtitle": "Your report will be automatically routed to the designated Ward Resident Engineer based on GPS/Ward division.",
    "report.step1_title": "1. Live Camera / Image Verification",
    "report.step1_desc": "Upload before-repair photo to prevent fake complaints. Maximum 5MB size.",
    "report.step2_title": "2. Issue Categorization & Priority",
    "report.step2_desc": "Specify what kind of grievance you are submitting so it goes to the correct engineers.",
    "report.step3_title": "3. Location Details & Landmarks",
    "report.step3_desc": "Include exact address coordinates or nearby landmarks to help field crew find the spot.",
    "report.camera_take": "Take Live Photo with Camera",
    "report.camera_active": "Camera is active. Click capture to save.",
    "report.submit_success": "Complaint Submitted Successfully!",

    // Status tracking
    "track.title": "Track Redressal Progress",
    "track.subtitle": "Input your Unique Grievance ID to view SLA progress logs, assigned engineering crew, and resolution proof.",
    "track.search_placeholder": "e.g. JS-IND-2026-048",
    "track.get_updates": "Fetch SLA Updates",

    // General Words & Badges
    "badge.new": "NEW",
    "badge.urgent": "URGENT",
    "badge.swachh_certified": "SWACHH CERTIFIED",
    "status.pending": "Pending",
    "status.inprogress": "In Progress",
    "status.resolved": "Resolved",
    "priority.emergency": "Emergency",
    "priority.high": "High",
    "priority.medium": "Medium",
    "priority.low": "Low",

    "action.back": "Back to Citizen Desk",
    "action.submit": "Submit Complaint",
    "action.track": "Track Status",
    "action.reassign": "Reassign",
    "action.upvote": "Upvote",
    "action.view_map": "View Ward Map",
    "action.view_gallery": "View Resolution Gallery",
    "action.view_details": "View Full Details",
    "action.view_standards": "View Standards",
  },
  Hindi: {
    // Navigation
    "nav.home": "होम",
    "nav.gallery": "समाधान गैलरी",
    "nav.standards": "नागरिक मानक",
    "nav.map": "वार्ड मानचित्र",
    "nav.alerts": "अलर्ट",
    "nav.help": "सहायता और अक्सर पूछे जाने वाले प्रश्न",
    "nav.officer_login": "अधिकारी लॉगिन",
    "nav.logout": "लॉगआउट",
    "nav.report_issue": "शिकायत दर्ज करें",
    "nav.portal_subtitle": "राष्ट्रीय स्वच्छ और नागरिक निवारण पोर्टल",

    // Hero Section
    "hero.badge": "नवीनतम हितधारक अपडेट",
    "hero.title": "भारत के लिए पारदर्शी और त्वरित नागरिक निवारण पोर्टल",
    "hero.subtitle": "सड़क के गड्ढे, कचरा संचय, स्ट्रीटलाइट खराब होने या जल निकासी की विफलता जैसी नागरिक समस्याओं की रिपोर्ट करें। वास्तविक समय में प्रगति को ट्रैक करें और प्रमाणित समाधान प्रमाण प्राप्त करें।",
    "hero.pothole_pioneer": "दिल्ली और गुजरात के उपखंडों में 'पॉथोल पायनियर' अभियान सक्रिय",
    "hero.active_campaign": "सक्रिय अभियान",
    "hero.file_complaint": "नई शिकायत दर्ज करें",
    "hero.quick_report": "अनाम शिकायत दर्ज करें",
    "hero.track_complaint": "शिकायत की स्थिति ट्रैक करें",
    "hero.admin_portal": "एडमिन पोर्टल में प्रवेश करें",

    // Dashboard & Stats
    "dashboard.title": "वास्तविक समय स्वच्छ शिकायत फीड",
    "dashboard.subtitle": "नगरपालिका उपखंडों में प्रतिक्रिया मीट्रिक को ट्रैक करने वाला सार्वजनिक बहीखाता",
    "stats.filed": "कुल शिकायतें",
    "stats.resolved": "पूर्ण समाधान",
    "stats.active": "कार्य प्रगति पर",
    "stats.pending": "लंबित ऑडिट",
    "stats.pothole_resolved": "सुलझाए गए गड्ढे",

    // Citizen Desk
    "citizen.title": "आपका नागरिक एक्शन डेस्क",
    "citizen.subtitle": "अपनी सक्रिय शिकायतों को ट्रैक करें या आस-पास की उन सार्वजनिक घटनाओं की समीक्षा करें जिन्हें आपके समर्थन की आवश्यकता है।",
    "citizen.filed_count": "दर्ज की गई शिकायतें",
    "citizen.no_complaints": "आपके खाते से अभी तक कोई शिकायत दर्ज नहीं की गई है।",
    "citizen.need_help": "मदद या तत्काल निवारण की आवश्यकता है? वार्ड मानचित्र में सूचीबद्ध अपने वार्ड इंजीनियर से संपर्क करें।",
    "citizen.login_title": "पंजीकरण या साइन इन करें",
    "citizen.login_desc": "जवाबदेही सुनिश्चित करने और फर्जी शिकायतें रोकने के लिए जनसेवा सभी नागरिकों को प्रमाणित करने के लिए कहता है।",

    // Form labels and actions
    "form.name": "आपका पूरा नाम",
    "form.email": "आपका ईमेल पता",
    "form.phone": "मोबाइल नंबर",
    "form.ward": "आपका पंजीकृत वार्ड उपखंड",
    "form.potholes": "गड्ढे और सड़कें",
    "form.garbage": "कचरा और अपशिष्ट संचय",
    "form.water": "पानी का संदूषण या रिसाव",
    "form.lights": "स्ट्रीटलाइट की खराबी",
    "form.drainage": "जल निकासी और सीवरेज का बहना",
    "form.placeholder_name": "जैसे: श्रीमती प्रिया नायर",
    "form.placeholder_email": "जैसे: priya.nair@mail.in",
    "form.placeholder_phone": "जैसे: +91 99999 00104",
    "form.auth_btn": "लॉगिन या साइन अप",
    "form.already_registered": "पहले से ही पंजीकृत हैं? साइन इन करें",
    "form.not_registered": "नया खाता चाहिए? पंजीकरण करें",
    "form.select_ward_first": "सक्रिय समस्याओं को देखने के लिए कृपया पहले अपना वार्ड चुनें।",

    // Report Issue Form
    "report.title": "नई नागरिक शिकायत दर्ज करें",
    "report.subtitle": "आपकी रिपोर्ट स्वचालित रूप से जीपीएस/वार्ड विभाजन के आधार पर नामित वार्ड रेजिडेंट इंजीनियर को भेज दी जाएगी।",
    "report.step1_title": "1. लाइव कैमरा / छवि सत्यापन",
    "report.step1_desc": "फर्जी शिकायतों को रोकने के लिए मरम्मत से पहले की फोटो अपलोड करें। अधिकतम 5MB आकार।",
    "report.step2_title": "2. शिकायत वर्गीकरण और प्राथमिकता",
    "report.step2_desc": "अपनी शिकायत का प्रकार निर्दिष्ट करें ताकि वह सही इंजीनियरों के पास जा सके।",
    "report.step3_title": "3. स्थान विवरण और स्थलचिह्न",
    "report.step3_desc": "फील्ड कर्मियों को स्थान ढूंढने में मदद के लिए सटीक पता निर्देशांक या आस-पास के स्थलचिह्न शामिल करें।",
    "report.camera_take": "कैमरे से लाइव फोटो लें",
    "report.camera_active": "कैमरा चालू है। फोटो सहेजने के लिए कैप्चर पर क्लिक करें।",
    "report.submit_success": "शिकायत सफलतापूर्वक दर्ज की गई!",

    // Status tracking
    "track.title": "निवारण प्रगति को ट्रैक करें",
    "track.subtitle": "एसएलए प्रगति लॉग, निर्दिष्ट इंजीनियरिंग क्रू और समाधान प्रमाण देखने के लिए अपनी अनूठी शिकायत आईडी दर्ज करें।",
    "track.search_placeholder": "जैसे: JS-IND-2026-048",
    "track.get_updates": "एसएलए अपडेट प्राप्त करें",

    // General Words & Badges
    "badge.new": "नया",
    "badge.urgent": "अति आवश्यक",
    "badge.swachh_certified": "स्वच्छ प्रमाणित",
    "status.pending": "लंबित",
    "status.inprogress": "प्रगति पर",
    "status.resolved": "समाधानित",
    "priority.emergency": "आपातकालीन",
    "priority.high": "उच्च",
    "priority.medium": "मध्यम",
    "priority.low": "निम्न",

    "action.back": "नागरिक डेस्क पर वापस जाएं",
    "action.submit": "शिकायत दर्ज करें",
    "action.track": "ट्रैक स्टेटस",
    "action.reassign": "पुनः सौंपें",
    "action.upvote": "समर्थन करें",
    "action.view_map": "वार्ड मानचित्र देखें",
    "action.view_gallery": "समाधान गैलरी देखें",
    "action.view_details": "पूरा विवरण देखें",
    "action.view_standards": "नागरिक मानक देखें",
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('janSewaLanguage');
    return (saved === 'Hindi' || saved === 'English') ? saved as Language : 'English';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('janSewaLanguage', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const translation = dictionary[language][key];
    if (translation !== undefined) {
      return translation;
    }
    // Fallback to English dictionary
    const englishFallback = dictionary['English'][key];
    if (englishFallback !== undefined) {
      return englishFallback;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
