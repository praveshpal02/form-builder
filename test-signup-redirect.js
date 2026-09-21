const cookieJar = [];

async function test() {
  // First login to get cookie
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test2@example.com",
      password: "password123"
    })
  });
  
  const setCookie = loginRes.headers.get("set-cookie");
  if (setCookie) {
    cookieJar.push(setCookie.split(";")[0]);
  }
  
  // Test accessing /signup when already authenticated (should redirect to /forms)
  const res = await fetch("http://localhost:3000/signup", {
    redirect: "manual",
    headers: { "Cookie": cookieJar.join("; ") }
  });
  
  console.log("Signup page Status:", res.status);
  console.log("Location:", res.headers.get("location"));
}

test();