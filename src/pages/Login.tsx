import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, session, isDemo } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: authError } = await signIn(email, password);
        if (authError) { setError(authError); setLoading(false); return; }
        toast.success("Welcome back! 👋");
        navigate("/dashboard", { replace: true });
      } else {
        if (!name.trim()) { setError("Please enter your full name."); setLoading(false); return; }
        const { error: authError } = await signUp(email, password, name);
        if (authError) { setError(authError); setLoading(false); return; }
        toast.success("Account created! Welcome to CoachOS 🚀");
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { error: authError } = await signIn("demo@coachos.io", "demo1234");
    if (!authError) {
      toast.success("Demo mode activated — explore freely! 🎉");
      navigate("/dashboard", { replace: true });
    }
    setLoading(false);
  };

  const features = [
    "Adherence Intelligence Score (0–100)",
    "AI-powered coaching insights",
    "Client streak & momentum tracking",
    "Real-time dropout risk classification",
    "Shareable client progress reports",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">CoachOS</span>
            <p className="text-emerald-400 text-xs font-medium">Fitness Coaching Intelligence</p>
          </div>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live adherence tracking</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Coach smarter.<br />
            <span className="text-emerald-400">Not harder.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
            The Adherence Intelligence Platform trusted by elite coaches. Track every client's consistency with precision — automatically.
          </p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 space-y-3">
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">JD</div>
              <div>
                <p className="text-slate-300 text-sm italic leading-relaxed">"CoachOS transformed how I manage 30+ clients. The adherence score alone saves me 5 hours a week of manual tracking."</p>
                <p className="text-slate-500 text-xs mt-2">Jamie Dawson · Elite PT, London</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-1">
            <div className="text-center"><p className="text-2xl font-bold text-white">2,400+</p><p className="text-xs text-slate-500">Coaches</p></div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center"><p className="text-2xl font-bold text-white">18k+</p><p className="text-xs text-slate-500">Clients tracked</p></div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center"><p className="text-2xl font-bold text-emerald-400">83%</p><p className="text-xs text-slate-500">Avg adherence</p></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Zap size={16} className="text-white" /></div>
            <span className="text-white font-bold text-lg">CoachOS</span>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {isDemo && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs text-emerald-700 font-medium">Demo mode active — no Supabase required</p>
              </div>
            )}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">{mode === "login" ? "Welcome back" : "Start for free"}</h2>
            <p className="text-sm text-slate-400 mb-6">{mode === "login" ? "Sign in to your CoachOS dashboard" : "Create your account — no credit card needed"}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" required className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors" />
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type={showPass ? "text" : "password"} required minLength={6} className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (mode === "login" ? "Sign in to CoachOS →" : "Create Free Account →")}
              </button>
            </form>
            <div className="mt-4">
              <div className="relative flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <button onClick={handleDemoLogin} disabled={loading} className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-sm font-medium transition-all">
                🎯 Try Demo — no account needed
              </button>
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs text-center text-slate-400">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center mt-5">
            By continuing, you agree to our{" "}
            <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Terms</span>
            {" & "}
            <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
