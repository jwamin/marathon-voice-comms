# Bundled profiles

Drop exported `.streamDeckProfile` files in this directory, then add a matching
entry to `manifest.json` under `"Profiles"`. Stream Deck rejects manifests that
reference missing profile files, so add the manifest entry **after** the file
exists.

## To create the default Neo layout

1. Launch Stream Deck. Open the Marathon Voice Comms plugin's actions.
2. Create a new profile (Preferences -> Profiles -> +) named **Marathon Neo**.
3. Drag the three actions onto the bottom row, left-aligned:

   ```
   [ ] [ ] [ ] [ ]
   [PTT][MIC][OTH][ ]
   ```

4. Right-click the profile in Preferences -> Profiles -> **Export**.
5. Save as `marathon-neo.streamDeckProfile` in this folder.

## Activate the manifest entry

Once `marathon-neo.streamDeckProfile` is in this folder, add to `manifest.json`
(top level, after `"UUID"`):

```json
"Profiles": [
    {
        "Name": "profiles/marathon-neo",
        "DeviceType": 9,
        "AutoInstall": true,
        "Readonly": false,
        "DontAutoSwitchWhenInstalled": false
    }
],
```

`DeviceType` 9 is Stream Deck Neo. For other devices: 0 = MK.2/Original, 1 =
Mini, 2 = XL, 7 = Stream Deck +. To ship multiple devices, export one profile
per device type and add additional entries.

Then run `npx streamdeck validate ./com.jossy.marathon.sdPlugin` to confirm the
plugin still loads cleanly.
