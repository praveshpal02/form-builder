import { createField, createEmptyFormSchema, createOption } from "./form-schema";

const FORM_TEMPLATES = [
  {
    id: "appointment",
    name: "Appointment",
    category: "Business",
    description: "Book appointments with your customers.",
    schema: {
      ...createEmptyFormSchema(),
      name: "Appointment",
      subject: "Request an Appointment",
      description: "Book an appointment with us.",
      notificationEmails: [],
      settings: {
        ...createEmptyFormSchema().settings,
        successMessage: "Thank you. Your appointment request has been received.",
      },
      fields: [
        createField("text", {
          id: "tpl_app_fullname",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
        }),
        createField("email", {
          id: "tpl_app_email",
          label: "Email",
          placeholder: "name@example.com",
          required: true,
        }),
        createField("phone", {
          id: "tpl_app_phone",
          label: "Phone",
          placeholder: "+1 (555) 000-0000",
          required: false,
        }),
        createField("date", {
          id: "tpl_app_date",
          label: "Appointment Date",
          required: true,
        }),
        createField("time", {
          id: "tpl_app_time",
          label: "Appointment Time",
          required: true,
        }),
        createField("textarea", {
          id: "tpl_app_message",
          label: "Message",
          placeholder: "Any additional notes or requests...",
          rows: 3,
          required: false,
        }),
      ],
    },
  },
  {
    id: "inquiry",
    name: "Inquiry",
    category: "Business",
    description: "Send us your inquiry and we will get back to you.",
    schema: {
      ...createEmptyFormSchema(),
      name: "Inquiry",
      subject: "New Inquiry",
      description: "Send us your inquiry and we will get back to you.",
      notificationEmails: [],
      settings: {
        ...createEmptyFormSchema().settings,
        successMessage: "Thank you. We have received your inquiry.",
      },
      fields: [
        createField("text", {
          id: "tpl_inq_fullname",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
        }),
        createField("email", {
          id: "tpl_inq_email",
          label: "Email",
          placeholder: "name@example.com",
          required: true,
        }),
        createField("phone", {
          id: "tpl_inq_phone",
          label: "Phone",
          placeholder: "+1 (555) 000-0000",
          required: false,
        }),
        createField("text", {
          id: "tpl_inq_subject",
          label: "Subject",
          placeholder: "What is your inquiry about?",
          required: true,
        }),
        createField("textarea", {
          id: "tpl_inq_message",
          label: "Message",
          placeholder: "Describe your inquiry in detail...",
          rows: 4,
          required: true,
        }),
      ],
    },
  },
  {
    id: "contact",
    name: "Contact Us",
    category: "Business",
    description: "Let customers reach out to you directly.",
    schema: {
      ...createEmptyFormSchema(),
      name: "Contact Us",
      subject: "New Contact Form Submission",
      description: "",
      notificationEmails: [],
      settings: {
        ...createEmptyFormSchema().settings,
        successMessage: "Thank you for contacting us. We will get back to you shortly.",
      },
      fields: [
        createField("text", {
          id: "tpl_con_fullname",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
        }),
        createField("email", {
          id: "tpl_con_email",
          label: "Email",
          placeholder: "name@example.com",
          required: true,
        }),
        createField("phone", {
          id: "tpl_con_phone",
          label: "Phone",
          placeholder: "+1 (555) 000-0000",
          required: false,
        }),
        createField("textarea", {
          id: "tpl_con_message",
          label: "Message",
          placeholder: "How can we help you?",
          rows: 4,
          required: true,
        }),
      ],
    },
  },
  {
    id: "feedback",
    name: "Customer Feedback",
    category: "Feedback",
    description: "Collect customer feedback and ratings.",
    schema: {
      ...createEmptyFormSchema(),
      name: "Customer Feedback",
      subject: "New Customer Feedback",
      description: "",
      notificationEmails: [],
      settings: {
        ...createEmptyFormSchema().settings,
        successMessage: "Thank you for your feedback!",
      },
      fields: [
        createField("text", {
          id: "tpl_fb_name",
          label: "Name",
          placeholder: "Enter your name",
          required: true,
        }),
        createField("email", {
          id: "tpl_fb_email",
          label: "Email",
          placeholder: "name@example.com",
          required: false,
        }),
        createField("rating", {
          id: "tpl_fb_rating",
          label: "Rating",
          maxRating: 5,
          required: true,
        }),
        createField("textarea", {
          id: "tpl_fb_feedback",
          label: "Feedback",
          placeholder: "Share your experience with us...",
          rows: 4,
          required: false,
        }),
      ],
    },
  },
  {
    id: "registration",
    name: "Registration",
    category: "Events",
    description: "Register attendees for events or services.",
    schema: {
      ...createEmptyFormSchema(),
      name: "Registration",
      subject: "New Registration",
      description: "",
      notificationEmails: [],
      settings: {
        ...createEmptyFormSchema().settings,
        successMessage: "Your registration has been received.",
      },
      fields: [
        createField("text", {
          id: "tpl_reg_fullname",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
        }),
        createField("email", {
          id: "tpl_reg_email",
          label: "Email",
          placeholder: "name@example.com",
          required: true,
        }),
        createField("phone", {
          id: "tpl_reg_phone",
          label: "Phone",
          placeholder: "+1 (555) 000-0000",
          required: false,
        }),
        createField("date", {
          id: "tpl_reg_dob",
          label: "Date of Birth",
          required: false,
        }),
        createField("textarea", {
          id: "tpl_reg_additional",
          label: "Additional Information",
          placeholder: "Any additional details...",
          rows: 3,
          required: false,
        }),
      ],
    },
  },
];

export function getFormTemplate(templateId) {
  return FORM_TEMPLATES.find((t) => t.id === templateId) || null;
}

export function getAllFormTemplates() {
  return FORM_TEMPLATES;
}

export function cloneTemplateSchema(template) {
  return JSON.parse(JSON.stringify(template.schema));
}
