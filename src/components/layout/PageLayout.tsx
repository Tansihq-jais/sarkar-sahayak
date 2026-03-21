import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noFooter?: boolean;
}

export function PageLayout({
  children,
  className,
  fullWidth = false,
  noFooter = false,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <NavBar />
      <main
        className={cn(
          "flex-1",
          !fullWidth && "mx-auto w-full max-w-7xl px-4 py-8 md:px-6",
          className
        )}
      >
        {children}
      </main>
      {!noFooter && <Footer />}
      <ToastContainer />
    </div>
  );
}
