import {
	action,
	KeyDownEvent,
	KeyUpEvent,
	SingletonAction,
	WillAppearEvent,
} from "@elgato/streamdeck";
import { keysender } from "../keysender";

export type PttSettings = {
	key?: string;
};

const DEFAULT_KEY = "v";

@action({ UUID: "com.jossy.marathon.ptt" })
export class PushToTalk extends SingletonAction<PttSettings> {
	override async onWillAppear(ev: WillAppearEvent<PttSettings>): Promise<void> {
		if (ev.action.isKey()) await ev.action.setState(0);
	}

	override async onKeyDown(ev: KeyDownEvent<PttSettings>): Promise<void> {
		const key = ev.payload.settings.key?.trim() || DEFAULT_KEY;
		keysender.down(key);
		await ev.action.setState(1);
	}

	override async onKeyUp(ev: KeyUpEvent<PttSettings>): Promise<void> {
		const key = ev.payload.settings.key?.trim() || DEFAULT_KEY;
		keysender.up(key);
		await ev.action.setState(0);
	}
}
