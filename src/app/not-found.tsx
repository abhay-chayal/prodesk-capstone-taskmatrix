import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-rose-100 p-4 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-rose-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        Oops! We couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
