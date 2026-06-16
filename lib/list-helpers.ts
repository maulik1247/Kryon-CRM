const DEFAULT_AUDIT_USER_IDS = ["user-admin", "user-2", "user-3"] as const;

export function sortByCreatedAtDesc<T extends { createdAt: string }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function withAuditFields<T extends object>(
  items: T[],
  userIds: readonly string[] = DEFAULT_AUDIT_USER_IDS
): (T & { createdAt: string; createdByUserId: string })[] {
  const base = Date.UTC(2026, 5, 15, 10, 0, 0);

  return items.map((item, index) => ({
    ...item,
    createdAt: new Date(base - index * 3_600_000).toISOString(),
    createdByUserId: userIds[index % userIds.length] ?? userIds[0]!,
  }));
}
