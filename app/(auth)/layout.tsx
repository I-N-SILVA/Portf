import "@/components/os/os-theme.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <div className="os-auth">{children}</div>
    </div>
  );
}
