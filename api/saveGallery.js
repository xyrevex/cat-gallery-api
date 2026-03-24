import fs from "fs";
import path from "path";
const GALLERY_FILE = path.join(process.cwd(), "gallery.json");
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    let body = {};
    if (req.headers["content-type"]?.includes("application/json")) {
      body = req.body;
    } else {
      body = JSON.parse(
        await new Promise((resolve, reject) => {
          let data = "";
          req.on("data", (chunk) => (data += chunk));
          req.on("end", () => resolve(data));
          req.on("error", reject);
        })
      );
    }
    const { catUrls } = body;
    if (!catUrls || !Array.isArray(catUrls)) {
      return res.status(400).json({ error: "Invalid catUrls" });
    }
    fs.writeFileSync(GALLERY_FILE, JSON.stringify({ catUrls }, null, 2));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveGallery error:", err);
    res.status(500).json({ error: "Failed to save gallery" });
  }
}
