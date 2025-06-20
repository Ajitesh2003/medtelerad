const fs = require("fs");
const https = require("https");
const path = require("path");

const jsonUrl = "https://spandannhm.medtelerad.com/json/1.2.840.113619.2.25.4.91453092.1747913352.623.json";
const outputDir = path.join(__dirname, "public", "dicoms");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(`Failed to download ${url}`);
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

async function run() {
  const res = await fetch(jsonUrl);
  const json = await res.json();

  const instances = json?.studies?.[0]?.series?.flatMap((series) =>
  series.instances.map((inst) => {
    if (inst.url.startsWith("dicomweb:")) {
      return inst.url.replace("dicomweb:", "");
    }
    return inst.url;
  })
);

console.log("Sample URLs===================>:", instances.slice(0, 3));



  for (let i = 0; i < instances.length; i++) {
    const url = instances[i];
    const filename = path.basename(url);
    const filePath = path.join(outputDir, filename);

    console.log(`Downloading ${url} -> ${filePath}`);
    await downloadFile(url, filePath);
  }

  console.log("✅ All files downloaded to /public/dicoms/");
}

run().catch(console.error);
