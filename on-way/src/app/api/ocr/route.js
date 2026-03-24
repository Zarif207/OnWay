import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { image } = await req.json(); // image should be base64
        const apiKey = process.env.GOOGLE_VISION_API_KEY;

        if (!apiKey || apiKey === "your_google_vision_api_key_here") {
            return NextResponse.json({ error: "Google Vision API Key not configured" }, { status: 500 });
        }

        const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

        const requestBody = {
            requests: [
                {
                    image: { content: image.split(",")[1] }, // strip data:image/... base64 prefix
                    features: [{ type: "TEXT_DETECTION" }]
                }
            ]
        };

        const response = await fetch(visionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Vision API error");
        }

        const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
        const textResults = data.responses[0]?.textAnnotations;

        return NextResponse.json({
            fullText: fullTextAnnotation?.text || "",
            blocks: fullTextAnnotation?.pages[0]?.blocks || [],
            raw: textResults || []
        });

    } catch (error) {
        console.error("[Vision API Route] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
