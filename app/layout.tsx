import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export const metadata: Metadata = {
  title: 'Навигатор проектов',
  description: 'Каталог проектов, MVP и стартапов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#030712] text-white antialiased">
        <SiteHeader />
        <div className="pt-4">{children}</div>
        <SiteFooter />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
