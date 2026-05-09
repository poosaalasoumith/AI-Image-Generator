"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { deleteImagesFromStorage } from "@/lib/storage"
import { revalidatePath } from "next/cache"

export async function deleteImagesAction(imageIds: string[]) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { error: "Unauthorized" }
    }

    if (!imageIds || imageIds.length === 0) {
      return { error: "No images provided for deletion" }
    }

    // Get the internal user id
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Find the images to ensure they belong to the user
    const imagesToDelete = await prisma.image.findMany({
      where: {
        id: { in: imageIds },
        userId: user.id
      },
      select: { id: true, url: true }
    })

    if (imagesToDelete.length === 0) {
      return { error: "Images not found or unauthorized" }
    }

    // Delete from Supabase Storage
    const urlsToDelete = imagesToDelete.map(img => img.url)
    try {
      await deleteImagesFromStorage(urlsToDelete)
    } catch (storageError) {
      console.error("Failed to delete from storage:", storageError)
      // Continue to delete from DB even if storage deletion fails, 
      // as we don't want the user to be stuck with broken DB records.
    }

    // Delete from Postgres database
    const validImageIds = imagesToDelete.map(img => img.id)
    await prisma.image.deleteMany({
      where: {
        id: { in: validImageIds },
        userId: user.id
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/history")
    
    return { success: true, count: validImageIds.length }
  } catch (error) {
    console.error("Delete images action failed:", error)
    return { error: "Internal Server Error" }
  }
}
