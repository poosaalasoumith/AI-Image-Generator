import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HistoryClient } from "./history-client"
import { PageTransition } from "@/components/page-transition"

export default async function HistoryPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true }
  })

  if (!user) {
    redirect("/")
  }

  // Fetch images for this user
  const images = await prisma.image.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Format the dates so they can be passed securely to the Client Component
  const formattedImages = images.map((img) => ({
    ...img,
    createdAt: img.createdAt.toISOString()
  }))

  return (
    <PageTransition className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Prompt History</h2>
        <p className="text-muted-foreground">
          View your previously generated images and reuse your favorite prompts.
        </p>
      </div>

      <HistoryClient initialImages={formattedImages} />
    </PageTransition>
  )
}
