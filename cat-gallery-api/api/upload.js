export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const IMGBB_KEY = process.env.IMGBB_KEY;

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: "POST",
      body: req.body
    });

    const data = await response.json();

    res.status(200).json({
      success: true,
      url: data.data.url
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
}