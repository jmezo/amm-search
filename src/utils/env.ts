import dotenv from "dotenv";

dotenv.config();

const getVar = (key: string): string => {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error(`env var not set: ${key}`);
  }
  return envVar;
};

const env = {
  FORK_NODE_HTTP: getVar("FORK_NODE_HTTP"),
};

export default env;
