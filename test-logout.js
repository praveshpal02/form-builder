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
  console.log("Set-Cookie:", setCookie);
  
  if (setCookie) {
    cookieJar.push(setCookie.split(";")[0]);
  }
  
  // Now test logout
  const logoutRes = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST",
    headers: { "Cookie": cookieJar.join("; ") }
  });
  
  console.log("Logout Status:", logoutRes.status);
  console.log(await logoutRes.json());
  
  // Now test /me after logout
  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: { "Cookie": cookieJar.join("; ") }
  });
  
  console.log("Me after logout Status:", meRes.status);
  console.log(await meRes.json());
}

test();