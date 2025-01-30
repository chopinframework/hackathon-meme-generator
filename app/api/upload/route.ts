import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase-admin"

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get("file") as unknown as File

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
  }

  try {
    // Create bucket if it doesn't exist using admin client
    const { error: bucketError } = await supabaseAdmin
      .storage
      .createBucket('memes', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error("Error creating bucket:", bucketError)
      return NextResponse.json({ success: false, error: "Failed to create storage bucket" }, { status: 500 })
    }

    // Enable public access for the bucket using SQL
    const { error: policyError } = await supabaseAdmin.from('storage.buckets').update({
      public: true,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }).eq('name', 'memes')

    if (policyError) {
      console.error("Error updating bucket policy:", policyError)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate a unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    
    // Upload using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('memes')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("Supabase storage error:", uploadError)
      return NextResponse.json({ success: false, error: "Failed to upload to storage" }, { status: 500 })
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('memes')
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ success: false, error: "Failed to process upload" }, { status: 500 })
  }
}

