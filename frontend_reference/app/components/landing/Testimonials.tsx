import Image from "next/image";

const testimonials = [
  {
    quote:
      "Hapna cut our no-shows by 45%. The AI bot is like having a full-time receptionist that never sleeps.",
    name: "Dr. Elena Rodriguez",
    role: "Wellness Center Director",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLv9yBH-vx75yqn_c6hZhH26d2wvj3Bzm8LJPXnCvXyLhNgWL4CafKmxRfiAXD6HemzGQwVLm7VcteYkq00wTz9UmWSnVjhYGp5P7rzIMz_U9P0FF1kXu3KiuMtWM0ljxfQFGGUKdYDgRbIR3NaG3HnxQHj1pkVk7e5nq7j2QOn-PqyghFhuHpA544mGuGZRZUgvVw3eW4XJ2Zmeg20UieNx2I-bScDcrI_hDziIIZyWZkJmDnHySKS7xpr01Rqg2SOYQ5gU9kuw",
  },
  {
    quote:
      "Setting it up took 10 minutes. Our clients love the voice bot — it sounds so human and handles accents perfectly.",
    name: "Marcus Thorne",
    role: "Founder, Thorne Creative",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAK7zKVKEhZbJRl0MIdZYMP8DQPmyiNPh1FKV7_Klg5qrDHpkCzirEhZzlLSj3ZOibepMcJ_XEMiZGUqQu3vRcyC7ls6nRa7OF3Clqje9lNZ3PXBcHSOsKdh4luXwN9Swf3s0TDmuq-Maa-X6ptvcAXFSYpYWCX8EXijErCx2Y3bobz7jsi9dgh99ow4N3c0p6ydcO3uyZSzD15wc9xIWmuWE3QeGoxtx4f3t6ygLBZ9WiQ367xijVZtyI31T3z-qJl7ytb0_E5bQ",
  },
  {
    quote:
      "Finally, a scheduling tool that works for omnichannel businesses. The real-time sync across all channels is a lifesaver.",
    name: "Sarah Jenkins",
    role: "COO at RecruitSync",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBLwPLl-nMJmOObl52ypIYRFVNHbHWcO9W3x_o504mbnuTXTZIClXa2zzR9b5IuSGnUIZ0EoGAmN4h5RveSWGKbsEshk0ym23wPyV8vFGh1gPWlo3IcSvNVXTZUk3LJ47tJqnLNbyPbWks4Bfl5l20pA_CFSSovd2nFOj9a7G_vkkWQWnihvKvmEoIFTzLBgsBqTfkICCh2MKMFyiPxpmVbbtgP8tNuQNU4Bqst3b34g6G-UmOgvT0prKW8GKoH9tF5ZDiH9UtiA",
  },
];

function StarIcon() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 bg-[#eff4ff]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16 tracking-tight">
          Loved by thousands of experts.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-base text-slate-700 italic mb-6 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
