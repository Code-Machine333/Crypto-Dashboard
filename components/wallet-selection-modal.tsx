"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onWalletSelect: (wallet: string) => void
}

export function WalletSelectionModal({ isOpen, onClose, onWalletSelect }: WalletSelectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  if (!isOpen) return null

  const handleWalletSelect = async (wallet: string) => {
    setIsConnecting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Call the parent handler
      onWalletSelect(wallet)
      onClose()
    } catch (error) {
      console.error('Wallet connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white text-center flex-1">
            Connect a wallet on Solana to continue
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Wallet Options */}
        <div className="p-6 space-y-3">
          {/* Solflare Wallet */}
          <button
            onClick={() => handleWalletSelect('solflare')}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-700 hover:border-yellow-500/50 hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-yellow-500 font-bold text-lg">S</span>
              </div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-medium text-lg">Solflare</div>
              <div className="text-gray-400 text-sm">Connect with Solflare wallet</div>
            </div>
            {isConnecting && (
              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>

          {/* Coinbase Wallet */}
          <button
            onClick={() => handleWalletSelect('coinbase')}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-medium text-lg">Coinbase Wallet</div>
              <div className="text-gray-400 text-sm">Connect with Coinbase wallet</div>
            </div>
            {isConnecting && (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>

          {/* Phantom Wallet (Additional option) */}
          <button
            onClick={() => handleWalletSelect('phantom')}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">P</span>
              </div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-medium text-lg">Phantom</div>
              <div className="text-gray-400 text-sm">Connect with Phantom wallet</div>
            </div>
            {isConnecting && (
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
