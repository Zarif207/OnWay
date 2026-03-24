"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md">
            A critical error occurred. Please try refreshing the page or clearing your browser cache.
          </p>
          <button
            onClick={() => typeof reset === "function" && reset()}
            className="px-6 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
