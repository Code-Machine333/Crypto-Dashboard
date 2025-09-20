import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"
import { 
  updateSharedWidget, 
  deleteSharedWidget,
  hasWidgetAccess 
} from "@/lib/sharing"
import { db } from "@/lib/db"

const updateWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  config: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Check if user has access to this widget
    const access = await hasWidgetAccess(params.id, userId)
    if (!access.hasAccess) {
      return jsonError("Widget not found or access denied", 404)
    }

    const widget = await db.sharedWidget.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!widget) {
      return jsonError("Widget not found", 404)
    }

    return jsonOK({
      ...widget,
      config: JSON.parse(widget.config),
      tags: widget.tags ? JSON.parse(widget.tags) : undefined,
      owner: widget.owner,
      collaborators: widget.collaborators.map(c => ({
        id: c.id,
        role: c.role,
        permissions: JSON.parse(c.permissions),
        user: c.user,
      })),
      comments: widget.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user,
        replies: comment.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt.toISOString(),
          user: reply.user,
        })),
      })),
    })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const body = await req.json()
    const parsed = updateWidgetSchema.safeParse(body)
    
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }

    const widget = await updateSharedWidget(params.id, session.user.id, parsed.data)
    return jsonOK(widget)
  } catch (error: any) {
    if (error.message === "Insufficient permissions") {
      return jsonError("Insufficient permissions", 403)
    }
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

    await deleteSharedWidget(params.id, session.user.id)
    return jsonOK({ deleted: true })
  } catch (error: any) {
    if (error.message === "Insufficient permissions") {
      return jsonError("Insufficient permissions", 403)
    }
    return jsonError(error?.message || "Internal Error", 500)
  }
}
