import {
	action,
	DidReceiveSettingsEvent,
	KeyAction,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
} from "@elgato/streamdeck";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { keysender } from "../keysender";

const BG = "#0A0807";

const DESIGNS = {
	marathon: { file: "marathon.svg", fg: "#D4FF3E" },
	cyberacme: { file: "cyberacme.svg", fg: "#FF5B1F" },
	mida: { file: "mida.svg", fg: "#22E1FF" },
	traxus: { file: "traxus.svg", fg: "#C44CFF" },
} as const;

type DesignKey = keyof typeof DESIGNS;

export type DecorativeSettings = {
	design?: DesignKey;
	key?: string;
	inverted?: boolean;
};

const cache = new Map<string, string>();

function resolveDesign(key: string | undefined): DesignKey {
	return key && key in DESIGNS ? (key as DesignKey) : "marathon";
}

async function loadTemplate(file: string): Promise<string> {
	const cached = cache.get(file);
	if (cached) return cached;
	const here = dirname(fileURLToPath(import.meta.url));
	const path = resolve(here, "..", "imgs", "actions", "decorative", file);
	const svg = await readFile(path, "utf-8");
	cache.set(file, svg);
	return svg;
}

function invertColors(svg: string, fg: string): string {
	const tmp = "__SWAP_TMP__";
	return svg.replaceAll(fg, tmp).replaceAll(BG, fg).replaceAll(tmp, BG);
}

async function renderDataUrl(design: DesignKey, inverted: boolean): Promise<string> {
	const { file, fg } = DESIGNS[design];
	const raw = await loadTemplate(file);
	const svg = inverted ? invertColors(raw, fg) : raw;
	return `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`;
}

@action({ UUID: "com.jossy.marathon.decorative" })
export class Decorative extends SingletonAction<DecorativeSettings> {
	override async onWillAppear(ev: WillAppearEvent<DecorativeSettings>): Promise<void> {
		if (!ev.action.isKey()) return;
		await this.paint(ev.action, ev.payload.settings);
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<DecorativeSettings>): Promise<void> {
		if (!ev.action.isKey()) return;
		await this.paint(ev.action, ev.payload.settings);
	}

	override async onKeyDown(ev: KeyDownEvent<DecorativeSettings>): Promise<void> {
		const settings = ev.payload.settings;
		if (settings.key) keysender.tap(settings.key);
		const next = !(settings.inverted ?? false);
		await ev.action.setSettings({ ...settings, inverted: next });
		await this.paint(ev.action, { ...settings, inverted: next });
	}

	private async paint(target: KeyAction<DecorativeSettings>, settings: DecorativeSettings): Promise<void> {
		const design = resolveDesign(settings.design);
		const url = await renderDataUrl(design, settings.inverted ?? false);
		await target.setImage(url);
	}
}
