import { spawn } from "child_process";
import { processMessage, chatNotify } from "./titan-tracker.js";
import dotenv from "dotenv";
dotenv.config();
let totalPackets = 0;
let unrequiredPackets = 0;

const TSHARK_PATH = "C:\\Program Files\\Wireshark\\tshark.exe";
const OPTIONS = [
  "-i",
  "WiFi",
  "-Y",
  'frame.len>124 && frame.len<360 && tcp.flags == 0x0018 && _ws.col.protocol == "TCP" && eth.dst.lg == False',
  "-x",
  "-l",
  "--hexdump",
  "noascii",
];
async function decode(content) {
  if (content.room != "group") {
    console.log(`Received a message for chat: ${content.room}`);
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
      console.log(`Triggered: ${content.type}`);
  }
}

export async function trackPackages() {
  const tsharkProcess = spawn(TSHARK_PATH, OPTIONS);

  tsharkProcess.stdout.on("data", (data) => {
    const stdoutput = data.toString("utf-8").split("\n");
    const stringified = stdoutput
      .filter((line) => line.trim() !== "")
      .map((line) => line.replace(/\r/g, "").trim().split("  ")[1])
      .join("")
      .replace(/\s/g, "");
    let softstring = Buffer.from(stringified, "hex").toString("utf-8");
    let matches = softstring.match(/42\[(.*?)\]/g);
    totalPackets++;
    if (matches) {
      matches.map((match) => {
        const withoutPrefix = match.replace(/^42/, "");
        const [type, rest] = JSON.parse(withoutPrefix);
        const content = { type: type, ...rest };
        content.room = content.room.split("::")[1];
        try {
          decode(content);
        } catch (error) {
          //console.error(`Some unexpected value was processed`, error);
          //console.log(object_result);
        }
      });
    } else {
      unrequiredPackets++;
      console.log(`(${totalPackets}) Unrequired packet N. ${unrequiredPackets} intercepted`);
    }
  });

  tsharkProcess.on("error", (error) => {
    console.error("Failed to start tshark:", error);
  });

  tsharkProcess.on("exit", (code) => {
    console.log("tshark process exited with code", code);
  });
}
