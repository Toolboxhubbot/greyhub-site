const zlib = require("zlib");
const parts = [require("./_p0"), require("./_p1")];
const b64 = parts.join("");

function isBrowser(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  // Common browser indicators
  if (
    lower.includes("mozilla") ||
    lower.includes("chrome") ||
    lower.includes("safari") ||
    lower.includes("firefox") ||
    lower.includes("edge") ||
    lower.includes("opera") ||
    lower.includes("msie") ||
    lower.includes("trident")
  ) {
    // Exclude known non-browser clients that sometimes carry Mozilla-ish strings
    if (
      lower.includes("roblox") ||
      lower.includes("httpget") ||
      lower.includes("executor") ||
      lower.includes("synapse") ||
      lower.includes("script-ware") ||
      lower.includes("krnl") ||
      lower.includes("fluxus") ||
      lower.includes("delta") ||
      lower.includes("wave") ||
      lower.includes("solara") ||
      lower.includes("codex")
    ) {
      return false;
    }
    return true;
  }
  return false;
}

module.exports = async function handler(req, res) {
  const ua = req.headers["user-agent"] || "";

  // Browsers get redirected to the block page
  if (isBrowser(ua)) {
    res.writeHead(302, {
      Location: "/block.html",
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }

  // Executors / non-browsers get the real script
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");

  try {
    const buf = Buffer.from(b64, "base64");
    const out = zlib.gunzipSync(buf);
    res.status(200).send(out.toString("utf8"));
  } catch (e) {
    res.status(500).send("-- error: " + e.message + "\n");
  }
};
