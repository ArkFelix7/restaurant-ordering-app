import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function OrderConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Order Confirmed!</h1>
            <p className="text-muted-foreground text-balance">
              Thank you for your order. We've received it and will start preparing
              your delicious meal shortly.
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="font-mono font-semibold">{params.id}</p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation call shortly to confirm your delivery
              details.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/">Back to Menu</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
