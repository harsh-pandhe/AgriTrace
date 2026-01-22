'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Leaf, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  BarChart3,
  Truck,
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
    <div className={`group relative overflow-hidden rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ${className}`}>
      <div className={`absolute -right-4 -top-4 h-24 sm:h-32 w-24 sm:w-32 rounded-full opacity-10 blur-3xl transition-all group-hover:scale-150 ${color}`} />
      <div className="relative z-10">
        <div className="mb-3 sm:mb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600">{label}</div>
        <div className={`mb-4 sm:mb-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-50 text-slate-900 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white`}>
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h4 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{title}</h4>
        <p className="mt-2 sm:mt-3 text-sm font-medium leading-relaxed text-slate-500">{desc}</p>
      </div>
      <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-8 opacity-0 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-100">
        <ArrowRight className="text-emerald-500 h-5 w-5" />
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
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl py-3 border-b border-slate-100' : 'bg-transparent py-4 sm:py-6 lg:py-8'}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 md:px-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-slate-900 text-white shadow-2xl shadow-emerald-500/20">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
            </div>
            <span className="text-xl sm:text-2xl font-[1000] tracking-tighter uppercase italic">
              Agri<span className="text-emerald-500 not-italic">Trace</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 xl:gap-12 lg:flex">
            {[
              { label: 'Farmer Portal', href: '/login' },
              { label: 'Agent App', href: '/login' },
              { label: 'Admin Dashboard', href: '/login' },
            ].map((item) => (
              <button key={item.label} onClick={() => router.push(item.href)} className="relative text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900 group">
                {item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-500 transition-all group-hover:w-full" />
              </button>
            ))}
            <div className="flex items-center gap-3 xl:gap-4">
              <button onClick={() => router.push('/login')} className="rounded-full bg-slate-100 px-4 xl:px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-200">Sign In</button>
              <button onClick={() => router.push('/signup')} className="group relative overflow-hidden rounded-full bg-slate-900 px-6 xl:px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                <span className="relative z-10">Register</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-600 to-lime-500 transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </div>
          </div>

          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-7 w-7 sm:h-8 sm:w-8" /> : <Menu className="h-7 w-7 sm:h-8 sm:w-8" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl">
            <div className="px-6 py-6 space-y-4">
              {[
                { label: 'Farmer Portal', href: '/login' },
                { label: 'Agent App', href: '/login' },
                { label: 'Admin Dashboard', href: '/login' },
              ].map((item) => (
                <button key={item.label} onClick={() => { router.push(item.href); setIsMenuOpen(false); }} className="block w-full text-left text-sm font-bold text-slate-700 py-2 hover:text-emerald-600 transition-colors">
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-3 border-t border-slate-100">
                <button onClick={() => { router.push('/login'); setIsMenuOpen(false); }} className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold transition-all hover:bg-slate-200">Sign In</button>
                <button onClick={() => { router.push('/signup'); setIsMenuOpen(false); }} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600">Register</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-24 sm:pt-20 pb-20 sm:pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative z-10">
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 sm:gap-3 rounded-full border border-emerald-100 bg-emerald-50/50 px-4 sm:px-6 py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] backdrop-blur-sm text-emerald-800">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Agri-Waste Tracking System v4.2</span>
            <span className="sm:hidden">AgriTrace v4.2</span>
          </div>
          
          <h1 className="text-[13vw] sm:text-[10vw] md:text-[80px] lg:text-[100px] xl:text-[120px] font-[1000] leading-[0.85] tracking-tighter text-slate-900">
            WASTE TO <br />
            <span className="italic text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>VERIFIED VALUE</span>
          </h1>
          
          <div className="mx-auto mt-6 sm:mt-10 max-w-2xl px-2">
            <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-slate-500">
              A centralized ecosystem to track stubble and crop waste from farm to facility. Verify pickups, manage logistics, and ensure transparent recycling compliance.
            </p>
          </div>

          <div className="mt-8 sm:mt-14 flex flex-col items-center justify-center gap-4 sm:gap-6 sm:flex-row px-2">
            <button onClick={() => router.push('/login')} className="h-14 sm:h-16 lg:h-20 w-full rounded-xl sm:rounded-2xl lg:rounded-[2rem] bg-slate-900 px-8 sm:px-12 text-sm sm:text-base lg:text-lg font-black text-white shadow-2xl shadow-slate-300 transition-all hover:-translate-y-1 hover:bg-emerald-600 sm:w-auto">
              Launch Dashboard
            </button>
            <div className="flex h-14 sm:h-16 lg:h-20 items-center gap-3 sm:gap-6 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white px-5 sm:px-8 text-xs sm:text-sm font-bold w-full sm:w-auto justify-center">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
              <span>1,240 MT Collected</span>
              <div className="flex -space-x-2 sm:-space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-white bg-slate-200`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live System Ticker */}
        <div className="absolute bottom-0 w-full overflow-hidden border-y border-slate-100 bg-white/50 py-3 sm:py-4 backdrop-blur-md">
          <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="mx-6 sm:mx-12 flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-slate-400">
                <History className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Latest: </span>Farm #F-{200 + i} Logged 1.2 Tons 
                <span className="text-slate-900">• Agent Assigned</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Bento Grid Features (The Real Workflows) --- */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-16 lg:mb-20 grid lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-600">The Workflow</h2>
              <h3 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900">Seamlessly <br className="hidden sm:block" />Connected.</h3>
            </div>
            <div className="flex items-end lg:justify-end">
              <p className="max-w-xs text-sm font-bold leading-relaxed text-slate-500">
                Four specialized interfaces designed to digitize the entire waste management lifecycle with audit-ready transparency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-12">
            <FeatureBento 
              icon={Smartphone} 
              label="For Farmers"
              title="Smart Waste Logging" 
              desc="Easy mobile entry for stubble and biomass. Log quantity, waste type, and schedule pickup requests instantly."
              className="md:col-span-2 lg:col-span-8 lg:h-[380px]"
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
              className="md:col-span-2 lg:col-span-8"
              color="bg-purple-400"
            />
          </div>
        </div>
      </section>

      {/* --- Interactive Terminal (Real Data Logs) --- */}
      <section className="py-16 sm:py-24 lg:py-32 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0)', backgroundSize: '30px 30px' }} />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] bg-white/[0.02] border border-white/10 p-6 sm:p-10 lg:p-16 xl:p-24 backdrop-blur-3xl">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-20 items-center">
              <div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 sm:mb-8 lg:mb-10 shadow-2xl shadow-emerald-500/40">
                  <Database className="text-white h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">Tamper-Proof <br className="hidden sm:block" />Compliance.</h3>
                <p className="mt-4 sm:mt-6 lg:mt-8 text-slate-400 text-base sm:text-lg leading-relaxed">
                  Every transaction—from the farmer's first log to the recycler's final check-in—is recorded with a unique digital signature, creating an unshakeable audit trail.
                </p>
                <div className="mt-8 sm:mt-10 lg:mt-12 flex gap-6 sm:gap-8 lg:gap-12">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest mt-1">Traceability</div>
                  </div>
                  <div className="h-8 sm:h-10 w-px bg-white/10" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white">Real-Time</div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest mt-1">Verification</div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="relative bg-[#050505] rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-white/10 font-mono text-xs sm:text-sm leading-relaxed overflow-hidden shadow-3xl">
                  <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-white/5 pb-3 sm:pb-4">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-800" />
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-800" />
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-800" />
                    <span className="text-[8px] sm:text-[10px] text-slate-600 font-bold ml-2 sm:ml-4 tracking-wider sm:tracking-widest uppercase truncate">system_logs_export.json</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3 text-[11px] sm:text-sm">
                    <div className="text-emerald-500">{"> initializing_audit..."}</div>
                    <div className="text-slate-500">{"[LOG] Farmer: #ALVIN-HILL-201"}</div>
                    <div className="text-slate-500">{"[LOG] Waste Type: Paddy Straw"}</div>
                    <div className="text-white font-bold">{"[LOG] Load Weight: 840 kg"}</div>
                    <div className="text-slate-500">{"[LOG] Agent Assigned: #CARGO-TEAM-A"}</div>
                    <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> 
                      {"STATUS: PICKUP_VERIFIED_BY_AGENT"}
                    </div>
                    <div className="pt-2 sm:pt-4 text-slate-500 italic text-[10px] sm:text-sm truncate">{"// Geolocation Tag: 30.7333° N, 76.7794° E"}</div>
                    <div className="pt-3 sm:pt-4 grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="h-14 sm:h-16 bg-white/5 rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3 flex flex-col justify-center">
                        <span className="text-[9px] sm:text-[10px] text-slate-500">TOTAL LOADS</span>
                        <span className="text-white font-black text-base sm:text-lg">4,281</span>
                      </div>
                      <div className="h-14 sm:h-16 bg-white/5 rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3 flex flex-col justify-center">
                        <span className="text-[9px] sm:text-[10px] text-slate-500">SUCCESS RATE</span>
                        <span className="text-emerald-500 font-black text-base sm:text-lg">99.8%</span>
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
      <footer className="bg-white pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] bg-slate-900 px-6 sm:px-8 py-12 sm:py-16 lg:py-20 text-center text-white shadow-2xl overflow-hidden mb-16 sm:mb-24 lg:mb-32">
             <div className="absolute top-0 right-0 h-32 sm:h-48 lg:h-64 w-32 sm:w-48 lg:w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/20 blur-[60px] sm:blur-[80px] lg:blur-[100px]" />
             <div className="relative z-10 max-w-2xl mx-auto space-y-6 sm:space-y-8">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter">Ready to join the network?</h2>
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg px-2">Onboard your farm, agency, or facility in minutes and start tracking verified impact today.</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                   <button onClick={() => router.push('/signup')} className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 rounded-xl sm:rounded-full bg-emerald-500 text-white text-sm sm:text-base font-black hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95">Create Account</button>
                   <button onClick={() => router.push('/login')} className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 rounded-xl sm:rounded-full bg-white/10 text-white text-sm sm:text-base font-black hover:bg-white/20 transition-all">Support Center</button>
                </div>
             </div>
          </div>

          <div className="grid gap-10 sm:gap-12 lg:gap-8 grid-cols-2 lg:grid-cols-4 border-t border-slate-100 pt-10 sm:pt-12 lg:pt-16">
            <div className="col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-lg sm:text-xl font-black tracking-tighter uppercase italic">AgriTrace</span>
              </div>
              <p className="max-w-md text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
                Empowering the circular economy through high-fidelity waste tracking and ecosystem collaboration.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-emerald-600">Portals</h5>
              <ul className="space-y-3 sm:space-y-4 font-bold text-slate-900 text-sm">
                {['Farmer Entry', 'Agent Logistics', 'Admin Oversight'].map(link => (
                  <li key={link}><a href="#" className="hover:text-emerald-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-emerald-600">Company</h5>
              <ul className="space-y-3 sm:space-y-4 font-bold text-slate-900 text-sm">
                {['Project Goals', 'Impact Metrics', 'Security Standards', 'Contact'].map(link => (
                  <li key={link}><a href="#" className="hover:text-emerald-500 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-24 flex flex-col items-center justify-between border-t border-slate-100 pt-6 sm:pt-8 lg:pt-10 gap-4 sm:gap-6 md:flex-row">
            <div className="text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-widest uppercase text-slate-400 text-center md:text-left">
              © 2026 AgriTrace Connect • Clean Supply Chain Verified
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap justify-center">
               <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-emerald-500">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                  System Operational
               </div>
               <div className="text-[9px] sm:text-[10px] font-black text-slate-900">V4.2.0-STABLE</div>
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
