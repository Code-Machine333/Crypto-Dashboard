import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { widgetId, content, parentId } = await request.json()

    if (!widgetId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if widget exists and is public
    const widget = await db.sharedWidget.findFirst({
      where: {
        OR: [
          { id: widgetId, isPublic: true },
          { shareToken: widgetId, isPublic: true }
        ]
      }
    })

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found or not public' },
        { status: 404 }
      )
    }

    const comment = await db.widgetComment.create({
      data: {
        widgetId: widget.id,
        userId: session.user.id,
        content,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: comment
    })

  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const widgetId = searchParams.get('widgetId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      )
    }

    // Find widget by ID or share token
    const widget = await db.sharedWidget.findFirst({
      where: {
        OR: [
          { id: widgetId },
          { shareToken: widgetId }
        ]
      }
    })

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    const [comments, total] = await Promise.all([
      db.widgetComment.findMany({
        where: {
          widgetId: widget.id,
          parentId: null // Only top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.widgetComment.count({
        where: {
          widgetId: widget.id,
          parentId: null
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
