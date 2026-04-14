import { SessionRouteGuard } from "@/app/_components/session-route-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionRouteGuard mode="dashboard">{children}</SessionRouteGuard>;
}
