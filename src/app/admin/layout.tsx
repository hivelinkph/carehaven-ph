export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-dashboard min-h-screen">{children}</div>;
}
