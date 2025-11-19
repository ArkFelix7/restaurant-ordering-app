import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order History',
}

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
