import { Strapi } from "@strapi/strapi";
import { ISettings } from "../../types";

export default ({ strapi }: { strapi: Strapi }) => {
  const getPluginStore = () => {
    return strapi.store({
      environment: "",
      type: "plugin",
      name: "alt-text-automator",
    });
  };
  const createDefaultConfig = async () => {
    const pluginStore = getPluginStore();
    const value: ISettings = {
      createAltTextOnImageUpload: true,
      language: "en",
      apiKey: "",
    };
    await pluginStore.set({ key: "settings", value });
    return pluginStore.get({ key: "settings" });
  };
  const getSettings = async () => {
    const pluginStore = getPluginStore();
    let config = await pluginStore.get({ key: "settings" });
    if (!config) {
      config = await createDefaultConfig();
    }
    return config;
  };
  const setSettings = async (settings: ISettings) => {
    settings.isValidApiKey = false;

    if (settings?.apiKey) {
      const res = await fetch(
        "https://www.alttextautomator.com/api/v1/account",
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": settings.apiKey,
          },
        }
      );

      if (!res.ok || res.status !== 200) {
        settings.isValidApiKey = false;
      } else {
        settings.isValidApiKey = true;
      }

      const accountInfo = (await res.json()) as Record<string, any>;

      settings.credits = accountInfo?.credits
        ? Number(accountInfo?.credits)
        : 0;
    }
    const pluginStore = getPluginStore();

    await pluginStore.set({ key: "settings", value: settings });
    return pluginStore.get({ key: "settings" });
  };
  return {
    getSettings,
    setSettings,
  };
};
