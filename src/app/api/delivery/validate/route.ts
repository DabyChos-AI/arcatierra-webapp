import { NextRequest, NextResponse } from 'next/server'

// Códigos postales válidos para CDMX (01000-16999)
const VALID_POSTAL_CODES = {
  min: 1000,
  max: 16999
}

// Zonas especiales con costos de envío diferentes
const DELIVERY_ZONES = {
  'centro': {
    postal_codes: [6000, 6050, 6100, 6140, 6170, 6200, 6240, 6250, 6260, 6270, 6280, 6300, 6350, 6400, 6450, 6500, 6600, 6700, 6720, 6760, 6800, 6820, 6840, 6860, 6900],
    cost: 0, // Envío gratis en zona centro
    delivery_time: '24-48 horas'
  },
  'norte': {
    postal_codes: [2000, 2010, 2020, 2040, 2080, 2090, 2100, 2120, 2128, 2129, 2130, 2140, 2150, 2160, 2200, 2230, 2240, 2250, 2300, 2310, 2320, 2330, 2340, 2360, 2400, 2410, 2420, 2440, 2459, 2460, 2470, 2490, 2500, 2510, 2520, 2530, 2540, 2550, 2560, 2600, 2630, 2640, 2650, 2660, 2670, 2680, 2690, 2700, 2710, 2720, 2730, 2750, 2760, 2770, 2780, 2790, 2800, 2810, 2820, 2830, 2840, 2860, 2870, 2900, 2910, 2920, 2940, 2950, 2960, 2970, 2980, 2990],
    cost: 50,
    delivery_time: '48-72 horas'
  },
  'sur': {
    postal_codes: [1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090, 1100, 1109, 1110, 1120, 1125, 1140, 1150, 1160, 1180, 1200, 1210, 1220, 1230, 1240, 1250, 1260, 1268, 1269, 1270, 1280, 1290, 1300, 1310, 1320, 1330, 1340, 1349, 1350, 1360, 1370, 1376, 1400, 1407, 1408, 1410, 1419, 1420, 1430, 1440, 1450, 1460, 1470, 1480, 1490, 1500, 1510, 1520, 1530, 1540, 1550, 1560, 1580, 1590, 1600, 1610, 1618, 1619, 1620, 1630, 1640, 1645, 1650, 1700, 1710, 1720, 1730, 1740, 1750, 1760, 1780, 1790, 1800, 1810, 1820, 1830, 1840, 1849, 1850, 1857, 1859, 1860, 1870, 1900, 1910, 1920, 1930, 1940, 1950],
    cost: 50,
    delivery_time: '48-72 horas'
  },
  'oriente': {
    postal_codes: [8000, 8010, 8020, 8030, 8040, 8050, 8060, 8070, 8100, 8110, 8120, 8130, 8200, 8210, 8220, 8230, 8240, 8300, 8310, 8320, 8400, 8420, 8500, 8510, 8600, 8610, 8700, 8710, 8720, 8730, 8734, 8760, 8800, 8810, 8830, 8840, 8900, 8910, 9000, 9010, 9020, 9030, 9040, 9060, 9070, 9080, 9089, 9090, 9100, 9110, 9120, 9130, 9140, 9160, 9180, 9200, 9208, 9209, 9210, 9220, 9230, 9240, 9250, 9260, 9270, 9280, 9290, 9300, 9310, 9320, 9340, 9350, 9360, 9370, 9400, 9410, 9420, 9430, 9440, 9460, 9470, 9480, 9500, 9510, 9520, 9530, 9540, 9550, 9560, 9570, 9580, 9600, 9610, 9620, 9630, 9640, 9700, 9710, 9720, 9730, 9740, 9750, 9760, 9780, 9790, 9800, 9810, 9820, 9830, 9837, 9838, 9839, 9840, 9850, 9856, 9857, 9858, 9859, 9860, 9870, 9897, 9898, 9899],
    cost: 75,
    delivery_time: '72-96 horas'
  },
  'poniente': {
    postal_codes: [1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090, 1100, 1109, 1110, 1120, 1125, 1140, 1150, 1160, 1180, 1200, 1210, 1220, 1230, 1240, 1250, 1260, 1268, 1269, 1270, 1280, 1290, 1300, 1310, 1320, 1330, 1340, 1349, 1350, 1360, 1370, 1376, 1400, 1407, 1408, 1410, 1419, 1420, 1430, 1440, 1450, 1460, 1470, 1480, 1490, 1500, 1510, 1520, 1530, 1540, 1550, 1560, 1580, 1590, 1600, 1610, 1618, 1619, 1620, 1630, 1640, 1645, 1650, 1700, 1710, 1720, 1730, 1740, 1750, 1760, 1780, 1790, 1800, 1810, 1820, 1830, 1840, 1849, 1850, 1857, 1859, 1860, 1870, 1900, 1910, 1920, 1930, 1940, 1950, 5000, 5010, 5020, 5030, 5100, 5109, 5110, 5118, 5119, 5120, 5130, 5140, 5150, 5200, 5240, 5250, 5260, 5270, 5280, 5290, 5300, 5310, 5320, 5330, 5340, 5348, 5360, 5370, 5400, 5410, 5500, 5520, 5530, 5540, 5600, 5610, 5620, 5630, 5700, 5710, 5730, 5750, 5800, 5810, 5820, 5830, 5840, 5860, 5900, 5920, 5930, 11000, 11010, 11020, 11040, 11100, 11200, 11210, 11220, 11230, 11240, 11250, 11260, 11300, 11320, 11330, 11340, 11350, 11360, 11370, 11400, 11410, 11420, 11430, 11440, 11450, 11460, 11470, 11480, 11489, 11490, 11500, 11510, 11520, 11529, 11530, 11540, 11550, 11560, 11590, 11600, 11610, 11650, 11700, 11800, 11810, 11820, 11830, 11840, 11850, 11860, 11870, 11900, 11910, 11920, 11930, 11940, 11950],
    cost: 75,
    delivery_time: '72-96 horas'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postal_code, address } = await request.json()

    if (!postal_code) {
      return NextResponse.json(
        { error: 'Código postal requerido' },
        { status: 400 }
      )
    }

    const cp = parseInt(postal_code.toString())

    // Validar rango de códigos postales de CDMX
    const isValidRange = cp >= VALID_POSTAL_CODES.min && cp <= VALID_POSTAL_CODES.max

    if (!isValidRange) {
      return NextResponse.json({
        valid: false,
        message: 'Solo realizamos entregas en Ciudad de México (CP 01000-16999)',
        postal_code: cp,
        delivery_available: false
      })
    }

    // Determinar zona de entrega
    let zone = 'standard'
    let deliveryInfo = {
      cost: 50,
      delivery_time: '48-72 horas'
    }

    for (const [zoneName, zoneData] of Object.entries(DELIVERY_ZONES)) {
      if (zoneData.postal_codes.includes(cp)) {
        zone = zoneName
        deliveryInfo = {
          cost: zoneData.cost,
          delivery_time: zoneData.delivery_time
        }
        break
      }
    }

    // Calcular tiempo estimado de entrega
    const today = new Date()
    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + (zone === 'centro' ? 1 : 2))

    return NextResponse.json({
      valid: true,
      postal_code: cp,
      delivery_available: true,
      zone: zone,
      delivery_cost: deliveryInfo.cost,
      delivery_time: deliveryInfo.delivery_time,
      estimated_delivery: deliveryDate.toISOString().split('T')[0],
      message: deliveryInfo.cost === 0 ? 
        'Envío gratis en zona centro' : 
        `Costo de envío: $${deliveryInfo.cost}`
    })

  } catch (error) {
    console.error('Error validating postal code:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const postal_code = searchParams.get('postal_code')

  if (!postal_code) {
    return NextResponse.json(
      { error: 'Código postal requerido' },
      { status: 400 }
    )
  }

  // Reutilizar la lógica del POST
  return POST(request)
}

