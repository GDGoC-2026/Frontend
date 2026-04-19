import Link from "next/link";

type SearchParams = {
  plan?: string | string[];
};

const PLAN_MAP = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/ month",
    highlight: "Starter access for core learning flow.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    period: "/ month",
    highlight: "Best for active learners with AI-assisted practice.",
  },
  developer: {
    id: "developer",
    name: "Developer",
    price: "$29.99",
    period: "/ month",
    highlight: "Sandbox, advanced projects, and priority support.",
  },
} as const;

function resolvePlan(rawPlan: string | string[] | undefined) {
  const key = (Array.isArray(rawPlan) ? rawPlan[0] : rawPlan)?.toLowerCase() ?? "pro";
  return PLAN_MAP[key as keyof typeof PLAN_MAP] ?? PLAN_MAP.pro;
}

function PixelButton({
  href,
  label,
  hollow = false,
}: {
  href: string;
  label: string;
  hollow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 min-w-[184px] items-center justify-center border px-6 font-pixel text-[10px] uppercase tracking-[0.2em] transition-all duration-200 hover:-translate-y-0.5 ${
        hollow
          ? "border-white/55 bg-transparent text-white hover:border-[#9cff93] hover:text-[#9cff93]"
          : "border-[#9cff93] bg-[#9cff93] text-[#113a14] hover:bg-[#b1ff94]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function CheckoutPage({ searchParams }: { searchParams?: SearchParams }) {
  const selectedPlan = resolvePlan(searchParams?.plan);

  return (
    <main className="min-h-screen bg-[#05070a] px-6 py-10 text-white">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-[#243226] bg-[#0b110d] px-5 py-4">
          <div>
            <div className="font-pixel text-[10px] uppercase tracking-[0.22em] text-[#6f8273]">
              Subscription Checkout
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-[-0.04em] text-[#9cff93]">
              Payment Gateway UI
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <PixelButton href="/#pricing" label="Back to Pricing" hollow />
            <PixelButton href="/dashboard" label="Go Dashboard" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <section className="border border-[#253227] bg-[#0a0f0d] p-6">
            <div className="mb-6 border border-[#2f4431] bg-[#0f1712] px-4 py-3">
              <div className="font-pixel text-[10px] uppercase tracking-[0.22em] text-[#6f8273]">
                Selected Plan
              </div>
              <div className="mt-3 flex items-end gap-3">
                <div className="font-display text-3xl font-bold uppercase tracking-[-0.04em]">
                  {selectedPlan.name}
                </div>
                <div className="font-display text-lg text-[#9cff93]">
                  {selectedPlan.price}
                  <span className="text-sm text-white/60">{selectedPlan.period}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-white/65">{selectedPlan.highlight}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {["Card", "E-Wallet", "Bank Transfer"].map((method, index) => (
                <button
                  className={`border px-4 py-4 text-left transition-colors ${
                    index === 0
                      ? "border-[#9cff93] bg-[#111a13]"
                      : "border-[#2a372c] bg-[#0c120f] hover:border-[#3b5840]"
                  }`}
                  key={method}
                  type="button"
                >
                  <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-[#6f8273]">
                    Method
                  </div>
                  <div className="mt-2 font-display text-lg font-semibold uppercase">{method}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-pixel text-[10px] uppercase tracking-[0.2em] text-[#6f8273]">
                  Card Holder
                </span>
                <input
                  className="h-12 w-full border border-[#2b3b2f] bg-[#0a100d] px-4 text-sm outline-none transition-colors focus:border-[#9cff93]"
                  placeholder="NGUYEN VAN A"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-pixel text-[10px] uppercase tracking-[0.2em] text-[#6f8273]">
                  Card Number
                </span>
                <input
                  className="h-12 w-full border border-[#2b3b2f] bg-[#0a100d] px-4 text-sm outline-none transition-colors focus:border-[#9cff93]"
                  placeholder="4242 4242 4242 4242"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-pixel text-[10px] uppercase tracking-[0.2em] text-[#6f8273]">
                  Expiry Date
                </span>
                <input
                  className="h-12 w-full border border-[#2b3b2f] bg-[#0a100d] px-4 text-sm outline-none transition-colors focus:border-[#9cff93]"
                  placeholder="MM / YY"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-pixel text-[10px] uppercase tracking-[0.2em] text-[#6f8273]">
                  CVV
                </span>
                <input
                  className="h-12 w-full border border-[#2b3b2f] bg-[#0a100d] px-4 text-sm outline-none transition-colors focus:border-[#9cff93]"
                  placeholder="123"
                  type="password"
                />
              </label>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block font-pixel text-[10px] uppercase tracking-[0.2em] text-[#6f8273]">
                Promo Code
              </span>
              <div className="flex flex-wrap gap-3">
                <input
                  className="h-12 flex-1 border border-[#2b3b2f] bg-[#0a100d] px-4 text-sm outline-none transition-colors focus:border-[#9cff93]"
                  placeholder="ENTER CODE"
                  type="text"
                />
                <button
                  className="h-12 border border-[#4f7254] bg-[#101a12] px-5 font-pixel text-[10px] uppercase tracking-[0.2em] text-[#9cff93] transition-colors hover:bg-[#132016]"
                  type="button"
                >
                  Apply
                </button>
              </div>
            </label>
          </section>

          <aside className="border border-[#253227] bg-[#0a0f0d] p-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.03em] text-[#9cff93]">
              Order Summary
            </h2>
            <div className="mt-5 space-y-3 border border-[#2a372c] bg-[#0f1712] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">{selectedPlan.name} Plan</span>
                <span>{selectedPlan.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Platform Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Discount</span>
                <span>-$0.00</span>
              </div>
              <div className="border-t border-white/10 pt-3 text-base font-semibold">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="text-[#9cff93]">{selectedPlan.price}</span>
                </div>
              </div>
            </div>

            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center border border-[#9cff93] bg-[#9cff93] font-pixel text-[10px] uppercase tracking-[0.2em] text-[#123b15] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b1ff94]"
              type="button"
            >
              Confirm Payment
            </button>

            <div className="mt-6 border border-[#2a372c] bg-[#0e1511] p-4">
              <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-[#69daff]">
                Gateway Status
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                <span className="inline-block h-2 w-2 rounded-full bg-[#9cff93] shadow-[0_0_10px_rgba(156,255,147,0.8)]" />
                Secure payment session ready (UI only)
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/50">
              This is frontend gateway UI only. Payment API and webhook can be connected later
              without changing visual flow.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
