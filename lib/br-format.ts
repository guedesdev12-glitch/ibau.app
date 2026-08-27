export function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

/** Valida CPF pelos dígitos verificadores (não só o formato). */
export function isValidCPF(raw: string) {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (sliceLength: number) => {
    let sum = 0;
    for (let i = 0; i < sliceLength; i++) {
      sum += Number(cpf[i]) * (sliceLength + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function formatCPF(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatPhone(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatCEP(raw: string) {
  return onlyDigits(raw).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}
