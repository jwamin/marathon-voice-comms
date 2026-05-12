import streamDeck from "@elgato/streamdeck";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Op = "down" | "up" | "tap";

let proc: ChildProcessWithoutNullStreams | null = null;
let warnedNonWindows = false;

function senderScriptPath(): string {
	// Bundle is emitted to <sdPlugin>/bin/plugin.js; helper sits at <sdPlugin>/helper/sender.ps1.
	const here = dirname(fileURLToPath(import.meta.url));
	return resolve(here, "..", "helper", "sender.ps1");
}

function ensureProc(): ChildProcessWithoutNullStreams | null {
	if (process.platform !== "win32") {
		if (!warnedNonWindows) {
			streamDeck.logger.warn("keysender: non-Windows platform, keystrokes are no-ops");
			warnedNonWindows = true;
		}
		return null;
	}
	if (proc && proc.exitCode === null && !proc.killed) return proc;

	const script = senderScriptPath();
	try {
		proc = spawn(
			"powershell.exe",
			["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script],
			{ stdio: ["pipe", "pipe", "pipe"], windowsHide: true },
		);
		proc.stderr.on("data", (d) => streamDeck.logger.warn(`[sender] ${d.toString().trim()}`));
		proc.on("exit", (code) => {
			streamDeck.logger.info(`[sender] exited with code ${code}`);
			proc = null;
		});
		proc.on("error", (err) => {
			streamDeck.logger.error(`[sender] process error: ${err.message}`);
			proc = null;
		});
		streamDeck.logger.info("keysender: helper process spawned");
	} catch (err) {
		streamDeck.logger.error(`keysender: failed to spawn helper: ${err}`);
		proc = null;
	}
	return proc;
}

function send(op: Op, key: string | undefined): void {
	if (!key || !key.trim()) return;
	const p = ensureProc();
	if (!p || !p.stdin.writable) return;
	p.stdin.write(JSON.stringify({ op, key: key.trim() }) + "\n");
}

export const keysender = {
	down: (key: string | undefined) => send("down", key),
	up: (key: string | undefined) => send("up", key),
	tap: (key: string | undefined) => send("tap", key),
	shutdown: () => {
		if (proc) {
			try { proc.stdin.end(); } catch { /* ignore */ }
			proc.kill();
			proc = null;
		}
	},
};
