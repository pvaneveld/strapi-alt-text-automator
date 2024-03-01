# Strapi plugin alt-text-automator

A plugin for <a href="https://github.com/strapi/strapi">Strapi CMS</a> that automatically generates alt text for images you upload to your media library via [Alt Text Automator](https://www.alttextautomator.com/).

## ✨ Supported Strapi Versions

The Placeholder plugin is only compatible with Strapi v4.

## ⚙️ Installation

To install, run:

```bash
npm install strapi-alt-text-automator
```

Open/create file `config/plugins.js`. Enable this plugin by adding:

```js
module.exports = {
  "alt-text-automator": {
    enabled: true,
  },
};
```

## 🖍️ How to generate alt text for images

1. Create an account on [Alt Text Automator](https://www.alttextautomator.com/auth/sign-up).
2. Generate an API key on the [settings page](https://www.alttextautomator.com/settings/api-keys).
   ![Generate an API key in alt text automator](./assets/strapi-api-key.png)
3. Add the API key to your Strapi Alt Text Automator plugin settings. If your API key is valid, the available credits will be displayed.
   ![Add API key to Strapi settings](./assets/strapi-settings.png)
4. Upload an image(s) to your media library. The alt text will be automatically generated and added to the image in your desired language.
   ![Alt text generated for image](./assets/strapi-alt-text.png)
