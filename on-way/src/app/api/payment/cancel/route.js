import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.formData();
    const tran_id = body.get("tran_id") || "";

    return NextResponse.redirect(
      new URL(`/payment/cancel?transaction=${tran_id}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/payment/cancel", req.url));
  }
}
