export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const datePart = value.split("T")[0] ?? "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toISOString().slice(0, 10);
}
