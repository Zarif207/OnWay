"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function DriverAnimation() {
  return (
    <div className="w-full flex justify-center items-center">
      <DotLottieReact
        src="https://lottie.host/da65d6ea-c9fd-452d-a439-b1801c6c30cc/mDIed2uDWH.lottie"
        loop
        autoplay
        style={{ width: "450px", height: "450px" }}
      />
    </div>
  );
}