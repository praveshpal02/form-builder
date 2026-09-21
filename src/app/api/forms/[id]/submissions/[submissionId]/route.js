import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";

async function checkOwnership(db, formId, userId) {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) return { form: null, error: "Form not found", status: 404 };
  if (form.userId !== userId) return { form: null, error: "Forbidden", status: 403 };
  return { form, error: null, status: 200 };
}

export async function DELETE(request, { params }) {
  try {
    const { id, submissionId } = await params;
    const db = getDb();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ownership = await checkOwnership(db, id, user.id);
    if (ownership.error) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
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
