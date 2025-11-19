import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Status',
}

export default function OrderStatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
