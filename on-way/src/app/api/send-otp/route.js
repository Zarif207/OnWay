import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        // ১. ডাটা রিসিভ করা
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, message: "Email and OTP are required" },
                { status: 400 }
            );
        }

        // ২. ট্রান্সপোর্টার সেটআপ
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            // secure: true, // Port 465 এর জন্য চাইলে ব্যবহার করতে পারেন
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // ৩. ইমেইল টেমপ্লেট (আপনার ডিজাইনটিকেই আরও একটু অপ্টিমাইজ করা হয়েছে)
        const mailOptions = {
            from: `"OnWay Team" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Verify Your OnWay Account",
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; padding: 40px; color: #333; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #ef269f; font-style: italic; font-size: 42px; margin-bottom: 5px; font-weight: 900;">OnWay<span style="color: #111;">.</span></h1>
                    <div style="height: 4px; width: 40px; background: #ef269f; margin: 0 auto 20px auto; border-radius: 10px;"></div>
                    
                    <h2 style="font-weight: 800; color: #111; font-size: 24px;">Account Verification</h2>
                    <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px;">
                        OnWay-তে আপনাকে স্বাগতম! আপনার রেজিস্ট্রেশন সম্পন্ন করতে নিচের ভেরিফিকেশন কোডটি ব্যবহার করুন:
                    </p>
                    
                    <div style="background-color: #fff0f9; border-radius: 20px; padding: 30px; margin: 20px 0; border: 2px dashed #ef269f;">
                        <span style="font-size: 48px; font-weight: 900; letter-spacing: 15px; color: #ef269f; font-family: monospace;">${otp}</span>
                    </div>

                    <p style="font-size: 13px; color: #888; margin-top: 30px; line-height: 1.5;">
                        নিরাপত্তার খাতিরে এই কোডটি কাউকে বলবেন না। এটি পরবর্তী <b>১০ মিনিটের</b> জন্য কার্যকর থাকবে।
                    </p>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
                        <p style="font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">OnWay Inc • Bangladesh</p>
                    </div>
                </div>
            `,
        };

        // ৪. ইমেইল পাঠানো
        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { success: true, message: "OTP sent successfully to " + email },
            { status: 200 }
        );

    } catch (error) {
        console.error("Nodemailer Error Details:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to send email",
                error: process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error"
            },
            { status: 500 }
        );
    }
}