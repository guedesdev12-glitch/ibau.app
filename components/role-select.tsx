"use client";

export function RoleSelect({
  action,
  roleId,
  roles,
}: {
  action: (formData: FormData) => void;
  roleId: string;
  roles: { id: string; name: string }[];
}) {
  return (
    <form action={action}>
      <select
        name="role_id"
        defaultValue={roleId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600"
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </form>
  );
}
