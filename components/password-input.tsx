"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  name,
  placeholder,
  minLength,
  required,
}: {
  name: string;
  placeholder: string;
  minLength?: number;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        name={name}
        type={visible ? "text" : "password"}
        minLength={minLength}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#14532d]"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
