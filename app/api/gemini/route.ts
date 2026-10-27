import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt, businessData } = await req.json();
    
    const systemInstruction = `You are KistiBoi AI, an expert financial and business advisor for "Bismillah Electronics and Furniture", an electronics and furniture store in Bangladesh that sells items on installment (কিস্তি) and cash. 
    Analyze the financial data provided and give concise, practical, and motivating business advice in Bengali language. Use bullet points and professional financial terminology commonly used in Bangladesh (যেমন: কালেকশন, বাকি, ডাউন পেমেন্ট, প্রফিট, ডিলার দেনা).`;

    const userPrompt = `${prompt || "দয়া করে আমাদের বর্তমান ব্যবসার আর্থিক অবস্থা বিশ্লেষণ করে কিছু পরামর্শ দিন।"}\n\nBusiness Financial Data:\n${JSON.stringify(businessData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI advice" }, { status: 500 });
  }
}
