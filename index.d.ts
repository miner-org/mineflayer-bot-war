import BotWarPlugin from "./src/BotWarPlugin";

declare module "@miner-org/mineflayer-bot-war" {
  import { Bot } from "mineflayer";

  export function loader(bot: Bot): void;
}

declare module "mineflayer" {
  interface Bot {
    botwar: BotWarPlugin;
  }
}
