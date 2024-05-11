import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "solidity-coverage";
import "hardhat-watcher";
import "hardhat-contract-sizer";

dotenv.config();

const accounts =
  process.env.PRIVATE_KEY_DEPLOYER !== undefined
    ? [process.env.PRIVATE_KEY_DEPLOYER]
    : [];

const config: HardhatUserConfig = {
  defaultNetwork: "polygon",
  networks: {
    /// TESTNET
    polygon_testnet: {
      /// amoy
      chainId: 80002,
      gas: "auto",
      accounts: accounts,
      url: "https://rpc-amoy.polygon.technology",
    },
    tcgverse_testnet: {
      url: "https://testnet.rpc.tcgverse.xyz/",
      gas: 1100000000,
      accounts: accounts,
    },
    mchverse_testnet: {
      url: "https://rpc.oasys.sand.mchdfgh.xyz/",
      gas: "auto",
      accounts: accounts,
    },
    dm2_testnet: {
      url: "https://rpc.testnet.dm2verse.dmm.com",
      gas: 11000000,
      blockGasLimit: 1100000000,
      accounts: accounts,
    },
    hub_testnet: {
      url: "https://rpc.testnet.oasys.games",
      gas: 11000000,
      accounts: accounts,
    },
    base_testnet: {
      url: "https://base-sepolia-rpc.publicnode.com",
      gas: "auto",
      accounts: accounts,
    },
    arbitrum_testnet: {
      url: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
      gas: "auto",
      accounts: accounts,
    },
    bsc_testnet: {
      url: "https://bsc-testnet-rpc.publicnode.com",
      gas: "auto",
      accounts: accounts,
    },
    defi_testnet: {
      url: "https://rpc-testnet.defi-verse.org/",
      gas: "auto",
      accounts: accounts,
    },
    ethereum_testnet: {
      // sepolia
      url: "https://1rpc.io/sepolia",
      gas: "auto",
      accounts: accounts,
    },
    avalanche_c_testnet: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gas: "auto",
      accounts: accounts,
    },
    unique_testnet: {
      url: "https://rpc-opal.unique.network",
      accounts: accounts,
    },

    /// MAINNET
    hub_mainnet: {
      url: "https://rpc.oasys.games",
      gas: 1100000000,
      accounts: accounts,
    },
    dm2: {
      url: "https://rpc.dm2verse.dmm.com",
      gas: 1100000000,
      accounts: accounts,
    },
    polygon: {
      url: process.env.POLYGON_URL || "",
      gasPrice: 64000000000,
      chainId: 137,
      accounts: accounts,
    },
    ethereum: {
      url: process.env.ETH_URL || "",
      accounts: accounts,
    },
    base: {
      url: "https://mainnet.base.org",
      gas: "auto",
      accounts: accounts,
    },
    arbitrum: {
      url: "https://arbitrum.llamarpc.com",
      gas: "auto",
      accounts: accounts,
    },
    bsc: {
      url: "https://binance.llamarpc.com",
      gas: "auto",
      accounts: accounts,
    },
    // TODO: add defi mainnet, ethereum mainnet, avalanche c-chain mainnet
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGON_API_KEY as string,
      polygon_testnet: "foo",
      tcgverse_testnet: "foo",
      mchverse_testnet: "foo",
      hub_testnet: "foo",
      hub_mainnet: "foo",
      dm2: "foo",
      dm2_testnet: "foo",
      base: "foo",
      base_testnet: "foo",
      bsc: "foo",
      bsc_testnet: "foo",
      arbitrum_testnet: "foo",
      arbitrum: "foo",
      defi_testnet: "foo",
      defi: "foo",
      avalanche_c_testnet: "foo",
      avalanche: "foo",
      ethereum_testnet: "foo",
      ethereum: "foo",
      // unique_testnet: "foo",
    },
    customChains: [
      {
        network: "polygon_testnet",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "tcgverse_testnet",
        chainId: 12005,
        urls: {
          apiURL: "https://testnet.explorer.tcgverse.xyz/api",
          browserURL: "https://testnet.explorer.tcgverse.xyz",
        },
      },
      {
        network: "mchverse_testnet",
        chainId: 420,
        urls: {
          apiURL: "https://explorer.oasys.sand.mchdfgh.xyz/api",
          browserURL: "https://explorer.oasys.sand.mchdfgh.xyz/",
        },
      },
      {
        network: "hub_testnet",
        chainId: 9372,
        urls: {
          apiURL: "https://explorer.testnet.oasys.games/api",
          browserURL: "https://explorer.testnet.oasys.games/",
        },
      },
      {
        network: "hub_mainnet",
        chainId: 248,
        urls: {
          apiURL: "https://explorer.oasys.games/api",
          browserURL: "https://explorer.oasys.games/",
        },
      },
      {
        network: "dm2",
        chainId: 68770,
        urls: {
          apiURL: "https://explorer.dm2verse.dmm.com/api",
          browserURL: "https://explorer.dm2verse.dmm.com/",
        },
      },
      {
        network: "dm2_testnet",
        chainId: 68775,
        urls: {
          apiURL: "https://explorer.testnet.dm2verse.dmm.com/api",
          browserURL: "https://explorer.testnet.dm2verse.dmm.com/",
        },
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com/",
        },
      },
      {
        network: "bsc_testnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com/",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
      {
        network: "base_testnet",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
      {
        network: "arbitrum",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io/",
        },
      },
      {
        network: "arbitrum_testnet",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
      {
        network: "defi_testnet",
        chainId: 17117,
        urls: {
          apiURL: "https://scan-testnet.defi-verse.org/api",
          browserURL: "https://scan-testnet.defi-verse.org/",
        },
      },
      {
        // sepolia
        network: "ethereum_testnet",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
      {
        network: "avalanche_c_testnet",
        chainId: 43113,
        urls: {
          apiURL: "https://api-beta.avascan.info",
          browserURL: "https://testnet.avascan.info/",
        },
      },
      {
        network: "unique_testnet",
        chainId: 8882,
        urls: {
          apiURL: "https://opal.subscan.io/api",
          browserURL: "https://opal.subscan.io/",
        },
      },
    ],
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
};

export default config;
