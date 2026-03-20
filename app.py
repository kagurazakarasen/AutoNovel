import os
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from openai import OpenAI, APIError
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

QUESTIONS = [
    {
        "id": "genre",
        "question": "物語のジャンルを選んでください",
        "options": ["ファンタジー", "SF・サイエンスフィクション", "恋愛", "ミステリー", "ホラー", "歴史小説"]
    },
    {
        "id": "setting",
        "question": "舞台設定はどこですか？",
        "options": ["現代日本", "中世ヨーロッパ", "宇宙・宇宙船内", "架空の異世界", "近未来都市"]
    },
    {
        "id": "protagonist",
        "question": "主人公はどんな人物ですか？",
        "options": ["普通の学生", "特殊能力を持つ若者", "孤独な探偵", "魔法使い", "天才科学者"]
    },
    {
        "id": "theme",
        "question": "物語のテーマは何ですか？",
        "options": ["友情と絆", "禁じられた愛", "復讐と正義", "成長と自己発見", "生存と希望"]
    },
    {
        "id": "tone",
        "question": "物語のトーン・雰囲気はどんな感じですか？",
        "options": ["明るく爽快", "暗く重厚", "シリアスで緊張感がある", "コミカルで軽快", "感動的で切ない"]
    },
    {
        "id": "length",
        "question": "小説の長さを選んでください",
        "options": ["短編（約800字）", "中編（約2000字）", "長編（約4000字）"]
    }
]

LENGTH_MAP = {
    "短編（約800字）": ("約800文字", 900),
    "中編（約2000字）": ("約2000文字", 2200),
    "長編（約4000字）": ("約4000文字", 4200),
}


@app.route("/")
def index():
    return render_template("index.html", questions=QUESTIONS)


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "リクエストが不正です。"}), 400

    answers = data.get("answers", {})

    length_label, max_tokens = LENGTH_MAP.get(
        answers.get("length", "短編（約800字）"), ("約800文字", 900)
    )

    prompt = f"""あなたは才能豊かな日本人小説家です。以下の条件に従い、読者を引き込む魅力的な小説を書いてください。

【条件】
- ジャンル: {answers.get("genre", "")}
- 舞台設定: {answers.get("setting", "")}
- 主人公: {answers.get("protagonist", "")}
- テーマ: {answers.get("theme", "")}
- トーン・雰囲気: {answers.get("tone", "")}
- 文字数の目安: {length_label}

【執筆の注意事項】
- 最初にタイトルを「# タイトル名」の形式で記載してください
- 美しい日本語で書いてください
- 豊かな情景描写と心理描写を盛り込んでください
- 起承転結のある完結した物語にしてください
- 読者が続きを読みたくなるような魅力的な書き出しにしてください

それでは、小説を書いてください："""

    def generate_stream():
        try:
            ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")
            ollama_model = os.environ.get("OLLAMA_MODEL", "llama3.2")
            llm_api_key = os.environ.get("LLM_API_KEY", "ollama")
            client = OpenAI(base_url=ollama_base_url, api_key=llm_api_key)
            stream = client.chat.completions.create(
                model=ollama_model,
                messages=[
                    {
                        "role": "system",
                        "content": "あなたは才能豊かな日本人小説家です。与えられた条件に基づき、情感豊かで読み応えのある小説を書きます。"
                    },
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                max_tokens=max_tokens,
                temperature=0.9,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
            yield f"\n\n---\n（{ollama_model}）で生成"
        except APIError as e:
            yield f"\n\n【エラー】APIエラーが発生しました: {e}"
        except Exception as e:
            yield f"\n\n【エラー】予期せぬエラーが発生しました: {e}"

    return Response(
        stream_with_context(generate_stream()),
        mimetype="text/plain; charset=utf-8"
    )


if __name__ == "__main__":
    app.run(debug=True)
