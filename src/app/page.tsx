'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  Trees, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  ChevronRight,
  BarChart3,
  Truck,
  Users,
  Search,
  Globe,
  Database,
  Smartphone,
  ClipboardCheck,
  History
} from 'lucide-react';

const App = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const FeatureBento = ({ icon: Icon, title, desc, className, color, label }: { icon: any; title: string; desc: string; className: string; color: string; label: string }) => (
    <div className={`group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ${className}`}>
      <div className={`absolute -right-4 -top-4 h-32 w-32 rounded-full opacity-10 blur-3xl transition-all group-hover:scale-150 ${color}`} />
      <div className="relative z-10">
        <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-emerald-600">{label}</div>
        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white`}>
          <Icon size={28} />
        </div>
        <h4 className="text-2xl font-black tracking-tight text-slate-900">{title}</h4>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">{desc}</p>
      </div>
      <div className="absolute bottom-6 right-8 opacity-0 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-100">
        <ArrowRight className="text-emerald-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Background Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-30 blur-[120px] transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.15), transparent 80%)`
        }}
      />

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl py-3 border-b border-slate-100' : 'bg-transparent py-8'}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xl shadow-emerald-500/20">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-[1000] tracking-tighter uppercase italic">
              Agri<span className="text-emerald-500 not-italic">Trace</span>
            </span>
          </div>

          <div className="hidden items-center gap-12 lg:flex">
            {['Farmer Portal', 'Agent App', 'Admin Dashboard'].map((item) => (
              <a key={item} href="#" className="relative text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900 group">
                {item}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-500 transition-all group-hover:w-full" />
              </a>
            ))}
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/login')} className="rounded-full bg-slate-100 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-200">Sign In</button>
              <button onClick={() => router.push('/login')} className="group relative overflow-hidden rounded-full bg-slate-900 px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                <span className="relative z-10">Register Farm</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-600 to-lime-500 transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </div>
          </div>

          <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50/50 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm text-emerald-800">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Agri-Waste Tracking System v4.2
          </div>
          
          <h1 className="text-[10vw] font-[1000] leading-[0.85] tracking-tighter text-slate-900 sm:text-[80px] lg:text-[120px]">
            WASTE TO <br />
            <span className="italic text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>VERIFIED VALUE</span>
          </h1>
          
          <div className="mx-auto mt-10 max-w-2xl">
            <p className="text-xl font-medium leading-relaxed text-slate-500">
              A centralized ecosystem to track stubble and crop waste from farm to facility. Verify pickups, manage logistics, and ensure transparent recycling compliance.
            </p>
          </div>

          <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <button onClick={() => router.push('/login')} className="h-20 w-full rounded-[2rem] bg-slate-900 px-12 text-lg font-black text-white shadow-2xl shadow-slate-300 transition-all hover:-translate-y-1 hover:bg-emerald-600 sm:w-auto">
              Launch Dashboard
            </button>
            <div className="flex h-20 items-center gap-6 rounded-[2rem] border border-slate-200 bg-white px-8 text-sm font-bold sm:w-auto">
              <ClipboardCheck size={20} className="text-emerald-500" />
              1,240 MT Collected
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-slate-200`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live System Ticker */}
        <div className="absolute bottom-0 w-full overflow-hidden border-y border-slate-100 bg-white/50 py-4 backdrop-blur-md">
          <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="mx-12 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                <History size={14} className="text-emerald-500" />
                Latest: Farm #F-{200 + i} Logged 1.2 Tons 
                <span className="text-slate-900">• Agent Assigned</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Bento Grid Features (The Real Workflows) --- */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-600">The Workflow</h2>
              <h3 className="mt-4 text-6xl font-black tracking-tighter text-slate-900">Seamlessly <br />Connected.</h3>
            </div>
            <div className="flex items-end lg:justify-end">
              <p className="max-w-xs text-sm font-bold leading-relaxed text-slate-500">
                Four specialized interfaces designed to digitize the entire waste management lifecycle with audit-ready transparency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
            <FeatureBento 
              icon={Smartphone} 
              label="For Farmers"
              title="Smart Waste Logging" 
              desc="Easy mobile entry for stubble and biomass. Log quantity, waste type, and schedule pickup requests instantly."
              className="lg:col-span-8 lg:h-[380px]"
              color="bg-emerald-400"
            />
            <FeatureBento 
              icon={Truck} 
              label="For Agents"
              title="Verified Pickup"
              desc="Mobile-optimized routing and QR-based verification at the point of collection."
              className="lg:col-span-4"
              color="bg-lime-400"
            />
            <FeatureBento 
              icon={BarChart3} 
              label="For Admins"
              title="Total Oversight" 
              desc="Real-time analytics, user management, and compliance auditing across the entire supply chain."
              className="lg:col-span-8"
              color="bg-purple-400"
            />
          </div>
        </div>
      </section>

      {/* --- Interactive Terminal (Real Data Logs) --- */}
      <section className="py-32 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0)', backgroundSize: '30px 30px' }} />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="rounded-[3rem] bg-white/[0.02] border border-white/10 p-8 lg:p-24 backdrop-blur-3xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/40">
                  <Database className="text-white" size={32} />
                </div>
                <h3 className="text-5xl font-black text-white leading-tight">Tamper-Proof <br />Compliance.</h3>
                <p className="mt-8 text-slate-400 text-lg leading-relaxed">
                  Every transaction—from the farmer's first log to the recycler's final check-in—is recorded with a unique digital signature, creating an unshakeable audit trail.
                </p>
                <div className="mt-12 flex gap-12">
                  <div>
                    <div className="text-3xl font-black text-white">100%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Traceability</div>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div>
                    <div className="text-3xl font-black text-white">Real-Time</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verification</div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="relative bg-[#050505] rounded-[2rem] p-8 border border-white/10 font-mono text-sm leading-relaxed overflow-hidden shadow-3xl">
                  <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
                    <div className="h-3 w-3 rounded-full bg-slate-800" />
                    <div className="h-3 w-3 rounded-full bg-slate-800" />
                    <div className="h-3 w-3 rounded-full bg-slate-800" />
                    <span className="text-[10px] text-slate-600 font-bold ml-4 tracking-widest uppercase">system_logs_export.json</span>
                  </div>
                  <div className="space-y-3">
                    <div className="text-emerald-500">{"> initializing_audit..."}</div>
                    <div className="text-slate-500">{"[LOG] Farmer: #ALVIN-HILL-201"}</div>
                    <div className="text-slate-500">{"[LOG] Waste Type: Paddy Straw"}</div>
                    <div className="text-white font-bold">{"[LOG] Load Weight: 840 kg"}</div>
                    <div className="text-slate-500">{"[LOG] Agent Assigned: #CARGO-TEAM-A"}</div>
                    <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                      <CheckCircle2 size={14} /> 
                      {"STATUS: PICKUP_VERIFIED_BY_AGENT"}
                    </div>
                    <div className="pt-4 text-slate-500 italic">{"// Geolocation Tag: 30.7333° N, 76.7794° E"}</div>
                    <div className="pt-4 grid grid-cols-2 gap-3">
                      <div className="h-16 bg-white/5 rounded-xl border border-white/5 p-3 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500">TOTAL LOADS</span>
                        <span className="text-white font-black text-lg">4,281</span>
                      </div>
                      <div className="h-16 bg-white/5 rounded-xl border border-white/5 p-3 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500">SUCCESS RATE</span>
                        <span className="text-emerald-500 font-black text-lg">99.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA / Footer --- */}
      <footer className="bg-white pt-32 pb-12 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="relative rounded-[3rem] bg-slate-900 px-8 py-20 text-center text-white shadow-2xl overflow-hidden mb-32">
             <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
             <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-4xl font-black sm:text-6xl tracking-tighter">Ready to join the network?</h2>
                <p className="text-slate-400 text-lg">Onboard your farm, agency, or facility in minutes and start tracking verified impact today.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button onClick={() => router.push('/login')} className="h-16 px-10 rounded-full bg-emerald-500 text-white font-black hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95">Create Account</button>
                   <button onClick={() => router.push('/login')} className="h-16 px-10 rounded-full bg-white/10 text-white font-black hover:bg-white/20 transition-all">Support Center</button>
                </div>
             </div>
          </div>

          <div className="grid gap-16 lg:grid-cols-4 lg:gap-8 border-t border-slate-100 pt-16">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                  <Leaf size={24} />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase italic">AgriTrace</span>
              </div>
              <p className="max-w-md text-slate-500 font-medium leading-relaxed">
                Empowering the circular economy through high-fidelity waste tracking and ecosystem collaboration.
              </p>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Portals</h5>
              <ul className="space-y-4 font-bold text-slate-900 text-sm">
                {['Farmer Entry', 'Agent Logistics', 'Admin Oversight'].map(link => (
                  <li key={link}><a href="#" className="hover:text-emerald-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Company</h5>
              <ul className="space-y-4 font-bold text-slate-900 text-sm">
                {['Project Goals', 'Impact Metrics', 'Security Standards', 'Contact'].map(link => (
                  <li key={link}><a href="#" className="hover:text-emerald-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-24 flex flex-col items-center justify-between border-t border-slate-100 pt-10 gap-6 md:flex-row">
            <div className="text-[10px] font-black tracking-widest uppercase text-slate-400">
              © 2026 AgriTrace Connect • Clean Supply Chain Verified
            </div>
            
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  System Operational
               </div>
               <div className="text-[10px] font-black text-slate-900">V4.2.0-STABLE</div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default App;
