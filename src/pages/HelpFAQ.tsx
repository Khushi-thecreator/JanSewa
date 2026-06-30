import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { 
  HelpCircle, 
  MapPin, 
  Camera, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertCircle, 
  PhoneCall, 
  Mail, 
  Search, 
  Layers, 
  FileText,
  UserCheck,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQS, FAQItem } from '../faqs/faqsData';

// Helper function to highlight matching search text
function highlightText(text: string, highlight: string) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-slate-900 font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function HelpFAQ() {
  const [activeTab, setActiveTab] = useState<'All' | 'General' | 'Process' | 'Wards & GIS' | 'Technical'>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = FAQS;

  const filteredFaqs = faqs.filter(item => {
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Automatically reset the open accordion index when the filters change
  useEffect(() => {
    setOpenIndex(null);
  }, [searchQuery, activeTab]);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />

      {/* Hero Header */}
      <section className="bg-blue-950 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(30,58,138,0.4),transparent)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-800 text-xs font-bold text-blue-300 uppercase tracking-wider mb-4 animate-fade-in">
            <HelpCircle className="w-3.5 h-3.5" /> Citizen Help Center
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            How Can We Assist You Today?
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Find guidelines on how to file grievances, understand the complete resolution pipeline, and browse answers to common municipal queries across India.
          </p>

          {/* FAQ Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by keywords (e.g. SLA, Ward, GPS, Account)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 shadow-xl focus:shadow-2xl transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 hover:scale-110 transition-all p-0.5 rounded-full hover:bg-slate-100"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Keywords Suggested Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-xl mx-auto animate-fade-in">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Search:</span>
            {['SLA', 'GIS', 'Ward', 'Dispute', 'Google Account', 'Anonymously'].map((term) => {
              const isActive = searchQuery.toLowerCase() === term.toLowerCase();
              return (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 border cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md scale-105' 
                      : 'bg-blue-900/40 border-blue-800/60 text-blue-200 hover:bg-blue-900/80 hover:text-white'
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Areas */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-24">
        
        {/* Section 1: Collapsible FAQs */}
        <section id="faqs" className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          
          {/* FAQ Navigation & Contact Block */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div>
                <span className="text-blue-900 font-extrabold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  FAQ Directory
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                  Frequently Asked Queries
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Filter questions by category or read through general topics to understand regulations, mapping, and timelines.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-col gap-2">
                {(['All', 'General', 'Process', 'Wards & GIS', 'Technical'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setOpenIndex(null);
                    }}
                    className={`text-left px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      activeTab === tab 
                        ? 'bg-blue-900 text-white shadow-md' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{tab} {tab !== 'All' ? 'Queries' : ''}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>


            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
              {filteredFaqs.map((faq, idx) => {
                const isOpened = openIndex === idx;
                return (
                  <div key={idx} className="transition-all">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-6 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black tracking-wider uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">
                          {faq.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base pr-4 leading-snug">
                          {highlightText(faq.question, searchQuery)}
                        </h3>
                      </div>
                      <span className="p-1 rounded-lg bg-slate-100 text-slate-500 mt-1 shrink-0">
                        {isOpened ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpened && (
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/30">
                        <div className="border-l-2 border-blue-900 pl-4 py-1">
                          {highlightText(faq.answer, searchQuery)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFaqs.length === 0 && (
                <div className="p-12 text-center text-slate-400 space-y-4">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                  <div>
                    <p className="font-bold text-sm text-slate-800">No queries match your search</p>
                    <p className="text-xs mt-1 text-slate-500 max-w-sm mx-auto">
                      We couldn't find any results for "{searchQuery}" in category "{activeTab}". Try entering other keywords or reset your filters.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('All');
                    }}
                    className="inline-flex bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* General Disclaimer */}
            <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200/50 text-[11px] text-slate-500 leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>
                <strong>Disclaimer:</strong> This citizen FAQ portal aligns with standards prescribed by the Ministry of Housing and Urban Affairs (MoHUA), Government of India, under the Swachh Bharat Mission (Urban). Specific resolution SLAs may vary in cases of municipal force majeure or natural calamities.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How to Report an Issue */}
        <section id="how-to-report" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-orange-600 font-extrabold text-xs uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Reporting Guidelines
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              4 Steps to File a Grievance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Our intuitive system ensures your reports are verified, geo-tagged, and delivered instantly to the appropriate authorities. Here is how it works:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 pt-4">
            {[
              {
                step: '01',
                icon: Camera,
                title: 'Capture Visual Evidence',
                desc: 'Snap a clear, well-lit photo of the issue (pothole, waste pile, or leakage). Clear visual proof helps crews prepare the right tools.',
                color: 'from-orange-500 to-amber-500',
                bg: 'bg-orange-50 border-orange-100 text-orange-600'
              },
              {
                step: '02',
                icon: MapPin,
                title: 'Detect / Pin GPS Location',
                desc: 'Allow GPS coordinate access so our GIS maps auto-assign your exact ward subdivision. Or select manually if reporting for a friend.',
                color: 'from-blue-500 to-indigo-500',
                bg: 'bg-blue-50 border-blue-100 text-blue-600'
              },
              {
                step: '03',
                icon: FileText,
                title: 'Select Category & priority',
                desc: 'Choose from Sanitation, Roads, Water, or Lights. Assign priority (Emergency, High, Medium, Low) to state urgency level.',
                color: 'from-emerald-500 to-teal-500',
                bg: 'bg-emerald-50 border-emerald-100 text-emerald-600'
              },
              {
                step: '04',
                icon: UserCheck,
                title: 'Track Live Progress',
                desc: 'Receive your unique reference ticket (e.g. JS-IND-2026-0001) for live lookup. Live email alerts keep you updated on progress.',
                color: 'from-purple-500 to-pink-500',
                bg: 'bg-purple-50 border-purple-100 text-purple-600'
              },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 relative hover:shadow-md transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl border ${card.bg}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-slate-100 tracking-tight select-none group-hover:text-slate-200 transition-colors">
                      {card.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-900 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Need Direct Helpline Section */}
        <section id="helpline" className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xs">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-orange-200">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Emergency Support</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Need Direct Helpline?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Have an urgent emergency like high-voltage dangling wires, toxic water contamination, active gas leaks, or major road cave-ins? 
                Please use our immediate hotline contacts to connect directly with on-duty ward engineers and disaster relief crews. For standard non-emergency municipal issues, please file a digital grievance above.
              </p>
            </div>
            
            <div className="w-full lg:max-w-md grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
              <a 
                href="tel:1800112233"
                className="bg-white border border-orange-200 hover:border-orange-400 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Central Hotline</h4>
                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Toll-Free 24/7</span>
                  </div>
                </div>
                <p className="font-black text-sm sm:text-base text-slate-800 group-hover:text-blue-900 transition-colors">
                  1800-11-2233
                </p>
              </a>

              <a 
                href="mailto:support@jansewa.gov.in"
                className="bg-white border border-orange-200 hover:border-orange-400 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Official Support</h4>
                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Response in 12h</span>
                  </div>
                </div>
                <p className="font-black text-sm sm:text-base text-slate-800 group-hover:text-blue-900 transition-colors truncate">
                  support@jansewa.gov.in
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: Complaint Lifecycle Visual Stepper */}
        <section id="lifecycle" className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-3xl mx-auto text-center mb-12 relative z-10">
            <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Transparency Engine
            </span>
            <h2 className="text-2xl md:text-3xl font-black mt-3 tracking-tight">
              Interactive Complaint Lifecycle
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2">
              Every grievance is monitored by a digital command room. Follow the exact journey of a logged ticket from draft to resolution.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-800 md:left-1/2 md:-translate-x-1/2"></div>

            <div className="space-y-12 relative">
              {[
                {
                  title: 'Step 1: Grievance Registered',
                  subtitle: 'Citizen Submission',
                  desc: 'Citizen uploads details. Our backend generates an immutable receipt reference (e.g. JS-IND-2026-000123) and triggers automatic SMTP email verification.',
                  badge: 'Drafted',
                  badgeColor: 'bg-blue-900/50 border-blue-700 text-blue-300',
                  icon: FileText,
                  left: true
                },
                {
                  title: 'Step 2: Smart Command Routing',
                  subtitle: 'GIS Triaging & Allocation',
                  desc: 'System triages coordinates, matches them with ward GIS polygon boundaries, and forwards the alert directly onto the assigned Resident Engineer\'s dashboard.',
                  badge: 'Triage',
                  badgeColor: 'bg-amber-900/50 border-amber-700 text-amber-300',
                  icon: Layers,
                  left: false
                },
                {
                  title: 'Step 3: Crew Dispatched & Active',
                  subtitle: 'Field Action & Remediation',
                  desc: 'Assigned crew loads tools from local municipal depot and heads to site. Status transitions to "In Progress". Residents receive real-time email alerts.',
                  badge: 'In Progress',
                  badgeColor: 'bg-yellow-900/50 border-yellow-700 text-yellow-300',
                  icon: Clock,
                  left: true
                },
                {
                  title: 'Step 4: Resolved & Feedback Prompted',
                  subtitle: 'Evidence Verification & QA',
                  desc: 'Engineer uploads an "After" photo. System prompts the reporting citizen to rate the resolution quality and close the case.',
                  badge: 'Resolved',
                  badgeColor: 'bg-emerald-900/50 border-emerald-700 text-emerald-300',
                  icon: CheckCircle,
                  left: false
                }
              ].map((step, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-start md:items-center ${step.left ? 'md:flex-row-reverse' : ''}`}>
                  {/* Left block */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-8 text-left md:text-right">
                    {step.left ? (
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${step.badgeColor}`}>
                          {step.badge}
                        </span>
                        <h4 className="font-extrabold text-white text-base md:text-lg">{step.title}</h4>
                        <p className="text-xs text-blue-300 font-semibold">{step.subtitle}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Icon Node */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-slate-900 border-2 border-slate-700 text-blue-400 font-bold text-xs z-10 shadow-lg">
                    <step.icon className="w-4 h-4" />
                  </div>

                  {/* Right block */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-8 text-left">
                    {!step.left ? (
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${step.badgeColor}`}>
                          {step.badge}
                        </span>
                        <h4 className="font-extrabold text-white text-base md:text-lg">{step.title}</h4>
                        <p className="text-xs text-blue-300 font-semibold">{step.subtitle}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer block */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="bg-blue-900 p-2 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-black tracking-tight uppercase">JanSewa</h1>
            </div>
            <p className="leading-relaxed text-slate-400 text-xs">
              Official Grievance Redressal and Citizen Empowerment System. Built under the Smart City Initiative of Indian Municipal Administrations.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home Dashboard</Link></li>
              <li><Link to="/report" className="hover:text-white transition-colors">File Grievance</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track reference Status</Link></li>
              <li><Link to="/standards" className="hover:text-white transition-colors">IRC Civic Codes</Link></li>
              <li><Link to="/map" className="hover:text-white transition-colors">Ward GIS Heatmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Zone Offices</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>North Zone Office, Connaught Place, New Delhi</li>
              <li>West Zone Office, Bandra West, Mumbai</li>
              <li>South Zone Office, Indiranagar, Bengaluru</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Contact Desk</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>Central National Helpline: 1800-11-2233</li>
              <li>Emergency control desk: +91 11 23456789</li>
              <li>Support Mail: support@jansewa.gov.in</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500 text-xs">
          <p>© 2026 JanSewa India. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Use</span>
            <span className="hover:text-slate-400 cursor-pointer">MoHUA Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
