export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center section-bg">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}