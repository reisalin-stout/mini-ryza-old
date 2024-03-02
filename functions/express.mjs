"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";

const app = express();
const router = Router();
app.use(express.json());
router.get("/", (req, res) => {
  res.send("Hello");
});
router.post("/updatestate", (req, res) => {
  res.json("Hello");
});
app.use("/.netlify/functions/express", router);

export const handler = serverless(app);
