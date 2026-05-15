export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '₹0';
  const rounded = Math.round(value * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;
  return (
    '₹' +
    rounded.toLocaleString('en-IN', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

export function formatShares(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const hasDecimals = n % 1 !== 0;
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 4,
  });
}
