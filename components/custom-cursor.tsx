"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const cursorInner = cursorInnerRef.current

    if (!cursor || !cursorInner) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1
      cursorY += (mouseY - cursorY) * 0.1

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`
      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseEnter = () => {
      cursor.style.opacity = "1"
    }

    const handleMouseLeave = () => {
      cursor.style.opacity = "0"
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.classList.contains("cursor-pointer")) {
        cursorInner.style.transform = "scale(2)"
        cursorInner.style.backgroundColor = "rgba(251, 146, 60, 0.3)"
      } else {
        cursorInner.style.transform = "scale(1)"
        cursorInner.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseover", handleMouseOver)

    updateCursor()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-50 opacity-0 transition-opacity duration-300"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          ref={cursorInnerRef}
          className="w-full h-full rounded-full border-2 border-orange-500/50 transition-all duration-200 ease-out"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        />
      </div>
    </>
  )
}