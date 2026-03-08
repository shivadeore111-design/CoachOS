import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { initiateSubscription } from "../lib/razorpay";

const plans = [
  { id: "free", name: "Free", price: "₹0", period: "mo", features: ["Up to 5 clients", "Basic dashboard"], cta: "Current Plan" },
  { id: "pro", name: "Pro", price: "₹999", period: "mo", badge: "Most Popular", features: ["Unlimited clients", "Full analytics", "AI insights"], cta: "Upgrade" },
  { id: "business", name: "Business", price: "₹2499", period: "mo", features: ["Everything in Pro", "Multi-coach", "White-label"], cta: "Upgrade" },
] as const;

export default function Pricing() {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-6">
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-5"><h1 className="text-lg sm:text-xl font-bold text-slate-800">Pricing</h1><p className="text-sm text-slate-400">Choose the right plan for your coaching business</p></div>
      <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl border p-6 ${plan.id === "pro" ? "border-emerald-400 shadow-lg" : "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-2"><h2 className="text-lg font-bold text-slate-800">{plan.name}</h2>{plan.badge && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{plan.badge}</span>}</div>
            <p className="text-3xl font-bold text-slate-800">{plan.price}<span className="text-sm text-slate-400">/{plan.period}</span></p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" />{feature}</li>)}</ul>
            <button
              disabled={plan.id === "free"}
              onClick={() => plan.id !== "free" && initiateSubscription(plan.id, user?.email ?? "")}
              className={`mt-6 w-full min-h-11 rounded-xl text-sm font-semibold ${plan.id === "free" ? "bg-slate-100 text-slate-500" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
