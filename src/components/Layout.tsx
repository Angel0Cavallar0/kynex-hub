import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        {children}
      </main>
    </div>
  );
};
