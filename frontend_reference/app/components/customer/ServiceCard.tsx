import Link from "next/link";
import Image from "next/image";

interface ServiceCardProps {
  id: string;
  title: string;
  price: string;
  providerName: string;
  providerAvatar: string;
  duration: string;
  location: string;
}

export function ServiceCard({
  id,
  title,
  price,
  providerName,
  providerAvatar,
  duration,
  location,
}: ServiceCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden editorial-shadow flex flex-col hover:translate-y-[-4px] transition-transform duration-300 pt-4 shadow-sm">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-primary font-label-sm text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
            {price}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-100 relative">
            {providerAvatar ? (
              <Image 
                src={providerAvatar} 
                alt={providerName} 
                fill 
                sizes="24px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {providerName.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-slate-600 font-medium text-sm">{providerName}</span>
        </div>
        
        <h3 className="font-semibold text-lg mb-3 text-slate-900">{title}</h3>
        
        <div className="flex gap-3 mb-6">
          <span className="flex items-center gap-1 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-[18px]">schedule</span> 
            {duration}
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-[18px]">location_on</span> 
            {location}
          </span>
        </div>
        
        <div className="mt-auto space-y-3">
          <Link href={`/book/${id}`} className="block w-full py-3 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all text-center">
            Book Now
          </Link>
          <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-[18px]">call</span> Book via Call
          </button>
        </div>
      </div>
    </div>
  );
}
