"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";
import { verifyKey, verifyKeyMiddleware } from "discord-interactions";

const app = express();
const router = Router();

router.get("/", (req, res) => {
  console.log("Reached /");
  res.send("Hello");
});
router.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), (req, res) => {
  console.log("Received interaction");
  res.send({ type: 1 });
  return;
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

app.use("/.netlify/functions/interact", router);
export const handler = serverless(app);
