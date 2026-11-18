export type LandingFeature = {
  title: string;
  description: string;
};

export type LandingStep = {
  step: number;
  title: string;
  description: string;
};

export type PartnerLandingContent = {
  host: {
    name: string;
    siteUrl: string;
    headerBadge: string;
  };
  partner: {
    name: string;
    productName: string;
    siteUrl: string;
  };
  audienceStrip: string;
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  offer: {
    badge: string;
    title: string;
    description: string;
    eligibility: string;
    expiresLabel: string;
  };
  featuresSection: {
    title: string;
    lead: string;
  };
  features: LandingFeature[];
  stepsSection: {
    title: string;
    lead: string;
  };
  steps: LandingStep[];
  testimonial: {
    quote: string;
    attribution: string;
    role: string;
  };
  finalCta: {
    headline: string;
    body: string;
    buttonLabel: string;
    href: string;
  };
  footer: {
    disclaimer: string;
    links: { label: string; href: string }[];
  };
};

const MYOB_PRICING_URL = "https://www.myob.com/au/pricing";

/** Mock content — Canva users joining MYOB (AU), MYOB site + Canva theme. */
export const partnerLandingContent: PartnerLandingContent = {
  host: {
    name: "MYOB",
    siteUrl: "https://www.myob.com/au",
    headerBadge: "× Canva",
  },
  partner: {
    name: "Canva",
    productName: "Canva",
    siteUrl: "https://www.canva.com/en_au/",
  },
  audienceStrip: "Exclusive offer for Canva users in Australia",
  hero: {
    eyebrow: "You design in Canva. Run the business in MYOB.",
    headline: "Turn your Canva hustle into books, BAS, and invoices that stack up",
    subheadline:
      "Join MYOB to handle GST, invoicing, and cash flow while you keep creating in Canva — one partner offer, built for freelancers and small teams who live in both tools.",
    primaryCta: {
      label: "Join MYOB",
      href: MYOB_PRICING_URL,
    },
    secondaryCta: {
      label: "Compare plans",
      href: "#features",
    },
  },
  offer: {
    badge: "Canva member offer",
    title: "6 months half price on MYOB Business",
    description:
      "Get guided setup, unlimited invoicing, and expense tracking when you sign up via this page with your Canva account.",
    eligibility:
      "For new MYOB Business customers with an active Canva account (Australia). Mock terms — confirm on myob.com before launch.",
    expiresLabel: "Offer ends 31 March 2026",
  },
  featuresSection: {
    title: "Why Canva users choose MYOB",
    lead:
      "Keep your visual brand in Canva and your numbers compliant in MYOB — no more spreadsheets on the side of your design workflow.",
  },
  features: [
    {
      title: "Invoices that match your brand",
      description:
        "Use the colours and logo you already have in Canva Brand Kit when you send tax invoices and quotes from MYOB.",
    },
    {
      title: "GST & BAS without the guesswork",
      description:
        "Automated sales tax categorisation and BAS-ready reporting so you spend less time out of the editor.",
    },
    {
      title: "One business, two tools",
      description:
        "Connect once with your Canva login, then jump between creating assets and getting paid — mock integration for demo only.",
    },
  ],
  stepsSection: {
    title: "How to join",
    lead: "Three steps from Canva to running your books on MYOB.",
  },
  steps: [
    {
      step: 1,
      title: "Continue with Canva",
      description:
        "Verify your Canva account so we know you’re eligible for the partner rate.",
    },
    {
      step: 2,
      title: "Pick a MYOB plan",
      description:
        "Choose Business Lite or Pro based on whether you need payroll, inventory, or multi-user access.",
    },
    {
      step: 3,
      title: "Create & get paid",
      description:
        "Design campaigns in Canva; raise invoices and track expenses in MYOB.",
    },
  ],
  testimonial: {
    quote:
      "I was sending Canva invoices as PDFs and chasing payments in DMs. Moving to MYOB meant my Brand Kit colours still show up, but GST and overdue reminders are automatic.",
    attribution: "Jordan Ellis",
    role: "Freelance brand designer — Canva Pro & MYOB Business Lite",
  },
  finalCta: {
    headline: "Ready to join MYOB?",
    body: "Start with your Canva account. Cancel or change plan any time within MYOB account settings.",
    buttonLabel: "Join MYOB with Canva",
    href: MYOB_PRICING_URL,
  },
  footer: {
    disclaimer:
      "Mock partner landing for demonstration. Canva® is a trademark of Canva Pty Ltd. MYOB® is a trademark of MYOB Group Limited. Offers, eligibility, and integrations described here are fictitious unless published on myob.com.",
    links: [
      { label: "MYOB Terms", href: "https://www.myob.com/au/legal/terms" },
      { label: "Privacy", href: "https://www.myob.com/au/legal/privacy" },
      { label: "Canva", href: "https://www.canva.com/en_au/" },
    ],
  },
};