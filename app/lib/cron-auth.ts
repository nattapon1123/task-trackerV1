import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCronRequest(
  header: string | null,
  secret: string,
): boolean {
  if (!header) return false;

  const received = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret}`);

  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}
