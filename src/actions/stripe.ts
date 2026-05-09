"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

export async function createCheckoutSession(formData: FormData) {
  let sessionUrl: string | null = null;
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // If they already have a Stripe Customer ID, use it. Otherwise, create one during checkout.
    const customerId = user.subscription?.stripeCustomerId

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID, // Ensure you create this price in Stripe dashboard
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`,
      metadata: {
        clerkId: userId,
      },
    })

    sessionUrl = session.url;
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error)
    throw new Error("Failed to create checkout session")
  }

  if (sessionUrl) {
    redirect(sessionUrl)
  }
}

export async function createCustomerPortal(formData: FormData) {
  let sessionUrl: string | null = null;
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    })

    if (!user?.subscription?.stripeCustomerId) {
      throw new Error("No active subscription found")
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing`,
    })

    sessionUrl = session.url;
  } catch (error) {
    console.error("[STRIPE_PORTAL_ERROR]", error)
    throw new Error("Failed to create customer portal")
  }

  if (sessionUrl) {
    redirect(sessionUrl)
  }
}
