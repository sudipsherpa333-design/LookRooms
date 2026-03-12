export const generateShareUrl = (listingId, platform, userId) => {
  return `https://lookrooms.com/room/${listingId}?ref=share&via=${platform}&uid=${userId}`;
};
