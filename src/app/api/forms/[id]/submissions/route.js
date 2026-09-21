import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";
import { validateFormSchema } from "@/lib/form-schema";
import { validateFormResponse } from "@/lib/form-validation";
import { sendAdminNotification, sendRespondentConfirmation } from "@/lib/email";

const SUBMISSION_COOKIE_PREFIX = "fc_sub_";
const SUBMISSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

async function checkOwnership(db, formId, userId) {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) return { form: null, error: "Form not found", status: 404 };
  if (form.userId !== userId) return { form: null, error: "Forbidden", status: 403 };
  return { form, error: null, status: 200 };
}

function checkFormClosed(settings, submissionCount) {
  if (!settings) return { closed: false, message: "" };

  // Check close on date
  if (settings.closeFormOnDate && settings.closeFormDate) {
    const closeDate = new Date(settings.closeFormDate);
    if (!isNaN(closeDate.getTime()) && new Date() > closeDate) {
      return {
        closed: true,
        message: settings.closedFormMessage || "This form is no longer accepting responses.",
      };
    }
  }

  // Check close on response limit
  if (settings.closeFormOnLimit && settings.responseLimit) {
    if (submissionCount >= settings.responseLimit) {
      return {
        closed: true,
        message: settings.closedFormMessage || "This form is no longer accepting responses.",
      };
    }
  }

  return { closed: false, message: "" };
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();

    const form = await db.form.findUnique({ where: { id } });

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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    if (!body || typeof body.response !== "object" || body.response === null || Array.isArray(body.response)) {
      return NextResponse.json(
        { success: false, error: "Response must be an object." },
        { status: 400 }
      );
    }

    let schema;
    try {
      schema = JSON.parse(form.schema);
    } catch {
      return NextResponse.json(
        { success: false, error: "Form configuration error." },
        { status: 500 }
      );
    }

    const schemaValidation = validateFormSchema(schema);
    if (!schemaValidation.valid) {
      return NextResponse.json(
        { success: false, error: "Form configuration error." },
        { status: 500 }
      );
    }

    const settings = schema.settings || {};

    // ── Server-side closing conditions check ────────────────────────
    const submissionCount = await db.formSubmission.count({ where: { formId: id } });
    const formClosed = checkFormClosed(settings, submissionCount);
    if (formClosed.closed) {
      return NextResponse.json(
        { success: false, error: formClosed.message },
        { status: 403 }
      );
    }

    // ── Allow Multiple Submissions check ────────────────────────────
    if (settings.allowMultipleSubmissions === false) {
      const submissionCookieName = `${SUBMISSION_COOKIE_PREFIX}${id}`;
      let hasSubmitted = false;

      if (request.cookies && request.cookies.get) {
        hasSubmitted = Boolean(request.cookies.get(submissionCookieName)?.value);
      } else if (request.headers) {
        const cookieHeader = request.headers.get("cookie") || "";
        hasSubmitted = cookieHeader.includes(`${submissionCookieName}=`);
      }

      if (hasSubmitted) {
        return NextResponse.json(
          { success: false, error: "You have already submitted this form." },
          { status: 403 }
        );
      }
    }

    const { valid, errors } = validateFormResponse(schema, body.response);
    if (!valid) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const submission = await db.formSubmission.create({
      data: {
        formId: id,
        response: JSON.stringify(body.response),
      },
    });

    // ── Email notifications (non-blocking) ────────────────────────
    const notificationEmails = Array.isArray(settings.notificationEmails)
      ? settings.notificationEmails.filter(
          (e) => typeof e === "string" && e.includes("@")
        )
      : [];

    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Admin notification
    if (notificationEmails.length > 0) {
      const subject = settings.subject
        ? `New submission: ${settings.subject}`
        : "New form submission";
      sendAdminNotification({
        to: notificationEmails,
        subject,
        formTitle: schema.title || form.title || "Untitled Form",
        fields: schema.fields || [],
        response: body.response,
      }).catch(() => {});
    }

    // Respondent confirmation
    const rc = settings.respondentConfirmation;
    if (rc && rc.enabled && rc.emailFieldId) {
      const emailField = (schema.fields || []).find(
        (f) => f.id === rc.emailFieldId && f.type === "email"
      );
      if (emailField) {
        const respondentEmail = body.response[emailField.id];
        if (
          typeof respondentEmail === "string" &&
          respondentEmail.includes("@")
        ) {
          sendRespondentConfirmation({
            to: respondentEmail,
            subject: rc.subject || "We received your response",
            message:
              rc.message || "Thank you for your submission.",
            formTitle: schema.title || form.title || "Untitled Form",
            submittedAt,
          }).catch(() => {});
        } else {
          console.warn(
            "[email] Respondent confirmation enabled but submitted email is invalid. Skipping."
          );
        }
      } else {
        console.warn(
          "[email] Respondent confirmation enabled but emailFieldId does not match an email field. Skipping."
        );
      }
    }

    const response = NextResponse.json(
      { success: true, submissionId: submission.id },
      { status: 201 }
    );

    if (settings.allowMultipleSubmissions === false) {
      const submissionCookieName = `${SUBMISSION_COOKIE_PREFIX}${id}`;
      response.cookies.set(submissionCookieName, "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SUBMISSION_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to submit the form." },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
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

    const submissions = await db.formSubmission.findMany({
      where: { formId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        response: true,
      },
    });

    const parsed = submissions.map((s) => {
      let response;
      try {
        response = JSON.parse(s.response);
      } catch {
        response = null;
      }
      return {
        id: s.id,
        createdAt: s.createdAt.toISOString(),
        response,
      };
    });

    return NextResponse.json({ success: true, submissions: parsed });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
