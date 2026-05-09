import { Sidebar } from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedUser } from "@/lib/auth-utils";
import { verifyAndResetCredits } from "@/lib/credits";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let credits = 0;
  let isPro = false;
  let isAuthorized = false;
  let lastCreditReset: Date | undefined;
  
  if (userId) {
    let user: any = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    });

    if (user) {
      const verified = await verifyAndResetCredits(userId);
      if (verified) user = verified;
      
      credits = user.credits ?? 0;
      isPro = user.subscription?.isPro ?? false;
      isAuthorized = isAuthorizedUser(user.email);
      lastCreditReset = user.lastCreditReset;
    }
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <Sidebar credits={credits} isPro={isPro} isAuthorized={isAuthorized} lastCreditReset={lastCreditReset} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10">
        {children}
      </main>
    </div>
  );
}
