import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Build pool info (token name, addresses, fee etc)
// from each chain/network using raw json from Subgraph's query

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, 'pools.raw.json');
const rawData = readFileSync(inputPath, 'utf-8');
const jsonData = JSON.parse(rawData);

const topLevelKeys = Object.keys(jsonData);
if (topLevelKeys.length === 0) {
    console.error('❌ Error: pools.raw.json has no top-level properties.');
    process.exit(1);
}

for (const networkName of topLevelKeys) {
    // Convert array to object with id as key 
    const arrayData = jsonData[networkName];

    if (!Array.isArray(arrayData)) {
        console.error(`❌ Error: ${firstProp} is not an array.`);
        process.exit(1);
    }

    const outputObject = {};
    arrayData.forEach(entry => {
        if (entry.id) {
            outputObject[entry.id] = entry;
        }
    });

    // Create json file for each topLevelKey/network
    const outputFilename = `${networkName}.poolinfo.json`;
    const outputPath = join(__dirname, outputFilename);
    writeFileSync(outputPath, JSON.stringify(outputObject, null, 2));

    console.log(`✅ Output written to ${outputFilename}`);
}
