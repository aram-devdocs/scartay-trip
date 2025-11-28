import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

function hashPin(pin: string): string {
  const salt = process.env.AUTH_PIN_SALT || 'default-dev-salt'
  return createHash('sha256').update(pin + salt).digest('hex')
}

async function main() {
  // Seed Users
  await prisma.user.upsert({
    where: { name: 'Taylor' },
    update: {},
    create: { name: 'Taylor', pin: hashPin('0326') },
  })
  await prisma.user.upsert({
    where: { name: 'Scarlett' },
    update: {},
    create: { name: 'Scarlett', pin: hashPin('1209') },
  })
  console.log('Users seeded!')

  // Seed Flights (using upsert pattern with unique identifier)
  const flights = [
    {
      travelerName: 'Tay',
      price3Night: 237,
      price4Night: 175,
      inboundFlight: 'Inbound (LGA): 12:30 - 2:44',
      outboundFlight: 'Departing(LGA) 4:00 - 6:23',
      airline: 'Delta Airline',
      notes: 'This would put us coming in similar time to similar airport.',
    },
    {
      travelerName: 'Scar',
      price3Night: 340,
      price4Night: 340,
      inboundFlight: 'Inbound(LGA) 7:45 - 3:14',
      outboundFlight: 'Departing(LGA) 6:30 - 9:02',
      airline: 'United Airline',
      notes: 'This would put us coming in similar time to similar airport.',
    },
  ]

  for (const flight of flights) {
    const existing = await prisma.flight.findFirst({
      where: { travelerName: flight.travelerName, airline: flight.airline },
    })
    if (!existing) {
      await prisma.flight.create({ data: flight })
    }
  }
  console.log('Flights seeded!')

  // Seed Hotels
  const hotels = [
    {
      name: 'Gild Hall, A Thompson Hotel, by Hyatt',
      totalPrice: 995.67,
      perPerson: 497.84,
      includes: '$100 hotel credit + free room upgrade + complimentary early check in/late check out',
      neighborhood: 'Wall Street/South Manhattan',
      notes: null,
      price3NightTay: 673,
      price3NightScar: 838,
      price4NightTay: 838.61,
      price4NightScar: 1003.61,
      url: 'https://www.hyatt.com/thompson-hotels/lgatg-gild-hall',
    },
    {
      name: 'Hotel Hugo',
      totalPrice: 1061.01,
      perPerson: 530.51,
      includes: '$25 hotel credit',
      neighborhood: 'Soho',
      notes: 'Non-refundable black friday deal',
      price3NightTay: 706,
      price3NightScar: 871,
      price4NightTay: 882.16,
      price4NightScar: 1047.16,
      url: 'https://www.hotelhugony.com/',
    },
    {
      name: 'Dream Downtown, by Hyatt',
      totalPrice: 1089.75,
      perPerson: 544.88,
      includes: '$100 hotel credit + free room upgrade + complimentary early check in/late check out',
      neighborhood: 'Chelsea',
      notes: 'Recent reviews mention this is a party hotel and some guests complain about loud noise at night due to nightclubs either in the building or nearby',
      price3NightTay: 720,
      price3NightScar: 885,
      price4NightTay: 901.32,
      price4NightScar: 1066.32,
      url: 'https://www.hyatt.com/dream-hotels/en-US/nycdd-dream-downtown',
    },
    {
      name: 'Grayson Hotel in the Unbound Collection by Hyatt',
      totalPrice: 1333.29,
      perPerson: 666.65,
      includes: '$100 hotel credit + breakfast daily + free room upgrade + complimentary early check in/late check out',
      neighborhood: 'Bryant Park',
      notes: null,
      price3NightTay: 842,
      price3NightScar: 1007,
      price4NightTay: 1063.64,
      price4NightScar: 1228.64,
      url: 'https://www.hyatt.com/unbound-collection/en-US/nycub-grayson-hotel',
    },
    {
      name: 'Roxy Hotel New York',
      totalPrice: 1398.68,
      perPerson: 699.34,
      includes: '$100 hotel credit + breakfast daily + free room upgrade + complimentary early check in/late check out',
      neighborhood: 'Soho',
      notes: null,
      price3NightTay: 874,
      price3NightScar: 1039,
      price4NightTay: 1107.22,
      price4NightScar: 1272.22,
      url: 'https://www.roxyhotelnyc.com/',
    },
    {
      name: 'The Public',
      totalPrice: 1502.83,
      perPerson: 751.42,
      includes: '$50 Food and Beverage Credit',
      neighborhood: 'Bowery',
      notes: null,
      price3NightTay: 926,
      price3NightScar: 1091,
      price4NightTay: 1176.64,
      price4NightScar: 1341.64,
      url: 'https://www.publichotels.com/newyork',
    },
  ]

  for (const hotel of hotels) {
    const existing = await prisma.hotel.findFirst({
      where: { name: hotel.name },
    })
    if (!existing) {
      await prisma.hotel.create({ data: hotel })
    }
  }
  console.log('Hotels seeded!')

  // Seed Activities
  const activities = [
    {
      name: 'The Met',
      address: '1000 5th Ave, New York, NY 10028',
      neighborhood: 'Upper east side',
      hours: 'Sunday, Monday, Tuesday, Thursday 10-5 and 10-9 Friday and Saturday',
      daysClosed: 'Wednesday',
      price: '$30 per person',
      url: 'https://www.metmuseum.org/',
    },
    {
      name: '4 Story Barnes and Noble',
      address: '33 E 17th St, New York, NY 10003',
      neighborhood: 'Midtown',
      hours: '9am - 9pm everyday except Sunday (10am-9pm)',
      daysClosed: null,
      price: 'Free',
      url: 'https://stores.barnesandnoble.com/store/2675',
    },
  ]

  for (const activity of activities) {
    const existing = await prisma.activity.findFirst({
      where: { name: activity.name },
    })
    if (!existing) {
      await prisma.activity.create({ data: activity })
    }
  }
  console.log('Activities seeded!')

  // Seed Restaurants
  const restaurants = [
    {
      name: 'The Empire Hotel Rooftop (Gossip Girl hotel)',
      address: '44 West 63rd Street, New York 10023',
      neighborhood: 'Upper West Side',
      foodOrDrink: 'Drink (has food)',
      veganOrOmni: 'Omni',
      hours: '2pm-12am (11am opening Saturday and Sunday, 1am closing Wednesday, Thursday, Friday and 1:30am closing Saturday)',
      daysClosed: 'None',
      priceRange: 'Drinks ~$20+ food $30 - $50',
      url: 'https://www.theempirerooftop.com/',
    },
    {
      name: 'Tompkins Square bagels',
      address: 'Many locations',
      neighborhood: 'East Village, Upper East Side, Union Square',
      foodOrDrink: 'Food',
      veganOrOmni: 'Omni',
      hours: '7am - 5pm',
      daysClosed: 'None',
      priceRange: '$10 - $20',
      url: 'https://www.tompkinssquarebagels.com/',
    },
    {
      name: 'Jajaja',
      address: 'Many locations',
      neighborhood: 'West Village, Lower East Side, Hudson Yards, Williamsburg, Union City',
      foodOrDrink: 'Food (great cocktails)',
      veganOrOmni: 'Vegan (mexican food)',
      hours: '11:30am - 11pm Thursday 12am closing Friday and Saturday, 11am -10pm Sunday',
      daysClosed: 'None',
      priceRange: '$20 - $30',
      url: 'https://www.jajajamexicana.com/',
    },
    {
      name: 'Anixi',
      address: '290 8th Ave, New York, NY 10001',
      neighborhood: 'Chelsea',
      foodOrDrink: 'Food (great cocktails)',
      veganOrOmni: 'Vegan (Mediterranean food)',
      hours: 'Monday - Thursday 4:30 - 10, Friday 4:30 - 10:30, Saturday 11:30 - 10:30, Sunday 11:30 - 10',
      daysClosed: 'None',
      priceRange: '$30 - $50',
      url: 'https://www.anixinyc.com/',
    },
    {
      name: "John's of East 12th Street",
      address: '302 E 12th St, New York, NY 10003',
      neighborhood: 'East Village',
      foodOrDrink: 'Both',
      veganOrOmni: 'Omni (Italian food with separate vegan menu)',
      hours: '4-10 daily',
      daysClosed: 'None',
      priceRange: '$30 - $50',
      url: 'https://www.johnsof12thstreet.com/',
    },
  ]

  for (const restaurant of restaurants) {
    const existing = await prisma.restaurant.findFirst({
      where: { name: restaurant.name },
    })
    if (!existing) {
      await prisma.restaurant.create({ data: restaurant })
    }
  }
  console.log('Restaurants seeded!')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
