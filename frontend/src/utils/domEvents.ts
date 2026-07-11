/**
 * Membaca nilai dari elemen form pada event DOM Vue secara aman.
 * Digunakan oleh template untuk menghindari akses langsung ke EventTarget.
 */
export function eventValue(
  event: Event | { target?: { value?: unknown } } | null,
): string {
  const target = event?.target as
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined;
  return target?.value ?? "";
}
