export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasStripe() {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY);
}

export function company() {
  return {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Iowa Structured Cabling LLC",
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "651-551-1174",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "Info@Iowacabling.com",
    web: process.env.NEXT_PUBLIC_COMPANY_WEB ?? "https://www.iowacabling.com",
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "2752 Holcomb Avenue, Des Moines, IA 50310",
  };
}
