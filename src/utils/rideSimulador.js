// Simulador de corridas para teste

/**
 * Gera uma corrida aleatória para simulação
 * @returns {Object} Dados da corrida simulada
 */
export const generateRandomRide = () => {
  const platforms = ['Uber', '99', 'UberX', 'Taxi'];
  const destinations = [
    'Centro',
    'Zona Sul',
    'Aeroporto',
    'Shopping',
    'Praia',
    'Estádio',
    'Hospital',
    'Universidade',
    'Terminal Rodoviário',
    'Parque Industrial'
  ];
  
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  const value = Number((Math.random() * 40 + 10).toFixed(2));
  const distance = Number((Math.random() * 15 + 3).toFixed(1));
  const time = Math.floor(Math.random() * 30 + 10);
  const valuePerKm = Number((value / distance).toFixed(2));
  
  // Determina a cor do semáforo baseado no valor por km
  let trafficLight = 'red';
  if (valuePerKm > 3.5) trafficLight = 'green';
  else if (valuePerKm > 2.0) trafficLight = 'yellow';
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    platform,
    value,
    distance,
    time,
    destination,
    trafficLight,
    valuePerKm,
    origin: 'Sua localização',
    estimatedEarnings: calculateEarnings(value, platform),
    surge: Math.random() > 0.7 ? 1.5 : 1.0, // Multiplicador de demanda
  };
};

/**
 * Calcula os ganhos estimados para uma corrida
 * @param {number} value - Valor da corrida
 * @param {string} platform - Plataforma
 * @returns {Object} Detalhamento dos ganhos
 */
export const calculateEarnings = (value, platform) => {
  const platformFee = platform === 'Uber' ? 0.25 : platform === '99' ? 0.20 : 0.15;
  const taxFee = 0.05;
  
  const gross = value;
  const platformDeduction = value * platformFee;
  const taxDeduction = value * taxFee;
  const net = value - platformDeduction - taxDeduction;
  
  return {
    gross,
    platformDeduction,
    taxDeduction,
    net,
    netPerKm: net / (value / 2.5) // Estimativa baseada em valor médio por km
  };
};

/**
 * Gera estatísticas diárias simuladas
 * @param {number} ridesCount - Número de corridas
 * @returns {Object} Estatísticas do dia
 */
export const generateDailyStats = (ridesCount = 12) => {
  const rides = [];
  let totalEarnings = 0;
  let totalDistance = 0;
  let totalTime = 0;
  
  for (let i = 0; i < ridesCount; i++) {
    const ride = generateRandomRide();
    rides.push(ride);
    totalEarnings += ride.value;
    totalDistance += ride.distance;
    totalTime += ride.time;
  }
  
  return {
    rides,
    summary: {
      totalRides: ridesCount,
      totalEarnings,
      totalDistance: Number(totalDistance.toFixed(1)),
      totalTime,
      averagePerRide: Number((totalEarnings / ridesCount).toFixed(2)),
      averagePerKm: Number((totalEarnings / totalDistance).toFixed(2)),
      bestRide: Math.max(...rides.map(r => r.value)),
      platformBreakdown: calculatePlatformBreakdown(rides)
    }
  };
};

/**
 * Calcula breakdown por plataforma
 * @param {Array} rides - Lista de corridas
 * @returns {Object} Estatísticas por plataforma
 */
const calculatePlatformBreakdown = (rides) => {
  const breakdown = {};
  
  rides.forEach(ride => {
    if (!breakdown[ride.platform]) {
      breakdown[ride.platform] = {
        count: 0,
        totalValue: 0,
        totalDistance: 0
      };
    }
    
    breakdown[ride.platform].count++;
    breakdown[ride.platform].totalValue += ride.value;
    breakdown[ride.platform].totalDistance += ride.distance;
  });
  
  // Calcula médias
  Object.keys(breakdown).forEach(platform => {
    const data = breakdown[platform];
    data.averageValue = Number((data.totalValue / data.count).toFixed(2));
    data.averageDistance = Number((data.totalDistance / data.count).toFixed(1));
  });
  
  return breakdown;
};

/**
 * Filtra corridas por critérios
 * @param {Array} rides - Lista de corridas
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Corridas filtradas
 */
export const filterRides = (rides, filters) => {
  return rides.filter(ride => {
    if (filters.minValue && ride.value < filters.minValue) return false;
    if (filters.maxValue && ride.value > filters.maxValue) return false;
    if (filters.minDistance && ride.distance < filters.minDistance) return false;
    if (filters.platform && ride.platform !== filters.platform) return false;
    if (filters.trafficLight && ride.trafficLight !== filters.trafficLight) return false;
    if (filters.minValuePerKm && ride.valuePerKm < filters.minValuePerKm) return false;
    return true;
  });
};