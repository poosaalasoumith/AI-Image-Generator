import { prisma } from "@/lib/prisma";
import { isAuthorizedUser } from "@/lib/auth-utils";

export const DAILY_FREE_CREDITS = 5;

/**
 * Verifies if a user's credits need to be reset based on the 24-hour cycle.
 * Updates the database and returns the latest user object.
 */
export async function verifyAndResetCredits(userId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true }
  });

  if (!user) return null;

  const isPro = user.subscription?.isPro ?? false;
  const isAuthorized = isAuthorizedUser(user.email);

  // Pro and Authorized users don't need daily resets for access, 
  // but we can still reset their balance for consistency, or just skip it.
  // Actually, we'll reset it anyway so if they downgrade, they start fresh.
  
  const now = new Date();
  const lastReset = user.lastCreditReset || user.createdAt; // fallback if somehow null
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    // Reset to 5 credits, or keep current if somehow higher (shouldn't happen for free users)
    const newCredits = DAILY_FREE_CREDITS;
    
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: newCredits,
        lastCreditReset: now,
      },
      include: { subscription: true }
    });
  }

  return {
    ...user,
    isPro,
    isAuthorized
  };
}
