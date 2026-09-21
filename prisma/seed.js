const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const demoSchema = {
  version: 1,
  settings: {
    submitButtonText: "Submit",
    successMessage: "Thank you for your feedback!",
  },
  fields: [
    {
      id: "name",
      type: "text",
      label: "Your Name",
      description: "",
      placeholder: "Enter your name",
      required: true,
      defaultValue: "",
      minLength: null,
      maxLength: null,
    },
    {
      id: "email",
      type: "email",
      label: "Email Address",
      description: "",
      placeholder: "you@example.com",
      required: true,
      defaultValue: "",
    },
    {
      id: "message",
      type: "textarea",
      label: "Feedback",
      description: "",
      placeholder: "Tell us what you think",
      required: false,
      defaultValue: "",
      rows: 5,
      minLength: null,
      maxLength: null,
    },
  ],
};

async function main() {
  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@example.com" },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@example.com",
        passwordHash: "demo",
      },
    });
    console.log("Demo user created:", demoUser.email);
  }

  const demoForm = await prisma.form.upsert({
    where: { slug: "customer-feedback" },
    update: {
      schema: JSON.stringify(demoSchema),
    },
    create: {
      title: "Customer Feedback",
      slug: "customer-feedback",
      description: "We would love to hear your feedback.",
      status: "published",
      schema: JSON.stringify(demoSchema),
      userId: demoUser.id,
    },
  });

  console.log("Demo form created/updated:", demoForm.title);
  console.log("Slug:", demoForm.slug);
  console.log("Status:", demoForm.status);

  const parsed = JSON.parse(demoForm.schema);
  console.log("Schema version:", parsed.version);
  console.log("Schema fields:", parsed.fields.length);
  console.log("Submit button:", parsed.settings.submitButtonText);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });