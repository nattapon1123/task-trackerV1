import assert from "node:assert/strict";
import test from "node:test";

import { isAuthorizedCronRequest } from "@/app/lib/cron-auth";
import {
  getDueReminders,
  sendReminderAndLog,
} from "@/app/lib/reminders";

test("cron authorization compares the complete bearer token", () => {
  assert.equal(isAuthorizedCronRequest("Bearer example-secret", "example-secret"), true);
  assert.equal(isAuthorizedCronRequest("Bearer example-secreu", "example-secret"), false);
  assert.equal(isAuthorizedCronRequest("Bearer other", "example-secret"), false);
  assert.equal(isAuthorizedCronRequest(null, "example-secret"), false);
});

test("a failed email send does not create a reminder log", async () => {
  let logCount = 0;

  await assert.rejects(
    sendReminderAndLog(
      async () => {
        throw new Error("SMTP delivery failed");
      },
      async () => {
        logCount++;
      },
    ),
    /SMTP delivery failed/,
  );

  assert.equal(logCount, 0);
});

test("a reminder round with a saved log is not sent again", async () => {
  const dueDate = new Date("2026-11-20T00:00:00.000Z");
  const now = new Date("2026-11-16T17:00:00.000Z");
  const reminderLogs: number[] = [];
  let sendCount = 0;

  async function sendDueRounds() {
    const dueRounds = getDueReminders(dueDate, now, reminderLogs);

    for (const daysBefore of dueRounds) {
      await sendReminderAndLog(
        async () => {
          sendCount++;
        },
        async () => {
          reminderLogs.push(daysBefore);
        },
      );
    }
  }

  await sendDueRounds();
  await sendDueRounds();

  assert.deepEqual(reminderLogs, [3]);
  assert.equal(sendCount, 1);
});
