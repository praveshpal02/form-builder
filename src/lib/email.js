import { Resend } from "resend";

let resendInstance = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatFieldValue(field, value) {
  if (value === null || value === undefined) return "";

  switch (field.type) {
    case "checkbox":
      return value ? "Yes" : "No";
    case "select":
    case "radio": {
      if (!field.options) return String(value);
      const opt = field.options.find((o) => o.value === value);
      return opt ? opt.label || value : value;
    }
    case "multiselect": {
      if (!Array.isArray(value)) return String(value);
      if (!field.options) return value.join(", ");
      return value
        .map((v) => {
          const opt = field.options.find((o) => o.value === v);
          return opt ? opt.label || v : v;
        })
        .join(", ");
    }
    case "rating":
      return `${value} / ${field.maxRating || 5}`;
    case "file":
      return "File upload";
    default:
      return String(value);
  }
}

function escapeAll(fieldValues, fields) {
  const safe = {};
  for (const field of fields) {
    const value = fieldValues[field.id];
    const formatted = formatFieldValue(field, value);
    safe[field.id] = escapeHtml(formatted);
  }
  return safe;
}

function buildAdminHtml({
  formTitle,
  submittedAt,
  fields,
  response,
}) {
  const safeTitle = escapeHtml(formTitle);
  const safeDate = escapeHtml(submittedAt);
  const escaped = escapeAll(response, fields);

  let rows = "";
  for (const field of fields) {
    const label = escapeHtml(field.label || field.id);
    const val = escaped[field.id] || "<em>—</em>";
    rows += `
      <tr>
        <td style="padding:6px 12px;font-size:13px;color:#555;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top;font-weight:600;">${label}</td>
        <td style="padding:6px 12px;font-size:13px;color:#333;border-bottom:1px solid #eee;word-break:break-word;vertical-align:top;">${val}</td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafafa;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
    <h1 style="font-size:20px;color:#111;margin:0 0 4px;">New submission received</h1>
    <p style="font-size:13px;color:#888;margin:0 0 24px;">Form: <strong>${safeTitle}</strong> &middot; ${safeDate}</p>
    <table style="width:100%;border-collapse:collapse;">
      ${rows}
    </table>
  </div>
</body>
</html>`;
}

function buildAdminText({ formTitle, submittedAt, fields, response }) {
  const escaped = escapeAll(response, fields);
  let lines = [
    "New submission received",
    "",
    `Form: ${formTitle}`,
    `Submitted: ${submittedAt}`,
    "",
  ];
  for (const field of fields) {
    lines.push(`${field.label || field.id}: ${escaped[field.id]}`);
  }
  return lines.join("\n");
}

function buildConfirmationHtml({ formTitle, message, submittedAt }) {
  const safeTitle = escapeHtml(formTitle);
  const safeMessage = escapeHtml(message);
  const safeDate = escapeHtml(submittedAt);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafafa;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
    <h1 style="font-size:20px;color:#111;margin:0 0 16px;">${safeTitle}</h1>
    <p style="font-size:15px;color:#333;margin:0 0 8px;white-space:pre-wrap;">${safeMessage}</p>
    <p style="font-size:12px;color:#aaa;margin:24px 0 0;">Received on ${safeDate}</p>
  </div>
</body>
</html>`;
}

function buildConfirmationText({ formTitle, message, submittedAt }) {
  return `${formTitle}\n\n${message}\n\nReceived on ${submittedAt}`;
}

export async function sendAdminNotification({
  to,
  subject,
  formTitle,
  fields,
  response,
}) {
  const client = getClient();
  if (!client) {
    console.log("[email] Email notifications are not configured. Skipping admin notification.");
    return { ok: false, skipped: true };
  }

  const submittedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  try {
    await client.emails.send({
      from: process.env.EMAIL_FROM || "forms@example.com",
      to,
      subject,
      html: buildAdminHtml({ formTitle, submittedAt, fields, response }),
      text: buildAdminText({ formTitle, submittedAt, fields, response }),
    });
    console.log(`[email] Admin notification sent to ${to.join(", ")}`);
    return { ok: true };
  } catch (error) {
    console.error("[email] Failed to send admin notification:", error.message);
    return { ok: false, error: error.message };
  }
}

export async function sendRespondentConfirmation({
  to,
  subject,
  message,
  formTitle,
  submittedAt,
}) {
  const client = getClient();
  if (!client) {
    console.log("[email] Email notifications are not configured. Skipping respondent confirmation.");
    return { ok: false, skipped: true };
  }

  try {
    await client.emails.send({
      from: process.env.EMAIL_FROM || "forms@example.com",
      to: [to],
      subject,
      html: buildConfirmationHtml({ formTitle, message, submittedAt }),
      text: buildConfirmationText({ formTitle, message, submittedAt }),
    });
    console.log(`[email] Respondent confirmation sent to ${to}`);
    return { ok: true };
  } catch (error) {
    console.error("[email] Failed to send respondent confirmation:", error.message);
    return { ok: false, error: error.message };
  }
}
