import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: {
      filename: string;
    };
  },
) {
  try {
    const { filename } = params;

    const { data, error } = await supabase.storage
      .from("images")
      .remove([filename]);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
