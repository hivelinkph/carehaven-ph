export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-admin min-h-screen relative overflow-x-clip">
      <div className="scan-lines absolute inset-0 z-0" />
      {/* Magenta corner accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,43,214,0.12), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Acid corner accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 w-[420px] h-[420px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(200,255,43,0.10), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
