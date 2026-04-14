import { SessionRouteGuard } from "@/app/_components/session-route-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionRouteGuard mode="auth">{children}</SessionRouteGuard>;
}
