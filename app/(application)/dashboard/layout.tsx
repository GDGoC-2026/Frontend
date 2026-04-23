import { SessionRouteGuard } from "@/app/_components/session-route-guard";
import { ChatDrawerProvider } from "@/app/_components/chat-drawer-context";
import { ResponsiveLayoutWrapper } from "@/app/_components/responsive-layout-wrapper";
import { GlobalChatDrawer } from "@/app/_components/global-chat-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionRouteGuard mode="dashboard">
      <ChatDrawerProvider>
        <ResponsiveLayoutWrapper>{children}</ResponsiveLayoutWrapper>
        <GlobalChatDrawer />
      </ChatDrawerProvider>
    </SessionRouteGuard>
  );
}
