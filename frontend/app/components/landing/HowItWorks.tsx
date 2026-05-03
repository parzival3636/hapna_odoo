import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Sync Global Context",
    description:
      "Integrate your Google, Outlook, or iCloud environments in one click. Hapna constructs an atomic understanding of your availability across all domains.",
    bullets: [
      "Real-time 2-way synchronization",
      "Sophisticated buffer & timezone logic",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfyFyBMjImiTLng8st5SuIrvySnp9Y8leYZa5XV1vDSO_2D_1KoZ0-IOoVhE5Md9t5gnl9tX7S-TXKpZXE9jpWqRaTd67DkWGt2Z0krMMqoQsRlws65uamJDOoMfkkjvTWiHwhQ1VYv0kNtSyioDgriqWGGHNR5_YqfMOManHRfeVXQkeH3NJDHXlLBsh_Zrx8Jmqy17pwaPBgUkjdUz-BfsiLAkc7gYDRyLMb8cK47eqhbDOFQOMkesCxHtqQUmME2eiq4XZp7g",
    reverse: false,
  },
  {
    number: "02",
    title: "AI Orchestration",
    description:
      "Our AI agents handle the noise. From phone calls to DMs, the system processes intent, resolves conflicts, and confirms sessions automatically.",
    bullets: [
      "Natural Language intent parsing",
      "Voice-first rescheduling workflows",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbsTkL7Uhv9RGj5Ukllb9ZKCRuubxtkGug2ZTKwab08p-lv9Q7iaA0izE064baxszmMbBRFkAaMTgH43m4MZVHRjA5SMohRZmJEvUbrGPg9Rqlm41bnaolaCKz3vwoqj4MriOmCjSijZ9Mt_7DWhfeRP_eq0L5WS42C8qilOLgZ35QM4bRfTZ9FlZWMCtsvucBpKwYgF5uvI9q8BAeHsiw7EtvPJr9mhmPQMEbg-13ljFrz7qdtT6lR-ej7G7cs7lZBh2aRfmW0A",
    reverse: true,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-slate-50 font-body">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-24">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">System Architecture</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tight">
            How it works.
          </h2>
        </div>

        {steps.map((step) => (
          <div
            key={step.number}
            className={`grid lg:grid-cols-2 gap-20 items-center mb-32 last:mb-0`}
          >
            {/* Text */}
            <div className={step.reverse ? "lg:order-2" : ""}>
              <span className="text-brand-primary font-heading font-black text-8xl opacity-10 block mb-6">
                {step.number}
              </span>
              <h3 className="text-3xl font-heading font-black text-slate-900 mb-6 tracking-tight">
                {step.title}
              </h3>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                {step.description}
              </p>
              <ul className="space-y-4">
                {step.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-3 text-sm font-bold text-slate-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Image */}
            <div
              className={`rounded-[3rem] overflow-hidden shadow-card border border-white relative group ${
                step.reverse ? "lg:order-1" : ""
              }`}
            >
              <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <Image
                src={step.image}
                alt={step.title}
                width={800}
                height={500}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
