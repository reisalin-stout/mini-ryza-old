"use strict";
import express from "express";
import serverless from "serverless-http";

const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello");
});
app.post("/updatestate", (req, res) => {
  res.json("Hello");
});

export const handler = serverless(app);
