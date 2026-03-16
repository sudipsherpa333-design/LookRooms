import http from "http";

const req = http.get("http://localhost:3000", (res) => {
  console.log("Status Code:", res.statusCode);
  process.exit(0);
});

req.on("error", (e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
