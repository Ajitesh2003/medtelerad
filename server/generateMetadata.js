const fs = require("fs");
const path = require("path");
const dicomParser = require("dicom-parser");

const dicomDir = path.join(__dirname, "public", "dicoms");
const outputFile = path.join(__dirname, "public", "metadata.json");

function parseDicomMetadata(buffer) {
  try {
    const dataSet = dicomParser.parseDicom(buffer);

    const SeriesDescription = dataSet.string("x0008103e"); // Series Description
    const SeriesInstanceUID = dataSet.string("x0020000e"); // Series UID
    const SOPInstanceUID = dataSet.string("x00080018"); // Instance UID
    const InstanceNumber = dataSet.intString("x00200013"); // Slice #
    const StudyInstanceUID = dataSet.string("x0020000d"); // Study UID

    return {
      SeriesDescription,
      SeriesInstanceUID,
      SOPInstanceUID,
      InstanceNumber,
      StudyInstanceUID,
    };
  } catch (err) {
    console.error("Error parsing DICOM:", err);
    return null;
  }
}

function groupBySeries(metadataList) {
  const grouped = {};

  for (const meta of metadataList) {
    const { SeriesInstanceUID } = meta;
    if (!grouped[SeriesInstanceUID]) {
      grouped[SeriesInstanceUID] = {
        SeriesDescription: meta.SeriesDescription,
        SeriesInstanceUID: SeriesInstanceUID,
        StudyInstanceUID: meta.StudyInstanceUID,
        imageIds: [],
      };
    }

    grouped[SeriesInstanceUID].imageIds.push({
      imageId: `wadouri:/dicoms/${meta.SOPInstanceUID}.dcm`,
      InstanceNumber: meta.InstanceNumber,
    });
  }

  // Optional: sort images in each series by InstanceNumber
  for (const series of Object.values(grouped)) {
    series.imageIds.sort((a, b) => a.InstanceNumber - b.InstanceNumber);
    series.imageIds = series.imageIds.map((img) => img.imageId);
  }

  return Object.values(grouped);
}

async function run() {
  const files = fs.readdirSync(dicomDir).filter((f) => f.endsWith(".dcm"));
  const metadataList = [];

  for (const file of files) {
    const buffer = fs.readFileSync(path.join(dicomDir, file));
    const metadata = parseDicomMetadata(buffer);
    if (metadata) metadataList.push(metadata);
  }

  const groupedSeries = groupBySeries(metadataList);

  fs.writeFileSync(outputFile, JSON.stringify(groupedSeries, null, 2));
  console.log("✅ metadata.json created at /public/metadata.json");
}

run();
