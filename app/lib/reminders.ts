export function getReminderTime(dueDate: Date, daysBefore: ReminderDay): Date {
  // dueDate คือเที่ยงคืน UTC ของวันครบกำหนด ซึ่งตรงกับ 07:00 น. ไทยของวันนั้น
  // ลบ 7 ชั่วโมงเพื่อให้ได้เที่ยงคืนไทยของวันเดียวกัน
  const dueBangkokMidnight = dueDate.getTime() - BANGKOK_OFFSET;

  // ถอยหลังตามจำนวนวันของรอบ
  return new Date(dueBangkokMidnight - daysBefore * DAY);
}
// กำหนดรอบการแจ้งเตือนก่อนวันครบกำหนด (หน่วยเป็นจำนวนวัน)
// 3 = เหลือ 3 วัน (ส่งเที่ยงคืนวันที่ 7 ถ้างานครบวันที่ 10)
// 0 = วันครบกำหนด (ส่งเที่ยงคืนวันที่ 10)
// ถ้าอยากเพิ่มรอบ แก้เฉพาะค่าในอาร์เรย์นี้
export const REMINDER_DAYS = [3, 0] as const;

export type ReminderDay = (typeof REMINDER_DAYS)[number];

import { DAY, BANGKOK_OFFSET } from "@/app/tasks/due";


// คืนรายการรอบที่ถึงเวลาส่งแล้ว แต่ยังไม่เคยส่ง
// dueDate คือวันครบกำหนดของงาน
// now คือเวลาปัจจุบัน (ส่งเข้ามาเพื่อให้ทดสอบได้)
// sentDays คือรายการรอบที่เคยส่งไปแล้วของงานนี้ เช่น [3]
export function getDueReminders(
  dueDate: Date,
  now: Date,
  sentDays: readonly number[],
): ReminderDay[] {
  return REMINDER_DAYS.filter((daysBefore) => {
    // ยังไม่ถึงเวลาของรอบนี้ ข้าม
    if (getReminderTime(dueDate, daysBefore).getTime() > now.getTime()) {
      return false;
    }

    // เคยส่งรอบนี้ไปแล้ว ข้าม
    if (sentDays.includes(daysBefore)) {
      return false;
    }

    return true;
  });
}