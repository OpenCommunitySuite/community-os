export const csvText = (value: string) => {
  const safe = /^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/u.test(value) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
};

export const csvAmount = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

export function downloadCsv(filename: string, lines: string[]) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
