const fs = require('fs');
const { exec } = require('child_process');

// Load the JSON file
const jsonFile = 'output.json'; // Replace with your JSON file
const outputDir = 'src/external'; // Directory where interfaces will be saved

// Function to run abi-to-sol
function runAbiToSol(abi, contractName) {
  const abiString = JSON.stringify(abi);
  const cmd = `echo '${abiString}' | abi-to-sol I${contractName} -V '^0.8.4' > ${outputDir}/I${contractName}.sol`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing abi-to-sol for ${contractName}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`abi-to-sol stderr for ${contractName}: ${stderr}`);
      return;
    }
    console.log(`Successfully created interface for ${contractName}`);
  });
}

// Read the JSON file
fs.readFile(jsonFile, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading JSON file: ${err.message}`);
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch (parseErr) {
    console.error(`Error parsing JSON data: ${parseErr.message}`);
    return;
  }

  const contracts = json.state;
  console.log(`Total contracts found: ${Object.keys(contracts).length}`);

  for (const key in contracts) {
    if (contracts.hasOwnProperty(key) && contracts[key].artifacts && contracts[key].artifacts.contracts) {
      const contractName = key.split('.').pop();
      const artifact = contracts[key].artifacts.contracts[contractName];
      if (artifact && artifact.abi) {
        console.log(`Processing contract: ${contractName}`);
        runAbiToSol(artifact.abi, contractName);
      } else {
        console.log(`No ABI found for contract: ${contractName}`);
      }
    } else {
      console.log(`Skipping key: ${key}`);
    }
  }
});
