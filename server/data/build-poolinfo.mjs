import { symbol } from 'd3';
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
const tokenListData = {};

const topLevelKeys = Object.keys(jsonData);
if (topLevelKeys.length === 0) {
    console.error('❌ Error: pools.raw.json has no top-level properties.');
    process.exit(1);
}

// Create token list
for (const networkName of topLevelKeys) {
    const arrayData = jsonData[networkName];
    tokenListData[networkName] = {};

    if (!Array.isArray(arrayData)) {
        console.error(`❌ Error: ${firstProp} is not an array.`);
        process.exit(1);
    }

    arrayData.forEach(entry => {
        tokenListData[networkName][entry.id] = {
            token0: [entry.token0.symbol, entry.token0.name],
            token1: [entry.token1.symbol, entry.token1.name]
        }
    });

}

const tokenListPath = join(__dirname, `tokenList.json`);
writeFileSync(tokenListPath, JSON.stringify(tokenListData, null, 4));
console.log(`✅ tokenList written to ${tokenListPath}`);

// Reformat json raw array to object with id as key 
for (const networkName of topLevelKeys) {
    const arrayData = jsonData[networkName];

    const outputObject = {};
    arrayData.forEach(entry => {
        if (entry.id) {
            outputObject[entry.id] = entry;
        }
    });

    // Create json file for each topLevelKey/network
    const outputFilename = `${networkName}.poolinfo.json`;
    const outputPath = join(__dirname, outputFilename);
    writeFileSync(outputPath, JSON.stringify(outputObject, null, 4));

    console.log(`✅ ${outputFilename} written to ${outputPath}`);
}
