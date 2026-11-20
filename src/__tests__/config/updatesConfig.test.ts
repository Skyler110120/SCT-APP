/**
 * Over-the-air updates only reach builds whose runtime version matches.
 * The iOS project is committed (bare workflow), so the runtime version is
 * written in three places that must stay in sync. Bump them together with
 * the app version whenever a release changes native code.
 */
import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "../../..");
const appJson = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8")).expo;
const easJson = JSON.parse(fs.readFileSync(path.join(root, "eas.json"), "utf8"));
const expoPlist = fs.readFileSync(path.join(root, "ios/SCTTraining/Supporting/Expo.plist"), "utf8");
const pbxproj = fs.readFileSync(path.join(root, "ios/SCTTraining.xcodeproj/project.pbxproj"), "utf8");

function plistString(key: string): string | undefined {
  return expoPlist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`))?.[1];
}

describe("EAS Update configuration", () => {
  it("uses an explicit runtime version equal to the app version", () => {
    expect(typeof appJson.runtimeVersion).toBe("string");
    expect(appJson.runtimeVersion).toBe(appJson.version);
  });

  it("matches the iOS runtime version and marketing version", () => {
    expect(plistString("EXUpdatesRuntimeVersion")).toBe(appJson.runtimeVersion);
    const marketing = new Set([...pbxproj.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1]));
    expect([...marketing]).toEqual([appJson.version]);
  });

  it("points iOS and Android at the same EAS Update URL", () => {
    const url = `https://u.expo.dev/${appJson.extra.eas.projectId}`;
    expect(appJson.updates.url).toBe(url);
    expect(plistString("EXUpdatesURL")).toBe(url);
    expect(expoPlist).toMatch(/<key>EXUpdatesEnabled<\/key>\s*<true\/>/);
  });

  it("gives every build profile its own update channel", () => {
    expect(easJson.build.production.channel).toBe("production");
    expect(easJson.build.preview.channel).toBe("preview");
    expect(easJson.build.development.channel).toBe("development");
  });
});
