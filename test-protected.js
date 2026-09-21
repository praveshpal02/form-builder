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
  
  // Test accessing /forms with auth
  const formsRes = await fetch("http://localhost:3000/forms", {
    redirect: "manual",
    headers: { "Cookie": cookieJar.join("; ") }
  });
  
  console.log("Forms with auth Status:", formsRes.status);
  console.log("Location:", formsRes.headers.get("location"));
  
  // Test accessing /forms/new with auth
  const newFormRes = await fetch("http://localhost:3000/forms/new", {
    redirect: "manual",
    headers: { "Cookie": cookieJar.join("; ") }
  });
  
  console.log("Forms/new with auth Status:", newFormRes.status);
  console.log("Location:", newFormRes.headers.get("location"));
}

test();