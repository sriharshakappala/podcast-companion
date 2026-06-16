import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { TopicSelector } from "./topic-selector";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (user && (user.topicPreferences as string[])?.length > 0) {
    redirect("/home");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-on-primary mb-2 text-center tracking-tight">
          What do you love listening to?
        </h1>
        <p className="text-on-surface-dim text-center mb-8 text-sm">
          Pick 3-5 topics. This helps us find episodes you won&apos;t bail on.
        </p>
        <TopicSelector />
      </div>
    </main>
  );
}
