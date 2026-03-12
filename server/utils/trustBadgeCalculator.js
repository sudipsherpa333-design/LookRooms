export const calculateTrustBadge = (avgRating, reviewCount, isVerified) => {
  if (avgRating >= 4.8 && reviewCount >= 10) return 'superhost'; // or 'top-tenant'
  if (avgRating >= 4.5 && reviewCount >= 5) return 'trusted';
  if (isVerified) return 'verified';
  return 'none';
};
