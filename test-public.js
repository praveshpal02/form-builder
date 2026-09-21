async function test() {
  // Test accessing public form (should work without auth)
  const res = await fetch("http://localhost:3000/f/cmuax7nfi00011pj4i5a18v5u", {
    redirect: "manual"
  });
  
  console.log("Public form Status:", res.status);
  console.log("Location:", res.headers.get("location"));
}

test();