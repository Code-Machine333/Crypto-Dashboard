import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, widgetType, config, isPublic, description } = await request.json()

    if (!name || !widgetType || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique share token
    const shareToken = randomBytes(16).toString('hex')
    
    // Create shared widget
    const sharedWidget = await db.sharedWidget.create({
      data: {
        name,
        widgetType,
        config: JSON.stringify(config),
        shareToken,
        isPublic: isPublic || false,
        description: description || '',
        ownerId: session.user.id,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: sharedWidget.id,
        shareToken: sharedWidget.shareToken,
        shareUrl: `${process.env.NEXTAUTH_URL}/widgets/shared/${sharedWidget.shareToken}`,
        isPublic: sharedWidget.isPublic
      }
    })

  } catch (error) {
    console.error('Error sharing widget:', error)
    return NextResponse.json(
      { error: 'Failed to share widget' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const widgetType = searchParams.get('type')

    const where = {
      isPublic: true,
      ...(widgetType && { widgetType })
    }

    const [widgets, total] = await Promise.all([
      db.sharedWidget.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              collaborators: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.sharedWidget.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        widgets: widgets.map((w: any) => ({
          ...w,
          config: JSON.parse(w.config)
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching shared widgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared widgets' },
      { status: 500 }
    )
  }
}
