// 建议使用环境变量而不是直接在仓库文件中放置密钥，但我跳过了这部分，因为对许多人来说会变得复杂。
// 或者，您可以下载仓库或fork它，然后从您的账户上传并保持私有，这样您的密钥就不会暴露给公众。

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
