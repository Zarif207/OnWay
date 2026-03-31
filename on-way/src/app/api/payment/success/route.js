import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.formData();
    const tran_id = body.get("tran_id") || "";

    // Update payment status in backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    try {
      await fetch(`${apiUrl}/payment/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tran_id, status: "success" }),
      });
    } catch (_) {}

    return NextResponse.redirect(
      new URL(`/payment/success?transaction=${tran_id}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/payment/success", req.url));
  }
}
