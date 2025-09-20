import { NextRequest, NextResponse } from 'next/server'
import { getCryptoPrices, getCryptoPrice } from '@/lib/crypto-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (symbol) {
      // Get specific crypto price
      const price = await getCryptoPrice(symbol)
      if (!price) {
        return NextResponse.json(
          { error: 'Cryptocurrency not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: price })
    } else {
      // Get all crypto prices
      const prices = await getCryptoPrices()
      return NextResponse.json({ success: true, data: prices })
    }
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    )
  }
}
