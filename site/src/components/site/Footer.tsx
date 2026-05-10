export function Footer() {
  return (
    <footer className="border-cream-300/60 bg-cream-50 mt-24 border-t">
      <div className="text-ink-500 mx-auto max-w-7xl px-6 py-10 font-mono text-xs tracking-[0.14em] uppercase">
        <p>AcrylixCo · Sydney, Australia</p>
        <p className="mt-2">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
