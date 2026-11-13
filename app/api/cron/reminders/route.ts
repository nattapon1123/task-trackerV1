import { NextResponse } from "next/server";

import { sendMail } from "@/app/lib/mailer";
import { buildReminderEmail } from "@/app/lib/reminder-email";
import prisma from "@/app/lib/prisma";
import { getDueReminders } from "@/app/lib/reminders";
import { getDueState } from "@/app/tasks/due";

export const dynamic = "force-dynamic";

// GET /api/cron/reminders ตรวจรหัสลับแล้วส่งอีเมลแจ้งเตือนทุกรอบที่ถึงเวลา
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // งานที่ยังไม่เสร็จ และเจ้าของเปิดการแจ้งเตือนอยู่
  const tasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      user: { reminderEnabled: true },
    },
    include: {
      user: { select: { name: true, email: true } },
      subject: { select: { name: true } },
      reminderLogs: { select: { daysBefore: true } },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const task of tasks) {
    // งานที่เลยกำหนดแล้วไม่แจ้งเตือน
    if (getDueState(task.dueDate, task.status, now.getTime()) === "overdue") {
      continue;
    }

    const sentDays = task.reminderLogs.map((log) => log.daysBefore);
    const dueDays = getDueReminders(task.dueDate, now, sentDays);

    for (const daysBefore of dueDays) {
      try {
        const email = buildReminderEmail({
          name: task.user.name ?? "เพื่อน",
          taskTitle: task.title,
          subjectName: task.subject.name,
          dueDate: task.dueDate,
          daysBefore,
        });

        await sendMail({ to: task.user.email, ...email });

        // บันทึกหลังส่งสำเร็จเท่านั้น ถ้าส่งไม่ได้จะลองใหม่รอบถัดไป
        await prisma.reminderLog.create({
          data: { taskId: task.id, daysBefore },
        });

        sent++;
      } catch (error) {
        errors.push(`งาน ${task.id} รอบ ${daysBefore}: ${String(error)}`);
      }
    }
  }

  return NextResponse.json({ sent, errors });
}