// แสดงรายละเอียดงานในกล่องโต้ตอบที่เปิดและปิดได้
"use client";

import { useId, useRef } from "react";

export default function DescriptionDialog({
  description,
}: {
  description: string;
}) {
  // เก็บ dialog ไว้เปิดและปิดรายละเอียดงาน
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="cursor-pointer text-focus hover:underline"
      >
        ดูรายละเอียด
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-h-[80vh] w-[calc(100%-2rem)] max-w-xl rounded-lg bg-sheet p-0 text-ink shadow-xl backdrop:bg-ink/50"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className="font-semibold">
            รายละเอียดงาน
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink"
          >
            ปิด
          </button>
        </div>
        <p className="max-h-[calc(80vh-5rem)] overflow-y-auto whitespace-pre-wrap break-words px-5 py-4 text-sm text-ink-soft">
          {description}
        </p>
      </dialog>
    </>
  );
}
