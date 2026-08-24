const zlib=require("zlib");
const parts=[require("./_p0"),require("./_p1"),require("./_p2"),require("./_p3"),require("./_p4")];
const b64=parts.join("");
module.exports=async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Content-Type","text/plain; charset=utf-8");
  res.setHeader("Cache-Control","public, max-age=60");
  try{
    const buf=Buffer.from(b64,"base64");
    const out=zlib.gunzipSync(buf);
    res.status(200).send(out.toString("utf8"));
  }catch(e){res.status(500).send("-- error: "+e.message+"\n")}
};
