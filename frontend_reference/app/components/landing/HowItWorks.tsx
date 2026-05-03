import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Connect your calendars",
    description:
      "Sync your existing Google, Outlook, or iCloud calendars in one click. Hapna instantly understands your availability across all your schedules.",
    bullets: [
      "Real-time 2-way synchronization",
      "Buffer times and time-zone logic",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfyFyBMjImiTLng8st5SuIrvySnp9Y8leYZa5XV1vDSO_2D_1KoZ0-IOoVhE5Md9t5gnl9tX7S-TXKpZXE9jpWqRaTd67DkWGt2Z0krMMqoQsRlws65uamJDOoMfkkjvTWiHwhQ1VYv0kNtSyioDgriqWGGHNR5_YqfMOManHRfeVXQkeH3NJDHXlLBsh_Zrx8Jmqy17pwaPBgUkjdUz-BfsiLAkc7gYDRyLMb8cK47eqhbDOFQOMkesCxHtqQUmME2eiq4XZp7g",
    reverse: false,
  },
  {
    number: "02",
    title: "AI handles the conversation",
    description:
      "Whether a client calls your phone or sends a DM, our AI agent responds naturally, answers questions, and finds the perfect slot.",
    bullets: [
      "Multi-language support",
      "Appointment rescheduling via voice",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbsTkL7Uhv9RGj5Ukllb9ZKCRuubxtkGug2ZTKwab08p-lv9Q7iaA0izE064baxszmMbBRFkAaMTgH43m4MZVHRjA5SMohRZmJEvUbrGPg9Rqlm41bnaolaCKz3vwoqj4MriOmCjSijZ9Mt_7DWhfeRP_eq0L5WS42C8qilOLgZ35QM4bRfTZ9FlZWMCtsvucBpKwYgF5uvI9q8BAeHsiw7EtvPJr9mhmPQMEbg-13ljFrz7qdtT6lR-ej7G7cs7lZBh2aRfmW0A",
    reverse: true,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#eff4ff]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            How it works
          </h2>
        </div>

        {steps.map((step) => (
          <div
            key={step.number}
            className={`grid lg:grid-cols-2 gap-16 items-center mb-32 last:mb-0 ${
              step.reverse ? "" : ""
            }`}
          >
            {/* Text */}
            <div className={step.reverse ? "lg:order-2" : ""}>
              <span className="text-[#3525cd] font-bold text-6xl opacity-20">
                {step.number}
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">
                {step.title}
              </h3>
              <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                {step.description}
              </p>
              <ul className="space-y-3">
                {step.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <svg
                      className="w-5 h-5 text-emerald-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Image */}
            <div
              className={`rounded-2xl overflow-hidden shadow-2xl border border-white ${
                step.reverse ? "lg:order-1" : ""
              }`}
            >
              <Image
                src={step.image}
                alt={step.title}
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
