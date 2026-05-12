import {
	action,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
} from "@elgato/streamdeck";
import { keysender } from "../keysender";

export type MuteOthersSettings = {
	key?: string;
	muted?: boolean;
};

const DEFAULT_KEY = "n";

@action({ UUID: "com.jossy.marathon.mute-others" })
export class MuteOthers extends SingletonAction<MuteOthersSettings> {
	override async onWillAppear(ev: WillAppearEvent<MuteOthersSettings>): Promise<void> {
		if (ev.action.isKey()) await ev.action.setState(ev.payload.settings.muted ? 1 : 0);
	}

	override async onKeyDown(ev: KeyDownEvent<MuteOthersSettings>): Promise<void> {
		const settings = ev.payload.settings;
		const key = settings.key?.trim() || DEFAULT_KEY;
		keysender.tap(key);
		const next = !(settings.muted ?? false);
		await ev.action.setSettings({ ...settings, muted: next });
		await ev.action.setState(next ? 1 : 0);
	}
}
