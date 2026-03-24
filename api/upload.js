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
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { filename, type } = req.query;
      if (!filename || !type) {
        return res.status(400).json({ error: "Missing filename or type" });
      }

      const publicUrl = `https://cat.92f920f6d4409b6e49817851354326d6.r2.cloudflarestorage.com/${filename}`;
      return res.status(200).json({ url: publicUrl, publicUrl });
    }

    if (req.method === "PUT") {
      let body;
      try {
        body = req.body && Object.keys(req.body).length ? req.body : await new Promise((resolve, reject) => {
          let data = "";
          req.on("data", chunk => data += chunk);
          req.on("end", () => {
            try { resolve(JSON.parse(data)); } catch(e){ reject(e); }
          });
          req.on("error", reject);
        });
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON" });
      }

      const { filename, type, fileBase64, username } = body;
      if (!filename || !type || !fileBase64) {
        return res.status(400).json({ error: "Missing filename, type, or fileBase64" });
      }

      try {
        const buffer = Buffer.from(fileBase64, "base64");
        await client.send(new PutObjectCommand({
          Bucket: "cat",
          Key: filename,
          Body: buffer,
          ContentType: type,
        }));

        const publicUrl = `https://cat.92f920f6d4409b6e49817851354326d6.r2.cloudflarestorage.com/${filename}`;
        const time = new Date().toISOString();
        gallery.unshift({ url: publicUrl, time, username: username || "Anonymous" });

        return res.status(200).json({ url: publicUrl });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Upload failed" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
