"use client"

import type React from "react"
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"

interface MemePreviewProps {
  backgroundImage: string
  texts: { id: number; text: string; x: number; y: number }[]
  onMoveText: (id: number, x: number, y: number) => void
}

const MemePreview = forwardRef<{ exportMeme: () => void }, MemePreviewProps>(
  ({ backgroundImage, texts, onMoveText }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isImageLoaded, setIsImageLoaded] = useState(false)

    useImperativeHandle(ref, () => ({
      exportMeme: () => {
        if (canvasRef.current) {
          const link = document.createElement("a")
          link.download = "meme.png"
          link.href = canvasRef.current.toDataURL()
          link.click()
        }
      },
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        setIsImageLoaded(true)
        drawTexts()
      }
      img.src = backgroundImage

      function drawTexts() {
        if (!ctx) return
        texts.forEach(({ text, x, y }) => {
          ctx.font = "30px Impact"
          ctx.fillStyle = "white"
          ctx.strokeStyle = "black"
          ctx.lineWidth = 2
          ctx.fillText(text, x, y)
          ctx.strokeText(text, x, y)
        })
      }
    }, [backgroundImage, texts])

    useEffect(() => {
      if (isImageLoaded) {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          texts.forEach(({ text, x, y }) => {
            ctx.font = "30px Impact"
            ctx.fillStyle = "white"
            ctx.strokeStyle = "black"
            ctx.lineWidth = 2
            ctx.fillText(text, x, y)
            ctx.strokeText(text, x, y)
          })
        }
        img.src = backgroundImage
      }
    }, [isImageLoaded, texts, backgroundImage])

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Find the closest text to the click position
      const closestText = texts.reduce((closest, current) => {
        const distanceToCurrent = Math.sqrt((current.x - x) ** 2 + (current.y - y) ** 2)
        const distanceToClosest = Math.sqrt((closest.x - x) ** 2 + (closest.y - y) ** 2)
        return distanceToCurrent < distanceToClosest ? current : closest
      })

      onMoveText(closestText.id, x, y)
    }

    return (
      <div className="relative">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="max-w-full h-auto border border-gray-300" />
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            Loading image...
          </div>
        )}
      </div>
    )
  },
)

MemePreview.displayName = "MemePreview"

export default MemePreview

