import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, CheckCircle2, ArrowLeftRight } from 'lucide-react';
import Header from '../components/Header';

export default function Gallery() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-8 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900">Before & After Gallery</h1>
            <p className="text-slate-500 text-lg font-medium">Witness the impact of citizen reporting and municipal action.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-900">12,405</span>
            <span className="text-slate-500 text-sm block">Issues Resolved This Month</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          {[
            { id: '#1024', cat: 'Potholes', title: 'Sector 4 Main Road Repair', time: '48 Hrs', ward: 'Ward 12', date: 'Oct 12, 2026', imgBefore: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&h=300&fit=crop', imgAfter: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&h=300&fit=crop' },
            { id: '#1089', cat: 'Sanitation', title: 'Market Square Cleanup', time: '24 Hrs', ward: 'Ward 05', date: 'Oct 15, 2026', imgBefore: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=300&fit=crop', imgAfter: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&h=300&fit=crop' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="relative flex h-64 w-full">
                <div className="w-1/2 relative border-r border-white/20">
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-md z-10">BEFORE</div>
                  <img src={item.imgBefore} alt="Before" className="w-full h-full object-cover" />
                </div>
                <div className="w-1/2 relative">
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md z-10 shadow-lg flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> RESOLVED
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-md z-10">AFTER</div>
                  <img src={item.imgAfter} alt="After" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-lg z-20">
                  <ArrowLeftRight className="text-blue-900 w-5 h-5" />
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-50 text-blue-900 text-xs font-bold px-2 py-0.5 rounded uppercase">{item.cat}</span>
                      <span className="text-slate-400 text-xs font-medium">{item.id}</span>
                    </div>
                    <h3 className="text-slate-900 text-lg font-bold">{item.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium uppercase">Time to Resolve</div>
                    <div className="text-emerald-600 font-black text-xl">{item.time}</div>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100 my-1"></div>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {item.ward}</div>
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {item.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
