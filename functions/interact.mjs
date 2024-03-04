"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";
import { verifyKeyMiddleware } from "discord-interactions";
import fetch from "node-fetch";

const app = express();
const router = Router();

async function callExternal(function_name, options) {
  let url = `https://mini-ryza.netlify.app/.netlify/functions/${function_name}`;

  if (options) {
    let queryString = Object.entries(options)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  console.log(`Fetching External: ${url}`);

  try {
    const promise = fetch(url);
    console.log("Request sent successfully");
    return promise;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function interact(command) {
  let response;
  switch (command.name) {
    case "bye":
      let url = "https://api.jsonbin.io/v3" + "/b/" + process.env.BIN_ID + "/latest";
      const headers = {
        "Content-Type": "application/json",
        "X-Master-Key": process.env.BIN_KEY,
      };

      await fetch(url, {
        method: "GET",
        headers: headers,
      })
        .then((response) => response.json())
        .then(async (data) => {
          let query = data.record[process.env.BIN_SECRET] + "/mini-ryza";
          console.log(query);
          await fetch(query, {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          });
        })
        .catch((error) => console.error("Error:", error));

      response = "Goodbye!";
      break;
    default:
      response = "Command not found";
  }
  return response;
}

router.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
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
    let result = await interact(command);
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
