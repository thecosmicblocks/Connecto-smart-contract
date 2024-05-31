import fs from "fs";
import { spawnSync } from "child_process";
import { abi as ConnectoNFTManagerAbi } from "./artifacts/contracts/connecto_nft/ConnectoNFTMananger.sol/ConnectoNFTManager.json";
import { abi as ConnectoProtocolAbi } from "./artifacts/contracts/connecto_dapp/ConnectoProtocol.sol/ConnectoProtocol.json";
import { abi as ConnectoMarketplaceAbi } from "./artifacts/contracts/connecto_dapp/ConnectoMarketplace.sol/ConnectoMarketplace.json";
import { abi as UniqueNFT } from "./artifacts/@unique-nft/solidity-interfaces/contracts/UniqueNFT.sol/UniqueNFT.json";

const OUT_DIR = "Connecto-smart-contract-sdk";
const CONTRACTS = [
  {
    name: "ConnectoNFTManager",
    abi: ConnectoNFTManagerAbi,
    fileName: "ConnectoNFTManager",
  },
  {
    name: "ConnectoProtocol",
    abi: ConnectoProtocolAbi,
    fileName: "ConnectoProtocol",
  },
  {
    name: "ConnectoMarketplace",
    abi: ConnectoMarketplaceAbi,
    fileName: "ConnectoMarketplace",
  },
  {
    name: "UniqueNFT",
    abi: UniqueNFT,
    fileName: "UniqueNFT",
  },
];

const WAGMI_CONFIG_TEMP = `import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

// https://wagmi.sh/cli/getting-started#use-generated-code
export default defineConfig({
  out: "${OUT_DIR}/src/{{sdk_file_name}}.ts",
  contracts: {{contracts}},
  plugins: [react()],
});
`;

for (const contract of CONTRACTS) {
  const temp = WAGMI_CONFIG_TEMP.replace(
    "{{sdk_file_name}}",
    contract.fileName
  ).replace(
    "{{contracts}}",
    JSON.stringify([{ name: contract.name, abi: contract.abi }], null, 2)
  );
  fs.writeFileSync("wagmi.config.ts", temp, { encoding: "utf-8" });
  spawnSync("yarn", ["wagmi", "generate"], { stdio: "inherit" });
}

console.log("Generated react sdk successfully\n");

/// ===============================================
/// ===============================================
/// ===============================================

let dir = fs.readdirSync(`${OUT_DIR}/src`, {
  encoding: "utf-8",
});
dir = dir.filter((file) => file !== "index.ts");
const dirContent = dir
  .map((file) => `export * from "./src/${file}";`)
  .join("\n");
fs.writeFileSync(`${OUT_DIR}/index.ts`, dirContent, {
  encoding: "utf-8",
});
console.log("Exported react sdk successfully\n");

/// ===============================================
/// ===============================================
/// ===============================================

const temp = WAGMI_CONFIG_TEMP.replace("{{sdk_file_name}}", "").replace(
  "{{contracts}}",
  JSON.stringify([], null, 2)
);
fs.writeFileSync("wagmi.config.ts", temp, { encoding: "utf-8" });
console.log("Clean up wagmi.config.ts\n");

spawnSync("cp", ["contract_address.json", "Connecto-smart-contract-sdk/"], {
  stdio: "inherit",
});
