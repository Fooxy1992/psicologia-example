import type {Metadata} from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import './globals.css'; // Global styles

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Dra. Carolina Amores | Psicóloga Clínica e Terapeuta EMDR',
  description: 'Terapia EMDR e psicologia clínica com olhar humanizado e sofisticado para o seu bem-estar profundo.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-PT" className={`${manrope.variable} ${newsreader.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#f8f9fa] text-[#191c1d]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
