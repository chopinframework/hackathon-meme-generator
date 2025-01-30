import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get("file") as unknown as File

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // With the file data in the buffer, you can do whatever you want with it.
  // For this example, we'll just write it to the filesystem in a new location
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  const filename = Date.now() + "-" + file.name
  const filepath = path.join(uploadDir, filename)

  try {
    await writeFile(filepath, buffer)
    console.log(`Uploaded file saved at ${filepath}`)
    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error("Error saving file:", error)
    return NextResponse.json({ success: false })
  }
}

