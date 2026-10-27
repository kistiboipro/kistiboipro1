import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-4xl font-extrabold mb-2">404</h1>
      <p className="text-base text-slate-600 dark:text-slate-400 mb-6">Page not found</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
