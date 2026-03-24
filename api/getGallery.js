import fs from "fs";
import path from "path";

const GALLERY_FILE = path.join(process.cwd(), "gallery.json");

export default function handler(req, res) {
  try {
    if (!fs.existsSync(GALLERY_FILE)) fs.writeFileSync(GALLERY_FILE, JSON.stringify({ catUrls: [] }));
    const data = JSON.parse(fs.readFileSync(GALLERY_FILE, "utf-8"));
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load gallery" });
  }
}
