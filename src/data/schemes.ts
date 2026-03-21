import type { Scheme } from "@/types";

export const SCHEMES: Scheme[] = [
  // ── Housing ───────────────────────────────────────────
  {
    id: "pmay-urban",
    name: "Pradhan Mantri Awas Yojana (Urban)",
    slug: "pm-awas-yojana-urban",
    shortName: "PMAY Urban",
    category: "housing",
    ministry: "Ministry of Housing and Urban Affairs",
    description:
      "Provides financial assistance to eligible urban households for construction or purchase of pucca houses. Covers EWS, LIG, and MIG categories.",
    eligibilitySummary:
      "Annual income below ₹18 lakh. No pucca house in India. First-time homebuyer. Indian citizen.",
    icon: "🏠",
    officialUrl: "https://pmaymis.gov.in",
    isActive: true,
    lastPolicyUpdate: "2024-01-01",
  },
  {
    id: "pmay-gramin",
    name: "Pradhan Mantri Awas Yojana (Gramin)",
    slug: "pm-awas-yojana-gramin",
    shortName: "PMAY Gramin",
    category: "housing",
    ministry: "Ministry of Rural Development",
    description:
      "Financial assistance of ₹1.20 lakh (plain areas) or ₹1.30 lakh (hilly/difficult areas) for rural households to construct pucca houses.",
    eligibilitySummary:
      "Rural household. Houseless or living in kutcha/dilapidated house. Name on SECC 2011 list. Priority: SC/ST, minorities, disabled.",
    icon: "🏡",
    officialUrl: "https://pmayg.nic.in",
    isActive: true,
    lastPolicyUpdate: "2024-03-01",
  },

  // ── Health ────────────────────────────────────────────
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    slug: "ayushman-bharat",
    shortName: "PM-JAY",
    category: "health",
    ministry: "Ministry of Health and Family Welfare",
    description:
      "Provides health cover of ₹5 lakh per family per year for secondary and tertiary hospitalisation. World's largest health insurance scheme.",
    eligibilitySummary:
      "Based on SECC 2011 database. Covers BPL families and specific occupational categories. No income ceiling — deprivation-based criteria.",
    icon: "🏥",
    officialUrl: "https://pmjay.gov.in",
    isActive: true,
    lastPolicyUpdate: "2024-01-15",
  },
  {
    id: "janani-suraksha",
    name: "Janani Suraksha Yojana",
    slug: "janani-suraksha-yojana",
    shortName: "JSY",
    category: "health",
    ministry: "Ministry of Health and Family Welfare",
    description:
      "Cash assistance to pregnant women for institutional delivery to reduce maternal and infant mortality. ₹1,400 in rural and ₹1,000 in urban areas.",
    eligibilitySummary:
      "All pregnant women in LPS states (low-performing states). BPL and SC/ST women in HPS states. Age 19+ years.",
    icon: "🤱",
    officialUrl: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841",
    isActive: true,
    lastPolicyUpdate: "2023-06-01",
  },

  // ── Agriculture ───────────────────────────────────────
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi",
    slug: "pm-kisan",
    shortName: "PM-KISAN",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    description:
      "Income support of ₹6,000 per year (₹2,000 every 4 months) to all farmer families with cultivable landholding, directly into bank account.",
    eligibilitySummary:
      "Farmer family with cultivable land. Valid Aadhaar and bank account. Not an income tax payer. Not a government employee or pensioner.",
    icon: "🌾",
    officialUrl: "https://pmkisan.gov.in",
    isActive: true,
    lastPolicyUpdate: "2024-02-01",
  },
  {
    id: "pm-fasal-bima",
    name: "Pradhan Mantri Fasal Bima Yojana",
    slug: "pm-fasal-bima-yojana",
    shortName: "PMFBY",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    description:
      "Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities, pests, or diseases.",
    eligibilitySummary:
      "All farmers including sharecroppers and tenant farmers growing notified crops. Compulsory for loanee farmers, voluntary for non-loanee.",
    icon: "🌱",
    officialUrl: "https://pmfby.gov.in",
    isActive: true,
    lastPolicyUpdate: "2023-12-01",
  },
  {
    id: "kisan-credit-card",
    name: "Kisan Credit Card Scheme",
    slug: "kisan-credit-card",
    shortName: "KCC",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    description:
      "Provides farmers with timely credit for agricultural needs including cultivation, post-harvest, and allied activities at subsidised interest rates.",
    eligibilitySummary:
      "Farmers, tenant farmers, sharecroppers, oral lessees, and SHGs with farming activities. Minimum age 18 years.",
    icon: "💳",
    officialUrl: "https://www.nabard.org/content1.aspx?id=572",
    isActive: true,
    lastPolicyUpdate: "2023-09-01",
  },

  // ── Finance / Social Security ─────────────────────────
  {
    id: "pm-jan-dhan",
    name: "Pradhan Mantri Jan Dhan Yojana",
    slug: "pm-jan-dhan-yojana",
    shortName: "PMJDY",
    category: "finance",
    ministry: "Ministry of Finance",
    description:
      "Universal banking access scheme providing zero-balance savings accounts with RuPay debit card, ₹1 lakh accident insurance, and ₹30,000 life cover.",
    eligibilitySummary:
      "Any Indian citizen aged 10+ without a bank account. One account per household.",
    icon: "🏦",
    officialUrl: "https://pmjdy.gov.in",
    isActive: true,
    lastPolicyUpdate: "2024-01-01",
  },
  {
    id: "pm-jivan-jyoti",
    name: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    slug: "pm-jeevan-jyoti-bima",
    shortName: "PMJJBY",
    category: "finance",
    ministry: "Ministry of Finance",
    description:
      "Life insurance cover of ₹2 lakh at a premium of ₹436 per year for death due to any reason. Renewable annually.",
    eligibilitySummary:
      "Age 18–50 years. Bank account holder. Aadhaar linked to bank account. Auto-debit consent required.",
    icon: "🛡️",
    officialUrl: "https://jansuraksha.gov.in/PMJJBY.aspx",
    isActive: true,
    lastPolicyUpdate: "2023-06-01",
  },
  {
    id: "pm-suraksha-bima",
    name: "Pradhan Mantri Suraksha Bima Yojana",
    slug: "pm-suraksha-bima-yojana",
    shortName: "PMSBY",
    category: "finance",
    ministry: "Ministry of Finance",
    description:
      "Accident insurance cover of ₹2 lakh for accidental death/full disability and ₹1 lakh for partial disability at ₹20 per year.",
    eligibilitySummary:
      "Age 18–70 years. Bank account with Aadhaar link. Annual auto-debit of ₹20 from bank account.",
    icon: "⚕️",
    officialUrl: "https://jansuraksha.gov.in/PMSBY.aspx",
    isActive: true,
    lastPolicyUpdate: "2023-06-01",
  },
  {
    id: "atal-pension",
    name: "Atal Pension Yojana",
    slug: "atal-pension-yojana",
    shortName: "APY",
    category: "finance",
    ministry: "Ministry of Finance",
    description:
      "Guaranteed pension of ₹1,000–₹5,000 per month after age 60, with government co-contribution for eligible subscribers joining before 2016.",
    eligibilitySummary:
      "Age 18–40 years. Indian citizen. Bank or post office account. Not an income tax payer.",
    icon: "👴",
    officialUrl: "https://npscra.nsdl.co.in/scheme-details.php",
    isActive: true,
    lastPolicyUpdate: "2023-09-01",
  },
  {
    id: "mudra-yojana",
    name: "Pradhan Mantri MUDRA Yojana",
    slug: "pm-mudra-yojana",
    shortName: "PMMY",
    category: "finance",
    ministry: "Ministry of Finance",
    description:
      "Provides loans up to ₹10 lakh to non-corporate, non-farm micro and small enterprises. Three tiers: Shishu (₹50K), Kishore (₹5L), Tarun (₹10L).",
    eligibilitySummary:
      "Non-farm income-generating businesses. No collateral required. Valid business plan. No prior loan default.",
    icon: "💼",
    officialUrl: "https://www.mudra.org.in",
    isActive: true,
    lastPolicyUpdate: "2024-01-01",
  },

  // ── Education ─────────────────────────────────────────
  {
    id: "pm-scholarship-scheme",
    name: "PM Scholarship Scheme for Central Armed Police Forces",
    slug: "pm-scholarship-capf",
    shortName: "PMSS",
    category: "education",
    ministry: "Ministry of Home Affairs",
    description:
      "Scholarships for widows/wards of Central Armed Police Forces personnel. ₹2,500/month for boys and ₹3,000/month for girls.",
    eligibilitySummary:
      "Ward or widow of CAPF/Assam Rifles personnel. Minimum 60% in qualifying exam. Pursuing professional degree.",
    icon: "🎓",
    officialUrl: "https://ksb.gov.in",
    isActive: true,
    lastPolicyUpdate: "2023-08-01",
  },
  {
    id: "national-means-merit",
    name: "National Means-cum-Merit Scholarship Scheme",
    slug: "national-means-merit-scholarship",
    shortName: "NMMSS",
    category: "education",
    ministry: "Ministry of Education",
    description:
      "₹12,000 per year (₹1,000/month) scholarship to meritorious students from economically weaker sections to reduce dropout rate at Class 8.",
    eligibilitySummary:
      "Class 9 students. Annual family income below ₹3.5 lakh. Minimum 55% in Class 7 (50% for SC/ST). Pass NMMS exam.",
    icon: "📚",
    officialUrl: "https://scholarships.gov.in",
    isActive: true,
    lastPolicyUpdate: "2023-11-01",
  },

  // ── Other / Social ────────────────────────────────────
  {
    id: "pm-ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana",
    slug: "pm-ujjwala-yojana",
    shortName: "PMUY",
    category: "other",
    ministry: "Ministry of Petroleum and Natural Gas",
    description:
      "Free LPG connections to BPL households to protect health of women and reduce indoor air pollution. ₹1,600 financial assistance.",
    eligibilitySummary:
      "Adult woman from BPL household. Name in SECC-2011 list or BPL ration card. No existing LPG connection in household.",
    icon: "🔥",
    officialUrl: "https://pmuy.gov.in",
    isActive: true,
    lastPolicyUpdate: "2023-10-01",
  },
  {
    id: "swachh-bharat-gramin",
    name: "Swachh Bharat Mission (Gramin)",
    slug: "swachh-bharat-gramin",
    shortName: "SBM-G",
    category: "other",
    ministry: "Ministry of Jal Shakti",
    description:
      "Incentive of ₹12,000 for construction of individual household toilets for BPL households and specific APL categories in rural areas.",
    eligibilitySummary:
      "Rural household. BPL or SC/ST or landless labourers or small/marginal farmers. No existing toilet. Enrolled in Gram Panchayat records.",
    icon: "🚽",
    officialUrl: "https://sbm.gov.in/sbmReport/home.aspx",
    isActive: true,
    lastPolicyUpdate: "2023-07-01",
  },
  {
    id: "pm-matru-vandana",
    name: "Pradhan Mantri Matru Vandana Yojana",
    slug: "pm-matru-vandana-yojana",
    shortName: "PMMVY",
    category: "health",
    ministry: "Ministry of Women and Child Development",
    description:
      "Maternity benefit of ₹5,000 in three instalments to pregnant and lactating women for first live birth to compensate for wage loss.",
    eligibilitySummary:
      "Pregnant women aged 19+ years. First live birth. Registered at Anganwadi Centre. Not a central/state government employee.",
    icon: "🤰",
    officialUrl: "https://pmmvy.wcd.gov.in",
    isActive: true,
    lastPolicyUpdate: "2023-12-01",
  },
  {
    id: "national-social-assistance",
    name: "National Social Assistance Programme",
    slug: "national-social-assistance-programme",
    shortName: "NSAP",
    category: "finance",
    ministry: "Ministry of Rural Development",
    description:
      "Monthly pension assistance to elderly, widows, and disabled persons from BPL households. Indira Gandhi National Old Age/Widow/Disability Pension.",
    eligibilitySummary:
      "BPL household member. Age 60+ for Old Age Pension. Widow of any age for Widow Pension. 80%+ disability for Disability Pension.",
    icon: "👵",
    officialUrl: "https://nsap.nic.in",
    isActive: true,
    lastPolicyUpdate: "2023-09-01",
  },
  {
    id: "pm-garib-kalyan-anna",
    name: "Pradhan Mantri Garib Kalyan Anna Yojana",
    slug: "pm-garib-kalyan-anna-yojana",
    shortName: "PMGKAY",
    category: "other",
    ministry: "Ministry of Consumer Affairs",
    description:
      "Free foodgrain (5 kg per person per month) to NFSA beneficiaries — Antyodaya Anna Yojana and Priority Household card holders.",
    eligibilitySummary:
      "NFSA beneficiary with valid ration card (AAY or PHH). Biometric authentication at PDS outlet.",
    icon: "🍚",
    officialUrl: "https://dfpd.gov.in",
    isActive: true,
    lastPolicyUpdate: "2024-01-01",
  },
  {
    id: "stand-up-india",
    name: "Stand-Up India Scheme",
    slug: "stand-up-india",
    shortName: "Stand-Up India",
    category: "finance",
    ministry: "Ministry of Finance",
    description:
      "Bank loans between ₹10 lakh and ₹1 crore to at least one SC/ST borrower and one woman borrower per bank branch for greenfield enterprises.",
    eligibilitySummary:
      "SC/ST or woman entrepreneur. Age 18+. Greenfield enterprise (first time in manufacturing/services/trading). No default with bank.",
    icon: "🚀",
    officialUrl: "https://www.standupmitra.in",
    isActive: true,
    lastPolicyUpdate: "2023-10-01",
  },
];

// ── Helper functions ──────────────────────────────────────

export function getSchemeBySlug(slug: string): Scheme | undefined {
  return SCHEMES.find((s) => s.slug === slug);
}

export function getSchemesByCategory(category: string): Scheme[] {
  if (category === "all") return SCHEMES;
  return SCHEMES.filter((s) => s.category === category);
}

export const CATEGORIES = [
  { value: "all", label: "All Schemes", icon: "🔍" },
  { value: "housing", label: "Housing", icon: "🏠" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "agriculture", label: "Agriculture", icon: "🌾" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "other", label: "Other", icon: "📦" },
] as const;
