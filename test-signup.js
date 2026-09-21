fetch("http://localhost:3000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test User",
    email: "test2@example.com",
    password: "password123",
    confirmPassword: "password123"
  })
}).then(r => r.json()).then(console.log)