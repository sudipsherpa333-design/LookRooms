export const aggregateRatings = (ratings) => {
  const subRatings = Object.values(ratings);
  const averageRating = subRatings.reduce((a, b) => a + b, 0) / subRatings.length;
  
  // Logic to compute breakdown percentages
  const breakdown = {};
  Object.keys(ratings).forEach(key => {
    breakdown[key] = ratings[key];
  });
  
  return { averageRating, breakdown };
};
