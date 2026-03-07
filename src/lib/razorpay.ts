import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export async function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiateSubscription(plan: "pro" | "business", email: string) {
  if (!KEY_ID) {
    toast("Contact shiva.deore111@gmail.com to upgrade");
    return;
  }

  const loaded = await loadRazorpay();
  if (!loaded || !window.Razorpay) {
    toast.error("Unable to load checkout right now.");
    return;
  }

  const amount = plan === "pro" ? 99900 : 249900;

  const razorpay = new window.Razorpay({
    key: KEY_ID,
    amount,
    currency: "INR",
    name: "CoachOS",
    description: `${plan === "pro" ? "Pro" : "Business"} Monthly Subscription`,
    prefill: { email },
    handler: () => toast.success("Payment captured. Plan update pending backend verification."),
  });

  razorpay.open();
}
