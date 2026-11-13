import { SiteFooter } from "@/components/SiteFooter";

export default function CieLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

