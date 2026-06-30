import React, { useState, useEffect } from 'react';
import { X, Info, Briefcase, CheckCircle2 } from 'lucide-react';
import { getComplaints } from '../lib/storage';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string | null;
  onConfirm: (id: string, officerName: string, officerRole: string) => void;
}

export default function ReassignModal({ isOpen, onClose, complaintId, onConfirm }: ReassignModalProps) {
  const [selectedDept, setSelectedDept] = useState('sanitation');
  const [selectedOfficer, setSelectedOfficer] = useState('Sunil Kumar');
  const [note, setNote] = useState('');

  const complaints = getComplaints();
  const activeComplaint = complaints.find(c => c.id === complaintId);

  // Auto-set department based on the complaint category initially
  useEffect(() => {
    if (activeComplaint) {
      const cat = activeComplaint.category.toLowerCase();
      if (cat.includes('sanit')) {
        setSelectedDept('sanitation');
        setSelectedOfficer('Sunil Kumar');
      } else if (cat.includes('water') || cat.includes('drain')) {
        setSelectedDept('water');
        setSelectedOfficer('Rajesh Solanki');
      } else if (cat.includes('light')) {
        setSelectedDept('electric');
        setSelectedOfficer('Priya Sharma');
      } else {
        setSelectedDept('roads');
        setSelectedOfficer('Vikram Singh');
      }
    }
  }, [complaintId, activeComplaint]);

  if (!isOpen || !activeComplaint) return null;

  const officersByDept: Record<string, { name: string; role: string; load: string; cases: number; online: boolean; img: string }[]> = {
    sanitation: [
      { name: 'Sunil Kumar', role: 'Senior Inspector, Sanitation Wing', load: 'Moderate Load', cases: 5, online: true, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
      { name: 'Anil Mehta', role: 'Junior Officer, Sanitation Section', load: 'Low Load', cases: 2, online: true, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }
    ],
    water: [
      { name: 'Rajesh Solanki', role: 'Junior Engineer, Water Supply', load: 'Low Load', cases: 3, online: true, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
      { name: 'Sanjay Dutt', role: 'Superintendent of Drainage Operations', load: 'High Load', cases: 9, online: false, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }
    ],
    electric: [
      { name: 'Priya Sharma', role: 'Assistant Electrical Engineer', load: 'High Load', cases: 12, online: true, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      { name: 'Karthik Rao', role: 'Electrical Grid Supervisor', load: 'Low Load', cases: 1, online: true, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' }
    ],
    roads: [
      { name: 'Vikram Singh', role: 'Sub-Divisional Engineer, Roads Maintenance', load: 'Moderate Load', cases: 6, online: true, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
      { name: 'Ketan Trivedi', role: 'Assistant Road Inspector', load: 'Low Load', cases: 3, online: false, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' }
    ]
  };

  const handleConfirm = () => {
    const list = officersByDept[selectedDept] || [];
    const officer = list.find(o => o.name === selectedOfficer) || list[0];
    if (officer && complaintId) {
      onConfirm(complaintId, officer.name, officer.role);
      onClose();
    }
  };

  const activeOfficers = officersByDept[selectedDept] || [];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh] font-sans border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-slate-900 text-xl font-bold leading-tight">Reassign Complaint</h2>
            <p className="text-blue-900 text-xs font-bold mt-1 tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
              Ref: {activeComplaint.id}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Current Incident Info</p>
              <p className="text-slate-900 text-sm font-extrabold mt-0.5">{activeComplaint.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                Category: <strong className="text-slate-700">{activeComplaint.category}</strong> | 
                Zone: <strong className="text-slate-700">{activeComplaint.ward}</strong>
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider">Select Target Department</label>
            <select 
              value={selectedDept}
              onChange={(e) => {
                const dept = e.target.value;
                setSelectedDept(dept);
                const firstOfficer = officersByDept[dept]?.[0]?.name || '';
                setSelectedOfficer(firstOfficer);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-900 focus:ring-blue-900 h-12 px-4 shadow-sm text-sm outline-none"
            >
              <option value="sanitation">Sanitation & Waste Management Department</option>
              <option value="water">Water Supply & Drainage Engineering Wing</option>
              <option value="electric">Electrical & Street Lights Department</option>
              <option value="roads">Roads & Public Works Maintenance Section</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider">Available Officers</label>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Sorted by load metrics</span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeOfficers.map((off) => {
                const isSelected = selectedOfficer === off.name;
                return (
                  <label 
                    key={off.name} 
                    onClick={() => setSelectedOfficer(off.name)}
                    className={`flex items-center gap-4 bg-white p-3.5 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50 ${
                      isSelected ? 'border-blue-900 bg-blue-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-200" style={{backgroundImage: `url('${off.img}')`}}></div>
                      {off.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 h-3 w-3 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-slate-900 text-sm font-bold truncate">{off.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          off.online ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-150 text-slate-500'
                        }`}>
                          {off.online ? 'Duty Active' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs truncate flex items-center gap-1 font-semibold">
                        {off.role}
                      </p>
                      <p className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" /> {off.cases} active tickets — {off.load}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <input 
                        type="radio" 
                        name="officer_select" 
                        checked={isSelected}
                        onChange={() => setSelectedOfficer(off.name)}
                        className="h-4.5 w-4.5 text-blue-900 border-slate-300 focus:ring-blue-900" 
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider">Internal Handover Note <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-900 focus:ring-blue-900 p-3 text-xs outline-none shadow-sm" 
              rows={2} 
              placeholder="e.g. Please expedite repair, citizen reported traffic slowing on CPM curves...">
            </textarea>
          </div>
        </div>
        
        <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm Reassignment
          </button>
        </div>
      </div>
    </>
  );
}
