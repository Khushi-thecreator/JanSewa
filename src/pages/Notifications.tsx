import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, HelpCircle, Settings } from 'lucide-react';
import Header from '../components/Header';

export default function Notifications() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center py-10 px-6 max-w-7xl mx-auto w-full">
        <div className="w-full flex flex-col lg:flex-row gap-12 items-center justify-center">
        <div className="flex-1 max-w-lg space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-medium text-sm">
            <Bell className="w-5 h-5" /> Real-time Alerts
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Instant Updates on Your Complaint
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Stay informed without checking the app. You will receive real-time updates via secure Email notifications for every step of the resolution process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <button className="flex items-center justify-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
              <Settings className="w-5 h-5" /> Manage Preferences
            </button>
            <Link to="/" className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold">
              <HelpCircle className="w-5 h-5" /> Back to Home
            </Link>
          </div>
        </div>
        <div className="relative w-full max-w-md shrink-0">
          <div className="bg-slate-950 rounded-2xl p-4 shadow-2xl border border-slate-800">
            <div className="relative bg-white overflow-hidden rounded-xl h-[480px] flex flex-col w-full text-slate-800 border border-slate-200">
              {/* Email Client Header */}
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold ml-2 font-mono text-slate-300">JanSewa Mail Client</span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">Inbox</span>
              </div>
              
              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-slate-50">
                {/* Email Item 1 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-150 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-800">JanSewa Grievance Desk</span>
                    <span>Just now</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-blue-950">[Ticket Registered] - JS-IND-2026-000123</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Dear Citizen, your sanitation grievance near Connaught Place, New Delhi has been logged. Standard resolution timeframe: 24-48 hours. Live tracking is active.
                  </p>
                </div>

                {/* Email Item 2 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-150 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-800">Ward Sub-division 8</span>
                    <span>1 hour ago</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-amber-800">[Engineer Dispatched] - JS-IND-2026-000123</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Namaste! Resident Engineer <strong className="text-slate-800">Rajesh Kumar</strong> has been assigned. Crew has left the local municipal depot with maintenance equipment.
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
