export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-provider min-h-screen relative overflow-x-clip">
      <div className="grid-overlay absolute inset-0 z-0" />
      {/* Glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(76,242,196,0.18), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[40vh] -left-40 w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(246,198,110,0.12), transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
