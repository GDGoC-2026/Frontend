import { SessionRouteGuard } from "@/app/_components/session-route-guard";
import { GlobalNotesDrawer } from "@/app/_components/global-notes-drawer";
import { GlobalChatDrawer } from "@/app/_components/global-chat-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionRouteGuard mode="dashboard">
      {children}
      <GlobalChatDrawer />
      <GlobalNotesDrawer />
    </SessionRouteGuard>
  );
}
