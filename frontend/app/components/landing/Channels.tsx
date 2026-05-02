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
    title: "SMS Bot",
    description:
      "Automated messaging that qualifies leads and books slots in seconds.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoYNu0SNLX4C_WptpbdpOKjdFSeLgZBi12ednKnNadnsA-yvehRN-gShBevxuoIGCqQtHWfifigNbBeqO2Wk49faoQZJgIOWCuanWVLOAMt3aa9V4hcl3M6T4BEk3wi_1VLe9z01BNUNSjTMIN4EutYwMaW7uPsc8OVtOS5z9WYnaez-FmdyAz93y27f5WK_73nYZR0Sf5rC_hCTvW-7nDGfi1C4yFc5CXxOMqitCah15LyeJxrMt-PRM0XeFMxy48203ofXcvlQ",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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
