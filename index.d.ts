import { BotWarClient } from "./src/types/BotWarClient";
import { WarClientOptions } from "./src/types/WarClientOptions";
import { Bot } from "mineflayer";

interface BotWarPlugin {
  client: BotWarClient;
  connect(options: WarClientOptions): void;
}

declare module "@miner-org/mineflayer-bot-war" {
  export function loader(bot: Bot): void;
}

declare module "mineflayer" {
  interface Bot {
    botwar: BotWarPlugin;
  }
}
