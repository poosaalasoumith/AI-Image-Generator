import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    if (!session?.metadata?.clerkId) {
      return new Response(null, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: session.metadata.clerkId }
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        isPro: true,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      },
      update: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        isPro: true,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      },
    })
  }

  // Handle subscription update/cancellation
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        isPro: subscription.status === "active",
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      },
    })
  }

  return new Response(null, { status: 200 })
}
