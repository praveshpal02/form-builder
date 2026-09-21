import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(_request, { params }) {
  try {
    const { id, submissionId } = await params;

    const form = await db.form.findUnique({ where: { id } });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    const submission = await db.formSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.formId !== id) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    await db.formSubmission.delete({ where: { id: submissionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
