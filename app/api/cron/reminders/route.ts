import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/app/lib/cron-auth";
import { sendMail } from "@/app/lib/mailer";
import { buildReminderEmail } from "@/app/lib/reminder-email";
import prisma from "@/app/lib/prisma";
import { getDueReminders, sendReminderAndLog } from "@/app/lib/reminders";
import { getDueState } from "@/app/tasks/due";

export const dynamic = "force-dynamic";

// GET /api/cron/reminders ตรวจรหัสลับแล้วส่งอีเมลแจ้งเตือนทุกรอบที่ถึงเวลา
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (
    !secret ||
    !isAuthorizedCronRequest(request.headers.get("authorization"), secret)
  ) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

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
  const failed: { taskId: number; daysBefore: number }[] = [];

  for (const task of tasks) {
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

        await sendReminderAndLog(
          () => sendMail({ to: task.user.email, ...email }),
          () =>
            prisma.reminderLog.create({
              data: { taskId: task.id, daysBefore },
            }),
        );

        sent++;
      } catch (error) {
        console.error(
          `[cron] ส่งงาน ${task.id} รอบ ${daysBefore} ไม่สำเร็จ`,
          error,
        );
        failed.push({ taskId: task.id, daysBefore });
      }
    }
  }

  return NextResponse.json({ sent, failed });
}