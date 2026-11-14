"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";

// บันทึกค่าเปิด/ปิดการแจ้งเตือนของผู้ใช้ที่ล็อกอินอยู่
export async function updateReminderSetting(enabled: boolean) {
  const session = await auth();

  // ต้องล็อกอินก่อนจึงแก้การตั้งค่าได้
  if (!session?.user?.id) {
    redirect("/login");
  }

  // อัปเดตเฉพาะแถวของผู้ใช้คนนี้เท่านั้น
  await prisma.user.update({
    where: { id: session.user.id },
    data: { reminderEnabled: enabled },
  });

  revalidatePath("/settings");
}