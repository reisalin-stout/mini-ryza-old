import * as ngrok from "ngrok";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/mini-ryza", (req, res) => {
  res.status(200).send("Hello");
  console.log("Someone Connected");
  const parameters = req.query;
  console.log(parameters);
});

let options = {
  proto: "http",
  addr: process.env.NGROK_PORT,
  authtoken: process.env.NGROK_TOKEN,
  region: "eu",
  onStatusChange: (status) => {
    //Add Logic
  },
  onLogEvent: (data) => {
    //Add logic
  },
};

const url = await ngrok.connect(options);
console.log(url);
app.listen(process.env.NGROK_PORT, () => {
  console.log(`Server is running on port ${process.env.NGROK_PORT}`);
  const postData = {};
  postData[process.env.BIN_SECRET] = url;

  const headers = {
    "Content-Type": "application/json",
    "X-Master-Key": process.env.BIN_KEY,
  };

  fetch(process.env.BIN_URL, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => console.log("Records updated"))
    .catch((error) => console.error("Error:", error));
});
