import * as ngrok from "ngrok";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import { trackPackages } from "./src/tracker.js";

dotenv.config();
const app = express();
app.use(express.json());

async function patchDiscordMessageById(channelId, messageId, newMessage) {
  let url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_AUTHTOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: newMessage }),
  })
    .then(console.log("Message Patched"))
    .catch((error) => console.error("Error:", error));
}

async function sendDiscordMessage(channelId, message) {
  let url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_AUTHTOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}

async function patchDiscordMessage(app_id, token, newMessage) {
  let url = `https://discord.com/api/webhooks/${app_id}/${token}/messages/@original`;
  fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: newMessage }),
  })
    .then(console.log("Message Patched"))
    .catch((error) => console.error("Error:", error));
}

async function interact(options) {
  console.log(options);
  switch (options.command) {
    case "bye":
      patchDiscordMessage(options.appid, options.token, "You are my friend now");
  }
}

app.get("/mini-ryza", (req, res) => {
  res.status(200).send("Hello");
  console.log("Someone Connected");
  const parameters = req.query;
  interact(parameters);
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
    //console.log(data);
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

  trackPackages();
});
