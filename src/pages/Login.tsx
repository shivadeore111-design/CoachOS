import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, session, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingForSession, setWaitingForSession] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
      setLoading(false);
      setWaitingForSession(false);
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }
      toast.success("Welcome back! 👋");
      setWaitingForSession(true);
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    const { error: authError } = await signUp(email, password, name);
    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    toast.success("Account created! Check your email if verification is required.");
    setWaitingForSession(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-slate-900 font-bold text-lg">CoachOS</span>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
          )}
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Password</label>
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPass ? "text" : "password"} required minLength={6} className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading || authLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold">
            {loading || waitingForSession ? "Authenticating..." : mode === "login" ? "Sign in to CoachOS" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
