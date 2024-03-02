"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";
import { verifyKey, verifyKeyMiddleware } from "discord-interactions";

const app = express();
const router = Router();
app.use(express.json());

router.get("/", (req, res) => {
  res.send("Hello");
});
router.post("/updatestate", (req, res) => {
  res.json("Hello");
});

router.get("/interactions", (req, res) => {
  res.send("Hello Site");
});
router.post("/interactions", (req, res) => {
  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");
  const isValidRequest = verifyKey(req.rawBody, signature, timestamp, process.env.PUBLIC_KEY);
  if (!isValidRequest) {
    return res.status(401).end("Bad request signature");
  }

  const message = req.body;

  try {
    console.log("Request:", message);
    res.json(interact(message));
  } catch (error) {
    console.error("Error parsing request:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

function interact(command) {
  if (command.type == 1) {
    return { type: 1 };
  } else {
    let response_content;
    switch (command.name) {
      case "hello":
        response_content = "Hello there!";
        break;
      case "bye":
        response_content = "Goodbye!";
        break;
      case "echo":
        let original_message = command.options[0].value;
        response_content = `Echoing: ${original_message}`;
        break;
      default:
        response_content = "No Message";
    }
    return {
      type: 4,
      data: { content: response_content },
    };
  }
}

app.use("/.netlify/functions/express", router);
export const handler = serverless(app);
