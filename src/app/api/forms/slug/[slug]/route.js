import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const db = getDb();

    const form = await db.form.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        schema: true,
        status: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    if (form.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    let schema;
    try {
      schema = JSON.parse(form.schema);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid form configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        schema,
        status: form.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}
