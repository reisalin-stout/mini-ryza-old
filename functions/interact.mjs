"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";
import { verifyKeyMiddleware } from "discord-interactions";
import fetch from "node-fetch";

const app = express();
const router = Router();

async function interact(command) {
  let response;
  switch (command.name) {
    case "bye":
      try {
        const endpoint_res = await fetch(`https://api.jsonbin.io/v3/b/${process.env.BIN_ID}/latest`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": process.env.BIN_KEY,
          },
        });
        const enpoint = await endpoint_res.json();
        let query = enpoint.record[process.env.BIN_SECRET] + "/mini-ryza";
        console.log(command);
        /*
        if (command.options) {
          let queryString = Object.entries(options)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");
          if (queryString) {
            query += `?${queryString}`;
          }
        }
        */
        console.log(`Fetching External: ${query}`);
        const query_res = await fetch(query, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });

        switch (query_res.status) {
          case 200:
            response = "Loading...";
            break;
          default:
            response = "Mini Ryza is sleeping.";
            break;
        }
      } catch (error) {
        response = "Couldn't find Mini Ryza, contact Ryza";
        console.error("Error:", error);
      }
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
