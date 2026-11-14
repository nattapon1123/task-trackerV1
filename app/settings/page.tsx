import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import AppHeader from "@/app/components/app-header";
import prisma from "@/app/lib/prisma";
import SettingsForm from "./settings-form";

// อ่านค่าปัจจุบันของผู้ใช้ แล้วแสดงฟอร์มตั้งค่า
export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { reminderEnabled: true },
  });

  return (
    <>
      <AppHeader
        userName={session.user.name ?? session.user.email ?? ""}
        current="settings"
      />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">ตั้งค่า</h1>
        <p className="mb-6 mt-1 text-ink-soft">จัดการการตั้งค่าของบัญชีคุณ</p>

        <SettingsForm reminderEnabled={user?.reminderEnabled ?? true} />
      </main>
    </>
  );
}