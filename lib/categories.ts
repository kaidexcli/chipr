import { ScheduleCCategory } from "@/types/finance";

export interface ExpenseCategory {
  id: string;
  name: string;
  entity: "personal" | "business" | "both";
  scheduleCCategory?: ScheduleCCategory;
  isTaxDeductible: boolean;
  deductiblePercentage: number;
  description: string;
  examples: string[];
}

export const STANDARD_CATEGORIES: ExpenseCategory[] = [
  // --- Comprehensive Personal Expense Categories ---
  {
    id: "cat-p-food",
    name: "Food & Dining",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Groceries, supermarkets, restaurants, dining out, fast food, coffee shops, cafes, food delivery, bakeries, snacks, drinks",
    examples: [
      "Jollibee",
      "McDonald's",
      "Starbucks",
      "Whole Foods",
      "Trader Joe's",
      "Costco",
      "Safeway",
      "Kroger",
      "Chipotle",
      "DoorDash",
      "Uber Eats",
      "GrabFood",
      "Foodpanda",
      "KFC",
      "Burger King",
      "Subway",
      "Chowking",
      "Mang Inasal",
      "Local Restaurant / Diner",
    ],
  },
  {
    id: "cat-p-clothes",
    name: "Shopping & Clothing",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Apparel, clothing, footwear, shoes, jackets, shirts, pants, accessories, jewelry, fashion retail",
    examples: [
      "Zara",
      "Nike",
      "Uniqlo",
      "H&M",
      "Nordstrom",
      "Levi's",
      "Adidas",
      "Gap",
      "Target Clothing",
      "Lululemon",
      "Shein",
    ],
  },
  {
    id: "cat-p-housing",
    name: "Housing & Rent",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Apartment rent, home mortgage, property taxes, home insurance, maintenance, repairs, furniture, home appliances",
    examples: [
      "Apartment Rent",
      "Mortgage Payment",
      "Home Depot",
      "IKEA",
      "HOA Fee",
      "Lowe's",
      "Plumbing Repair",
      "Furniture Store",
    ],
  },
  {
    id: "cat-p-utilities",
    name: "Utilities & Bills",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Electricity, water, natural gas, trash collection, home internet Wi-Fi, mobile phone cellular plans",
    examples: [
      "Electric Bill",
      "Meralco",
      "Water Bill",
      "Internet Wi-Fi",
      "PLDT",
      "Globe",
      "Smart",
      "AT&T",
      "Verizon",
      "T-Mobile",
      "Natural Gas",
    ],
  },
  {
    id: "cat-p-transportation",
    name: "Transportation & Fuel",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Gasoline, petrol, EV charging, public transit, subway, bus, taxi, rideshare (Uber, Lyft, Grab), parking, tolls, car maintenance",
    examples: [
      "Shell Gas Station",
      "Petron",
      "Caltex",
      "Chevron",
      "Grab Car",
      "Uber",
      "Lyft",
      "Metro Pass",
      "Subway Fare",
      "Highway Toll",
      "Parking Garage",
      "Oil Change",
    ],
  },
  {
    id: "cat-p-healthcare",
    name: "Healthcare & Medical",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Doctor visits, dental care, optometrist, prescription drugs, pharmacy, hospital bills, personal health insurance",
    examples: [
      "Mercury Drug",
      "Watsons Pharmacy",
      "CVS Pharmacy",
      "Walgreens",
      "Doctor Consultation",
      "Dental Clinic",
      "Prescription Medicine",
      "Health Insurance",
      "Eyeglasses / Optometry",
    ],
  },
  {
    id: "cat-p-fitness",
    name: "Personal Care & Fitness",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Gym memberships, fitness classes, barbershop, hair salon, spa, massage, cosmetics, personal grooming",
    examples: [
      "Gym Membership",
      "Anytime Fitness",
      "Planet Fitness",
      "Barber Shop Haircut",
      "Hair Salon",
      "Sephora",
      "Spa Treatment",
      "Cosmetics & Skincare",
    ],
  },
  {
    id: "cat-p-entertainment",
    name: "Entertainment & Leisure",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Movies, cinema, concerts, sporting events, video games, theme parks, bowling, recreational hobbies",
    examples: [
      "Cinema Movie Tickets",
      "AMC Theatres",
      "Steam Games",
      "PlayStation Network",
      "Nintendo eShop",
      "Concert Tickets",
      "Recreational Outing",
    ],
  },
  {
    id: "cat-p-subscriptions",
    name: "Subscriptions & Streaming",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Digital media subscriptions, video streaming, cloud storage, music streaming apps",
    examples: [
      "Netflix",
      "Spotify Premium",
      "YouTube Premium",
      "Apple One",
      "Disney+",
      "iCloud Storage",
      "Google One",
    ],
  },
  {
    id: "cat-p-education",
    name: "Education & Learning",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Tuition, college courses, online courses, textbooks, workshops, bootcamps, school supplies",
    examples: [
      "Coursera",
      "Udemy",
      "College Tuition",
      "Textbooks",
      "Barnes & Noble",
      "School Supplies",
    ],
  },
  {
    id: "cat-p-travel",
    name: "Travel & Vacations",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Personal airfare, hotels, resorts, Airbnb, car rentals, vacation packages, luggage",
    examples: [
      "Philippine Airlines",
      "Cebu Pacific",
      "Delta Airlines",
      "United Airlines",
      "Airbnb",
      "Marriott Hotel",
      "Hilton",
      "Expedia",
    ],
  },
  {
    id: "cat-p-gifts",
    name: "Gifts & Donations",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Charitable donations, birthday gifts, holiday gifts, family support, religious offerings",
    examples: [
      "Charity Donation",
      "Red Cross",
      "Birthday Present",
      "Holiday Gift",
      "Family Support / Remittance",
    ],
  },
  {
    id: "cat-p-pets",
    name: "Pets & Animals",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Pet food, veterinary visits, pet grooming, toys, pet medicine, pet boarding",
    examples: [
      "Petco",
      "Chewy",
      "Veterinary Clinic",
      "Pet Food Store",
      "Dog Grooming",
    ],
  },
  {
    id: "cat-p-financial",
    name: "Financial & Bank Fees",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Bank account service fees, ATM fees, wire fees, interest charges, credit card annual fees",
    examples: [
      "ATM Fee",
      "Bank Service Fee",
      "Credit Card Annual Fee",
      "Wire Transfer Fee",
    ],
  },
  {
    id: "cat-p-others",
    name: "Others & Miscellaneous",
    entity: "personal",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "General retail, convenience store purchases, cash withdrawals, and all other miscellaneous personal expenses",
    examples: [
      "7-Eleven",
      "Convenience Store",
      "General Merchandise",
      "Cash Withdrawal",
      "Miscellaneous Expense",
    ],
  },

  // --- Comprehensive Business Expense Categories (IRS Schedule C & Operations) ---
  {
    id: "cat-b1",
    name: "Office & Software Subscriptions",
    entity: "business",
    scheduleCCategory: "Office & Software Subscriptions",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Cloud infrastructure, SaaS tooling, productivity software, developer APIs, email suites",
    examples: ["AWS", "GitHub", "Figma", "Google Workspace", "Slack", "Vercel", "OpenAI API", "Groq API"],
  },
  {
    id: "cat-b2",
    name: "Advertising & Marketing",
    entity: "business",
    scheduleCCategory: "Advertising & Marketing",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Online ads, marketing campaigns, lead generation, branding, promotional materials",
    examples: ["Google Ads", "Meta Ads", "LinkedIn Ads", "Domain Registrations", "Mailchimp"],
  },
  {
    id: "cat-b3",
    name: "Contract Labor (1099)",
    entity: "business",
    scheduleCCategory: "Contract Labor (1099)",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Payments to independent contractors, freelance designers, outside developers",
    examples: ["Upwork", "Contractor Payment", "Freelance Developer", "Copywriter Fee"],
  },
  {
    id: "cat-b4",
    name: "Legal & Professional Services",
    entity: "business",
    scheduleCCategory: "Legal & Professional Services",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "CPA accounting fees, tax preparation, attorneys, business consulting",
    examples: ["CPA Retainer", "LegalZoom", "Corporate Counsel", "Bookkeeping Service"],
  },
  {
    id: "cat-b5",
    name: "Business Travel",
    entity: "business",
    scheduleCCategory: "Travel",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Airfare, hotel accommodations, car rentals exclusively for business trips",
    examples: ["Delta Airlines", "Marriott", "United Airlines", "Enterprise Rent-A-Car"],
  },
  {
    id: "cat-b6",
    name: "Meals & Entertainment (50%)",
    entity: "business",
    scheduleCCategory: "Meals & Entertainment (50%)",
    isTaxDeductible: true,
    deductiblePercentage: 50,
    description: "Business meals with clients, prospects, or partners (50% IRS deductible)",
    examples: ["Client Dinner", "Business Lunch", "Partner Coffee Meeting"],
  },
  {
    id: "cat-b7",
    name: "Car & Truck / Mileage",
    entity: "business",
    scheduleCCategory: "Car & Truck / Mileage",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Gas, tolls, and mileage for travel between business destinations",
    examples: ["Business Fuel", "Highway Tolls", "Airport Parking for Business Trip"],
  },
  {
    id: "cat-b8",
    name: "Taxes & Licenses",
    entity: "business",
    scheduleCCategory: "Taxes & Licenses",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "State LLC franchise tax fees, city business licenses, regulatory filings",
    examples: ["Delaware Franchise Tax", "State Secretary of State Fee", "City Business License"],
  },
  {
    id: "cat-b9",
    name: "Office Supplies & Equipment",
    entity: "business",
    scheduleCCategory: "Other Business Expenses",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Computer hardware, monitors, desks, chairs, stationery, printer ink",
    examples: ["Apple Store Hardware", "Dell Monitor", "Staples Office Supplies"],
  },
  {
    id: "cat-b10",
    name: "Other Business Expenses",
    entity: "business",
    scheduleCCategory: "Other Business Expenses",
    isTaxDeductible: true,
    deductiblePercentage: 100,
    description: "Bank fees, business insurance, merchant processing fees, miscellaneous operations",
    examples: ["Stripe Fees", "Business Insurance", "PO Box Rental"],
  },
  {
    id: "cat-b11",
    name: "Owner's Draw",
    entity: "business",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Owner taking profit distribution from business to personal account (not an expense/deduction)",
    examples: ["Owner Draw", "Owner Distribution", "Transfer to Personal"],
  },
  {
    id: "cat-b12",
    name: "Capital Contribution",
    entity: "business",
    isTaxDeductible: false,
    deductiblePercentage: 0,
    description: "Owner infusing personal funds into business entity (equity capital)",
    examples: ["Capital Injection", "Owner Contribution"],
  },
];

