import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

const createSchema = z.object({
  name: z.string().min(1).max(64),
  widget: z.string().min(1).max(64),
  config: z.any(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  config: z.any().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  
  // If no session, return empty array instead of error
  if (!session?.user?.id) {
    return jsonOK([])
  }

  const items = await db.preset.findMany({ 
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }, 
    take: 50 
  })
  return jsonOK(items.map(i => ({ ...i, config: JSON.parse(i.config) })))
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }
    const data = parsed.data
    const created = await db.preset.create({
      data: {
        name: data.name,
        widget: data.widget,
        config: JSON.stringify(data.config),
        userId: session.user.id,
      },
    })
    return jsonOK({ id: created.id })
  } catch (e: any) {
    return jsonError(e?.message || "Internal Error", 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (!id) return jsonError("Missing preset ID", 400)
    
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }
    
    const updateData: any = {}
    if (parsed.data.name) updateData.name = parsed.data.name
    if (parsed.data.config) updateData.config = JSON.stringify(parsed.data.config)
    
    const updated = await db.preset.update({
      where: { 
        id,
        userId: session.user.id, // Ensure user owns the preset
      },
      data: updateData,
    })
    return jsonOK({ id: updated.id })
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Preset not found", 404)
    return jsonError(e?.message || "Internal Error", 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (!id) return jsonError("Missing preset ID", 400)
    
    await db.preset.delete({ 
      where: { 
        id,
        userId: session.user.id, // Ensure user owns the preset
      }
    })
    return jsonOK({ deleted: true })
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Preset not found", 404)
    return jsonError(e?.message || "Internal Error", 500)
  }
}
