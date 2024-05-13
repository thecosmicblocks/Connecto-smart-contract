import path from "path";
import fs from "fs";
require("dotenv").config();

export const getKey = (network: string, name: string) => {
  return network
    .replace(/_MAINNET|_TESTNET|_mainnet|_testnet/g, "")
    .concat("_", name)
    .toUpperCase();
};

export const appendAddress = (
  network: string,
  address: string,
  _key: string
) => {
  const key = getKey(network, _key);
  const contractAddressFile = path.join(__dirname, "../contract_address.json");
  const ca = JSON.parse(
    fs.readFileSync(contractAddressFile, { encoding: "utf8" })
  );
  ca[(process.env.NODE_ENV as string).toUpperCase()][key] = address;
  fs.writeFileSync(contractAddressFile, JSON.stringify(ca, null, 2));
  console.log("Save contract address successfully\n");
};

export const getAddress = (network: string, _key: string) => {
  const key = getKey(network, _key);
  const contractAddressFile = path.join(__dirname, "../contract_address.json");
  const ca = JSON.parse(
    fs.readFileSync(contractAddressFile, { encoding: "utf8" })
  );
  return ca[(process.env.NODE_ENV as string).toUpperCase()][key];
};

export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
};

export const makeId = (length: number): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
