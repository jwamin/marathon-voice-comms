# Bundled profiles

`.streamDeckProfile` files in this directory ship inside the plugin and are
referenced from `../manifest.json` under `"Profiles"`. With `AutoInstall: true`,
Stream Deck installs the profile the first time the plugin loads on a matching
device.

## Currently bundled

| File                          | DeviceType | Device           |
| ----------------------------- | ---------- | ---------------- |
| `Marathon.streamDeckProfile`  | 9          | Stream Deck Neo  |

## Adding another device's layout

1. In Stream Deck, switch to the target device.
2. Create a new profile, place the three actions where you want them.
3. Right-click the profile in Preferences -> Profiles -> **Export**.
4. Save the `.streamDeckProfile` file into this folder.
5. Add a matching entry to `../manifest.json` under `"Profiles"`. DeviceType
   integers: 0 = MK.2/Original, 1 = Mini, 2 = XL, 7 = Stream Deck +, 9 = Neo,
   13 = Stream Deck + XL.
6. Re-validate: `npx streamdeck validate ./com.jossy.marathon.sdPlugin`.

Stream Deck rejects manifests that reference missing profile files, so add the
manifest entry **after** the file is in place.
