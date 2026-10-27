'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Something went wrong!</h2>
          <p className="text-xs text-slate-500">{error?.message || 'An error occurred'}</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm transition-all"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
