import Link from "next/link";

export default function NotFound() {
  return (
    <main className="theme-marketing flex min-h-screen flex-col items-center justify-center bg-base px-5 text-center text-ink-1">
      <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-gold-400">404</p>
      <h1 className="mt-3 text-[36px] font-bold tracking-tight sm:text-[48px]">Page not found</h1>
      <p className="mt-3 max-w-md text-[16px] text-ink-3">
        That page doesn&apos;t exist. Head back to see our cars and rates.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-gold-500 px-6 py-3 text-[15px] font-semibold text-black hover:bg-gold-400"
      >
        Back to KAR GO RENTALS
      </Link>
    </main>
  );
}
