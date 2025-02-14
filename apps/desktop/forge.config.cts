import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import path from "path";
import fs from "fs/promises";

import "dotenv/config";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    prune: false,
    icon: path.join(__dirname, "assets", "appicon"),
    name: "Virginia",
    osxSign: {
      // Fix notarization issue: https://github.com/electron/notarize/issues/185
      // Fix plist issue: https://github.com/electron/forge/issues/3521
      optionsForFile: (filePath) => {
        if (filePath.endsWith("Virginia.app")) {
          return {
            entitlements: path.join(__dirname, "./entitlements.plist"),
            hardenedRuntime: true,
          };
        }
        if (filePath.endsWith("Virginia Helper (GPU).app")) {
          return {
            entitlements: path.join(__dirname, "./entitlements.gpu.plist"),
            hardenedRuntime: true,
          };
        }
        if (filePath.endsWith("Virginia Helper (Plugin).app")) {
          return {
            entitlements: path.join(__dirname, "./entitlements.plugin.plist"),
            hardenedRuntime: true,
          };
        }
        if (filePath.endsWith("Virginia Helper (Renderer).app")) {
          return {
            entitlements: path.join(__dirname, "./entitlements.renderer.plist"),
            hardenedRuntime: true,
          };
        }
        if (filePath.endsWith("Virginia Helper.app")) {
          return {
            entitlements: path.join(__dirname, "./entitlements.renderer.plist"),
            hardenedRuntime: true,
          };
        }
        return {
          entitlements: path.join(__dirname, "./entitlements.plist"),
          hardenedRuntime: true,
        };
      },
    },
    osxNotarize: {
      appleApiKey: process.env.APPLE_API_KEY,
      appleApiKeyId: process.env.APPLE_API_KEY_ID,
      appleApiIssuer: process.env.APPLE_API_ISSUER,
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      // Fix monorepo references: https://gist.github.com/robin-hartmann/ad6ffc19091c9e661542fbf178647047
      const bundler = await import("./bundler.js");
      await bundler.bundle(__dirname, buildPath);
    },
    packageAfterPrune: async (_forgeConfig, buildPath) => {
      // Fix sqlite interrupting code signing on macOS: https://github.com/electron/osx-sign/issues/158
      const dest = path.join(buildPath, "node_modules", "sqlite3", "build");
      await fs.rm(dest, { recursive: true, force: true });
    },
  },
  plugins: [
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        prerelease: true,
        repository: {
          owner: "rrpff",
          name: "virginia",
        },
      },
    },
  ],
};

export default config;
