"use client";

import { useTransition } from "react";

export function PermissionCheckbox({
  toggle,
  defaultChecked,
  disabled,
}: {
  toggle: (enabled: boolean) => Promise<void>;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={defaultChecked}
      disabled={disabled || isPending}
      onChange={(e) => {
        const checked = e.currentTarget.checked;
        startTransition(() => {
          toggle(checked);
        });
      }}
      className="h-5 w-5 accent-[#173B2C] disabled:opacity-40"
    />
  );
}
