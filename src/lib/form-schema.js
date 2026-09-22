export const SUPPORTED_FIELD_TYPES = [
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "multiselect",
  "radio",
  "checkbox",
  "date",
  "time",
  "datetime",
  "file",
  "phone",
  "url",
  "rating",
];

let fieldCounter = 0;

function generateFieldId() {
  fieldCounter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `field_${timestamp}${random}`;
}

export function createOption(value = "", label = "") {
  return { value, label };
}

const FIELD_DEFAULTS = {
  text: {
    minLength: null,
    maxLength: null,
  },
  email: {},
  number: {
    min: null,
    max: null,
    step: 1,
  },
  textarea: {
    rows: 4,
    minLength: null,
    maxLength: null,
  },
  select: {
    options: [],
  },
  multiselect: {
    options: [],
    maxSelections: null,
  },
  radio: {
    options: [],
  },
  checkbox: {
    defaultValue: false,
  },
  date: {
    minDate: null,
    maxDate: null,
  },
  time: {},
  datetime: {
    minDateTime: null,
    maxDateTime: null,
  },
  file: {
    accept: "",
    maxSizeMB: 10,
    maxFiles: 1,
  },
  phone: {
    placeholder: "",
  },
  url: {
    placeholder: "https://",
  },
  rating: {
    maxRating: 5,
  },
};

const FIELD_LABELS = {
  text: "Short Text",
  email: "Email Address",
  number: "Number",
  textarea: "Long Text",
  select: "Dropdown Select",
  multiselect: "Multi Select",
  radio: "Radio Choices",
  checkbox: "Checkbox",
  date: "Date",
  time: "Time",
  datetime: "Date & Time",
  file: "File Upload",
  phone: "Phone Number",
  url: "Website / URL",
  rating: "Rating",
};

export function createField(type, overrides = {}) {
  if (!SUPPORTED_FIELD_TYPES.includes(type)) {
    throw new Error(`Unsupported field type: ${type}`);
  }

  const base = {
    id: generateFieldId(),
    type,
    label: FIELD_LABELS[type] || "Field",
    description: "",
    placeholder: "",
    required: false,
    defaultValue: type === "checkbox" ? false : "",
  };

  const typeDefaults = FIELD_DEFAULTS[type] || {};

  const field = {
    ...base,
    ...typeDefaults,
    ...overrides,
    id: overrides.id || base.id,
    type,
  };

  // Tally-style UX: option-based fields always get at least one default option
  if (["select", "multiselect", "radio"].includes(type)) {
    const options = Array.isArray(field.options) ? field.options : [];
    if (options.length === 0) {
      field.options = [createOption("option_1", "Option 1")];
    }
  }

  return field;
}

export const FORM_THEME_FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
];

export const DEFAULT_FORM_THEME = {
  font: "Inter",
  pageBackground: "#F8F8FC",
  cardBackground: "#FFFFFF",
  text: "#171717",
  mutedText: "#6B7280",
  inputBackground: "#FFFFFF",
  inputBorder: "#E5E7EB",
  buttonBackground: "#7957FF",
  buttonText: "#FFFFFF",
  accent: "#7957FF",
};

export function createEmptyFormSchema() {
  return {
    version: 1,
    settings: {
      // Locale
      locale: "en-IN",

      // Theme
      theme: { ...DEFAULT_FORM_THEME },

      // Submission
      submitButtonText: "Submit",
      successMessage: "Thank you for your response.",
      redirectUrl: "",
      redirectOnSubmit: false,

      // Behavior
      allowMultipleSubmissions: true,
      shuffleFields: false,
      showProgressBar: false,

      // Closing conditions
      closeFormOnDate: false,
      closeFormDate: "",
      closeFormOnLimit: false,
      responseLimit: null,
      closedFormMessage: "This form is no longer accepting responses.",

      // Notifications
      respondentConfirmation: {
        enabled: false,
        emailFieldId: null,
        subject: "We received your response",
        message: "Thank you for your submission. We have received your response.",
      },
    },
    banner: null,
    fields: [],
  };
}

export function validateFormSchema(schema) {
  const errors = [];

  if (!schema) {
    return { valid: false, errors: ["Schema is required"] };
  }

  if (schema.version === undefined) {
    errors.push("Schema version is required");
  }

  if (!Array.isArray(schema.fields)) {
    errors.push("Fields must be an array");
    return { valid: errors.length === 0, errors };
  }

  const seenIds = new Set();

  for (let i = 0; i < schema.fields.length; i++) {
    const field = schema.fields[i];
    const prefix = `Field ${i + 1}`;

    if (!field.id) {
      errors.push(`${prefix}: ID is required`);
    } else if (seenIds.has(field.id)) {
      errors.push(`Field ID must be unique: "${field.id}"`);
    } else {
      seenIds.add(field.id);
    }

    if (!field.type) {
      errors.push(`${prefix}: Type is required`);
    } else if (!SUPPORTED_FIELD_TYPES.includes(field.type)) {
      errors.push(`${prefix}: Unsupported type "${field.type}"`);
    }

    if (!field.label && field.label !== "") {
      errors.push(`${prefix}: Label is required`);
    }

    if (
      field.type === "select" ||
      field.type === "radio" ||
      field.type === "multiselect"
    ) {
      if (!Array.isArray(field.options)) {
        errors.push(`${prefix}: Options must be an array`);
      } else {
        if (field.options.length === 0) {
          errors.push(`${prefix}: Add at least one option.`);
        }
        for (let j = 0; j < field.options.length; j++) {
          const opt = field.options[j];
          if (!opt.value && opt.value !== "") {
            errors.push(`${prefix}: Option ${j + 1} missing value`);
          }
          if (!opt.label && opt.label !== "") {
            errors.push(`${prefix}: Option ${j + 1} missing label`);
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
