export default function Newsletter() {
  return (
    <section className="section-bg py-12 border-t border-gray-200/50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-extrabold text-gray-800">📬 Never Miss an Opportunity</h2>
        <p className="text-sm text-gray-500 mt-1">
          Get new jobs, deadlines, and career opportunities delivered directly to your inbox.
        </p>
        <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition">
            Subscribe Free
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">No spam, unsubscribe anytime.</p>
      </div>
    </section>
  );
}