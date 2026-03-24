import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: "https://92f920f6d4409b6e49817851354326d6.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

let gallery = [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); 
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body && Object.keys(req.body).length ? req.body : JSON.parse(req.body || "{}");
    const { filename, type, fileBase64, username } = body;

    if (!filename || !type || !fileBase64) {
      return res.status(400).json({ error: "Missing filename, type, or fileBase64" });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    await client.send(
      new PutObjectCommand({
        Bucket: "cat", 
        Key: filename,
        Body: buffer,
        ContentType: type,
      })
    );

    const publicUrl = `https://cat.92f920f6d4409b6e49817851354326d6.r2.cloudflarestorage.com/${filename}`;

    const time = new Date().toISOString();
    gallery.unshift({ url: publicUrl, time, username: username || "Anonymous" });

    res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}
