import fs from "fs";
import path from "path";

const GALLERY_FILE = path.join(process.cwd(), "gallery.json");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { catUrls } = req.body;
    if (!catUrls || !Array.isArray(catUrls)) return res.status(400).json({ error: "Invalid catUrls" });

    fs.writeFileSync(GALLERY_FILE, JSON.stringify({ catUrls }, null, 2));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save gallery" });
  }
}
