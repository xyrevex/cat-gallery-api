import fs from "fs";
import path from "path";

const GALLERY_FILE = path.join(process.cwd(), "gallery.json");

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (!fs.existsSync(GALLERY_FILE)) {
      fs.writeFileSync(GALLERY_FILE, JSON.stringify({ catUrls: [] }));
    }

    const rawData = fs.readFileSync(GALLERY_FILE, "utf-8");
    const data = rawData ? JSON.parse(rawData) : { catUrls: [] };

    res.status(200).json(data);
  } catch (err) {
    console.error("Error reading gallery.json:", err);
    res.status(500).json({ error: "Failed to load gallery" });
  }
}  // dont tell me it was the file name..
