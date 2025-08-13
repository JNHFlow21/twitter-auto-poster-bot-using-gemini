// index.js
// By JNHFlow21 - Gemini + Twitter 自动发帖中文科普版（动态主题，从 SECRETS.js 读取）

const { GoogleGenAI } = require("@google/genai");
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

// -------- Twitter Client（从 SECRETS.js 读取） --------
const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

// -------- Gemini Client（用官方新 SDK） --------
const rawGeminiKey = (SECRETS.GEMINI_API_KEY || "").trim();
if (!rawGeminiKey) {
  console.error("❌ 未配置 GEMINI_API_KEY，检查 SECRETS.js。");
  process.exit(1);
}
if (!/^AIza/.test(rawGeminiKey)) {
  console.warn(
    "⚠️ GEMINI_API_KEY 看起来不是标准形式（通常以 AIza 开头），但继续尝试。"
  );
}
const ai = new GoogleGenAI({ apiKey: rawGeminiKey });

// ============ 动态主题构造 ============

// 16 档轮换的大类（与北京时间每 90 分钟一档对应）
const SLOT_ORDER = [
  "wallet",
  "security",
  "defi",
  "dex",
  "exchange",
  "rwa",
  "gamefi",
  "l2",
  "nft",
  "bridge",
  "reg",
  "onchain",
  "approval",
  "scam",
  "macro",
  "stable",
];

// 细分主题池
const TOPIC_POOL = {
  wallet: ["钱包与助记词安全", "热钱包 vs 冷钱包的取舍", "私钥备份与离线保存"],
  security: [
    "授权（Approval）风险与撤销",
    "签名请求里的隐藏风险",
    "常见空投钓鱼套路",
  ],
  defi: [
    "DeFi 收益的来源与风险",
    "借贷协议的清算线与稳定性",
    "收益聚合器的原理与注意事项",
  ],
  dex: ["Uniswap 做市与滑点原理", "价格影响与最小成交额设置", "集中流动性基础"],
  exchange: [
    "交易所 KYC 与提币限额",
    "交易所存取款费用与到账时间",
    "从交易所到自托管的迁移清单",
  ],
  rwa: [
    "RWA 的链上表示与合规边界",
    "RWA 的定价、净值与披露",
    "RWA 与利率/信用风险的关系",
  ],
  gamefi: [
    "GameFi 经济模型与代币通胀",
    "抽奖/概率型机制的风控",
    "可持续激励与反女巫设计",
  ],
  l2: [
    "L2 手续费与结算安全",
    "Optimistic vs ZK Rollup",
    "跨 L2 转账的注意事项",
  ],
  nft: ["NFT 的所有权与版权边界", "版税与市场竞争", "NFT 的真实用途与误区"],
  bridge: [
    "跨链桥安全事件复盘",
    "资产映射与锚定风险",
    "跨链前后的地址与链 ID 校验",
  ],
  reg: [
    "ETF/监管动态对新手的影响",
    "合规交易与税务基础",
    "不同司法区的合规差异",
  ],
  onchain: [
    "Etherscan 阅读交易与事件日志",
    "合约地址与代币合约核验",
    "从区块浏览器识别可疑交互",
  ],
  approval: [
    "无限授权的风险",
    "月度授权体检：撤销清单与工具",
    "授权与连接钱包的本质区别",
  ],
  scam: ["社工钓鱼常见话术", "空投/白名单骗局识别", "签名消息里藏的恶意操作"],
  macro: [
    "减半、流动性与周期误区",
    "美元利率与稳定币需求",
    "风险资产相关性变化",
  ],
  stable: [
    "USDT/USDC/DAI 差异（储备/抵押）",
    "稳定币脱钩的成因与应对",
    "如何分散稳定币对手风险",
  ],
};

// 交易所与协议点缀
const EXCHANGES = [
  "Binance",
  "Coinbase",
  "OKX",
  "Bybit",
  "Kraken",
  "Bitget",
  "HTX",
];
const KEYWORDS = [
  "Uniswap",
  "Aave",
  "MakerDAO",
  "Curve",
  "Arbitrum",
  "zkSync",
  "EigenLayer",
];

// 获取北京时间并算 slot index（每 90 分钟一个）
function getBeijingNow() {
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijing;
}
function getSlotIndex(dateBJ = getBeijingNow()) {
  const minutes = dateBJ.getUTCHours() * 60 + dateBJ.getUTCMinutes();
  return Math.floor((minutes % (24 * 60)) / 90);
}

function pickSubTopic(category) {
  const pool = TOPIC_POOL[category] || ["Web3 常见误区澄清"];
  let base = pool[Math.floor(Math.random() * pool.length)];

  if (["exchange", "dex", "defi", "stable", "rwa"].includes(category)) {
    if (Math.random() < 0.7) {
      base += `；举例：${
        EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)]
      }`;
    }
    if (Math.random() < 0.5) {
      base += `；相关：${
        KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
      }`;
    }
  } else if (Math.random() < 0.4) {
    base += `；相关：${KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]}`;
  }
  return base;
}

