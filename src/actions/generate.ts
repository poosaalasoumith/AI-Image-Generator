"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { generateImage } from "@/lib/huggingface"
import { uploadImage } from "@/lib/storage"
import { verifyAndResetCredits } from "@/lib/credits"

import { isAuthorizedUser } from "@/lib/auth-utils"

export async function generateImageAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const prompt = formData.get("prompt") as string
    const style = formData.get("style") as string
    const seedString = formData.get("seed") as string
    const seed = seedString && !isNaN(parseInt(seedString)) ? parseInt(seedString, 10) : undefined

    if (!prompt) {
      return { error: "Prompt is required" }
    }

    let user: any = null;
    let isPro = false;
    let isAuthorized = false;
    
    try {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true }
      })
      
      if (!user) {
        const clerkUser = await currentUser();
        if (!clerkUser) {
          return { error: "User not found in authentication provider. Please log in again." };
        }
        
        const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || "no-email@example.com";

        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: primaryEmail,
            credits: 5,
            subscription: {
              create: {
                isPro: false,
              },
            },
          },
          include: { subscription: true }
        });
      } else {
        const verified = await verifyAndResetCredits(userId);
        if (verified) {
          user = verified;
        }
      }
      
      isPro = user.subscription?.isPro ?? false;
      isAuthorized = isAuthorizedUser(user.email);

      if (!isAuthorized && !isPro && user.credits <= 0) {
        return { error: "No credits remaining. Please upgrade to Pro." }
      }

      // Rate limiting: 10 seconds cooldown for free users
      if (!isAuthorized && !isPro && user.lastGenerationAt) {
        const timeSinceLastGeneration = Date.now() - user.lastGenerationAt.getTime();
        if (timeSinceLastGeneration < 10000) { // 10 seconds
          const waitTime = Math.ceil((10000 - timeSinceLastGeneration) / 1000);
          return { error: `Please wait ${waitTime} seconds before generating again.` }
        }
      }

    } catch (dbError) {
      console.error("Database Error during verification:", dbError);
      return { error: "Failed to verify user status." }
    }

    // Generate Image using Hugging Face
    let imageBuffer: ArrayBuffer;
    try {
       imageBuffer = await generateImage(prompt, style, seed);
    } catch (hfError: any) {
        console.error("Hugging Face Error:", hfError);
        return { error: hfError.message || "Failed to generate image from Hugging Face." }
    }

    // Upload Image to Supabase Storage
    let publicUrl: string;
    try {
        publicUrl = await uploadImage(userId, imageBuffer);
    } catch (storageError: any) {
        console.error("Storage Error:", storageError);
        return { error: "Failed to upload image to storage." }
    }

    // Deduct credit and save image
    try {
        const queries: any[] = [];
        
        // Update user: deduct credits if not pro/authorized, and update lastGenerationAt
        queries.push(
          prisma.user.update({
              where: { clerkId: userId },
              data: { 
                credits: (!isPro && !isAuthorized) ? { decrement: 1 } : undefined,
                lastGenerationAt: new Date()
              }
          })
        );
        
        queries.push(
            prisma.image.create({
                data: {
                    prompt: style && style !== "none" ? `${prompt}, ${style} style, high quality, highly detailed` : prompt,
                    style: style || "none",
                    url: publicUrl,
                    userId: user.id
                }
            })
        );
        
        await prisma.$transaction(queries)
    } catch (dbError) {
        console.error("Database Error during save:", dbError);
        return { error: "Failed to save generated image to database." }
    }

    return { success: true, imageUrl: publicUrl }

  } catch (error) {
    console.error("[GENERATE_ERROR]", error)
    return { error: "Something went wrong" }
  }
}
