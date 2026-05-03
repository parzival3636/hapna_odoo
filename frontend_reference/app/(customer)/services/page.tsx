"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/utils/get-role";
import { ServiceCard } from "@/app/components/customer/ServiceCard";

interface UserInfo { email: string; name: string; role: string; }

// Mock data for services
const mockServices = [
  {
    id: "s1",
    title: "General Health Check-up",
    price: "₹1,200",
    providerName: "Dr. Aris Varma",
    providerAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ujOMUqxd-_Cg8D13rQSTH-mEQgu2OXgfGf1DgBC0KEWs_0Km4tZr8xp1XYJ3bhBkaFgm4gqXEz8ytxdxq62kT6ehO9DUq7siVonz7jhCn1xzouaC0ynYj3qdpeKsUdkPojJ5LKcTm7WbUSaIwWw1xZ9UbrNcD6C-ql3j9EGAjv6nBhLmI6FGWNUCRp8isbKKqd6Gs88Yjpy9k1rdcGDsgID28Lkm3bIqGECuHYUrEVpWlp-hy0OuCPKm6-UPL6tbiNL4dkE5r-m",
    duration: "45 min",
    location: "In-person",
    category: "Health"
  },
  {
    id: "s2",
    title: "Morning Flow Yoga",
    price: "₹800",
    providerName: "Sarah Mitchell",
    providerAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ujOMUqxd-_Cg8D13rQSTH-mEQgu2OXgfGf1DgBC0KEWs_0Km4tZr8xp1XYJ3bhBkaFgm4gqXEz8ytxdxq62kT6ehO9DUq7siVonz7jhCn1xzouaC0ynYj3qdpeKsUdkPojJ5LKcTm7WbUSaIwWw1xZ9UbrNcD6C-ql3j9EGAjv6nBhLmI6FGWNUCRp8isbKKqd6Gs88Yjpy9k1rdcGDsgID28Lkm3bIqGECuHYUrEVpWlp-hy0OuCPKm6-UPL6tbiNL4dkE5r-m",
    duration: "60 min",
    location: "Online",
    category: "Beauty"
  },
  {
    id: "s3",
    title: "Financial Strategy",
    price: "₹2,500",
    providerName: "James Chen",
    providerAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ujOMUqxd-_Cg8D13rQSTH-mEQgu2OXgfGf1DgBC0KEWs_0Km4tZr8xp1XYJ3bhBkaFgm4gqXEz8ytxdxq62kT6ehO9DUq7siVonz7jhCn1xzouaC0ynYj3qdpeKsUdkPojJ5LKcTm7WbUSaIwWw1xZ9UbrNcD6C-ql3j9EGAjv6nBhLmI6FGWNUCRp8isbKKqd6Gs88Yjpy9k1rdcGDsgID28Lkm3bIqGECuHYUrEVpWlp-hy0OuCPKm6-UPL6tbiNL4dkE5r-m",
    duration: "30 min",
    location: "Hybrid",
    category: "Consulting"
  }
];

export default function CustomerServices() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function loadUser() {
      const { role, user: u } = await getUserRole();
      // Temporarily bypass auth check for UI development
      // if (!u) { router.push("/login"); return; }
      setUser({ email: u?.email || "customer@example.com", name: u?.user_metadata?.full_name || "Customer", role: role || "customer" });
    }
    loadUser();
  }, [router]);

  const categories = ["All", "Health", "Beauty", "Consulting", "Education"];
  
  const filteredServices = activeCategory === "All" 
    ? mockServices 
    : mockServices.filter(s => s.category === activeCategory);

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="mb-12 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-900 tracking-tight font-serif">Browse Services</h1>
        <p className="text-lg text-slate-500">Find and book appointments with top-tier professionals.</p>
      </section>

      {/* Search & Filters */}
      <section className="mb-10 space-y-6">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">search</span>
          <input 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all text-base shadow-sm" 
            placeholder="Search services..." 
            type="text"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                activeCategory === category 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Service Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filteredServices.map(service => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </section>
    </div>
  );
}
