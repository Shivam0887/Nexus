import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text mb-4">404</h1>
        <h2 className="text-xl md:text-3xl font-semibold text mb-6">
          Page Not Found
        </h2>
        <p className="text-base md:text-xl text mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/search"
          className="px-6 py-3 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors duration-300"
        >
          Go Back Search
        </Link>
      </div>
    </div>
  );
}
