import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, message, turnstileToken } = body;

    // バリデーション
    if (!name || !email || !message || !turnstileToken) {
      return NextResponse.json(
        { message: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    // Cloudflare Turnstile検証
    const turnstileVerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const turnstileResponse = await fetch(turnstileVerifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: process.env.CF_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const turnstileData: TurnstileResponse = await turnstileResponse.json();

    if (!turnstileData.success) {
      console.error("Turnstile verification failed:", turnstileData["error-codes"]);
      return NextResponse.json(
        { message: "ボット検証に失敗しました。もう一度お試しください。" },
        { status: 400 }
      );
    }

    // Discord Webhook送信
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("WEBHOOK_URL is not configured");
      return NextResponse.json(
        { message: "サーバーエラーが発生しました" },
        { status: 500 }
      );
    }

    // Discord Embed形式でペイロードを作成
    const discordPayload = {
      embeds: [
        {
          title: "📧 新しいお問い合わせ",
          color: 0x0066cc, // 青色
          fields: [
            {
              name: "お名前",
              value: name,
              inline: true,
            },
            {
              name: "メールアドレス",
              value: email,
              inline: true,
            },
            {
              name: "お問い合わせ内容",
              value: message,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "株式会社ファンエクス",
          },
        },
      ],
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!webhookResponse.ok) {
      console.error("Discord webhook failed:", await webhookResponse.text());
      return NextResponse.json(
        { message: "送信に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "送信が完了しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
