import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

// https://wagmi.sh/cli/getting-started#use-generated-code
export default defineConfig({
  out: "Connecto-smart-contract-sdk/src/.ts",
  contracts: [],
  plugins: [react()],
});
