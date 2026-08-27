import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INCOIS Ocean Digital Twin',
  description:
    'Explore the Indian Ocean — surface, cutaway, and dive through depth to compare model predictions with Argo float observations.',
  keywords: ['ocean', 'digital twin', 'INCOIS', 'Argo', 'Bay of Bengal', 'oceanography'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="h-full w-full overflow-hidden bg-abyss text-foam font-ui">
        {children}
      </body>
    </html>
  );
}
