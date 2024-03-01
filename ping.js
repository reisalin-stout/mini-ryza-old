const https = require("https");

const postData = JSON.stringify({
  message: "Hello message",
});

const options = {
  hostname: "clever-klepon-204c2d.netlify.app",
  path: "/.netlify/functions/add",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": postData.length,
  },
};

const req = https.request(options, (res) => {
  let data = "";

  // A chunk of data has been received.
  res.on("data", (chunk) => {
    data += chunk;
  });

  // The whole response has been received.
  res.on("end", () => {
    console.log(data);
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(postData);
req.end();
