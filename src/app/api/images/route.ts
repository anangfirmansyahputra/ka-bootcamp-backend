import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Ensure supabase client is configured properly

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files"); // Get all files from the form

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 },
      );
    }

    let uploadResults: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        throw new Error("Invalid file type");
      }

      const fileName = `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }

      uploadResults.push(data?.path);
    }

    return NextResponse.json({ uploadedFiles: uploadResults }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
