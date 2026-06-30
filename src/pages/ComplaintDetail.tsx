import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Building2, Navigation, Lightbulb, AlertTriangle, MessageSquare, 
  ThumbsUp, ArrowLeft, MapPin, Calendar, Check, Clock, Shield, AlertCircle,
  Star
} from 'lucide-react';
import Header from '../components/Header';
import { getComplaints, upvoteComplaint, hasVoted, Complaint, submitComplaintFeedback } from '../lib/storage';

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const [complaints, setComplaints] = useState(() => getComplaints());
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const complaint = complaints.find(c => c.id === id);

  const handleUpvote = () => {
    if (!id || hasVoted(id)) return;
    const updated = upvoteComplaint(id);
    setComplaints(updated);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || rating === 0) return;
    const updated = submitComplaintFeedback(id, rating, comment);
    setComplaints(updated);
  };

  if (!complaint) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Grievance Not Found</h1>
            <p className="text-sm text-slate-500 mb-6">The complaint ID "{id}" could not be located in the municipal database.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-blue-900 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home Feed
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isUpvoted = hasVoted(complaint.id);

  // Status-based formatting
  const getStatusBadge = (status: string) => {
    if (status === 'Pending') return 'text-red-700 bg-red-50 border border-red-200';
    if (status === 'In Progress') return 'text-amber-700 bg-amber-50 border border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
  };

  const getPriorityBadge = (prio: string) => {
    if (prio === 'Emergency') return 'text-red-850 bg-red-100 border border-red-250 font-bold';
    if (prio === 'High') return 'text-orange-850 bg-orange-100 border border-orange-200 font-bold';
    if (prio === 'Medium') return 'text-blue-800 bg-blue-50 border border-blue-200';
    return 'text-slate-700 bg-slate-100 border border-slate-200';
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 py-8 px-4 md:px-10 max-w-6xl mx-auto w-full">
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Citizen Feed
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${getStatusBadge(complaint.status)}`}>
                {complaint.status}
              </span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${getPriorityBadge(complaint.priority || 'Medium')}`}>
                {complaint.priority || 'Medium'} Priority
              </span>
              <span className="text-slate-400 text-xs font-mono">{complaint.id}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">
              {complaint.title}
            </h1>
            <p className="text-slate-500 text-sm font-semibold flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Reported: {complaint.date}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:inline"></span>
              <span>Category: <strong className="text-slate-700">{complaint.category}</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:inline"></span>
              <span>Ward: <strong className="text-slate-700">{complaint.ward}</strong></span>
            </p>
          </div>
          <Link 
            to="/map" 
            state={{ focusLatitude: complaint.latitude, focusLongitude: complaint.longitude }}
            className="inline-flex items-center justify-center gap-2 h-12 px-5 bg-blue-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-800 transition-all shrink-0"
          >
            <Navigation className="w-4 h-4" /> View GIS Map Coordinates
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details on the left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">Grievance Overview</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {complaint.photoPreview && (
                    <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                      <img 
                        src={complaint.photoPreview} 
                        alt="Civic defect snapshot" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Detailed Description</p>
                      <p className="text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                        "{complaint.description}"
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Key Landmark</p>
                        <p className="text-sm font-semibold text-slate-800">{complaint.landmark || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">GPS Location</p>
                        <p className="text-sm font-mono font-semibold text-slate-800">{complaint.latitude}, {complaint.longitude}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive voting panel bar */}
              <div className="bg-slate-50 p-5 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-150 gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleUpvote}
                    disabled={isUpvoted}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm border transition-all ${
                      isUpvoted 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 cursor-default' 
                        : 'text-blue-900 bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'text-emerald-600 fill-emerald-100' : 'text-blue-900'}`} />
                    <span>{isUpvoted ? '✓ Upvoted' : 'Support this Issue'}</span>
                  </button>
                  <div className="text-slate-600 text-xs font-semibold">
                    <span className="font-extrabold text-slate-900 text-sm mr-1">{complaint.upvotes}</span> citizens support fixing this
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  Upvoting signals urgency and pulls reports to the top of the Ward Engineer queue.
                </div>
              </div>
            </div>

            {/* Officer Assignment details (if assigned) */}
            {complaint.assignedOfficer && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-1">Resident Officer Dispatched</h4>
                  <p className="text-sm font-bold text-slate-800">{complaint.assignedOfficer}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{complaint.officerRole || 'Sub-divisional Municipal Officer'}</p>
                </div>
              </div>
            )}

            {/* Resolution Feedback Form (Only shown if complaint is Resolved) */}
            {complaint.status === 'Resolved' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <Star className="w-6 h-6 fill-amber-100 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wider">Resolution Quality Feedback</h3>
                    <p className="text-xs text-slate-500 mt-1">This grievance has been resolved. Please take 10 seconds to evaluate your satisfaction.</p>
                  </div>
                </div>

                {complaint.feedbackRating !== undefined ? (
                  // Submitted state
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center space-y-3">
                    <p className="text-emerald-900 text-sm font-extrabold">Thank you! Your feedback has been registered.</p>
                    <div className="flex justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-6 h-6 ${
                            star <= (complaint.feedbackRating || 0) 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-slate-200'
                          }`} 
                        />
                      ))}
                    </div>
                    {complaint.feedbackComment && (
                      <div className="text-slate-600 text-xs italic bg-white/85 p-3 rounded-xl border border-emerald-200/50 max-w-lg mx-auto">
                        "{complaint.feedbackComment}"
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-semibold">Your response helps JanSewa track local ward engineers performance indices.</p>
                  </div>
                ) : (
                  // Interactive Form
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Your Rating: <span className="text-amber-600 font-extrabold">{rating || hoverRating || 'Select Stars'}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star 
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || rating) 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-slate-200'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="feedback-comment" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Resolution Comment (Optional)
                      </label>
                      <textarea
                        id="feedback-comment"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share details about repair speed, quality of work, or the conduct of municipal engineers..."
                        className="w-full text-sm font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={rating === 0}
                      className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 ${
                        rating > 0 
                          ? 'bg-blue-950 text-white hover:bg-blue-900 cursor-pointer' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <span>Submit Resolution Feedback</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
          
          {/* Status timeline tracker on the right */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-extrabold text-lg text-slate-900 mb-6 uppercase tracking-wider">Live Action Milestones</h3>
              
              <div className="border-l-2 border-slate-150 pl-6 space-y-8 relative ml-3">
                {/* Milestone 1: Submitted */}
                <div className="relative">
                  <div className="absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white ring-4 ring-white shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-900">Complaint Logged</p>
                    <p className="text-slate-400 text-xs mt-0.5">Recorded on {complaint.date}</p>
                  </div>
                </div>

                {/* Milestone 2: Ward Assignment */}
                <div className="relative">
                  <div className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white shadow-sm text-white ${
                    complaint.status !== 'Pending' ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}>
                    {complaint.status !== 'Pending' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <div>
                    <p className={`font-extrabold text-sm ${complaint.status !== 'Pending' ? 'text-slate-900' : 'text-slate-400'}`}>
                      Assigned to Subdivision
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {complaint.status !== 'Pending' 
                        ? `Routed to ${complaint.assignedOfficer || 'Local Field Crew'}`
                        : 'Awaiting local dispatcher review'
                      }
                    </p>
                  </div>
                </div>

                {/* Milestone 3: Resolution */}
                <div className="relative">
                  <div className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white shadow-sm text-white ${
                    complaint.status === 'Resolved' ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}>
                    {complaint.status === 'Resolved' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <div>
                    <p className={`font-extrabold text-sm ${complaint.status === 'Resolved' ? 'text-emerald-800' : 'text-slate-400'}`}>
                      Resolution Confirmed
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {complaint.status === 'Resolved' 
                        ? 'Defect rectified. Clean photo certified.' 
                        : 'Work sequence underway'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
