"use client";

import { useState, useTransition } from "react";

import { updateReminderSetting } from "./actions";

type SettingsFormProps = {
  reminderEnabled: boolean;
};

// แสดงสวิตช์เปิด/ปิดการแจ้งเตือนทางอีเมล
export default function SettingsForm({ reminderEnabled }: SettingsFormProps) {
  const [enabled, setEnabled] = useState(reminderEnabled);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;

    // เปลี่ยนค่าบนหน้าทันที แล้วบันทึกลงฐานข้อมูล
    setEnabled(next);
    startTransition(async () => {
      await updateReminderSetting(next);
    });
  }

  return (
    <section className="rounded-lg border border-line bg-sheet p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-semibold">แจ้งเตือนงานทางอีเมล</h2>
          <p className="mt-1 text-sm text-ink-soft">
            ระบบจะส่งอีเมลเมื่อถึงเที่ยงคืนวันที่ 3 วันก่อนกำหนดส่ง
            และอีกครั้งในวันที่ครบกำหนด
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={pending}
          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
            enabled ? "bg-done" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-sheet transition ${
              enabled ? "left-5.5" : "left-0.5"
            }`}
          />
          <span className="sr-only">แจ้งเตือนงานทางอีเมล</span>
        </button>
      </div>
    </section>
  );
}