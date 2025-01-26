import Header from "@/components/header";
import MobileNavigation from "@/components/mobile-navigation";
import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/sign-in");
  }

  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} />
        <Header />
        <div className="main-content">{children}</div>
      </section>
    </main>
  );
};

export default RootLayout;
