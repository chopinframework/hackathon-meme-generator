interface TextInputProps {
  id: number
  text: string
  onUpdateText: (id: number, newText: string) => void
}

export default function TextInput({ id, text, onUpdateText }: TextInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Meme Text</label>
      <input
        type="text"
        value={text}
        onChange={(e) => onUpdateText(id, e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
    </div>
  )
}

