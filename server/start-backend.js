const { execSync } = require("child_process");

try {
  console.log("🚀 Running downloadDicom.js...");
  execSync("node downloadDicom.js", { stdio: "inherit" });

  console.log("\n📦 Generating metadata.json...");
  execSync("node generateMetadata.js", { stdio: "inherit" });

  console.log("\n🌐 Starting Express server...");
  execSync("node index.js", { stdio: "inherit" });
} catch (err) {
  console.error("❌ Something went wrong while running the backend script.", err);
}
