import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Delicious Bites - Restaurant Ordering',
    template: '%s | Delicious Bites'
  },
  description: 'Order fresh, delicious food online. Fast delivery, quality ingredients, and exceptional taste.',
  keywords: ['restaurant', 'food delivery', 'online ordering', 'fresh food', 'delicious bites'],
  authors: [{ name: 'Delicious Bites' }],
  creator: 'Delicious Bites',
  publisher: 'Delicious Bites',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Delicious Bites - Restaurant Ordering',
    description: 'Order fresh, delicious food online. Fast delivery, quality ingredients.',
    siteName: 'Delicious Bites',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