function buildTopic() {
  const override = (SECRETS.TOPIC_OVERRIDE || "").trim();
  if (override) return override;

  const hasNews = (SECRETS.NEWS_HEADLINE || "").trim();
  if (hasNews) return "news";

  const slot = getSlotIndex();
  const category = SLOT_ORDER[slot % SLOT_ORDER.length];
  return pickSubTopic(category);
}

function buildPrompt() {
  const topic = buildTopic();

  if (topic === "news") {
    const headline = (SECRETS.NEWS_HEADLINE || "").trim();
    const date = (SECRETS.NEWS_DATE || "").trim();
    const source = (SECRETS.NEWS_SOURCE || "").trim();
    const points = (SECRETS.NEWS_POINTS || "").trim();

    return `请用中文写一条不少于230字、不超过260字的 Web3/加密新闻解读短帖。  
材料：标题「${headline}」；日期：${date}；来源：${source}；要点：${points}。  

结构建议：  
1. 开头用一句引导式问题或判断句开启，比如“为什么这个事件值得关注？”、“这则新闻背后隐藏哪些风险？”等，引发兴趣；  
2. 第二段总结新闻核心内容，并指出其对币种、协议、交易所或大家的潜在影响；  
3. 第三段提示可能的风险点（如技术、合规、市场反应等）；  
4. 最后一段给出一条明确可行的建议，避免泛泛而谈。  

风格要求：  
- 语言自然、平实、有节奏感，通俗易懂；  
- 可以使用“大家”称呼，但避免“朋友们”“小白”“我”“你”等口语化标记；  
- 不使用表情、不加外链、不预测价格或承诺收益；  
- 输出为**带换行的中文纯文本**，每段之间用一个空行分隔；  
- 不要额外解释，不添加标签或标题；  
- 如信息有限或无法核实，请直接说明“不确定”，并补充一条常规安全建议。`;
  }

  return `请围绕“${topic}”写一条不少于230字、不超过260字的 Web3/加密科普短帖。  
目标是提升可读性和传播力，适合发布在 X 平台，语气自然、有节奏感。  

结构要求：  
1. 开头用一句引导式提问或判断句，如“为什么...？”、“大家有没有注意到...？”等；  
2. 第二段给出一个清晰的核心观点，并用简洁语句解释；  
3. 第三段提供一条面向大家的可执行建议，具体可行，避免泛泛而谈；  
4. 如信息不充分或无法核实，请说明“不确定”，并补充一条通用风险提示。  

风格要求：  
- 语言尽量通俗，避免术语堆砌；  
- 可使用“大家”作为称呼，避免“小白”“我”“你”等第一/二人称；  
- 不使用表情、不加外链、不预测价格或承诺收益；  
- 输出为**带换行的中文纯文本**，每段之间用一个空行隔开；  
- 不要额外解释，不添加标签或标题，只输出正文内容。`;
}

// ============ 主流程 ============

async function run() {
  try {
    const prompt = buildPrompt();
    const bj = getBeijingNow();
    console.log(
      `🕒 Beijing Time: ${bj
        .toISOString()
        .replace("T", " ")
        .slice(0, 19)}  | Prompt preview: ${prompt.slice(0, 80)}...`
    );

    // 用官方方式调用 Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // 取文本（兼容不同版本返回结构）
    let text = "";
    if (typeof response.text === "string") {
      text = response.text;
    } else if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.content) {
          for (const c of item.content) {
            if (c.text) text += c.text;
          }
        }
      }
    }

    text = (text || "").trim().replace(/\s*\n+\s*/g, " ");

    if (!text || text.length < 10) {
      console.error("❌ Gemini 没有返回有效内容，取消发推。");
      return;
    }

    if (text.length < 230) {
      console.warn(`⚠️ 生成内容仅 ${text.length} 字，低于 230 字，但仍发送。`);
    }

    text = text.slice(0, 260); // 保底截断
    console.log(`📢 Gemini 生成内容（${text.length}字）：\n${text}`);

    await sendTweet(text);
  } catch (err) {
    console.error("❌ run() 发生异常：", err?.message || err);
  }
}

async function sendTweet(tweetText) {
  const text = (tweetText || "").trim();
  if (!text || text.length < 5) {
    console.error("❌ 推文内容为空或太短，不发送。");
    return;
  }
  try {
    await twitterClient.v2.tweet(text);
    console.log("✅ 推文成功发布！");
  } catch (error) {
    console.error(
      "❌ 推文失败：",
      error?.data?.errors?.[0]?.message || error.message
    );
  }
}

run();
