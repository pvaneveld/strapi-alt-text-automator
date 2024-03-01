import { request } from "@strapi/helper-plugin";
import { ISettings } from "../../../../types";

const settingsProxy = {
  get: async () => {
    const data = await request(`/alt-text-automator/settings`, {
      method: "GET",
    });

    return data;
  },
  set: async (data: ISettings) => {
    return await request(`/alt-text-automator/settings`, {
      method: "POST",
      body: data,
    });
  },
};
export default settingsProxy;
