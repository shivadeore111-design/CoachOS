import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Check } from "lucide-react";
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
      setLoading(false);
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
      navigate("/dashboard", { replace: true });
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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <section className="flex w-full flex-col justify-between bg-slate-900 px-6 py-10 sm:px-10 lg:w-3/5 lg:px-16 lg:py-14">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">CoachOS</span>
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              The OS for elite fitness coaches
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
              Manage clients, track progress, and grow your coaching business — all in one place.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Real-time client progress tracking",
                "AI-powered workout planning",
                "Automated alerts & check-ins",
                "Revenue & business analytics",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-200">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-slate-700 bg-slate-800 p-6">
            <p className="text-slate-100">
              “CoachOS helped me scale from 8 to 40 clients without burning out.”
            </p>
            <p className="mt-3 text-sm text-slate-300">— Marcus T., Online Fitness Coach</p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-slate-800 px-6 py-10 sm:px-10 lg:w-2/5">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/70 p-8 shadow-2xl backdrop-blur">
            <h2 className="mb-6 text-3xl font-bold text-white">Welcome back</h2>

            <div className="mb-6 flex rounded-xl bg-slate-700 p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    mode === m ? "bg-slate-900 text-white shadow-sm" : "text-slate-300"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
              >
                {loading ? "Authenticating..." : mode === "login" ? "Sign in to CoachOS" : "Create Account"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
