fetch("http://localhost:5000/api/auth/login/mobile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ mobile_number: "+917981007386" })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.json());
}).catch(console.error);
