import fs from "fs";

function main() {
  const start = new Date().getTime();
  const fileNames = getFiles("data");
  if (fileNames.length === 0) {
    console.log("No files found in the data folder.");
    return;
  }
  console.log(`I found the following files: ${fileNames.join(", ")}`);
  const orderedFiles = [];
  console.log("Ordering the files ascending by minute");
  for (const file of fileNames) {
    const [prefix, suffix] = file.split(".");
    const underscoreSplits = prefix.split("_");
    const minText = underscoreSplits[underscoreSplits.length - 1];
    const min = Number(minText.split("min")[0]);
    orderedFiles.push({ min, name: file });
  }
  orderedFiles.sort((a, b) => a.min - b.min);
  console.log(
    `Order of minutes is: ${orderedFiles.map((i) => i.min).join(", ")}`
  );

  // keep these global to use max of only the first file
  let yMax = Number.MIN_SAFE_INTEGER;
  let yMin = Number.MAX_SAFE_INTEGER;
  for (let j = 0; j < orderedFiles.length; j++) {
    console.log(`\n\nTransforming the ${j + 1}. file...`);
    const file = orderedFiles[j];
    const [prefix, suffix] = file.name.split(".");
    const raw = fs.readFileSync(`data/${file.name}`, {
      encoding: "utf-8",
    });
    const [header, rest] = raw.split("XYDATA");
    const [rawData, footer] = rest.split("#");
    const data = rawData.trim();
    const list = data.split("\n");

    // only use first set to get min/max
    if (j === 0) {
      // get min max to normalize
      console.log("\nGetting min and max from the only the first file");
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        const [x, y] = element.split("\t");
        if (Number(y) > yMax) yMax = Number(y);
        if (Number(y) < yMin) yMin = Number(y);
      }
      console.log(`Min: ${yMin}, Max: ${yMax}\n`);
    }

    let output = "";

    console.log("Normalizing values...");
    // extract normalized y values
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const [x, y] = element.split("\t");
      const normalized = normalize(Number(y), yMin, yMax)
        .toString()
        .replace(".", ",");
      output += normalized;
      if (i < list.length - 1) output += "\n";
    }
    console.log(`Normalized ${list.length} values, writing to output...`);
    fs.writeFileSync(`output/${prefix}_normalized.txt`, output, {
      encoding: "utf-8",
    });
  }
  const end = new Date().getTime();
  const seconds = (end - start) / 1000;
  console.log(`\nDone! Execution took ${seconds} seconds\n\n`);
}

function getFiles(dirname: string) {
  const fileNames = fs.readdirSync(dirname);
  const filterByTxt = fileNames.filter((f) => f.includes(".txt"));
  return filterByTxt;
}

function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

main();
