import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  const topics = (user?.topicPreferences as string[]) ?? [];

  return (
    <div>
      <h2 className="text-3xl font-bold text-on-primary mb-1 tracking-tight">
        Profile
      </h2>
      <p className="text-on-surface-dim text-sm mb-6">
        Your account and preferences
      </p>

      {topics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-on-surface mb-3">Your topics</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 rounded-full bg-primary-container text-primary text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-surface-1 p-6 overflow-hidden">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none",
            },
          }}
        />
      </div>
    </div>
  );
}
