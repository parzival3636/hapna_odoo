export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-background flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-float">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-white mb-1 tracking-tight">
          Hapna
        </h1>
        <p className="text-center text-sm text-[#64748b] mb-8">
          Appointment Booking Platform
        </p>

        {/* Glass Card */}
        <div className="glass-card p-8">{children}</div>
      </div>
    </div>
  );
}
