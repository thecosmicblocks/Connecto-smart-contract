import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { abi as ConnectoNFTManagerAbi } from "./artifacts/contracts/connecto_nft/ConnectoNFTMananger.sol/ConnectoNFTManager.json";
import { abi as ConnectoProtocolAbi } from "./artifacts/contracts/connecto_token/ConnectoProtocol.sol/ConnectoProtocol.json";

export default defineConfig({
  out: "sdk/index.ts",
  contracts: [
    {
      name: "ConnectoNFTManager",
      abi: ConnectoNFTManagerAbi as any,
    },
    {
      name: "ConnectoProtocol",
      abi: ConnectoProtocolAbi as any,
    },
  ],
  plugins: [react()],
});
