import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { ethers } from "ethers";
import env from "./utils/env";

type Pair = {
  token0: string;
  token1: string;
  addr: string;
  blockNum: number;
  txHash: string;
};

const UNI_FACTORY_BLOCK = 10000835;
const BLOCKS_PER_QUERY = 10000;
const ADDR_UNI_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const ABI_UNI_FACTORY = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
];

const getDb = (path: string = "db.json") => {
  const adapter = new FileSync(path);
  const db = low(adapter);
  db.read();

  if (db.get("uniAtBlock").value() === undefined) {
    db.set("uniAtBlock", UNI_FACTORY_BLOCK).write();
  }
  if (db.get("uniPairs").value() == undefined) {
    db.set("uniPair", {}).write();
  }
  return db;
};

const main = async () => {
  const db = getDb();
  const provider = new ethers.providers.JsonRpcProvider(env.FORK_NODE_HTTP);

  const uniFactory = new ethers.Contract(
    ADDR_UNI_FACTORY,
    ABI_UNI_FACTORY,
    provider
  );
  let head = await provider.getBlockNumber();
	console.log(db.get("uniAtBlock").value());
  while (db.get("uniAtBlock").value() < head) {
    const from = db.get("uniAtBlock").value();
    const to = from + BLOCKS_PER_QUERY;
    console.log("querying:", { from, to });
    const logs = await uniFactory.queryFilter(
      uniFactory.filters.PairCreated(),
      from,
      to
    );
    logs.forEach((log) => {
      const {
        args: [token0, token1, pair],
        blockNumber,
        transactionHash,
      } = log;
      const uniPair: Pair = {
        token0,
        token1,
        addr: pair,
        txHash: transactionHash,
        blockNum: blockNumber,
      };
			db.set(`uniPair[${uniPair.addr}]`, uniPair).write();
    });
		db.set("uniAtBlock", to + 1).write();
    head = await provider.getBlockNumber();
    console.log("done:", { from, to }, Date.now());
  }
  console.log("exited at block:", head);
};

main();
