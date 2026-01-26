import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata = {
  title: "Freeshell - AI Content Platform",
  description: "AI-powered content generation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
