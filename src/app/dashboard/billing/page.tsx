import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Loader2 } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession, createCustomerPortal } from "@/actions/stripe"

import { SubmitButton } from "./submit-button"

export default async function BillingPage({ searchParams }: { searchParams: { success?: string, canceled?: string } }) {
  const { userId } = await auth()


  if (!userId) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true }
  })

  const isPro = user?.subscription?.isPro ?? false;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {searchParams.success && (
        <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md">
          Success! Your subscription has been updated.
        </div>
      )}
      {searchParams.canceled && (
        <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">
          Checkout was canceled.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card className={!isPro ? "border-primary shadow-md" : ""}>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Perfect to test out our capabilities</CardDescription>
            <div className="mt-4 text-4xl font-bold">
              ₹0<span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 5 image generations</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Standard resolution</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Basic styles</li>
              <li className="flex items-center opacity-50"><Check className="mr-2 h-4 w-4" /> No commercial rights</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={!isPro ? "outline" : "default"} disabled={!isPro}>
              {isPro ? "Downgrade" : "Current Plan"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={isPro ? "border-primary shadow-md" : "relative overflow-hidden border-primary/50"}>
          {!isPro && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-medium">
              Popular
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center">
              Pro Plan
              <Zap className="ml-2 h-4 w-4 text-amber-500 fill-amber-500" />
            </CardTitle>
            <CardDescription>For professionals and heavy users</CardDescription>
            <div className="mt-4 text-4xl font-bold">
              ₹499<span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited generations</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> HD resolution (1024x1024)</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> All premium styles</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Full commercial rights</li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <form action={createCustomerPortal} className="w-full">
                <SubmitButton text="Manage Subscription" variant="outline" />
              </form>
            ) : (
              <form action={createCheckoutSession} className="w-full">
                <SubmitButton text="Upgrade to Pro" />
              </form>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
