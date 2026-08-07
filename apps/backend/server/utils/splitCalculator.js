export function calculateEqualSplit(amount, numberOfMembers) {
  if (numberOfMembers <= 0) {
    throw new Error("A group must have at least one member.");
  }

  return Number((amount / numberOfMembers).toFixed(2));
}

export function validateCustomSplits(totalAmount, splits) {
  const total = splits.reduce(
    (sum, split) => sum + Number(split.amount),
    0
  );

  return Math.abs(total - Number(totalAmount)) < 0.01;
}