/**
 * Normalizes and accurately resolves any expense description or merchant into
 * the canonical Chipr category taxonomy.
 */
export function resolveCategory(
  categoryInput?: string,
  merchantInput?: string,
  entity: "personal" | "business" = "personal"
): string {
  const cat = (categoryInput || "").trim();
  const merch = (merchantInput || "").trim().toLowerCase();
  const catLower = cat.toLowerCase();

  if (entity === "business") {
    if (
      catLower.includes("software") ||
      catLower.includes("saas") ||
      catLower.includes("cloud") ||
      merch.includes("aws") ||
      merch.includes("github") ||
      merch.includes("figma") ||
      merch.includes("vercel") ||
      merch.includes("slack") ||
      merch.includes("openai") ||
      merch.includes("groq")
    ) {
      return "Office & Software Subscriptions";
    }
    if (
      catLower.includes("ad") ||
      catLower.includes("market") ||
      merch.includes("google ads") ||
      merch.includes("meta ads") ||
      merch.includes("linkedin")
    ) {
      return "Advertising & Marketing";
    }
    if (catLower.includes("contract") || catLower.includes("freelance") || merch.includes("upwork")) {
      return "Contract Labor (1099)";
    }
    if (
      catLower.includes("legal") ||
      catLower.includes("cpa") ||
      catLower.includes("account") ||
      catLower.includes("attorney")
    ) {
      return "Legal & Professional Services";
    }
    if (catLower.includes("travel") || catLower.includes("flight") || catLower.includes("hotel")) {
      return "Business Travel";
    }
    if (catLower.includes("meal") || catLower.includes("dinner") || catLower.includes("lunch")) {
      return "Meals & Entertainment (50%)";
    }
    if (catLower.includes("mileage") || catLower.includes("gas") || catLower.includes("toll")) {
      return "Car & Truck / Mileage";
    }
    if (catLower.includes("tax") || catLower.includes("license") || catLower.includes("fee")) {
      return "Taxes & Licenses";
    }
    if (
      catLower.includes("supply") ||
      catLower.includes("equipment") ||
      catLower.includes("hardware")
    ) {
      return "Office Supplies & Equipment";
    }
    if (catLower.includes("draw")) return "Owner's Draw";
    if (catLower.includes("capital") || catLower.includes("contribution")) return "Capital Contribution";
    return cat || "Other Business Expenses";
  }

  // --- Personal Expense Categories Matching ---
  // 1. Food & Dining
  if (
    merch.includes("jollibee") ||
    merch.includes("mcdonald") ||
    merch.includes("starbucks") ||
    merch.includes("kfc") ||
    merch.includes("burger") ||
    merch.includes("subway") ||
    merch.includes("chipotle") ||
    merch.includes("pizza") ||
    merch.includes("dunkin") ||
    merch.includes("wendy") ||
    merch.includes("chowking") ||
    merch.includes("mang inasal") ||
    merch.includes("grabfood") ||
    merch.includes("foodpanda") ||
    merch.includes("doordash") ||
    merch.includes("ubereats") ||
    catLower === "food" ||
    catLower === "dining" ||
    catLower === "groceries" ||
    catLower === "grocery" ||
    catLower.includes("food") ||
    catLower.includes("dining") ||
    catLower.includes("grocer") ||
    catLower.includes("restaurant") ||
    catLower.includes("fast food") ||
    catLower.includes("meal") ||
    catLower.includes("snack") ||
    catLower.includes("cafe") ||
    catLower.includes("coffee") ||
    catLower.includes("bakery")
  ) {
    return "Food & Dining";
  }

  // 2. Shopping & Clothing
  if (
    merch.includes("zara") ||
    merch.includes("nike") ||
    merch.includes("uniqlo") ||
    merch.includes("h&m") ||
    merch.includes("adidas") ||
    merch.includes("gap") ||
    merch.includes("shein") ||
    merch.includes("lululemon") ||
    merch.includes("nordstrom") ||
    catLower === "clothes" ||
    catLower === "clothing" ||
    catLower === "apparel" ||
    catLower.includes("cloth") ||
    catLower.includes("apparel") ||
    catLower.includes("fashion") ||
    catLower.includes("shoe") ||
    catLower.includes("footwear") ||
    catLower.includes("jacket") ||
    catLower.includes("shirt") ||
    catLower.includes("pant")
  ) {
    return "Shopping & Clothing";
  }

  // 3. Housing & Rent
  if (
    merch.includes("ikea") ||
    merch.includes("home depot") ||
    merch.includes("lowe") ||
    catLower.includes("rent") ||
    catLower.includes("mortgage") ||
    catLower.includes("housing") ||
    catLower.includes("furniture") ||
    catLower.includes("plumbing") ||
    catLower.includes("hoa")
  ) {
    return "Housing & Rent";
  }

  // 4. Utilities & Bills
  if (
    merch.includes("meralco") ||
    merch.includes("pldt") ||
    merch.includes("globe") ||
    merch.includes("smart") ||
    merch.includes("water") ||
    merch.includes("electric") ||
    catLower.includes("utilit") ||
    catLower.includes("electric") ||
    catLower.includes("water bill") ||
    catLower.includes("power bill") ||
    catLower.includes("internet") ||
    catLower.includes("wifi") ||
    catLower.includes("cellular") ||
    catLower.includes("phone bill")
  ) {
    return "Utilities & Bills";
  }

  // 5. Transportation & Fuel
  if (
    merch.includes("shell") ||
    merch.includes("petron") ||
    merch.includes("caltex") ||
    merch.includes("chevron") ||
    merch.includes("mobil") ||
    merch.includes("grab") ||
    merch.includes("uber") ||
    merch.includes("lyft") ||
    catLower.includes("gas") ||
    catLower.includes("fuel") ||
    catLower.includes("petrol") ||
    catLower.includes("transit") ||
    catLower.includes("subway") ||
    catLower.includes("bus") ||
    catLower.includes("fare") ||
    catLower.includes("toll") ||
    catLower.includes("parking") ||
    catLower.includes("transport")
  ) {
    return "Transportation & Fuel";
  }

  // 6. Healthcare & Medical
  if (
    merch.includes("mercury drug") ||
    merch.includes("watsons") ||
    merch.includes("cvs") ||
    merch.includes("walgreens") ||
    catLower.includes("health") ||
    catLower.includes("medic") ||
    catLower.includes("doctor") ||
    catLower.includes("clinic") ||
    catLower.includes("pharmacy") ||
    catLower.includes("dental") ||
    catLower.includes("hospital")
  ) {
    return "Healthcare & Medical";
  }

  // 7. Personal Care & Fitness
  if (
    merch.includes("gym") ||
    merch.includes("anytime fitness") ||
    merch.includes("barber") ||
    merch.includes("salon") ||
    merch.includes("sephora") ||
    catLower.includes("fitness") ||
    catLower.includes("gym") ||
    catLower.includes("haircut") ||
    catLower.includes("barber") ||
    catLower.includes("salon") ||
    catLower.includes("spa") ||
    catLower.includes("skincare") ||
    catLower.includes("cosmetic")
  ) {
    return "Personal Care & Fitness";
  }

  // 8. Entertainment & Leisure
  if (
    merch.includes("cinema") ||
    merch.includes("theatre") ||
    merch.includes("steam") ||
    merch.includes("playstation") ||
    merch.includes("nintendo") ||
    catLower.includes("entertain") ||
    catLower.includes("movie") ||
    catLower.includes("cinema") ||
    catLower.includes("game") ||
    catLower.includes("gaming") ||
    catLower.includes("concert")
  ) {
    return "Entertainment & Leisure";
  }

  // 9. Subscriptions & Streaming
  if (
    merch.includes("netflix") ||
    merch.includes("spotify") ||
    merch.includes("youtube") ||
    merch.includes("disney") ||
    merch.includes("apple one") ||
    merch.includes("icloud") ||
    catLower.includes("subscription") ||
    catLower.includes("streaming")
  ) {
    return "Subscriptions & Streaming";
  }

  // 10. Education & Learning
  if (
    merch.includes("coursera") ||
    merch.includes("udemy") ||
    catLower.includes("education") ||
    catLower.includes("tuition") ||
    catLower.includes("course") ||
    catLower.includes("book") ||
    catLower.includes("school")
  ) {
    return "Education & Learning";
  }

  // 11. Travel & Vacations
  if (
    merch.includes("cebu pacific") ||
    merch.includes("philippine airlines") ||
    merch.includes("airbnb") ||
    merch.includes("hotel") ||
    merch.includes("airline") ||
    catLower.includes("travel") ||
    catLower.includes("vacation") ||
    catLower.includes("flight") ||
    catLower.includes("resort")
  ) {
    return "Travel & Vacations";
  }

  // 12. Gifts & Donations
  if (
    catLower.includes("gift") ||
    catLower.includes("donation") ||
    catLower.includes("charity") ||
    catLower.includes("remittance")
  ) {
    return "Gifts & Donations";
  }

  // 13. Pets & Animals
  if (
    merch.includes("petco") ||
    merch.includes("chewy") ||
    catLower.includes("pet") ||
    catLower.includes("vet") ||
    catLower.includes("dog") ||
    catLower.includes("cat")
  ) {
    return "Pets & Animals";
  }

  // 14. Financial & Bank Fees
  if (
    catLower.includes("bank fee") ||
    catLower.includes("atm fee") ||
    catLower.includes("interest") ||
    catLower.includes("wire fee")
  ) {
    return "Financial & Bank Fees";
  }

  // 15. Check if it directly matches any standard category name
  const matched = STANDARD_CATEGORIES.find(
    (c) => c.name.toLowerCase() === catLower
  );
  if (matched) {
    return matched.name;
  }

  if (cat) {
    return cat;
  }

  return "Others & Miscellaneous";
}

/**
 * Returns all standard personal categories.
 */
export function getPersonalCategories(): ExpenseCategory[] {
  return STANDARD_CATEGORIES.filter((c) => c.entity === "personal" || c.entity === "both");
}

/**
 * Returns all standard business categories.
 */
export function getBusinessCategories(): ExpenseCategory[] {
  return STANDARD_CATEGORIES.filter((c) => c.entity === "business" || c.entity === "both");
}
