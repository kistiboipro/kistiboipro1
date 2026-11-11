import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 32 * 1024;
const MAX_PROMPT_LENGTH = 4000;
const MAX_BUSINESS_DATA_LENGTH = 20_000;

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Authentication service is not configured." }, { status: 500 });
    }

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const { data: staff, error: staffError } = await userClient
      .from("user_accounts")
      .select("role_key,is_active")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();
    if (staffError || !staff?.is_active || !["admin", "manager"].includes(staff.role_key)) {
      return NextResponse.json({ error: "You are not authorised to use this service." }, { status: 403 });
    }

    const { data: quotaAllowed, error: quotaError } = await userClient.rpc("consume_gemini_quota", {
      p_user_id: authData.user.id,
    });
    if (quotaError) {
      console.error("Gemini quota check failed:", quotaError.message);
      return NextResponse.json({ error: "AI service is temporarily unavailable." }, { status: 503 });
    }
    if (!quotaAllowed) {
      return NextResponse.json({ error: "Hourly AI request limit reached. Try again later." }, { status: 429 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }

    const body = JSON.parse(rawBody);
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const businessData = body.businessData ?? {};
    const businessDataJson = JSON.stringify(businessData);
    if (prompt.length > MAX_PROMPT_LENGTH || businessDataJson.length > MAX_BUSINESS_DATA_LENGTH) {
      return NextResponse.json({ error: "Prompt or business data exceeds the allowed size." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service is not configured." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are KistiBoi AI, an expert financial and business advisor for "Bismillah Electronics and Furniture", an electronics and furniture store in Bangladesh that sells items on installment (কিস্তি) and cash. Analyze the financial data provided and give concise, practical, motivating business advice in Bengali. Use bullet points and professional financial terminology commonly used in Bangladesh.`;
    const userPrompt = `${prompt || "দয়া করে আমাদের বর্তমান ব্যবসার আর্থিক অবস্থা বিশ্লেষণ করে কিছু পরামর্শ দিন।"}\n\nBusiness Financial Data:\n${JSON.stringify(businessData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.7 },
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI advice." }, { status: 500 });
  }
}
