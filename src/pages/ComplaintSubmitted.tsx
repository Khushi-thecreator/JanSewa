import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Navigation, Download, MapPin, FileText, Compass, Send, Mail, Inbox, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import { downloadReceiptFile } from '../lib/storage';

export default function ComplaintSubmitted() {
  const location = useLocation();
  const stateData = location.state || {};
  const complaint = stateData.complaint;
  
  const category = complaint ? complaint.category : (stateData.category || 'Roads');
  const latitude = complaint ? complaint.latitude : (stateData.latitude || '22.303900');
  const longitude = complaint ? complaint.longitude : (stateData.longitude || '70.802200');
  const landmark = complaint ? complaint.landmark : (stateData.landmark || 'Ward 08 (Connaught Place, New Delhi)');
  const description = complaint ? complaint.description : (stateData.description || 'Civic defect reported on road causing traffic disruption.');
  const photoPreview = complaint ? complaint.photoPreview : (stateData.photoPreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&h=300&fit=crop');
  const citizenName = complaint ? complaint.citizenName : '';
  const email = complaint ? complaint.email : (stateData.email || '');
  const date = complaint ? complaint.date : new Date().toISOString().split('T')[0];

  // Generate a random high-fidelity receipt ID, or use the generated complaint ID
  const receiptId = complaint ? complaint.id : `JS-IND-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const [deviceMockOpen, setDeviceMockOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>(() => {
    if (!email) return [];
    const t = new Date().toLocaleTimeString();
    return [
      `[${t}] 🚀 Initializing JanSewa Automated Email Dispatcher...`,
      `[${t}] 📡 Connecting to SMTP secure mail gateway (SSL Port 465)...`,
      `[${t}] 📝 Composing dynamic HTML receipt for recipient: ${email}...`,
      `[${t}] ⚠️ Local Sandbox Mode: Real-world email deliveries require configuring SMTP credentials in your environment.`,
      `[${t}] 🔍 Verification complete. Click "Send Simulated Email" below to instantly dispatch a test notification!`
    ];
  });

  const handleSimulateAlert = () => {
    setDeviceMockOpen(true);
    const t = new Date().toLocaleTimeString();
    
    setLogs(prev => [
      ...prev,
      `[${t}] 📨 Requesting Simulated email dispatch to: ${email}...`,
      `[${t}] 🔑 SMTP handshake verified...`,
      `[${t}] 📧 Subject: [JanSewa-India] Ticket Logged successfully - #${receiptId}`,
      `[${t}] ✔️ Dispatch success! Message-ID: <jans-india-${receiptId}@mail.gov.in>`,
      `[${t}] 🖥️ Simulated email rendered on mockup display to the right.`
    ]);

    // Request desktop permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleDownload = () => {
    downloadReceiptFile({
      id: receiptId,
      category,
      title: `${category} issue near ${landmark}`,
      description,
      landmark,
      latitude,
      longitude,
      citizenName,
      email,
      status: 'Pending',
      date
    });
  };


  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col items-center py-10 px-4 md:px-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="relative bg-gradient-to-b from-green-50 to-white pt-12 pb-8 px-6 text-center border-b border-slate-100">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 ring-8 ring-green-50">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Complaint Submitted Successfully!</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              Thank you for being a responsible citizen. Your report has been dispatched to our National Command Center.
            </p>
          </div>
          <div className="p-6 md:p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 flex flex-col h-full">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center justify-center text-center h-full gap-2 relative overflow-hidden">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Complaint Reference ID</p>
                  <div className="text-2xl md:text-3xl font-bold text-blue-900 tracking-tight font-mono bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                    {receiptId}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Save this ID for future tracking</p>
                </div>
              </div>
              <div className="md:col-span-7">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-slate-200 rounded-lg overflow-hidden relative">
                    <img src={photoPreview} alt={category} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{category} Grievance</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{landmark}</span>
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 uppercase tracking-wider">
                        Pending Ward Review
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Added Section displaying exact GPS Geolocation and detail report */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-900" /> Registered GPS & Telemetry Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Latitude</span>
                  <span className="font-mono font-bold text-slate-800">{latitude}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Longitude</span>
                  <span className="font-mono font-bold text-slate-800">{longitude}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Ward Routing</span>
                  <span className="font-bold text-slate-800">Auto-detected (National Ward Division)</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200/50">
                <span className="text-xs text-slate-400 font-semibold block uppercase mb-1">Issue Description</span>
                <p className="text-slate-700 leading-relaxed text-sm italic">"{description}"</p>
              </div>
            </div>

            {/* Contact Details & Email Confirmation */}
            {email && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-900 p-2.5 rounded-lg font-bold text-sm">
                    EMAIL
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Real-time Email Updates Configured</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      We've registered your contact info for instant automated email notifications. You will receive updates as our engineering team verifies, routes, and rectifies this grievance.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-blue-100/50">
                      <div>
                        <span className="text-slate-400 font-medium">Citizen Name:</span> <strong className="font-bold text-slate-850">{citizenName || 'Anonymous'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Email Address:</span> <strong className="font-mono font-bold text-slate-850">{email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Alert Status:</span> <strong className="text-emerald-700 font-bold">✓ Active</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Email Simulator Console */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 text-slate-100 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-slate-400 font-bold font-mono ml-2">JanSewa Email Gateway Simulator</span>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold">Local Sandbox</span>
                  </div>
                  
                  <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <p>
                      <strong>Why didn't you receive an actual email on your personal inbox?</strong>
                    </p>
                    <p>
                      In our containerized sandbox environment, real-world email delivery requires active SMTP credentials or API keys (like SendGrid or Mailgun). To keep this app fully secure and plug-and-play, we've integrated this live developer simulator to let you test the system dispatch immediately!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
                    {/* Terminal Log */}
                    <div className="lg:col-span-7 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-slate-300 h-64 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                      {logs.map((log, i) => (
                        <div key={i} className={
                          log.includes('⚠️') ? 'text-amber-400' : 
                          log.includes('📧') || log.includes('📨') ? 'text-sky-400' :
                          log.includes('✔️') || log.includes('✓') || log.includes('🚀') ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                        }>
                          {log}
                        </div>
                      ))}
                    </div>

                    {/* Email Mockup Screen */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-2xl relative">
                        <div className="flex items-center gap-1.5 mb-3 text-slate-500 text-[11px] font-mono border-b border-slate-800 pb-2">
                          <span className="w-2 h-2 rounded-full bg-red-500/40"></span>
                          <span className="w-2 h-2 rounded-full bg-yellow-500/40"></span>
                          <span className="w-2 h-2 rounded-full bg-green-500/40"></span>
                          <span className="ml-2">JanSewa Mail Client</span>
                        </div>
                        
                        {/* Screen */}
                        {deviceMockOpen ? (
                          <div className="bg-white rounded-lg p-3 text-slate-800 font-sans text-xs overflow-hidden flex flex-col space-y-2.5 shadow-inner">
                            {/* Header details */}
                            <div className="border-b border-slate-100 pb-2 text-[10px] text-slate-500 space-y-1">
                              <div><span className="font-semibold text-slate-700">From:</span> JanSewa India Desk &lt;no-reply@jansewa.gov.in&gt;</div>
                              <div><span className="font-semibold text-slate-700">To:</span> {email}</div>
                              <div><span className="font-semibold text-slate-700">Subject:</span> [JanSewa-India] Ticket Logged successfully - #{receiptId}</div>
                            </div>

                            {/* Email Body */}
                            <div className="text-[10px] leading-relaxed text-slate-600 space-y-2">
                              <p><strong>Namaste {citizenName || 'Citizen'},</strong></p>
                              <p>
                                Your <strong>{category}</strong> grievance has been recorded and routed to the Ward Sub-divisional desk under Ticket Reference ID: <strong className="font-mono text-slate-900">{receiptId}</strong>.
                              </p>
                              <p>
                                Our team has verified your coordinates ({latitude}, {longitude}) at <strong>{landmark}</strong>. We are assigning field engineers to look into the issue.
                              </p>
                              <p className="bg-slate-50 p-2 rounded border border-slate-150">
                                <strong>Live Tracking Link:</strong> <span className="text-blue-600 underline">jansewa.gov.in/track?id={receiptId}</span>
                              </p>
                              <p className="text-[9px] text-slate-400 italic">
                                This is an automated email. Please do not reply directly to this message.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900 rounded-lg p-6 text-center text-slate-400 font-sans text-xs flex flex-col items-center justify-center h-48 border border-dashed border-slate-800">
                            <Send className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                            <p>No email dispatched yet.</p>
                            <p className="text-[10px] text-slate-500 mt-1">Click the button below to simulate an SMTP dispatch.</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 w-full">
                        <button 
                          onClick={handleSimulateAlert}
                          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <Send className="w-4 h-4 text-blue-200 animate-pulse" /> Dispatch Simulated Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <Link to="/" className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                <Home className="w-5 h-5" /> Go to Home
              </Link>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl border border-blue-900 text-blue-900 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-5 h-5" /> Download Receipt
                </button>
                <Link to="/track" className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                  <Navigation className="w-5 h-5" /> Track Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
