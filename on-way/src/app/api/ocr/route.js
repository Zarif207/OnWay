import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import { parseDocument } from "@/utils/ocrParser";

export async function POST(req) {
    let worker = null;
    try {
        const { image } = await req.json(); // image should be base64 (with or without prefix)

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Clean base64
        const base64Data = image.includes("base64,") ? image.split(",")[1] : image;
        const buffer = Buffer.from(base64Data, "base64");

        console.log("Initializing Tesseract Worker (eng+ben)...");
        worker = await createWorker("eng+ben");

        await worker.setParameters({
            tessedit_pageseg_mode: 6, // Assume a single uniform block of text
        });

        console.log("Running OCR...");

        // Timeout protection (15 seconds limit)
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("OCR Timeout")), 15000)
        );

        const { data: { text } } = await Promise.race([
            worker.recognize(buffer),
            timeout
        ]);

        await worker.terminate();
        worker = null;

        console.log("OCR Result Length:", text.length);

        // Extract semi-structured data using our parser
        const extracted = parseDocument(text);

        return NextResponse.json({
            fullText: text || "",
            name: extracted.fullName || "",
            documentType: (extracted.documentType || "nid").toLowerCase(),
            success: true
        });

    } catch (error) {
        console.error("[Tesseract OCR API] Error:", error);
        if (worker) await worker.terminate();
        return NextResponse.json({ error: "Failed to process image: " + error.message }, { status: 500 });
    }
}
