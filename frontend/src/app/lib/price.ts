export const formatUSDPrice = (price?: string): string => {
  if (!price?.trim()) return "";
  const amount = Number(price.replace(/USD\s*/i, "").replace(/,/g, "").trim());
  if (!Number.isFinite(amount)) return price;

  return `USD ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};
