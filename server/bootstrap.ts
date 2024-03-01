import { Event } from "@strapi/database/dist/lifecycles";
import { Strapi } from "@strapi/strapi";
import { ISettings } from "../types";
import { ReadStream } from "fs";

export default ({ strapi }: { strapi: Strapi }) => {
  strapi.db?.lifecycles.subscribe({
    models: ["plugin::upload.file"],
    beforeCreate: async (event) => generateAltTextBeforeCreate(event, strapi),
    afterUpdate: async (event) => generateAltTextAfterUpdate(event, strapi),
  });
};

async function generateAltTextBeforeCreate(
  event: Event,
  strapi: Strapi
): Promise<void | Promise<void>> {
  const settingService = strapi
    .plugin("alt-text-automator")
    ?.service("settingsService");

  if (!settingService) {
    return;
  }

  const settings: ISettings = await settingService.getSettings();

  const { createAltTextOnImageUpload, apiKey, isValidApiKey, language } =
    settings;

  if (!createAltTextOnImageUpload || !apiKey || !isValidApiKey || !language) {
    return;
  }

  const eventData = event.params?.data;

  if (!isValidMimeType(eventData?.mime)) {
    return;
  }

  if (!isWithinAllowedSize(eventData?.size)) {
    return;
  }

  const stream: ReadStream = eventData?.getStream();

  if (!stream) {
    return;
  }

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => {
      chunks.push(chunk as Buffer);
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });

  const base64Image = buffer.toString("base64");

  const response = await fetch(
    "https://www.alttextautomator.com/api/v1/strapi-images",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        fileSrc: base64Image,
        url: eventData.url,
        language: settings.language,
      }),
    }
  );

  if (!response.ok) {
    return;
  }

  const responseJson = (await response.json()) as { alt_text: string };

  const altText = responseJson?.alt_text;

  if (!altText) {
    return;
  }

  eventData.alternativeText = altText;
}

async function generateAltTextAfterUpdate(
  event: Event,
  strapi: Strapi
): Promise<void | Promise<void>> {
  const newFileHash = event.params?.data?.hash;

  // If the file hash is not present, it means that the file was not updated
  if (!newFileHash) {
    return;
  }

  const settingService = strapi
    .plugin("alt-text-automator")
    ?.service("settingsService");

  if (!settingService) {
    return;
  }

  const settings: ISettings = await settingService
    .getSettings()
    .catch(() => ({}));

  const { createAltTextOnImageUpload, apiKey, isValidApiKey, language } =
    settings;

  if (!createAltTextOnImageUpload || !apiKey || !isValidApiKey || !language) {
    return;
  }

  // @ts-ignore
  const eventData = event.result;

  if (!isValidMimeType(eventData?.mime)) {
    return;
  }

  if (!isWithinAllowedSize(eventData?.size)) {
    return;
  }

  const host = strapi.config.get("server.host");
  const port = strapi.config.get("server.port");
  const serverUrl = `http://${host}:${port}`;
  const imageUrl = `${serverUrl}${eventData.url}`;

  const res = await fetch(imageUrl);
  const imageBlob = await res.arrayBuffer();
  const buffer = Buffer.from(imageBlob);
  const base64Image = buffer.toString("base64");

  const response = await fetch(
    "https://www.alttextautomator.com/api/v1/strapi-images",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        fileSrc: base64Image,
        url: eventData.url,
        language: settings.language,
      }),
    }
  );

  if (!response.ok) {
    return;
  }

  const responseJson = (await response.json()) as { alt_text: string };

  const altText = responseJson?.alt_text;

  if (!altText) {
    return;
  }

  await strapi.db?.query("plugin::upload.file").update({
    where: { id: eventData.id },
    data: { alternativeText: altText },
  });
}

function isValidMimeType(mimeType: string | undefined): boolean {
  return /image\/(jpeg|png|webp|gif)/.test(mimeType ?? "");
}

function isWithinAllowedSize(sizeInKb: number | undefined): boolean {
  if (!sizeInKb) {
    return false;
  }

  const sizeAsNumber = Number(sizeInKb);

  if (isNaN(sizeAsNumber)) {
    return false;
  }

  const sizeInMb = sizeAsNumber / 1000;

  return sizeInMb <= 20;
}
