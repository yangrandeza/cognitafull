
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <img src="/logo.svg" alt="MUDEAI Logo" className="h-8 w-auto" />
                    </div>
                    <p className="text-sm text-foreground/60">
                        &copy; {new Date().getFullYear()} MUDEAI. Todos os direitos reservados.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link href="#" className="text-foreground/60 hover:text-foreground">Privacidade</Link>
                        <Link href="#" className="text-foreground/60 hover:text-foreground">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
