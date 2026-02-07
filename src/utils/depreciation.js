const calculateStraightLineDepreciation = (
  purchasePrice,
  purchaseDate,
  depreciationRate
) => {
  const currentDate = new Date();
  const yearsOwned = (currentDate.getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  const annualDepreciation = purchasePrice * (depreciationRate / 100);
  const totalDepreciation = Math.min(annualDepreciation * yearsOwned, purchasePrice);
  const currentValue = Math.max(purchasePrice - totalDepreciation, 0);

  return {
    currentValue: Math.round(currentValue * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
    yearsOwned: Math.round(yearsOwned * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
  };
};

const calculateDecliningBalanceDepreciation = (
  purchasePrice,
  purchaseDate,
  depreciationRate
) => {
  const currentDate = new Date();
  const yearsOwned = (currentDate.getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  let currentValue = purchasePrice;
  const annualRate = depreciationRate / 100;

  for (let i = 0; i < Math.floor(yearsOwned); i++) {
    currentValue = currentValue * (1 - annualRate);
  }

  const partialYear = yearsOwned - Math.floor(yearsOwned);
  currentValue = currentValue * (1 - annualRate * partialYear);

  const totalDepreciation = purchasePrice - currentValue;
  const annualDepreciation = purchasePrice * annualRate;

  return {
    currentValue: Math.round(currentValue * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
    yearsOwned: Math.round(yearsOwned * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
  };
};

const calculateSumOfYearsDepreciation = (
  purchasePrice,
  purchaseDate,
  usefulLife = 5
) => {
  const currentDate = new Date();
  const yearsOwned = Math.min(
    (currentDate.getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    usefulLife
  );

  const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
  let totalDepreciation = 0;

  for (let year = 1; year <= Math.floor(yearsOwned); year++) {
    const remainingLife = usefulLife - year + 1;
    totalDepreciation += (purchasePrice * remainingLife) / sumOfYears;
  }

  const partialYear = yearsOwned - Math.floor(yearsOwned);
  if (partialYear > 0) {
    const remainingLife = usefulLife - Math.floor(yearsOwned);
    totalDepreciation += (purchasePrice * remainingLife * partialYear) / sumOfYears;
  }

  const currentValue = Math.max(purchasePrice - totalDepreciation, 0);
  const annualDepreciation = totalDepreciation / yearsOwned;

  return {
    currentValue: Math.round(currentValue * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
    yearsOwned: Math.round(yearsOwned * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
  };
};

const updateAssetValue = (
  purchasePrice,
  purchaseDate,
  depreciationRate,
  method = 'straight-line'
) => {
  let result;

  switch (method) {
    case 'declining-balance':
      result = calculateDecliningBalanceDepreciation(purchasePrice, purchaseDate, depreciationRate);
      break;
    case 'sum-of-years':
      result = calculateSumOfYearsDepreciation(purchasePrice, purchaseDate);
      break;
    default:
      result = calculateStraightLineDepreciation(purchasePrice, purchaseDate, depreciationRate);
  }

  return result.currentValue;
};

module.exports = {
  calculateStraightLineDepreciation,
  calculateDecliningBalanceDepreciation,
  calculateSumOfYearsDepreciation,
  updateAssetValue,
};
