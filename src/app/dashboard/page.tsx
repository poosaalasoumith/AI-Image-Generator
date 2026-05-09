import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/page-transition";

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAuthorizedUser } from "@/lib/auth-utils"

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/")
  }

  // Fetch actual user data from database
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        _count: {
          select: { images: true }
        },
        images: {
          orderBy: { createdAt: 'desc' },
          take: 4
        }
      }
    })
  } catch(e) {
    console.error("Database not ready", e)
  }

  const credits = user?.credits ?? 0;
  const totalImages = user?._count.images ?? 0;
  const recentImages = user?.images ?? [];
  const isAuthorized = isAuthorizedUser(user?.email);

  return (
    <PageTransition className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Start creating amazing images.
          </p>
        </div>
        <Link href="/dashboard/generate">
          <Button size="lg" className="font-semibold">
            <Sparkles className="mr-2 h-5 w-5" />
            New Generation
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAuthorized ? "Unlimited" : credits}</div>
            <p className="text-xs text-muted-foreground">
              {isAuthorized ? "Developer Mode enabled" : "Free plan limits applied"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Total lifetime creations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-semibold">Recent Generations</h3>
          {recentImages.length > 0 && (
            <Link href="/dashboard/history" className="text-sm font-medium text-primary hover:underline">
              View all history &rarr;
            </Link>
          )}
        </div>
        
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentImages.map((img) => (
              <Link href={`/dashboard/history`} key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-card border shadow-sm transition-all hover:shadow-md block">
                <img 
                  src={img.url} 
                  alt={img.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs line-clamp-2 font-medium">{img.prompt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">You haven't generated any images yet.</p>
              <Link href="/dashboard/generate">
                <Button variant="outline">
                  Generate your first image
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
