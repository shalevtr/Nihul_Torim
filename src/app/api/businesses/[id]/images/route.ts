import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/roles"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params
    const { imageUrl, category, treatmentType, description } = await request.json()

    // Check if user owns this business
    const business = await prisma.business.findUnique({
      where: { id },
      select: { ownerId: true },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (business.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const image = await prisma.businessImage.create({
      data: {
        businessId: id,
        imageUrl,
        category: category || "GALLERY",
        treatmentType,
        description,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Error adding image:", error)
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: any = { businessId: id }
    if (category) {
      where.category = category
    }

    const images = await prisma.businessImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 })
    }

    // Check if user owns this business
    const image = await prisma.businessImage.findUnique({
      where: { id: imageId },
      include: { business: { select: { ownerId: true } } },
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    if (image.business.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.businessImage.delete({
      where: { id: imageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}

