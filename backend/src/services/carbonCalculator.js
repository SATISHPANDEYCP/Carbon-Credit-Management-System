const emissionFactors = {
  transport: {
    car: 0.23,
    bus: 0.10,
    train: 0.04,
    flight: 0.25
  },
  electricity: 0.5,
  waste: 0.3,
  manufacturing: 1.5
};

export const calculateCO2 = (activityType, quantity, unit, vehicleType = null) => {
  let co2Generated = 0;

  switch(activityType) {
    case 'transport':
      if (vehicleType && emissionFactors.transport[vehicleType]) {
        co2Generated = quantity * emissionFactors.transport[vehicleType];
      }
      break;
    case 'electricity':
      co2Generated = quantity * emissionFactors.electricity;
      break;
    case 'waste':
      co2Generated = quantity * emissionFactors.waste;
      break;
    case 'manufacturing':
      co2Generated = quantity * emissionFactors.manufacturing;
      break;
    default:
      co2Generated = 0;
  }

  return parseFloat(co2Generated.toFixed(2));
};

export const calculateCreditsEarned = (impactKg) => {
  return parseFloat((impactKg * 0.1).toFixed(2));
};
