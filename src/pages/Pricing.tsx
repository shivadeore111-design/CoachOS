import { CheckCircle2, Zap, Users, Building2, Star, ArrowRight, Shield } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for solo coaches just getting started.",
    color: "border-slate-200",
    headerBg: "bg-slate-50",
    badge: null,
    cta: "Current Plan",
    ctaStyle: "bg-slate-100 text-slate-500 cursor-default",
    icon: Zap,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    features: [
      { text: "Up to 3 clients", included: true },
      { text: "Basic adherence tracking", included: true },
      { text: "30-day workout history", included: true },
      { text: "Risk level classification", included: true },
      { text: "AI insights & alerts", included: false },
      { text: "Shareable client reports", included: false },
      { text: "Trend analytics & charts", included: false },
      { text: "Streak tracking", included: false },
      { text: "Export to PDF/CSV", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious coaches growing their client base.",
    color: "border-emerald-400",
    headerBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    badge: "Most Popular",
    cta: "Start 14-Day Free Trial",
    ctaStyle: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    icon: Users,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    features: [
      { text: "Unlimited clients", included: true },
      { text: "Full adherence tracking", included: true },
      { text: "Unlimited workout history", included: true },
      { text: "Risk level classification", included: true },
      { text: "AI insights & alerts", included: true },
      { text: "Shareable client reports", included: true },
      { text: "Trend analytics & charts", included: true },
      { text: "Streak tracking", included: true },
      { text: "Export to PDF/CSV", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Team",
    price: "$79",
    period: "per month",
    description: "For gyms, studios, and coaching teams.",
    color: "border-violet-300",
    headerBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    badge: "Best Value",
    cta: "Contact Sales",
    ctaStyle: "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20",
    icon: Building2,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    features: [
      { text: "Unlimited clients", included: true },
      { text: "Full adherence tracking", included: true },
      { text: "Unlimited workout history", included: true },
      { text: "Risk level classification", included: true },
      { text: "AI insights & alerts", included: true },
      { text: "Shareable client reports", included: true },
      { text: "Trend analytics & charts", included: true },
      { text: "Streak tracking", included: true },
      { text: "Export to PDF/CSV", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade at any time. Changes apply immediately and billing is prorated.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is always safe. If you exceed Free tier limits, we'll archive (not delete) client profiles until you upgrade.",
  },
  {
    q: "Is there a setup fee?",
    a: "Never. No setup fees, no hidden costs. What you see is what you pay.",
  },
  {
    q: "Can I add my clients to their own portal?",
    a: "Client-facing portals are on our roadmap for Q3. Pro and Team subscribers will get early access.",
  },
];

export default function Pricing() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Upgrade CoachOS</h1>
          <p className="text-sm text-slate-400 mt-0.5">Unlock the full power of adherence intelligence</p>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Star size={12} />
            Trusted by 2,000+ fitness coaches worldwide
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you're ready. No contracts, no surprises.
            All plans include our core Adherence Intelligence Score.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${plan.color} ${
                plan.name === "Pro" ? "shadow-xl shadow-emerald-500/10 scale-[1.02]" : "shadow-sm"
              }`}
            >
              {/* Card Header */}
              <div className={`px-6 py-5 ${plan.name === "Pro" || plan.name === "Team" ? plan.headerBg : "bg-white border-b border-slate-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className={`flex items-center gap-2 ${plan.name === "Pro" || plan.name === "Team" ? "" : ""}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      plan.name === "Pro" || plan.name === "Team" ? "bg-white/20" : plan.iconBg
                    }`}>
                      <plan.icon size={16} className={plan.name === "Pro" || plan.name === "Team" ? "text-white" : plan.iconColor} />
                    </div>
                    <span className={`text-sm font-bold ${plan.name === "Pro" || plan.name === "Team" ? "text-white" : "text-slate-800"}`}>
                      {plan.name}
                    </span>
                  </div>
                  {plan.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className={`mt-2 ${plan.name === "Pro" || plan.name === "Team" ? "text-white" : "text-slate-800"}`}>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.name === "Pro" || plan.name === "Team" ? "text-white/70" : "text-slate-400"}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${plan.name === "Pro" || plan.name === "Team" ? "text-white/70" : "text-slate-400"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="px-6 py-5">
                <ul className="space-y-2.5 mb-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-xs ${feature.included ? "text-slate-600" : "text-slate-300"}`}>
                      {feature.included ? (
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 flex-shrink-0 mt-0.5" />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                  onClick={() => {
                    if (plan.name !== "Free") {
                      alert(`🚀 ${plan.name} plan selected!\n\nIn production, this opens Stripe checkout for $${plan.name === "Pro" ? "29" : "79"}/month.`);
                    }
                  }}
                >
                  {plan.cta}
                  {plan.name !== "Free" && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4">
          {[
            { icon: Shield, text: "256-bit SSL encryption" },
            { icon: Star, text: "14-day free trial" },
            { icon: CheckCircle2, text: "Cancel anytime" },
            { icon: Zap, text: "Instant setup" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 text-xs">
              <b.icon size={14} className="text-emerald-500" />
              {b.text}
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Full Feature Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-slate-500 font-medium">Feature</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium">Free</th>
                  <th className="text-center px-4 py-3 text-emerald-600 font-semibold">Pro</th>
                  <th className="text-center px-4 py-3 text-violet-600 font-semibold">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { feature: "Clients", free: "3", pro: "Unlimited", team: "Unlimited" },
                  { feature: "Workout history", free: "30 days", pro: "Unlimited", team: "Unlimited" },
                  { feature: "Adherence score", free: "✓", pro: "✓", team: "✓" },
                  { feature: "Risk classification", free: "✓", pro: "✓", team: "✓" },
                  { feature: "AI insights", free: "—", pro: "✓", team: "✓" },
                  { feature: "Trend analytics", free: "—", pro: "✓", team: "✓" },
                  { feature: "Streak tracking", free: "—", pro: "✓", team: "✓" },
                  { feature: "Shareable reports", free: "—", pro: "✓", team: "✓" },
                  { feature: "Team coaches", free: "1", pro: "1", team: "Up to 5" },
                  { feature: "PDF/CSV export", free: "—", pro: "—", team: "✓" },
                  { feature: "Priority support", free: "—", pro: "—", team: "✓" },
                  { feature: "White-label reports", free: "—", pro: "—", team: "✓" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-600 font-medium">{row.feature}</td>
                    <td className={`px-4 py-3 text-center ${row.free === "—" ? "text-slate-200" : "text-slate-500"}`}>{row.free}</td>
                    <td className={`px-4 py-3 text-center font-medium ${row.pro === "—" ? "text-slate-200" : "text-emerald-600"}`}>{row.pro}</td>
                    <td className={`px-4 py-3 text-center font-medium ${row.team === "—" ? "text-slate-200" : "text-violet-600"}`}>{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-4 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">{faq.q}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to scale your coaching?</h3>
          <p className="text-emerald-100 text-sm mb-5 max-w-sm mx-auto">
            Join thousands of coaches using CoachOS to deliver better results and grow their business.
          </p>
          <button
            className="bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors inline-flex items-center gap-2"
            onClick={() => alert("🚀 Starting free trial!\n\nIn production, this opens Stripe checkout.")}
          >
            Start 14-Day Free Trial
            <ArrowRight size={15} />
          </button>
          <p className="text-emerald-200 text-xs mt-3">No credit card required · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
