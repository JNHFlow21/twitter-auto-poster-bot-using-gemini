可以在本地电脑终端复制输入下面的命令，测试gemini能否正常运行，但必须开vpn，且全局，或者配置下，让你的终端也走vpn代理，否则是国内的网络，访问不了
```
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
  -H 'Content-Type: application/json' \
  -H 'X-goog-api-key: AIzaSyBt3qkdGnONgW7iErPhEYXzZEGr4ZBKqn0' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "请用中文写一条不少与230字，≤260字的 Web3/加密科普短帖，面向小白。主题可从但不限于：钱包与助记词、安全与授权、交易所与KYC、稳定币、DeFi/DEX、NFT、L2、跨链桥、链上数据、监管与ETF、减半与宏观等；也可对最近7天业内大事做简短分析（结论+风险+一条行动建议）。如无把握的实时信息，请改写为常青科普，不要编造事实。要求：具体、可执行；可用1–2个表情；不含价格预测/收益承诺/外链；输出单段中文纯文本。"
          }
        ]
      }
    ]
  }'
```

