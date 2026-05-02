import Image from "next/image";

const channels = [
  {
    title: "Web Booking",
    description:
      "A beautiful, customizable booking page that lives on your website.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7CO92QQ8Yk688Wgmfoa566efgb5z02LZJrjwhar3CIpz7X_GLRKyeCZmECcINYz_nn-uISY36SWR8xIlMs1WiKbeCvyNxi9W0gVSAeF-vn1OQOPQyXjLdvEzCs7DifNe8fcG_TBiYzxHIVgqDUXd6F99J27XLCJ1Sv3ba7jYvJ4DGbihMIHjr1xKOkrVWR7gM7onvBstNgN-PI4LTBL5fEZrVAtK-GI1AE6MuKTQsygMCnE7atfJIKR5GP-Y62RmjTOmpiCzU-Q",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: "WhatsApp Bot",
    description:
      "Automated chat that qualifies leads and books slots in seconds.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoYNu0SNLX4C_WptpbdpOKjdFSeLgZBi12ednKnNadnsA-yvehRN-gShBevxuoIGCqQtHWfifigNbBeqO2Wk49faoQZJgIOWCuanWVLOAMt3aa9V4hcl3M6T4BEk3wi_1VLe9z01BNUNSjTMIN4EutYwMaW7uPsc8OVtOS5z9WYnaez-FmdyAz93y27f5WK_73nYZR0Sf5rC_hCTvW-7nDGfi1C4yFc5CXxOMqitCah15LyeJxrMt-PRM0XeFMxy48203ofXcvlQ",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
    ),
  },
  {
    title: "Voice Call Bot",
    description:
      "Natural-sounding AI that answers calls and schedules 24/7.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnWSdy2n42yhOJFJAsx-mDBLZjh-jMxjOuEnl6INlyGQ_ElwhbUEh5YT7brcMiq_niB2B2P38Bn3eSvCsMrNCcQ7_rfdvH_PA9NH8Yc3iM6K-oQdkwOJJ6PrkEoPcxUibsdP6WjFn8v15ZbBULIMQdZqPZjFZN0u26dFaRAx3tnd8N8x_3uDt40IAY2RkwXwWe8fLaCSATEcG_X8YCqNpGTXGvREVFtYJmrDobqtO_2Rn6KeiC7B6Q_ZQdmqH29-KdcRtyLt9Ogg",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

export function Channels() {
  return (
    <section id="channels" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            One platform. Every channel.
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Engage your customers where they are already talking. No new apps
            required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="h-48 overflow-hidden">
                <Image
                  src={channel.image}
                  alt={channel.title}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#4F46E5]">{channel.icon}</span>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {channel.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
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
