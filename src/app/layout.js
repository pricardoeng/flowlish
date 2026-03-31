import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Mango",
  description: "A plataforma definitiva para fluência real através de blocos de linguagem.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
