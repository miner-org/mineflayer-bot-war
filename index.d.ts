import { BotWarClient } from "./src/types/BotWarClient";
import { WarClientOptions } from "./src/types/WarClientOptions";

interface BotWarPlugin {
  client: BotWarClient;
  connect(options: WarClientOptions): void;
}

declare module "@miner-org/mineflayer-bot-war" {
  import { Bot } from "mineflayer";

  export function loader(bot: Bot): void;
}

declare module "mineflayer" {
  interface Bot {
    botwar: BotWarPlugin;
  }
}
