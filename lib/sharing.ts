import { db } from "@/lib/db"

export interface SharedWidgetData {
  id: string
  name: string
  description?: string | null
  widgetType: string
  config: Record<string, any>
  isPublic: boolean
  shareToken: string
  viewCount: number
  likeCount: number
  tags?: string[]
  owner: {
    id: string
    email: string
    name?: string | null
  }
  collaborators?: Array<{
    id: string
    role: string
    permissions: string[]
    user: {
      id: string
      email: string
      name?: string | null
    }
  }>
  comments?: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      email: string
      name?: string | null
    }
    replies?: Array<{
      id: string
      content: string
      createdAt: string
      user: {
        id: string
        email: string
        name?: string
      }
    }>
  }>
  createdAt: string | Date
  updatedAt: string | Date
}

// Create a shared widget
export async function createSharedWidget(
  ownerId: string,
  data: {
    name: string
    description?: string | null
    widgetType: string
    config: Record<string, any>
    isPublic?: boolean
    tags?: string[]
  }
): Promise<SharedWidgetData> {
  const widget = await db.sharedWidget.create({
    data: {
      ownerId,
      name: data.name,
      description: data.description,
      widgetType: data.widgetType,
      config: JSON.stringify(data.config),
      isPublic: data.isPublic || false,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  return {
    ...widget,
    config: JSON.parse(widget.config),
    tags: widget.tags ? JSON.parse(widget.tags) : undefined,
    owner: widget.owner,
  }
}

// Get shared widget by share token
export async function getSharedWidgetByToken(shareToken: string): Promise<SharedWidgetData | null> {
  const widget = await db.sharedWidget.findUnique({
    where: { shareToken },
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

  if (!widget) return null

  // Increment view count
  await db.sharedWidget.update({
    where: { id: widget.id },
    data: { viewCount: { increment: 1 } },
  })

  return {
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
        user: {
          id: reply.user.id,
          email: reply.user.email,
          name: reply.user.name || undefined,
        },
      })),
    })),
  }
}

// Get user's shared widgets
export async function getUserSharedWidgets(userId: string): Promise<SharedWidgetData[]> {
  const widgets = await db.sharedWidget.findMany({
    where: { ownerId: userId },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return widgets.map(widget => ({
    ...widget,
    config: JSON.parse(widget.config),
    tags: widget.tags ? JSON.parse(widget.tags) : undefined,
    owner: widget.owner,
  }))
}

// Get public shared widgets
export async function getPublicSharedWidgets(
  limit: number = 20,
  offset: number = 0,
  search?: string,
  widgetType?: string
): Promise<SharedWidgetData[]> {
  const where: any = { isPublic: true }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (widgetType) {
    where.widgetType = widgetType
  }

  const widgets = await db.sharedWidget.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
    skip: offset,
  })

  return widgets.map(widget => ({
    ...widget,
    config: JSON.parse(widget.config),
    tags: widget.tags ? JSON.parse(widget.tags) : undefined,
    owner: widget.owner,
  }))
}

// Add collaborator to widget
export async function addCollaborator(
  widgetId: string,
  userId: string,
  role: string = 'viewer',
  permissions: string[] = []
): Promise<void> {
  await db.widgetCollaborator.create({
    data: {
      widgetId,
      userId,
      role,
      permissions: JSON.stringify(permissions),
    },
  })
}

// Remove collaborator from widget
export async function removeCollaborator(widgetId: string, userId: string): Promise<void> {
  await db.widgetCollaborator.delete({
    where: {
      widgetId_userId: {
        widgetId,
        userId,
      },
    },
  })
}

// Add comment to widget
export async function addComment(
  widgetId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<void> {
  await db.widgetComment.create({
    data: {
      widgetId,
      userId,
      content,
      parentId,
    },
  })
}

// Like a widget
export async function likeWidget(widgetId: string): Promise<void> {
  await db.sharedWidget.update({
    where: { id: widgetId },
    data: { likeCount: { increment: 1 } },
  })
}

// Check if user has access to widget
export async function hasWidgetAccess(
  widgetId: string,
  userId?: string
): Promise<{ hasAccess: boolean; role?: string }> {
  const widget = await db.sharedWidget.findUnique({
    where: { id: widgetId },
    include: {
      collaborators: {
        where: userId ? { userId } : undefined,
      },
    },
  })

  if (!widget) return { hasAccess: false }

  // Public widgets are accessible to everyone
  if (widget.isPublic) return { hasAccess: true }

  // Owner has full access
  if (userId && widget.ownerId === userId) return { hasAccess: true, role: 'owner' }

  // Check if user is a collaborator
  if (userId && widget.collaborators.length > 0) {
    return { hasAccess: true, role: widget.collaborators[0].role }
  }

  return { hasAccess: false }
}

// Update widget
export async function updateSharedWidget(
  widgetId: string,
  userId: string,
  data: {
    name?: string
    description?: string | null
    config?: Record<string, any>
    isPublic?: boolean
    tags?: string[]
  }
): Promise<SharedWidgetData> {
  // Check if user has edit access
  const access = await hasWidgetAccess(widgetId, userId)
  if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin' && access.role !== 'editor')) {
    throw new Error('Insufficient permissions')
  }

  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.config) updateData.config = JSON.stringify(data.config)
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic
  if (data.tags) updateData.tags = JSON.stringify(data.tags)

  const widget = await db.sharedWidget.update({
    where: { id: widgetId },
    data: updateData,
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  return {
    ...widget,
    config: JSON.parse(widget.config),
    tags: widget.tags ? JSON.parse(widget.tags) : undefined,
    owner: widget.owner,
  }
}

// Delete widget
export async function deleteSharedWidget(widgetId: string, userId: string): Promise<void> {
  // Check if user is the owner
  const widget = await db.sharedWidget.findUnique({
    where: { id: widgetId },
  })

  if (!widget || widget.ownerId !== userId) {
    throw new Error('Insufficient permissions')
  }

  await db.sharedWidget.delete({
    where: { id: widgetId },
  })
}
