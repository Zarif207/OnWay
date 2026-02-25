import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();

    // Here you would connect to your database (e.g. MongoDB, PostgreSQL)
    // and save the `data` object.
    
    // For demonstration, we simply log the complete received data
    console.log("Earn Registration Received:", data);

    return NextResponse.json(
      { message: "Registration submitted successfully", receivedData: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
