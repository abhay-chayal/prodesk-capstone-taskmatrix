import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-slate-800">Loading TaskMatrix...</h2>
      <p className="text-slate-500 mt-2 text-sm">Getting things ready for you</p>
    </div>
  );
}
