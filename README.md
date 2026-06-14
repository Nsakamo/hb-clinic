# 歯と美容のクリニック — Webサイト

国家資格者による医療ホワイトニングクリニック（銀座本院／銀座7丁目院）の公式サイト。

## 構成
- `index.html` — TOPページ
- `home-whitening.html` — ホームホワイトニングLP
- `dual-whitening.html` — デュアルホワイトニングLP
- `css/styles.css` — 共通デザインシステム
- `js/main.js` — アコーディオン・スクロール演出・固定CTA

## 公開
Netlify（GitHub連携）で自動デプロイ。`main` ブランチへの push で本番反映、プルリクエストごとにプレビューURLが発行されます。

## 開発メモ
- 静的サイト（ビルド不要）。`netlify.toml` の publish は `.`（ルート）。
- 写真は IMG-001 等のプレースホルダ。実画像に差し替え予定。
