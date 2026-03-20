# AutoNovel

<div>
<video controls src="https://github.com/user-attachments/assets/83e476de-a5dd-4293-8280-395b2754cc05" muted="false"></video>
</div>


AIが自動で小説を生成するWebアプリケーションです。ジャンル・舞台・主人公・テーマなどをステップ形式で選択するだけで、GPT-4oが完結した日本語小説を執筆します。

## 機能

- 6つの質問（ジャンル／舞台設定／主人公／テーマ／トーン／文字数）を順番に選択
- 選択内容に基づき GPT-4o がリアルタイムストリーミングで小説を生成
- 生成した小説をクリップボードにコピー、またはテキストファイルとして保存

## 必要環境

- Python 3.9 以上
- OpenAI API キー（[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) から取得）
- OpenAI アカウントに利用クレジットがあること（[課金設定](https://platform.openai.com/account/billing)）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd AutoNovel
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. APIキーの設定


`.env.example` ファイルを `.env`にコピー

```bash
cp .env.example .env
```


`.env` ファイルを編集し、取得した OpenAI API キーを設定します。

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. サーバーの起動

```bash
python app.py
```

ブラウザで [http://localhost:5000](http://localhost:5000) を開きます。

## 使い方

1. 「小説を作る」ボタンをクリック
2. 表示される6つの質問に順番に回答
3. AIが小説を自動生成（生成中はリアルタイムでテキストが表示されます）
4. 完成した小説を「コピー」または「保存」で取得

## ファイル構成

```
AutoNovel/
├── app.py              # Flask サーバー・API処理
├── requirements.txt    # 依存パッケージ
├── .env                # APIキー設定（Gitには含めないこと）
├── templates/
│   └── index.html      # メインHTML
└── static/
    ├── css/
    │   └── style.css   # スタイルシート
    └── js/
        └── app.js      # フロントエンドロジック
```

## 注意事項

- `.env` ファイルは絶対に Git にコミットしないでください。`.gitignore` に追加することを推奨します。
- 本アプリは開発用サーバー（Flask debug mode）で動作します。本番環境での公開には別途 WSGI サーバー（Gunicorn 等）を使用してください。

## トラブルシューティング

| エラー | 原因 | 対処 |
|--------|------|------|
| APIキーが無効です | `.env` のキーが誤っている | 正しいキーを再設定 |
| You exceeded your current quota | OpenAI の利用クレジット不足 | [課金ページ](https://platform.openai.com/account/billing/overview)でクレジットを追加 |
| Failed to fetch | Flask サーバーが起動していない | `python app.py` を実行 |
