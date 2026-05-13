import streamDeck from "@elgato/streamdeck";

import { Decorative } from "./actions/decorative";
import { MuteMic } from "./actions/mute-mic";
import { MuteOthers } from "./actions/mute-others";
import { PushToTalk } from "./actions/push-to-talk";
import { keysender } from "./keysender";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new PushToTalk());
streamDeck.actions.registerAction(new MuteMic());
streamDeck.actions.registerAction(new MuteOthers());
streamDeck.actions.registerAction(new Decorative());

process.on("exit", () => keysender.shutdown());
process.on("SIGINT", () => { keysender.shutdown(); process.exit(0); });
process.on("SIGTERM", () => { keysender.shutdown(); process.exit(0); });

streamDeck.connect();
