import { SUPPORTED_FIELD_TYPES } from "./form-schema";

function isBlank(v) {
  return v === "" || v === null || v === undefined;
}

function validateFieldValue(field, value) {
  const v = value;

  if (field.required) {
    if (field.type === "checkbox") {
      if (v !== true) return "This field is required.";
    } else if (field.type === "multiselect") {
      if (!Array.isArray(v) || v.length === 0)
        return "Please select at least one option.";
    } else if (field.type === "rating") {
      const num = Number(v);
      if (isBlank(v) || isNaN(num) || num < 1) return "Please provide a rating.";
    } else if (field.type === "file") {
      // File fields cannot be validated server-side from JSON submissions
      return null;
    } else {
      if (isBlank(v)) return "This field is required.";
    }
  }

  if (isBlank(v)) return null;

  switch (field.type) {
    case "text":
    case "textarea": {
      if (typeof v !== "string") return "Must be text.";
      if (
        field.minLength != null &&
        field.minLength !== undefined &&
        v.length < field.minLength
      )
        return `Must be at least ${field.minLength} characters.`;
      if (
        field.maxLength != null &&
        field.maxLength !== undefined &&
        v.length > field.maxLength
      )
        return `Must be at most ${field.maxLength} characters.`;
      break;
    }
    case "email":
      if (typeof v !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return "Please enter a valid email address.";
      break;
    case "url":
      if (typeof v !== "string") return "Must be a URL string.";
      try {
        new URL(v);
      } catch {
        return "Please enter a valid URL.";
      }
      break;
    case "number": {
      const num = Number(v);
      if (isNaN(num)) return "Please enter a valid number.";
      if (field.min != null && field.min !== undefined && num < field.min)
        return `Value must be at least ${field.min}.`;
      if (field.max != null && field.max !== undefined && num > field.max)
        return `Value must be at most ${field.max}.`;
      break;
    }
    case "select":
      if (typeof v !== "string") return "Must be a string value.";
      if (field.options && field.options.length > 0) {
        const valid = field.options.map((o) => o.value);
        if (!valid.includes(v)) return "Please select a valid option.";
      }
      break;
    case "radio":
      if (typeof v !== "string") return "Must be a string value.";
      if (field.options && field.options.length > 0) {
        const valid = field.options.map((o) => o.value);
        if (!valid.includes(v)) return "Please select a valid option.";
      }
      break;
    case "multiselect":
      if (!Array.isArray(v)) return "Must be an array of values.";
      if (field.options && field.options.length > 0) {
        const valid = field.options.map((o) => o.value);
        const invalid = v.filter((item) => !valid.includes(item));
        if (invalid.length > 0) return "Please select valid options.";
      }
      if (field.maxSelections && v.length > field.maxSelections)
        return `Maximum ${field.maxSelections} selection${
          field.maxSelections !== 1 ? "s" : ""
        } allowed.`;
      break;
    case "checkbox":
      if (typeof v !== "boolean") return "Must be a boolean.";
      break;
    case "date":
      if (typeof v !== "string") return "Must be a date string.";
      if (isNaN(Date.parse(v))) return "Please enter a valid date.";
      if (field.minDate && v < field.minDate)
        return `Date must be on or after ${field.minDate}.`;
      if (field.maxDate && v > field.maxDate)
        return `Date must be on or before ${field.maxDate}.`;
      break;
    case "time":
      if (typeof v !== "string") return "Must be a time string.";
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(v)) return "Please enter a valid time.";
      break;
    case "datetime":
      if (typeof v !== "string") return "Must be a datetime string.";
      if (isNaN(Date.parse(v))) return "Please enter a valid date and time.";
      break;
    case "phone":
      if (typeof v !== "string") return "Must be a phone number.";
      break;
    case "rating": {
      const num = Number(v);
      if (isNaN(num) || num < 1) return "Please provide a valid rating.";
      const max = field.maxRating || 5;
      if (num > max) return `Rating must be at most ${max}.`;
      break;
    }
    case "file":
      // Skip file validation for JSON submissions
      return null;
    default:
      break;
  }

  return null;
}

export function validateFormResponse(schema, response) {
  const errors = {};

  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return { valid: false, errors: { _form: "Response must be an object." } };
  }

  const fields = schema.fields || [];
  const fieldMap = new Map();
  for (const f of fields) {
    fieldMap.set(f.id, f);
  }

  // Reject unknown field IDs
  for (const key of Object.keys(response)) {
    if (!fieldMap.has(key)) {
      errors[key] = "This field does not exist on this form.";
    }
  }

  // Validate each defined field
  for (const field of fields) {
    const value = response[field.id];
    const error = validateFieldValue(field, value);
    if (error) {
      errors[field.id] = error;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
