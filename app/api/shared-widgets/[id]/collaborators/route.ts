import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"
import { addCollaborator, removeCollaborator, hasWidgetAccess } from "@/lib/sharing"
import { db } from "@/lib/db"

const addCollaboratorSchema = z.object({
  userId: z.string(),
  role: z.enum(['viewer', 'editor', 'admin']).default('viewer'),
  permissions: z.array(z.string()).default([]),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    // Check if user has admin access to this widget
    const access = await hasWidgetAccess(params.id, session.user.id)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      return jsonError("Insufficient permissions", 403)
    }

    const body = await req.json()
    const parsed = addCollaboratorSchema.safeParse(body)
    
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }

    await addCollaborator(params.id, parsed.data.userId, parsed.data.role, parsed.data.permissions)
    return jsonOK({ success: true })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    
    if (!userId) {
      return jsonError("User ID required", 400)
    }

    // Check if user has admin access to this widget
    const access = await hasWidgetAccess(params.id, session.user.id)
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      return jsonError("Insufficient permissions", 403)
    }

    await removeCollaborator(params.id, userId)
    return jsonOK({ success: true })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
