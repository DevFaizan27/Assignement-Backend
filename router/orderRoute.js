import express from "express";
import axios from "axios";

const router = express.Router();

const PRICE_PER_CFT = 15; // Base price per cubic feet in INR
const PACKAGING_MULTIPLIERS = {
  single: 0.08, // 8% of the base price
  double: 0.15, // 15% of the base price
  triple: 0.25, // 25% of the base price
};
const FLOOR_COST = 300; // Additional cost per floor in INR
const DISTANCE_RATE = 7; // Price per km in INR
const BASE_CHARGE = 500; // Flat base charge in INR

// Helper function for market-level pricing
const calculateMarketRate = (distance, totalCFT, packagingType, floor) => {
  const basePrice = totalCFT * PRICE_PER_CFT;
  const packagingCost = basePrice * PACKAGING_MULTIPLIERS[packagingType];
  const floorCost = floor * FLOOR_COST;
  const distanceCost = distance * DISTANCE_RATE;

  const totalPrice = BASE_CHARGE + basePrice + packagingCost + floorCost + distanceCost;
  return totalPrice;
};

// Calculate API Route
router.post("/calculate", async (req, res) => {
  try {
    const { pickup, dropoff, packaging, floor, items } = req.body;

    // Validate Inputs
    if (!pickup || !dropoff || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid input. Please provide all required fields." });
    }

    // Step 1: Calculate Distance using Google Maps API
    const googleApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      pickup
    )}&destinations=${encodeURIComponent(dropoff)}&key=AIzaSyDrROirhFaapbWyT1rusyEvBF0lpVxpUyE`;
    const distanceResponse = await axios.get(googleApiUrl);

    const elements = distanceResponse.data.rows[0].elements[0];
    if (elements.status !== "OK") {
      return res.status(400).json({ message: "Unable to calculate distance. Check your locations." });
    }

    const distance = elements.distance.value / 1000; // Convert meters to kilometers
    const duration = elements.duration.text; // Estimated travel time

    // Step 2: Calculate Total Item Volume (CFT)
    const totalCFT = items.reduce((total, item) => total + item.cft * item.quantity, 0);

    // Step 3: Calculate Total Price
    const totalPrice = calculateMarketRate(distance, totalCFT, packaging, floor);

    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
      
      res.json({
        totalPrice: formatter.format(totalPrice),
        breakdown: {
          distance: `${distance} km`,
          duration,
          baseCharge: formatter.format(BASE_CHARGE),
          itemCost: formatter.format(totalCFT * PRICE_PER_CFT),
          packagingCost: formatter.format((totalCFT * PRICE_PER_CFT) * PACKAGING_MULTIPLIERS[packaging]),
          floorCost: formatter.format(floor * FLOOR_COST),
          distanceCost: formatter.format(distance * DISTANCE_RATE),
        },
      });
      
  } catch (error) {
    console.error("Error calculating price:", error.message);
    res.status(500).json({ message: "Error calculating price", error: error.message });
  }
});

export default router;
