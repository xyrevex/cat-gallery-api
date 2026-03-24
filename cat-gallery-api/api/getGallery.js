export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const API_KEY = process.env.JSONBIN_KEY;
  const BIN_ID = process.env.BIN_ID;

  const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": API_KEY
    }
  });

  const data = await response.json();
  res.status(200).json(data.record);
} // adding ts to push deployment or smth idk
