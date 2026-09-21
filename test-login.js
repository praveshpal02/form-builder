fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "test2@example.com",
    password: "password123"
  })
}).then(r => { console.log("Status:", r.status); return r.json() }).then(console.log)