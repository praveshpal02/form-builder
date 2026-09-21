async function test() {
  // Test accessing /forms without auth (should redirect to login)
  const res = await fetch("http://localhost:3000/forms", {
    redirect: "manual"
  });
  
  console.log("Forms Status:", res.status);
  console.log("Location:", res.headers.get("location"));
  console.log("Content-Type:", res.headers.get("content-type"));
}

test();