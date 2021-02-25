import fs from "fs";

function main() {
  const fileNames = getFiles("data");
  for (const file of fileNames) {
    const [prefix, suffix] = file.split(".");
    const raw = fs.readFileSync(`data/${file}`, {
      encoding: "utf-8",
    });
    const [header, rest] = raw.split("XYDATA");
    const [rawData, footer] = rest.split("#");
    const data = rawData.trim();
    const list = data.split("\n");

    let yMax = Number.MIN_SAFE_INTEGER;
    let yMin = Number.MAX_SAFE_INTEGER;
    // get min max to normalize
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const [x, y] = element.split("\t");
      if (Number(y) > yMax) yMax = Number(y);
      if (Number(y) < yMin) yMin = Number(y);
    }

    let output = "";

    // extract normalized y values
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const [x, y] = element.split("\t");
      const normalized = normalize(Number(y), yMin, yMax);
      output += normalized;
      if (i < list.length - 1) output += "\n";
    }

    fs.writeFileSync(`output/${prefix}_normalized.txt`, output, {
      encoding: "utf-8",
    });
  }
}

function getFiles(dirname: string) {
  const fileNames = fs.readdirSync(dirname);
  return fileNames;
}

function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

main();
