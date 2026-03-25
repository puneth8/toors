// ============================================
// Seed Data - MEGA: All-India routes, 100+ buses, trains, flights
// Run: npm run seed (or node utils/seedData.js)
// ============================================
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Train = require('../models/Train');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busgo');
    console.log('🔌 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Route.deleteMany({}), Bus.deleteMany({}),
      Train.deleteMany({}), Flight.deleteMany({}), Booking.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // ========================
    // USERS
    // ========================
    await User.create({ name: 'Admin', email: 'admin@busgo.com', password: 'admin123', phone: '9999999999', role: 'admin' });
    await User.create({ name: 'Demo User', email: 'demo@busgo.com', password: 'demo123', phone: '8888888888', role: 'user' });
    console.log('👤 Users created');

    // ========================
    // ALL-INDIA ROUTES (80+ routes covering every major city)
    // ========================
    const allRoutes = [
      // South India
      { source: 'Hyderabad', destination: 'Bangalore', distance: 570, duration: '8h 30m' },
      { source: 'Hyderabad', destination: 'Chennai', distance: 630, duration: '9h 00m' },
      { source: 'Hyderabad', destination: 'Vijayawada', distance: 275, duration: '4h 30m' },
      { source: 'Hyderabad', destination: 'Tirupati', distance: 560, duration: '8h 00m' },
      { source: 'Hyderabad', destination: 'Visakhapatnam', distance: 620, duration: '10h 00m' },
      { source: 'Hyderabad', destination: 'Mumbai', distance: 710, duration: '11h 00m' },
      { source: 'Hyderabad', destination: 'Pune', distance: 560, duration: '8h 30m' },
      { source: 'Hyderabad', destination: 'Goa', distance: 640, duration: '10h 00m' },
      { source: 'Bangalore', destination: 'Chennai', distance: 350, duration: '6h 00m' },
      { source: 'Bangalore', destination: 'Mysore', distance: 150, duration: '3h 00m' },
      { source: 'Bangalore', destination: 'Goa', distance: 560, duration: '9h 30m' },
      { source: 'Bangalore', destination: 'Kochi', distance: 560, duration: '9h 00m' },
      { source: 'Bangalore', destination: 'Mangalore', distance: 350, duration: '6h 30m' },
      { source: 'Bangalore', destination: 'Coimbatore', distance: 365, duration: '6h 00m' },
      { source: 'Bangalore', destination: 'Ooty', distance: 280, duration: '6h 30m' },
      { source: 'Bangalore', destination: 'Tirupati', distance: 260, duration: '5h 00m' },
      { source: 'Chennai', destination: 'Pondicherry', distance: 170, duration: '3h 30m' },
      { source: 'Chennai', destination: 'Madurai', distance: 460, duration: '7h 30m' },
      { source: 'Chennai', destination: 'Coimbatore', distance: 500, duration: '8h 00m' },
      { source: 'Chennai', destination: 'Kochi', distance: 700, duration: '11h 30m' },
      { source: 'Chennai', destination: 'Tirupati', distance: 135, duration: '3h 00m' },
      { source: 'Chennai', destination: 'Trivandrum', distance: 775, duration: '13h 00m' },
      { source: 'Kochi', destination: 'Trivandrum', distance: 200, duration: '4h 00m' },
      { source: 'Kochi', destination: 'Munnar', distance: 130, duration: '4h 30m' },
      { source: 'Kochi', destination: 'Coimbatore', distance: 200, duration: '4h 30m' },
      // West India
      { source: 'Mumbai', destination: 'Pune', distance: 150, duration: '3h 30m' },
      { source: 'Mumbai', destination: 'Goa', distance: 590, duration: '10h 00m' },
      { source: 'Mumbai', destination: 'Ahmedabad', distance: 530, duration: '8h 00m' },
      { source: 'Mumbai', destination: 'Nashik', distance: 170, duration: '3h 30m' },
      { source: 'Mumbai', destination: 'Shirdi', distance: 250, duration: '5h 00m' },
      { source: 'Mumbai', destination: 'Surat', distance: 300, duration: '5h 00m' },
      { source: 'Mumbai', destination: 'Aurangabad', distance: 340, duration: '6h 00m' },
      { source: 'Mumbai', destination: 'Nagpur', distance: 840, duration: '13h 00m' },
      { source: 'Mumbai', destination: 'Indore', distance: 585, duration: '9h 30m' },
      { source: 'Pune', destination: 'Goa', distance: 450, duration: '8h 00m' },
      { source: 'Pune', destination: 'Kolhapur', distance: 230, duration: '5h 00m' },
      { source: 'Pune', destination: 'Nashik', distance: 210, duration: '4h 00m' },
      { source: 'Ahmedabad', destination: 'Surat', distance: 265, duration: '4h 30m' },
      { source: 'Ahmedabad', destination: 'Rajkot', distance: 220, duration: '4h 00m' },
      { source: 'Ahmedabad', destination: 'Udaipur', distance: 260, duration: '5h 00m' },
      { source: 'Ahmedabad', destination: 'Jaipur', distance: 680, duration: '10h 00m' },
      // North India
      { source: 'Delhi', destination: 'Jaipur', distance: 280, duration: '5h 30m' },
      { source: 'Delhi', destination: 'Agra', distance: 230, duration: '4h 00m' },
      { source: 'Delhi', destination: 'Chandigarh', distance: 250, duration: '5h 00m' },
      { source: 'Delhi', destination: 'Dehradun', distance: 255, duration: '6h 00m' },
      { source: 'Delhi', destination: 'Haridwar', distance: 225, duration: '5h 30m' },
      { source: 'Delhi', destination: 'Rishikesh', distance: 240, duration: '6h 00m' },
      { source: 'Delhi', destination: 'Shimla', distance: 345, duration: '8h 00m' },
      { source: 'Delhi', destination: 'Manali', distance: 540, duration: '13h 00m' },
      { source: 'Delhi', destination: 'Amritsar', distance: 450, duration: '8h 00m' },
      { source: 'Delhi', destination: 'Lucknow', distance: 555, duration: '8h 30m' },
      { source: 'Delhi', destination: 'Varanasi', distance: 800, duration: '12h 00m' },
      { source: 'Delhi', destination: 'Jaisalmer', distance: 790, duration: '14h 00m' },
      { source: 'Delhi', destination: 'Udaipur', distance: 665, duration: '11h 00m' },
      { source: 'Delhi', destination: 'Mumbai', distance: 1400, duration: '22h 00m' },
      { source: 'Delhi', destination: 'Bangalore', distance: 2150, duration: '36h 00m' },
      { source: 'Jaipur', destination: 'Udaipur', distance: 395, duration: '6h 30m' },
      { source: 'Jaipur', destination: 'Jodhpur', distance: 340, duration: '6h 00m' },
      { source: 'Jaipur', destination: 'Ajmer', distance: 135, duration: '2h 30m' },
      { source: 'Jaipur', destination: 'Pushkar', distance: 145, duration: '3h 00m' },
      { source: 'Lucknow', destination: 'Varanasi', distance: 300, duration: '5h 30m' },
      { source: 'Lucknow', destination: 'Agra', distance: 335, duration: '6h 00m' },
      { source: 'Lucknow', destination: 'Kanpur', distance: 80, duration: '1h 30m' },
      // East India
      { source: 'Kolkata', destination: 'Digha', distance: 185, duration: '4h 00m' },
      { source: 'Kolkata', destination: 'Darjeeling', distance: 615, duration: '12h 00m' },
      { source: 'Kolkata', destination: 'Puri', distance: 500, duration: '9h 00m' },
      { source: 'Kolkata', destination: 'Siliguri', distance: 570, duration: '10h 00m' },
      { source: 'Kolkata', destination: 'Bhubaneswar', distance: 440, duration: '7h 30m' },
      { source: 'Kolkata', destination: 'Patna', distance: 590, duration: '10h 00m' },
      { source: 'Kolkata', destination: 'Guwahati', distance: 1000, duration: '18h 00m' },
      { source: 'Patna', destination: 'Varanasi', distance: 290, duration: '5h 30m' },
      { source: 'Patna', destination: 'Ranchi', distance: 320, duration: '6h 00m' },
      { source: 'Bhubaneswar', destination: 'Puri', distance: 60, duration: '1h 30m' },
      // Central India
      { source: 'Nagpur', destination: 'Raipur', distance: 285, duration: '5h 00m' },
      { source: 'Indore', destination: 'Bhopal', distance: 195, duration: '3h 30m' },
      { source: 'Indore', destination: 'Ujjain', distance: 55, duration: '1h 15m' },
      { source: 'Bhopal', destination: 'Jabalpur', distance: 330, duration: '6h 00m' },
      // Northeast
      { source: 'Guwahati', destination: 'Shillong', distance: 100, duration: '3h 00m' },
      { source: 'Guwahati', destination: 'Tezpur', distance: 180, duration: '4h 00m' },
      // Hill Stations & Tourism
      { source: 'Chandigarh', destination: 'Shimla', distance: 115, duration: '3h 30m' },
      { source: 'Chandigarh', destination: 'Manali', distance: 310, duration: '8h 00m' },
    ];

    const routes = await Route.insertMany(allRoutes);
    console.log(`🗺️ Created ${routes.length} routes across all India`);

    // ========================
    // BUSES (120+ buses across all routes)
    // ========================
    const busOperators = [
      'Royal Travels', 'SRS Travels', 'VRL Travels', 'Orange Travels', 'Kaveri Travels',
      'Neeta Travels', 'Paulo Travels', 'KSRTC Premium', 'TSRTC Garuda', 'Jabbar Travels',
      'KPN Travels', 'Greenline Travels', 'IntrCity SmartBus', 'Sharma Transports', 'Ashok Travels',
      'National Travels', 'Parveen Travels', 'Kesineni Travels', 'Kallada Travels', 'MSRTC Shivneri',
      'RedBus Connect', 'Volvo Express', 'Yatra Express', 'Raj National Express', 'Eagle Travels',
      'Hans Travels', 'Rathimeena Travels', 'SRM Travels', 'Konduskar Travels', 'Shrinath Travels'
    ];

    const amenitySets = [
      ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle'],
      ['WiFi', 'Water Bottle', 'Snacks', 'TV'],
      ['Charging Point', 'Reading Light', 'Blanket'],
      ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Snacks', 'TV'],
      ['Water Bottle', 'Blanket'],
      ['WiFi', 'Charging Point', 'Pillow', 'Eye Mask']
    ];

    const busTypes = ['AC', 'Non-AC', 'Sleeper', 'Seater', 'AC-Sleeper', 'Volvo'];
    const depTimes = ['05:00', '06:00', '06:30', '07:00', '08:00', '09:00', '10:00', '11:00',
      '13:00', '14:00', '15:00', '16:00', '17:30', '18:00', '19:00', '20:00', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];

    const buses = [];
    let busNum = 1;

    for (const route of routes) {
      // 5-10 buses per route
      const count = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < count; i++) {
        const bType = busTypes[Math.floor(Math.random() * busTypes.length)];
        const isPremium = bType.includes('AC') || bType === 'Volvo';
        const basePrice = Math.floor(route.distance * (isPremium ? 1.6 : 0.9));
        const variation = Math.floor(Math.random() * 300) - 100;
        const price = Math.max(99, basePrice + variation);
        const dep = depTimes[Math.floor(Math.random() * depTimes.length)];

        buses.push({
          busName: busOperators[Math.floor(Math.random() * busOperators.length)],
          busNumber: `BG${String(busNum++).padStart(4, '0')}`,
          busType: bType,
          route: route._id,
          totalSeats: bType.includes('Sleeper') ? 30 : 40,
          price,
          departureTime: dep,
          arrivalTime: calcArr(dep, route.duration),
          amenities: amenitySets[Math.floor(Math.random() * amenitySets.length)],
          rating: +(3.2 + Math.random() * 1.8).toFixed(1),
          seatLayout: {
            rows: bType.includes('Sleeper') ? 10 : 10,
            columns: bType.includes('Sleeper') ? 3 : 4,
            unavailableSeats: []
          }
        });
      }
    }
    await Bus.insertMany(buses);
    console.log(`🚌 Created ${buses.length} buses`);

    // ========================
    // TRAINS (80+ trains)
    // ========================
    const trainNames = [
      'Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Vande Bharat Express',
      'Garib Rath Express', 'Jan Shatabdi', 'Superfast Express', 'Humsafar Express',
      'Tejas Express', 'Gatimaan Express', 'Double Decker Express', 'Sampark Kranti',
      'AP Express', 'Tamil Nadu Express', 'Karnataka Express', 'Kerala Express',
      'Deccan Queen', 'Chennai Mail', 'Howrah Mail', 'Grand Trunk Express'
    ];

    const trainTypes = ['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Duronto', 'Vande Bharat', 'Garib Rath'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const trains = [];
    let trainNum = 12001;

    for (const route of routes) {
      // 1-2 trains per route (not all routes have trains)
      if (Math.random() > 0.25) {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
          const tType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
          const isRajdhani = tType === 'Rajdhani' || tType === 'Shatabdi' || tType === 'Vande Bharat';

          const baseSL = Math.floor(route.distance * 0.5);
          const dep = depTimes[Math.floor(Math.random() * depTimes.length)];
          const runDays = days.filter(() => Math.random() > 0.2);

          trains.push({
            trainName: `${route.source} ${trainNames[Math.floor(Math.random() * trainNames.length)]}`,
            trainNumber: String(trainNum++),
            trainType: tType,
            route: route._id,
            classes: [
              ...(isRajdhani ? [] : [{ classType: 'GN', totalSeats: 80, price: Math.max(50, Math.floor(baseSL * 0.3)) }]),
              { classType: 'SL', totalSeats: 72, price: Math.max(100, baseSL) },
              { classType: '3A', totalSeats: 64, price: Math.floor(baseSL * 2.5) },
              { classType: '2A', totalSeats: 48, price: Math.floor(baseSL * 4) },
              { classType: '1A', totalSeats: 24, price: Math.floor(baseSL * 6.5) },
              ...(tType === 'Shatabdi' || tType === 'Vande Bharat' ? [{ classType: 'CC', totalSeats: 60, price: Math.floor(baseSL * 3) }] : [])
            ],
            departureTime: dep,
            arrivalTime: calcArr(dep, route.duration),
            daysOfWeek: runDays.length > 0 ? runDays : ['Mon', 'Wed', 'Fri'],
            amenities: isRajdhani ? ['Meals', 'Bedding', 'AC', 'Charging Point'] : ['Charging Point', 'Pantry Car'],
            rating: +(3.5 + Math.random() * 1.5).toFixed(1)
          });
        }
      }
    }
    await Train.insertMany(trains);
    console.log(`🚂 Created ${trains.length} trains`);

    // ========================
    // FLIGHTS (60+ flights)
    // ========================
    const airlines = [
      'IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Go First',
      'AirAsia India', 'Akasa Air', 'Air India Express', 'Alliance Air', 'Star Air'
    ];
    const aircraft = ['Boeing 737', 'Airbus A320', 'Airbus A321neo', 'Boeing 737 MAX', 'ATR 72'];

    // Only major city pairs get flights
    const flightRoutes = routes.filter(r => r.distance > 300 || ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Kochi', 'Jaipur', 'Lucknow', 'Guwahati', 'Chandigarh', 'Varanasi', 'Trivandrum', 'Coimbatore', 'Mangalore', 'Bhubaneswar', 'Patna', 'Indore', 'Nagpur', 'Visakhapatnam'
    ].some(city => r.source === city || r.destination === city));

    const flights = [];
    let flightNum = 1;

    for (const route of flightRoutes) {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const prefix = airline === 'IndiGo' ? '6E' : airline === 'Air India' ? 'AI' : airline === 'SpiceJet' ? 'SG' : airline === 'Vistara' ? 'UK' : airline === 'Go First' ? 'G8' : airline === 'AirAsia India' ? 'I5' : airline === 'Akasa Air' ? 'QP' : 'IX';

        const flightDurH = Math.max(1, Math.floor(route.distance / 650));
        const flightDurM = Math.floor(Math.random() * 40) + 10;
        const flightDuration = `${flightDurH}h ${flightDurM}m`;
        const dep = depTimes[Math.floor(Math.random() * depTimes.length)];

        const baseEconomy = Math.floor(route.distance * 3.5) + Math.floor(Math.random() * 1500);

        flights.push({
          airline,
          flightNumber: `${prefix}${String(1000 + flightNum++)}`,
          flightType: 'Domestic',
          route: route._id,
          classes: [
            { classType: 'Economy', totalSeats: 150, price: Math.max(1499, baseEconomy) },
            { classType: 'Premium Economy', totalSeats: 24, price: Math.floor(baseEconomy * 1.8) },
            { classType: 'Business', totalSeats: 12, price: Math.floor(baseEconomy * 3.5) }
          ],
          departureTime: dep,
          arrivalTime: calcArr(dep, flightDuration),
          duration: flightDuration,
          aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
          amenities: airline === 'Vistara' || airline === 'Air India'
            ? ['Meals', 'WiFi', 'Entertainment', 'Lounge Access']
            : ['Snacks', 'Charging Point'],
          rating: +(3.5 + Math.random() * 1.5).toFixed(1),
          stops: Math.random() > 0.7 ? 1 : 0
        });
      }
    }
    await Flight.insertMany(flights);
    console.log(`✈️ Created ${flights.length} flights`);

    console.log('\n✅ MEGA Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 ${routes.length} Routes | ${buses.length} Buses | ${trains.length} Trains | ${flights.length} Flights`);
    console.log('Admin: admin@busgo.com / admin123');
    console.log('Demo:  demo@busgo.com / demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

function calcArr(dep, dur) {
  const [dH, dM] = dep.split(':').map(Number);
  const m = dur.match(/(\d+)h\s*(\d+)?m?/);
  if (!m) return dep;
  let aH = (dH + parseInt(m[1])) % 24;
  let aM = dM + parseInt(m[2] || 0);
  if (aM >= 60) { aH = (aH + 1) % 24; aM -= 60; }
  return `${String(aH).padStart(2, '0')}:${String(aM).padStart(2, '0')}`;
}

seedData();
