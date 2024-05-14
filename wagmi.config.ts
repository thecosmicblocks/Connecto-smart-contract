import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

// https://wagmi.sh/cli/getting-started#use-generated-code
export default defineConfig({
  out: "Connecto-solidity-smart_contract-sdk/src/.ts",
  contracts: [],
  plugins: [react()],
});
