export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-customer min-h-screen relative overflow-x-clip">
      {/* Watercolor blobs that live behind every customer-dashboard page */}
      <div
        className="journal-blob"
        style={{
          width: 520,
          height: 520,
          top: -120,
          left: -160,
          background: "radial-gradient(circle, #f1c8a5 0%, #f1c8a5 35%, transparent 70%)",
        }}
      />
      <div
        className="journal-blob"
        style={{
          width: 460,
          height: 460,
          top: 220,
          right: -180,
          background: "radial-gradient(circle, #c5d6b6 0%, #c5d6b6 40%, transparent 75%)",
        }}
      />
      <div
        className="journal-blob"
        style={{
          width: 380,
          height: 380,
          bottom: -120,
          left: "30%",
          background: "radial-gradient(circle, #ecc7a8 0%, #ecc7a8 30%, transparent 75%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
