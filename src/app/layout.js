import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata = {
  title: "Flowlish - Aprenda Inglês por Chunks",
  description: "A plataforma definitiva para fluência real através de blocos de linguagem.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased text-zinc-900 bg-zinc-50">
        <AuthProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
