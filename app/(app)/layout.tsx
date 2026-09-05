import { BrandMark } from "@/components/layout/brand-mark";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SidebarUserCard } from "@/components/layout/sidebar-user-card";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getCurrentUser } from "@/lib/current-user";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-rail flex-col justify-between bg-sidebar shadow-rail lg:flex">
        <div className="flex flex-col">
          <BrandMark />
          <SidebarNav />
        </div>
        <SidebarUserCard user={user} />
      </aside>

      <div className="flex min-h-full flex-1 flex-col lg:pl-rail">
        <AppHeader user={user} />
        <main className="w-full flex-1 bg-background px-gutter-md pt-16 pb-20 sm:pb-gutter-md lg:px-gutter-xl">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col pt-gutter-md pb-gutter-xl">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </>
  );
}
