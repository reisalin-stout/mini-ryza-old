import { spawn } from "child_process";
import { processMessage, chatNotify } from "./titan-tracker.js";
import dotenv from "dotenv";
dotenv.config();

const TSHARK_PATH = "C:\\Program Files\\Wireshark\\tshark.exe";
const OPTIONS = ["-i", "WiFi", "-Y", "tcp && frame.len>64 && frame.len<512", "-x", "-l", "--hexdump", "delimit"];
//_ws == websocket or something
async function decode(chat_object) {
  const [type, rest] = chat_object;
  const content = { type: type, ...rest };
  content.room = content.room.split("::")[1];

  if (content.room != "group") {
    return;
  }

  switch (content.type) {
    case "notify":
      await processMessage(content);
      break;
    case "chat":
      await chatNotify(content);
      break;
    default:
      console.log(`Triggered: ${type}`);
  }
  console.log(content);
}

export async function trackPackages() {
  const tsharkProcess = spawn(TSHARK_PATH, OPTIONS);

  tsharkProcess.stdout.on("data", (data) => {
    const stdoutput = data.toString("utf-8").split("\n");
    const result = stdoutput.reduce((acc, line) => {
      const output = line.split("|")[0].trim().split(" ").slice(1).join("");
      return acc + output;
    }, "");
    let softstring = Buffer.from(result, "hex").toString("utf-8");
    let object_result = softstring.substring(softstring.indexOf("42[") + 2);
    try {
      decode(JSON.parse(object_result));
    } catch (error) {
      //console.error(`Some unexpected value was processed`, error);
      //console.log(object_result);
    }
  });

  tsharkProcess.on("error", (error) => {
    console.error("Failed to start tshark:", error);
  });

  tsharkProcess.on("exit", (code) => {
    console.log("tshark process exited with code", code);
  });
}
