import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get("file") as unknown as File

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  
  // Ensure upload directory exists
  if (!existsSync(uploadDir)) {
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating upload directory:", error)
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }
  }

  const filename = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const filepath = path.join(uploadDir, filename)

  try {
    await writeFile(filepath, buffer)
    console.log(`Uploaded file saved at ${filepath}`)
    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error("Error saving file:", error)
    return NextResponse.json({ success: false, error: "Failed to save file" }, { status: 500 })
  }
}

