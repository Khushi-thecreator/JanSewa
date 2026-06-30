import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Phone, Mail, CheckCircle2, FileText, Download, MapPin, 
  Compass, AlertCircle, ChevronRight, Check, Clock, ThumbsUp, 
  Calendar, Filter, X 
} from 'lucide-react';
import Header from '../components/Header';
import { getComplaints, Complaint, downloadReceiptFile, upvoteComplaint, hasVoted } from '../lib/storage';

export default function TrackStatus() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchQuery, setSearchQuery] = useState(initialId);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  // Load complaints list in dynamic state
  const [complaintsList, setComplaintsList] = useState(() => getComplaints());

  // Handle live upvote from track status page
  const handleUpvote = (id: string) => {
    if (hasVoted(id)) return;
    const updated = upvoteComplaint(id);
    setComplaintsList(updated);
    
    // Refresh the selected/active complaint so UI increments instantly
    if (activeComplaint && activeComplaint.id === id) {
      const refreshedActive = updated.find(c => c.id === id);
      if (refreshedActive) {
        setActiveComplaint(refreshedActive);
      }
    }
  };

  // Derived state: filter the complaints list dynamically
  const filteredComplaints = complaintsList.filter(c => {
    // 1. Text Search query (matches ID, Email, Title, Description, Citizen Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.id.toLowerCase().includes(q);
      const matchEmail = c.email ? c.email.toLowerCase().includes(q) : false;
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchName = c.citizenName ? c.citizenName.toLowerCase().includes(q) : false;
      
      if (!matchId && !matchEmail && !matchTitle && !matchDesc && !matchName) {
        return false;
      }
    }

    // 2. Status Filter
    if (filterStatus !== 'All') {
      if (c.status !== filterStatus) return false;
    }

    // 3. Date Range Filter
    if (filterStartDate) {
      if (c.date < filterStartDate) return false;
    }
    if (filterEndDate) {
      if (c.date > filterEndDate) return false;
    }

    return true;
  });

  // Handle selecting the first complaint matching the current search & filters
  useEffect(() => {
    if (filteredComplaints.length > 0) {
      const stillInList = filteredComplaints.some(c => c.id === activeComplaint?.id);
      if (!stillInList) {
        setActiveComplaint(filteredComplaints[0]);
      }
    } else {
      setActiveComplaint(null);
    }
  }, [searchQuery, filterStatus, filterStartDate, filterEndDate, complaintsList]);

  // If initial ID is passed via query params, reset other filters and select it
  useEffect(() => {
    if (initialId) {
      setSearchQuery(initialId);
      setFilterStatus('All');
      setFilterStartDate('');
      setFilterEndDate('');
      const matched = complaintsList.find(c => c.id.toUpperCase() === initialId.toUpperCase().trim());
      if (matched) {
        setActiveComplaint(matched);
      }
    } else if (complaintsList.length > 0 && !activeComplaint) {
      setActiveComplaint(complaintsList[0]);
    }
  }, [initialId, complaintsList]);

  const handleDownload = () => {
    if (!activeComplaint) return;
    downloadReceiptFile({
      id: activeComplaint.id,
      category: activeComplaint.category,
      title: activeComplaint.title,
      description: activeComplaint.description,
      landmark: activeComplaint.landmark,
      latitude: activeComplaint.latitude,
      longitude: activeComplaint.longitude,
      citizenName: activeComplaint.citizenName,
      phone: activeComplaint.phone,
      email: activeComplaint.email,
      status: activeComplaint.status,
      date: activeComplaint.date || new Date().toISOString().split('T')[0],
      ward: activeComplaint.ward
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">Pending Review</span>;
      case 'In Progress':
        return <span className="inline-flex items-center rounded-md bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 animate-pulse">In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">✓ Resolved</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'Emergency':
        return <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-900 border border-red-200">Emergency Priority</span>;
      case 'High':
        return <span className="inline-flex items-center rounded-md bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 border border-orange-200">High Priority</span>;
      case 'Medium':
        return <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 border border-blue-200">Medium Priority</span>;
      case 'Low':
        return <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">Low Priority</span>;
      default:
        return null;
    }
  };

  // Helper count for badges
  const totalCount = complaintsList.length;
  const pendingCount = complaintsList.filter(c => c.status === 'Pending').length;
  const progressCount = complaintsList.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaintsList.filter(c => c.status === 'Resolved').length;

  const isAnyFilterActive = searchQuery !== '' || filterStatus !== 'All' || filterStartDate !== '' || filterEndDate !== '';

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar: Advanced Search & Filter Controls */}
            <div className="w-full lg:max-w-md space-y-6">
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-3">Track Complaint Status</h2>
                <p className="text-base text-slate-600">Find and review local grievances by ID, email, status, or reporting date ranges.</p>
              </div>
              
              {/* Filter Panel Container */}
              <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-slate-900/5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Filter className="w-4 h-4 text-blue-900" />
                    <span>Search & Filter Options</span>
                  </div>
                  {isAnyFilterActive && (
                    <button 
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* 1. Keyword search (ID, Email, Title) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none" 
                      placeholder="Enter Complaint ID, title or email..." 
                    />
                  </div>
                </div>

                {/* 2. Status chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Complaint Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFilterStatus('All')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                        filterStatus === 'All'
                          ? 'bg-blue-950 border-blue-950 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>All Issues</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterStatus === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{totalCount}</span>
                    </button>

                    <button
                      onClick={() => setFilterStatus('Pending')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                        filterStatus === 'Pending'
                          ? 'bg-red-600 border-red-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Pending</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterStatus === 'Pending' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'}`}>{pendingCount}</span>
                    </button>

                    <button
                      onClick={() => setFilterStatus('In Progress')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                        filterStatus === 'In Progress'
                          ? 'bg-yellow-500 border-yellow-500 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>In Progress</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterStatus === 'In Progress' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'}`}>{progressCount}</span>
                    </button>

                    <button
                      onClick={() => setFilterStatus('Resolved')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                        filterStatus === 'Resolved'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Resolved</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterStatus === 'Resolved' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>{resolvedCount}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Date Range filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Filing Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">From</span>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                        <input
                          type="date"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs text-slate-800 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">To</span>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                        <input
                          type="date"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs text-slate-800 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of matching complaints */}
              <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-900/5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {filteredComplaints.length === totalCount 
                      ? 'All Registered Grievances' 
                      : `Filtered Results (${filteredComplaints.length})`}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">{filteredComplaints.length} tickets found</span>
                </div>

                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold">No grievances match your filter criteria</p>
                    <p className="text-[11px]">Try searching a broader query or clicking "Reset" above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 space-y-1.5">
                    {filteredComplaints.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setActiveComplaint(res)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border ${
                          activeComplaint?.id === res.id 
                            ? 'bg-blue-50/50 border-blue-200 shadow-3xs' 
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[9px] font-mono font-black text-blue-950 bg-blue-50 px-1.5 py-0.2 rounded">
                              {res.id.split('-').slice(-1)[0]}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">{res.date}</span>
                            <span className={`text-[8px] px-1.5 py-0.2 font-bold rounded-full ${
                              res.status === 'Resolved' ? 'bg-green-50 text-green-700' :
                              res.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }`}>{res.status}</span>
                          </div>
                          <p className="text-xs font-black text-slate-800 truncate">{res.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{res.landmark}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-blue-50 p-6">
                <h3 className="font-bold text-blue-900 mb-2">Municipal Helpline Support</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Call directly if you are experiencing an emergency or water pipeline breakage. Our civic network offers a 24/7 dedicated control desk.
                </p>
                <ul className="space-y-3 text-sm text-slate-700 font-medium">
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-900"/> Helpline: 1800-11-2233</li>
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-900"/> support@jansewa.gov.in</li>
                </ul>
              </div>
            </div>
            
            {/* Right Main Panel: Display active complaint details & status timeline */}
            <div className="flex-1">
              {activeComplaint ? (
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
                  <div className="flex flex-col sm:flex-row border-b border-slate-100 bg-slate-50/50 px-6 py-5 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        {getStatusBadge(activeComplaint.status)}
                        {getPriorityBadge(activeComplaint.priority || 'Medium')}
                        <span className="text-xs text-slate-500 font-medium">{activeComplaint.time}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{activeComplaint.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">ID: {activeComplaint.id}</p>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center flex-wrap">
                      <button 
                        onClick={() => handleUpvote(activeComplaint.id)}
                        disabled={hasVoted(activeComplaint.id)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold shadow-sm border transition-all ${
                          hasVoted(activeComplaint.id)
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 cursor-default font-semibold'
                            : 'text-blue-900 bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted(activeComplaint.id) ? 'text-emerald-600 fill-emerald-100' : 'text-blue-900'}`} />
                        <span>{hasVoted(activeComplaint.id) ? '✓ Upvoted' : 'Support Issue'} ({activeComplaint.upvotes})</span>
                      </button>

                      <button 
                        onClick={handleDownload}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        <Download className="w-4 h-4"/> Receipt
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative h-48 w-full md:w-56 shrink-0 overflow-hidden rounded-xl bg-slate-100 border">
                        <img 
                          alt={activeComplaint.category} 
                          className="h-full w-full object-cover" 
                          src={activeComplaint.photoPreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&h=300&fit=crop'} 
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citizen Description</p>
                          <p className="text-sm text-slate-700 italic">"{activeComplaint.description}"</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location & Landmark</p>
                            <p className="text-sm font-semibold text-slate-900 mt-0.5">{activeComplaint.landmark}</p>
                            <p className="text-xs text-slate-500 font-mono">GPS: {activeComplaint.latitude}, {activeComplaint.longitude}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Ward Subdivision</p>
                            <p className="text-sm font-semibold text-slate-900 mt-0.5">{activeComplaint.ward || 'Ward 8 (Amin Marg)'}</p>
                          </div>
                        </div>
                        {activeComplaint.email && activeComplaint.email !== 'N/A' && (
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-xs text-emerald-800">
                            <span className="font-bold">✓ Connected:</span> Email notification triggers active for citizen <strong className="font-bold">{activeComplaint.citizenName}</strong> at <strong className="font-mono">{activeComplaint.email}</strong>.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Progress Timeline */}
                    <div className="border-t pt-6">
                      <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Resolution History & Milestones</h4>
                      
                      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-150 ml-4 space-y-8">
                        {/* Milestone 1: Registered */}
                        <div className="relative">
                          <div className="absolute -left-[35px] sm:-left-[43px] flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white ring-4 ring-white shadow-sm">
                            <Check className="w-4 h-4"/>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Complaint Registered & Logged</p>
                            <p className="text-xs text-slate-400">Grievance successfully assigned JanSewa reference ID: {activeComplaint.id}.</p>
                          </div>
                        </div>

                        {/* Milestone 2: Ward Assignment */}
                        <div className="relative">
                          <div className={`absolute -left-[35px] sm:-left-[43px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white shadow-sm ${
                            activeComplaint.status !== 'Pending' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {activeComplaint.status !== 'Pending' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Assigned to Ward Engineer</p>
                            {activeComplaint.status !== 'Pending' ? (
                              <div className="mt-1 space-y-2">
                                <p className="text-xs text-slate-500">Auto-routed to Zone Ward sub-divisional staff for physical inspect.</p>
                                <div className="flex items-center gap-2.5 bg-slate-50 border p-2 rounded-lg max-w-sm">
                                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">
                                    {activeComplaint.assignedOfficer ? activeComplaint.assignedOfficer.split(' ').map(n=>n[0]).join('') : 'W'}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">{activeComplaint.assignedOfficer || 'Junior Engineer'}</p>
                                    <p className="text-[10px] text-slate-400">{activeComplaint.officerRole || 'Ward Officer'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">Pending review by Zone Commissioner and Subdivision dispatch Desk.</p>
                            )}
                          </div>
                        </div>

                        {/* Milestone 3: Resolution */}
                        <div className="relative">
                          <div className={`absolute -left-[35px] sm:-left-[43px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white shadow-sm ${
                            activeComplaint.status === 'Resolved' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {activeComplaint.status === 'Resolved' ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Work Verified & Rectified</p>
                            {activeComplaint.status === 'Resolved' ? (
                              <p className="text-xs text-emerald-700 font-medium">Issue marked resolved. Verification photo uploaded by Engineer on site. Completed with satisfaction review.</p>
                            ) : activeComplaint.status === 'In Progress' ? (
                              <p className="text-xs text-amber-600 font-medium animate-pulse">Engineer is currently on-site working on resolution.</p>
                            ) : (
                              <p className="text-xs text-slate-400">Will commence once assigned officer approves inspection report.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 text-center p-6">
                  <Compass className="w-12 h-12 text-slate-300 mb-3 animate-spin" />
                  <h3 className="text-lg font-bold text-slate-700">No Report Selected</h3>
                  <p className="text-sm text-slate-400 max-w-sm mt-1">Please enter an ID or email address on the left panel to display tracking details and milestones.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
