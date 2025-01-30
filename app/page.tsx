"use client"

import { useState, useRef } from "react"
import TextInput from "./components/TextInput"
import MemePreview from "./components/MemePreview"

const PLACEHOLDER_IMAGE = "https://picsum.photos/800/600"

export default function MemeGenerator() {
  const [texts, setTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([])
  const memePreviewRef = useRef<{ exportMeme: () => void } | null>(null)

  const handleAddText = () => {
    setTexts([...texts, { id: Date.now(), text: "New Text", x: 50, y: 50 }])
  }

  const handleUpdateText = (id: number, newText: string) => {
    setTexts(texts.map((text) => (text.id === id ? { ...text, text: newText } : text)))
  }

  const handleMoveText = (id: number, x: number, y: number) => {
    setTexts(texts.map((text) => (text.id === id ? { ...text, x, y } : text)))
  }

  const handleExport = () => {
    if (memePreviewRef.current) {
      memePreviewRef.current.exportMeme()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Meme Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <button onClick={handleAddText} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Text
          </button>
          {texts.map((text) => (
            <TextInput key={text.id} id={text.id} text={text.text} onUpdateText={handleUpdateText} />
          ))}
          <button onClick={handleExport} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Export Meme
          </button>
        </div>
        <div>
          <MemePreview
            ref={memePreviewRef}
            backgroundImage={PLACEHOLDER_IMAGE}
            texts={texts}
            onMoveText={handleMoveText}
          />
        </div>
      </div>
    </div>
  )
}

