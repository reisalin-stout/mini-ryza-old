"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";
import { verifyKeyMiddleware } from "discord-interactions";

const app = express();
const router = Router();

router.get("/", (req, res) => {
  console.log("Reached /");
  res.send("Hello");
});

function interact(command) {
  let response;
  switch (command.name) {
    case "hello":
      response = "Hello there!";
      break;
    case "bye":
      response = "Goodbye!";
      break;
    case "echo":
      let original_message = command.options[0].value;
      response = `Echoing: ${original_message}`;
      break;
    default:
      response = "No Message";
  }
  return response;
}

router.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), (req, res) => {
  const command = req.body.data;
  console.log(`Command received: ${command.name} (${command.type})`);

  try {
    /*
    //Uncomment if it suddenly breaks and needs to be re-validated by discord
    if (command.type == 1) {
      res.send({ type: 1 });
      return;
    }
    */
    let result = interact(command);
    res.send({
      type: 4,
      data: { content: result },
    });
  } catch (error) {
    console.error("Error parsing request:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

app.use("/.netlify/functions/interact", router);
export const handler = serverless(app);
