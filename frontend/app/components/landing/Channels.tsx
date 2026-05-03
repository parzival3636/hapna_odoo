import Image from "next/image";
import { Globe, MessageSquare, PhoneCall } from "lucide-react";

const channels = [
  {
    title: "Web Booking",
    description:
      "A high-fidelity, customizable booking interface that embeds seamlessly into your existing digital footprint.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7CO92QQ8Yk688Wgmfoa566efgb5z02LZJrjwhar3CIpz7X_GLRKyeCZmECcINYz_nn-uISY36SWR8xIlMs1WiKbeCvyNxi9W0gVSAeF-vn1OQOPQyXjLdvEzCs7DifNe8fcG_TBiYzxHIVgqDUXd6F99J27XLCJ1Sv3ba7jYvJ4DGbihMIHjr1xKOkrVWR7gM7onvBstNgN-PI4LTBL5fEZrVAtK-GI1AE6MuKTQsygMCnE7atfJIKR5GP-Y62RmjTOmpiCzU-Q",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    title: "SMS Bot",
    description:
      "Conversational engine that qualifies leads and executes slot locking in sub-second response times.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoYNu0SNLX4C_WptpbdpOKjdFSeLgZBi12ednKnNadnsA-yvehRN-gShBevxuoIGCqQtHWfifigNbBeqO2Wk49faoQZJgIOWCuanWVLOAMt3aa9V4hcl3M6T4BEk3wi_1VLe9z01BNUNSjTMIN4EutYwMaW7uPsc8OVtOS5z9WYnaez-FmdyAz93y27f5WK_73nYZR0Sf5rC_hCTvW-7nDGfi1C4yFc5CXxOMqitCah15LyeJxrMt-PRM0XeFMxy48203ofXcvlQ",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    title: "Voice Call Bot",
    description:
      "Ultra-low latency AI that captures verbal intent and orchestrates your schedule 24/7 with human-like cadence.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnWSdy2n42yhOJFJAsx-mDBLZjh-jMxjOuEnl6INlyGQ_ElwhbUEh5YT7brcMiq_niB2B2P38Bn3eSvCsMrNCcQ7_rfdvH_PA9NH8Yc3iM6K-oQdkwOJJ6PrkEoPcxUibsdP6WjFn8v15ZbBULIMQdZqPZjFZN0u26dFaRAx3tnd8N8x_3uDt40IAY2RkwXwWe8fLaCSATEcG_X8YCqNpGTXGvREVFtYJmrDobqtO_2Rn6KeiC7B6Q_ZQdmqH29-KdcRtyLt9Ogg",
    icon: <PhoneCall className="w-5 h-5" />,
  },
];

export function Channels() {
  return (
    <section id="channels" className="py-32 font-body">
      <div className="max-w-7xl mx-auto px-8">
        <div className="max-w-2xl mb-24">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">Omnichannel Strategy</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tight">
            One platform.<br />
            <span className="text-brand-primary">Every channel.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-card hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-500"
            >
              <div className="h-64 overflow-hidden relative">
                <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <Image
                  src={channel.image}
                  alt={channel.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[0.2] group-hover:grayscale-0"
                />
              </div>
              <div className="p-10 lg:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 transition-all duration-300 shadow-sm">
                    {channel.icon}
                  </div>
                  <h3 className="text-2xl font-heading font-black text-slate-900 group-hover:text-brand-primary transition-colors">
                    {channel.title}
                  </h3>
                </div>
                <p className="text-base text-slate-500 leading-relaxed font-medium">
                  {channel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
