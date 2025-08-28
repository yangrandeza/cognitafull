import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
            {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
