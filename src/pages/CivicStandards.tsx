import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, Droplet, Hammer, Trash2, Lightbulb, 
  BookOpen, Compass, Award, ExternalLink, HelpCircle
} from 'lucide-react';
import Header from '../components/Header';

interface StandardItem {
  id: string;
  title: string;
  authority: string;
  code: string;
  subtitle: string;
  photo: string;
  summary: string;
  specifications: { label: string; value: string; detail: string }[];
  citizenChecklist: string[];
}

const INDIAN_CIVIC_STANDARDS: StandardItem[] = [
  {
    id: 'roads',
    title: 'Pothole Repair & Road Restoration',
    authority: 'Indian Roads Congress (IRC)',
    code: 'Ref: IRC:82-2015 & IRC:SP:109',
    subtitle: 'Standards for bituminous road maintenance, repairs, and trench restoration.',
    photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&h=600&fit=crop',
    summary: 'The IRC mandates that pothole filling should not be a temporary cosmetic patch. It requires geometric cutting (squaring of edges), dust removal, emulsion/tack coat spraying, and compacting with hot-mix asphalt to ensure a water-sealed flush surface.',
    specifications: [
      { label: 'Minimum Depth', value: '40 mm', detail: 'Sub-base excavation must reach a minimum of 40mm into healthy asphalt to prevent sliding.' },
      { label: 'Material Grade', value: 'Bitumen VG-30 / Cold Mix', detail: 'Viscosity Grade 30 or specialized cold-mix for monsoon seasons.' },
      { label: 'Compaction Method', value: 'Vibratory Roller', detail: 'Manual rammers are forbidden on roads; static or vibratory road-rollers must be used.' },
      { label: 'Edge Cutting', value: 'Vertical & Rectangular', detail: 'Pothole perimeter must be cut into clean vertical rectangle walls, not left raw and circular.' }
    ],
    citizenChecklist: [
      'Are the edges of the pothole cut in neat straight lines before filling?',
      'Has the crew cleaned the soil, dust, and water out of the cavity?',
      'Is a black liquid "tack coat" painted inside the cavity before putting asphalt?',
      'Is the newly completed surface rolled completely flat and flush with the rest of the road?'
    ]
  },
  {
    id: 'water',
    title: 'Potable Drinking Water Quality',
    authority: 'Bureau of Indian Standards (BIS)',
    code: 'Ref: IS 10500 : 2012',
    subtitle: 'National benchmarks for municipal piped water purity, safety, and supply pressure.',
    photo: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1000&h=600&fit=crop',
    summary: 'Under the Jal Jeevan Mission and BIS IS:10500, municipal bodies are legally required to deliver clean, odor-free, non-turbid drinking water. Chlorine residue is essential at distribution endpoints to prevent waterborne epidemic outbreaks.',
    specifications: [
      { label: 'Residual Chlorine', value: '0.2 to 0.5 ppm', detail: 'Essential at tap endpoints to keep water sterile from pipeline contamination.' },
      { label: 'Turbidity Limit', value: '< 1 NTU', detail: 'Water must be crystal clear. Turbidity up to 5 NTU is acceptable only in emergency conditions.' },
      { label: 'pH Range', value: '6.5 to 8.5', detail: 'Neutral to slightly alkaline water, preventing corrosive leaching of heavy metals.' },
      { label: 'Supply Pressure', value: '12m Head', detail: 'Standard terminal head pressure to ensure water reaches double-story buildings without pumps.' }
    ],
    citizenChecklist: [
      'Is the water free of visible yellow/brown silt and muddy particles?',
      'Does the water smell fresh, with a very mild, safe smell of disinfection chlorine?',
      'Is the supply pipeline routed at a safe distance (minimum 1.5 meters) from open sewer lines?',
      'Is water supply running on fixed municipal time schedules with steady pressure?'
    ]
  },
  {
    id: 'garbage',
    title: 'Solid Waste Management & Segregation',
    authority: 'Swachh Bharat Mission (SBM-U 2.0)',
    code: 'Ref: SWM Rules 2016',
    subtitle: 'Directives for 100% door-to-door source segregation and Zero-Waste wards.',
    photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1000&h=600&fit=crop',
    summary: 'Swachh Bharat Mission Urban 2.0 mandates the elimination of all open garbage dumps ("Kachra Points"). All municipal wards must implement strict source-level categorization. Biodegradable waste must be composted or fed to bio-methanators locally.',
    specifications: [
      { label: 'Source Segregation', value: '3-Way Split', detail: 'Dry Waste (Blue bin), Wet Waste (Green bin), and domestic Hazardous/Sanitary (Red pouch).' },
      { label: 'Collection Frequency', value: 'Daily / 24-Hours', detail: 'Door-to-door auto-tipper vehicles must arrive daily in residential areas.' },
      { label: 'Open Dump Limits', value: 'Strictly Zero', detail: 'No secondary open collection points are permitted. Waste must flow directly from household to transfer station.' },
      { label: 'Processing Goal', value: '100% Scientific', detail: 'No untreated waste should end up in landfills. Dry recyclables must go to Material Recovery Facilities (MRF).' }
    ],
    citizenChecklist: [
      'Does your municipal auto-tipper have separate partitions for wet, dry, and sanitary waste?',
      'Are open-air neighborhood plots clear of unauthorized public garbage dumping?',
      'Are commercial market associations provided with heavy community waste-bins?',
      'Is dry litter collected from public street gutters on a daily scheduled basis?'
    ]
  },
  {
    id: 'lights',
    title: 'Streetlights & Smart LED Illumination',
    authority: 'National Street Lighting Programme (NSLP)',
    code: 'Ref: IS 1944 / EESL Norms',
    subtitle: 'Standards for street lighting intervals, illumination indices, and maintenance times.',
    photo: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c090?w=1000&h=600&fit=crop',
    summary: 'The Energy Efficiency Services Limited (EESL) in partnership with Urban Local Bodies (ULBs) replaces traditional sodium-vapor lights with high-efficiency LEDs. Lighting is measured in Lux to ensure dark-alley safety for women and pedestrians.',
    specifications: [
      { label: 'Avg Illumination', value: '15 - 20 Lux', detail: 'Required intensity for major arterial roads. Internal residential lanes require min 8-10 Lux.' },
      { label: 'LED Efficiency', value: '> 110 lm/W', detail: 'High lumen output per watt to minimize public electricity expenditure.' },
      { label: 'Resolution SLA', value: 'Within 48 Hours', detail: 'Municipal standard SLA for replacing fused LEDs or faulty light-sensitive switches.' },
      { label: 'Smart Controls', value: 'Dusk-to-Dawn', detail: 'Automated Centralized Control and Monitoring Systems (CCMS) to turn off lights at sunrise.' }
    ],
    citizenChecklist: [
      'Are streetlights functioning continuously on your lane throughout the dark hours?',
      'Is there an automated CCMS timer, preventing lights from being left on in broad daylight?',
      'Are the light poles placed at safe intervals (standard 25-30 meters) without dark gaps?',
      'Is there proper insulation on the base wires to prevent high-voltage shocks during monsoon waterlogging?'
    ]
  }
];

