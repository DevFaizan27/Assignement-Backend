import { getDistance } from "./googleDistance.js";

export const calculatePrice = async ({
  source,
  destination,
  items,
  packagingType,
  fragile,
  floorPickup,
  floorDelivery,
  lift
}) => {
  const distance = await getDistance(source, destination);
  const isWithinCity = distance <= 50;

  const baseRate = isWithinCity ? 10 : 15; // ₹10/km within city, ₹15/km between cities
  const distanceCharge = distance * baseRate;

  let itemCharge = 0;
  for (const item of items) {
    const { height, length, width, basePricePerCFT } = item;
    const cft = height * length * width;
    const packagingMultiplier = packagingType === "Triple Layer" ? 1.5 : packagingType === "Double Layer" ? 1.2 : 1;
    const fragileMultiplier = fragile ? 1.3 : 1;

    itemCharge += cft * basePricePerCFT * packagingMultiplier * fragileMultiplier;
  }

  const floorCharge = (!lift ? 10 : 5) * (floorPickup + floorDelivery);

  return distanceCharge + itemCharge + floorCharge;
};
