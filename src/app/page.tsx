import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/home");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
          Podcast Companion
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Know in 15 seconds if an episode is worth your 45 minutes.
          AI-powered previews that tell you exactly what&apos;s inside.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-500 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