export default function CivicStandards() {
  const [activeTab, setActiveTab] = useState<string>('roads');

  const selectedStandard = INDIAN_CIVIC_STANDARDS.find(item => item.id === activeTab) || INDIAN_CIVIC_STANDARDS[0];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      
      {/* Indian Civic Pride Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-12 px-4 relative overflow-hidden">
        {/* Subtle decorative Indian tri-color color-glow dots */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">
            <Award className="w-3.5 h-3.5 text-orange-400" />
            Swachh Survekshan & IRC Quality Benchmarks
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tight mb-4">
            Indian Municipal Civic Standards
          </h1>
          <p className="text-slate-300 text-sm md:text-lg max-w-3xl leading-relaxed">
            In India, public infrastructure quality is strictly regulated by national expert bodies. Under the 
            <strong> JanSewa Municipal Charter</strong>, citizens are empowered to understand these benchmarks, 
            verify finished work quality, and hold local ward administration accountable.
          </p>
        </div>
      </div>

      <main className="flex-1 py-10 px-4 max-w-6xl mx-auto w-full">
        {/* Explanation Alert */}
        <div className="bg-orange-50 border border-orange-200/60 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
          <div className="p-2 bg-orange-100 rounded-xl text-orange-800 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-orange-950">Why should Indian citizens know these standards?</h4>
            <p className="text-xs text-orange-800/95 mt-1 leading-relaxed">
              When water supply is contaminated, streetlights are broken, or roads are filled with poor-quality loose gravel, citizens have the right to request correct technical rectifications rather than temporary cosmetic fixes. This portal translates complex engineering codes (IRC, SWM 2016, BIS) into a simple interactive format to bridge the gap between citizens and municipal engineers.
            </p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-8">
          {INDIAN_CIVIC_STANDARDS.map((std) => {
            const isSelected = std.id === activeTab;
            return (
              <button
                key={std.id}
                onClick={() => setActiveTab(std.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                  isSelected 
                    ? 'bg-blue-900 border-blue-950 text-white shadow-md' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {std.id === 'roads' && <Hammer className={`w-6 h-6 mb-2 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />}
                {std.id === 'water' && <Droplet className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />}
                {std.id === 'garbage' && <Trash2 className={`w-6 h-6 mb-2 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />}
                {std.id === 'lights' && <Lightbulb className={`w-6 h-6 mb-2 ${isSelected ? 'text-yellow-400' : 'text-slate-400'}`} />}
                <span className="text-xs font-extrabold tracking-tight block leading-tight">{std.title}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Standards Inspector Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-5">
          {/* Left Column: Visuals & Authority */}
          <div className="lg:col-span-2 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="relative h-64 lg:h-72 w-full overflow-hidden bg-slate-100">
              <img 
                src={selectedStandard.photo} 
                alt={selectedStandard.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="bg-orange-600 text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-md tracking-wider">
                  Swachh Bharat aligned
                </span>
                <p className="text-xs font-mono font-bold mt-2 opacity-90">{selectedStandard.code}</p>
              </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Governing Regulatory Body</p>
                <h4 className="text-base font-black text-slate-900 mt-1">{selectedStandard.authority}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  These codes are referenced in all public tenders issued by Municipal Corporations (such as RMC, BMC, and MCD) and monitored under Swachh Survekshan audits.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Compass className="w-4 h-4 text-orange-500 animate-spin-slow" />
                  <span>Interactive Verification Checklist</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & Checklists */}
          <div className="lg:col-span-3 p-6 md:p-8 space-y-8 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-4 mb-6">
                <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">National Standard Parameter</span>
                <h2 className="text-xl md:text-2xl font-black text-slate-950 mt-1">{selectedStandard.title}</h2>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{selectedStandard.subtitle}</p>
              </div>

              {/* Technical Grid */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3.5">Engineering Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedStandard.specifications.map((spec, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{spec.label}</div>
                      <div className="text-base font-black text-slate-900 mt-0.5">{spec.value}</div>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{spec.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Inspection Checklist */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3.5">Citizen Quality Inspection</h4>
                <div className="space-y-3">
                  {selectedStandard.citizenChecklist.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="p-0.5 bg-emerald-100 text-emerald-800 rounded-full mt-0.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action card */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
              <div className="text-center sm:text-left">
                <h5 className="font-extrabold text-xs text-blue-950">Notice a deviation from these standards?</h5>
                <p className="text-[11px] text-blue-800 mt-0.5">Use our active reporting system to lodge a formal complaint in 60 seconds.</p>
              </div>
              <Link 
                to="/report" 
                className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow shrink-0"
              >
                File Non-Compliance Ticket
              </Link>
            </div>
          </div>
        </div>

        {/* Indian Swachh Bharat Pledge & General FAQs */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-extrabold text-xl text-slate-900">Frequently Asked Questions (FAQs)</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">How is my priority evaluated under Swachh Bharat guidelines?</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Complaints filed on JanSewa are analyzed on three factors: (1) Select Category urgency, (2) User-selected priority level (Emergency vs. Low), and (3) Total citizen upvotes. Issues with high upvotes are automatically flagged on the Ward Engineer’s CCMS portal for immediate action.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">What happens if a contractor does not match these standards?</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Every public contract under Swachh Bharat urban guidelines has a "Defect Liability Period" (DLP) ranging from 1 to 3 years. If the repair work deteriorates or non-compliance is verified, the municipal corporation can issue a penalty notice and withhold the contractor’s bank guarantee deposit.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-amber-700 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 bg-white/15 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                🇮🇳
              </div>
              <h4 className="font-black text-lg">My Swachh Pledge</h4>
              <p className="text-xs text-orange-100/90 leading-relaxed mt-2 italic">
                "I pledge that I will remain committed towards cleanliness and devote time for this. I will devote 100 hours per year, that is two hours per week, to voluntary work for cleanliness. I will neither litter nor let others litter."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 text-[10px] text-orange-200 uppercase font-bold tracking-widest">
              Swachh Bharat Mission (Urban)
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
