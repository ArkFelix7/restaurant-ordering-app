import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu Management',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
