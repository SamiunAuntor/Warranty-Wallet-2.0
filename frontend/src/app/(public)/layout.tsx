import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="relative flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-[#f8f9ff]"><Navbar /><main className="min-w-0 flex-1">{children}</main><Footer /></div>;
}
