import { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.archpoi.searchpoi",
  appName: "SEARCH-POI",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    url: "https://engine-v1.pages.dev",
    cleartext: true
  }
};
export default config;
