'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg text-center space-y-4 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold">Something went wrong!</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error?.message || 'An error occurred'}</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
