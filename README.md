# AutoNovel

<div>
<video controls src="https://github.com/user-attachments/assets/83e476de-a5dd-4293-8280-395b2754cc05" muted="false"></video>
</div>


AIが自動で小説を生成するWebアプリケーションです。ジャンル・舞台・主人公・テーマなどをステップ形式で選択するだけで、ローカルLLM（Ollama）が完結した日本語小説を執筆します。

## 機能

- 6つの質問（ジャンル／舞台設定／主人公／テーマ／トーン／文字数）を順番に選択
- 選択内容に基づきローカルLLM（Ollama）がリアルタイムストリーミングで小説を生成
- 生成した小説をクリップボードにコピー、またはテキストファイルとして保存

## 必要環境

- Python 3.9 以上

## 推奨環境

- [Ollama](https://ollama.com/) がローカルにインストール済みであること
- ※.envファイルを適宜設定することでOpenAIに変更することも可能（ただし要APIキー）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/kagurazakarasen/AutoNovel.git
cd AutoNovel
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. Ollamaのセットアップ

Ollamaをインストールして、使用するモデルを取得します。

```bash
ollama pull llama3.2
```

### 4. 設定（任意）

デフォルト設定のままで動作しますが、モデルやエンドポイントを変更したい場合は `.env` ファイルを作成して設定します。

**Ollama（デフォルト）**

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
LLM_API_KEY=ollama
```

**OpenAI に切り替える場合**

```env
OLLAMA_BASE_URL=https://api.openai.com/v1
OLLAMA_MODEL=gpt-4o
LLM_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. サーバーの起動

```bash
python app.py
```

ブラウザで [http://localhost:5000](http://localhost:5000) を開きます。

## 使い方

1. 「はじめる → 」ボタンをクリック
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

- 本アプリは開発用サーバー（Flask debug mode）で動作します。本番環境での公開には別途 WSGI サーバー（Gunicorn 等）を使用してください。
- 日本語小説の生成には、日本語対応のモデル（例: `llama3.2`, `qwen2.5`, `gemma3` など）の使用を推奨します。

## トラブルシューティング

| エラー | 原因 | 対処 |
|--------|------|------|
| APIエラーが発生しました | Ollama が起動していない | `ollama serve` を実行して Ollama を起動する |
| モデルが見つからない | 指定モデルが未取得 | `ollama pull <モデル名>` を実行 |
| Failed to fetch | Flask サーバーが起動していない | `python app.py` を実行 |
