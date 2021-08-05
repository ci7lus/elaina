# <img src="https://i.gyazo.com/297a60290f2b9ecc7b766ac532841fd7.jpg" alt="elaina logo" width="20px"> elaina

鋭意開発中

## これはなに

[l3tnun/EPGStation](https://github.com/l3tnun/EPGStation) と [SlashNephy/saya](https://github.com/SlashNephy/saya) で動くコメント付き DTV 視聴 Web アプリです。

[![elaina 動作イメージ](https://i.gyazo.com/a028110a6b4befb003c5f3f9d045a663.jpg)](https://gyazo.com/a028110a6b4befb003c5f3f9d045a663)

## 使用

最新バージョンを [elaina.surge.sh](http://elaina.surge.sh) にて公開しています。<br />
HTTPS は強制されませんので、使用している EPGStation の Scheme に合わせて使用してください。<br />
EPGStation は `config.yml` にて `isAllowAllCORS: true` で CORS ヘッダーを付与するように設定してください（[詳細](https://github.com/l3tnun/EPGStation/blob/723dacd3f0344615c6b9e766f2f00cbc17251cd1/doc/conf-manual.md#isallowallcors)）。

- [HTTP (http://elaina.surge.sh)](http://elaina.surge.sh)
- [HTTPS (https://elaina.surge.sh)](https://elaina.surge.sh)

必須ではありませんが、字幕の表示に [Rounded M+ 1m for ARIB](https://github.com/xtne6f/TVCaptionMod2/blob/3cc6c1767595e1973473124e892a57c7693c2154/TVCaptionMod2_Readme.txt#L49-L50) を指定しているので、フォントのインストールを推奨します。[ダウンロードはこちら](https://github.com/ci7lus/MirakTest/files/6555741/rounded-mplus-1m-arib.ttf.zip)。

## 開発

```bash
yarn
yarn dev
# ビルド
yarn build
```

開発に使用する EPGStation は上記使用セクションの手順に従って CORS ヘッダーの付与を行ってください。

## 謝辞

elaina および [SlashNephy/saya](https://github.com/SlashNephy/saya) は次のプロジェクトを参考にして実装しています。

- [Chinachu/Chinachu](https://github.com/Chinachu/Chinachu)
- [tsukumijima/TVRemotePlus](https://github.com/tsukumijima/TVRemotePlus)
- [l3tnun/EPGStation](https://github.com/l3tnun/EPGStation)

DTV 実況コミュニティの皆さまに感謝します。

## ライセンス

elaina は MIT ライセンスの下で提供されます。
