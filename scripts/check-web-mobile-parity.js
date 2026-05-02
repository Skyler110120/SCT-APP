const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");

const checks = [
  {
    name: "availability admin methods",
    webFile: path.join(
      rootDir,
      "sct-web-app/src/services/availabilityService.ts"
    ),
    mobileFile: path.join(
      rootDir,
      "SCT-APP/src/services/instructorAvailabilityService.ts"
    ),
    requiredMethods: [
      "createAvailabilityAsAdmin",
      "getInstructorAvailabilityForAdmin",
      "getCompanyAvailability",
    ],
  },
  {
    name: "user permission methods",
    webFile: path.join(rootDir, "sct-web-app/src/services/userService.ts"),
    mobileFile: path.join(rootDir, "SCT-APP/src/services/userService.ts"),
    requiredMethods: ["updateInstructorPermissions"],
  },
];

function readFileOrThrow(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function missingMethods(source, methods) {
  return methods.filter((methodName) => !source.includes(methodName));
}

function run() {
  let hasFailure = false;

  for (const check of checks) {
    const webSource = readFileOrThrow(check.webFile);
    const mobileSource = readFileOrThrow(check.mobileFile);

    const webMissing = missingMethods(webSource, check.requiredMethods);
    const mobileMissing = missingMethods(mobileSource, check.requiredMethods);

    if (webMissing.length > 0 || mobileMissing.length > 0) {
      hasFailure = true;
      console.error(`\n[parity] ${check.name} failed`);
      if (webMissing.length > 0) {
        console.error(`[parity] Missing in web: ${webMissing.join(", ")}`);
      }
      if (mobileMissing.length > 0) {
        console.error(`[parity] Missing in mobile: ${mobileMissing.join(", ")}`);
      }
    } else {
      console.log(`[parity] ${check.name} passed`);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
    return;
  }

  console.log("\n[parity] All checks passed");
}

run();
