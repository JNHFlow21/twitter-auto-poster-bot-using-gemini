// 你可以直接fork仓库后，在这里复制粘贴上你的apikey，然后启用工作流，就能自动运行发推了
// 或者，您可以下载仓库，然后从您的账户上传并保持private权限，这样您的密钥就不会暴露给公众。

const APP_KEY = "你的twitter api key";
const APP_SECRET = "你的twitter api secret";
const ACCESS_TOKEN = "你的twitter access token";
const ACCESS_SECRET = "你的twitter access secret";
const GEMINI_API_KEY = "你的gemini api key";

const SECRETS = {
  APP_KEY,
  APP_SECRET,
  ACCESS_TOKEN,
  ACCESS_SECRET,
  GEMINI_API_KEY,
};

module.exports = SECRETS;
