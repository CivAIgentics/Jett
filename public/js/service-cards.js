/**
 * CITY OF MIDLAND SERVICE CARDS
 * Comprehensive card orchestration for Jacky 2.0
 * Each card includes: title, description, URL, phone, email, and keywords
 * Keywords are broad to capture various user intents and questions
 */

export const serviceCards = {
  
  // ============================================================
  // 1. CITY GOVERNMENT & LEADERSHIP
  // ============================================================
  
  mayorCouncil: {
    title: "Mayor & City Council",
    description: "Contact Mayor Lori Blong and City Council members. View council information, meeting schedules, and how to get involved in city government.",
    url: "https://midlandtexas.gov/238/Mayor-City-Council",
    phone: "(432) 685-7204",
    email: "lblong@midlandtexas.gov",
    keywords: ["mayor", "council", "city council", "lori blong", "councilman", "councilwoman", "city leadership", "elected officials", "government", "city hall", "vote", "representative", "district", "at-large", "who is the mayor", "contact council", "council members", "alcalde", "concejo", "consejo municipal", "concejo de la ciudad", "funcionarios electos", "miembros del concejo", "gobierno de la ciudad", "gobierno", "líderes de la ciudad", "distritos"],
    titleEs: 'Alcalde y Concejo Municipal',
    descriptionEs: 'Conozca al alcalde y a los miembros del concejo municipal, vea los distritos y encuentre información de contacto.',
    linkTextEs: 'Ver Liderazgo'
  },

  cityLeadership: {
    title: "City Leadership",
    description: "Meet the City Manager, Deputy City Manager, Assistant City Manager, and other executive leadership managing Midland's operations.",
    url: "https://midlandtexas.gov/858/City-Leadership",
    phone: "(432) 685-7100",
    keywords: ["city manager", "tommy gonzalez", "deputy city manager", "morris williams", "assistant city manager", "jose ortiz", "chief of staff", "taylor novak", "executive", "administration", "management", "leadership team", "who runs the city", "gerente de la ciudad", "gerente municipal", "liderazgo de la ciudad", "directores de departamento", "administración de la ciudad", "personal de la ciudad", "gerente de la ciudad", "gerente municipal", "liderazgo de la ciudad", "directores de departamento", "administración de la ciudad", "personal de la ciudad"],
    titleEs: 'Liderazgo de la Ciudad',
    descriptionEs: 'Directorio de liderazgo ejecutivo de la Ciudad de Midland, incluyendo al gerente de la ciudad y jefes de departamento.',
    linkTextEs: 'Ver Liderazgo'
  },

  citySecretary: {
    title: "City Secretary",
    description: "Access city records, meeting minutes, agendas, and official city documents. Contact Marcia Bentley-German for records requests.",
    url: "https://midlandtexas.gov/148/City-Secretary",
    phone: "(432) 685-7205",
    email: "mbentleygerman@midlandtexas.gov",
    keywords: ["city secretary", "marcia bentley-german", "records", "minutes", "agendas", "official documents", "city records", "meeting records", "public records", "minutes of meeting", "agenda", "city documents", "secretario de la ciudad", "registros", "actas", "agendas", "documentos de la ciudad"],
    titleEs: 'Secretaría Municipal',
    descriptionEs: 'Actas del concejo, agendas, ordenanzas, resoluciones y registros oficiales de la ciudad.',
    linkTextEs: 'Visitar Secretaría'
  },

  staffDirectory: {
    title: "Staff Directory",
    description: "Search for city employees by name, department, or title. Find direct contact information for city staff members.",
    url: "https://midlandtexas.gov/Directory.aspx",
    phone: "(432) 685-7100",
    keywords: ["staff directory", "employee directory", "find employee", "contact staff", "who works", "department contact", "employee search", "staff contact", "city employee", "find person", "staff member", "directorio del personal", "directorio de empleados", "encontrar empleado", "buscar personal", "contactar empleado"],
    titleEs: 'Directorio de Personal',
    descriptionEs: 'Busque personal de la ciudad por nombre, departamento o función.',
    linkTextEs: 'Buscar Personal'
  },

  councilMeetings: {
    title: "Council Meetings & Agendas",
    description: "View upcoming City Council meetings, watch live streams, access agendas and minutes. Meetings held 2nd and 4th Tuesday at 10 AM.",
    url: "https://midlandtexas.gov/AgendaCenter",
    phone: "(432) 685-7205",
    keywords: ["council meeting", "city council meeting", "agenda", "meeting schedule", "watch meeting", "live stream", "meeting minutes", "when is the meeting", "attend meeting", "council session", "meeting video", "upcoming meetings", "meeting dates", "reunión del concejo", "reunión del consejo", "agenda", "horario de reuniones", "ver reunión", "reunión en vivo", "actas de la reunión", "fechas de reuniones", "reunión del concejo", "reunión del consejo", "agenda", "horario de reuniones", "ver reunión", "reunión en vivo", "actas de la reunión", "fechas de reuniones"],
    titleEs: 'Reuniones del Concejo',
    descriptionEs: 'Horarios de reuniones del concejo municipal, agendas, transmisiones en vivo y grabaciones archivadas.',
    linkTextEs: 'Ver Reuniones'
  },

  councilAppearance: {
    title: "Speak at City Council",
    description: "Request to speak at a City Council meeting. Submit appearance requests and learn about public comment procedures.",
    url: "https://midlandtexas.gov/1435/Council-Appearance-Request",
    phone: "(432) 685-7205",
    keywords: ["speak at council", "public comment", "address council", "council appearance", "speak to council", "present to council", "talk to council", "council request", "public speaking", "citizen comment", "voice concern", "present issue", "hablar en el concejo", "comentario público", "dirigirse al concejo", "hablar en la reunión", "comentarios del público"],
    titleEs: 'Comparecer ante el Concejo',
    descriptionEs: 'Regístrese para hablar en una reunión del concejo municipal durante el período de comentarios públicos.',
    linkTextEs: 'Registrarse'
  },

  boardsCommissions: {
    title: "Boards & Commissions",
    description: "Apply to serve on city boards and commissions. Learn about volunteer opportunities in city government.",
    url: "https://midlandtexas.gov/243/Boards-Commissions",
    email: "boardapplications@midlandtexas.gov",
    keywords: ["board", "commission", "volunteer", "serve", "apply", "board application", "committee", "advisory board", "citizen board", "planning commission", "zoning board", "volunteer opportunity", "get involved", "civic engagement", "junta", "comisión", "voluntario", "servir", "junta ciudadana", "comité"],
    titleEs: 'Juntas y Comisiones',
    descriptionEs: 'Juntas, comisiones y comités asesores de ciudadanos. Encuentre agendas, vacantes y solicitudes.',
    linkTextEs: 'Ver Juntas'
  },

  emergencyAlerts: {
    title: "Emergency Alerts - Alert Midland",
    description: "Sign up for emergency notifications including severe weather, traffic incidents, water disruptions, and facility closures.",
    url: "https://midlandtexas.gov/382/Emergency-Alerts",
    directSignup: "https://member.everbridge.net/1772417038942756/login",
    phone: "(432) 685-7234",
    keywords: ["emergency alerts", "alert midland", "notifications", "emergency notification", "weather alerts", "sign up alerts", "text alerts", "emergency messages", "weather warning", "traffic alerts", "stay informed", "get alerts", "notification system", "alertas de emergencia", "notificaciones", "alertas meteorológicas", "notificación de emergencia", "registrarse para alertas", "alertas de texto", "mensajes de emergencia", "alertas de emergencia", "notificaciones", "alertas meteorológicas", "notificación de emergencia", "registrarse para alertas", "alertas de texto", "mensajes de emergencia"],
    titleEs: 'Alertas de Emergencia',
    descriptionEs: 'Regístrese para recibir alertas de emergencia, advertencias meteorológicas y notificaciones de seguridad pública.',
    linkTextEs: 'Registrarse'
  },

  cityCharter: {
    title: "City Charter",
    description: "Read the City of Midland's charter, the document that establishes the city's government structure and powers.",
    url: "https://midlandtexas.gov/345/City-Charter",
    keywords: ["city charter", "charter", "city constitution", "government structure", "city laws", "founding document", "city rules", "legal framework", "carta de la ciudad", "carta municipal", "constitución de la ciudad"],
    titleEs: 'Carta Municipal',
    descriptionEs: 'Lea la carta de la Ciudad de Midland, el documento fundamental que establece la estructura del gobierno.',
    linkTextEs: 'Leer Carta'
  },

  cityCode: {
    title: "City Code & Ordinances",
    description: "Access Midland's municipal code and ordinances. Search city laws, regulations, and legal requirements.",
    url: "https://ecode360.com/MI6651",
    keywords: ["city code", "ordinances", "municipal code", "city law", "regulations", "legal code", "city ordinance", "laws", "rules", "code of ordinances", "legal requirements", "código de la ciudad", "ordenanzas", "código municipal", "leyes de la ciudad"],
    titleEs: 'Código Municipal',
    descriptionEs: 'Busque ordenanzas de la ciudad, códigos de zonificación y regulaciones municipales.',
    linkTextEs: 'Ver Código'
  },

  proclamations: {
    title: "Proclamation Request",
    description: "Request an official city proclamation for special events, recognition, or awareness campaigns.",
    url: "https://midlandtexas.gov/1434/Proclamation-Request",
    keywords: ["proclamation", "recognition", "special event", "awareness", "request proclamation", "city proclamation", "official recognition", "honor", "celebration", "proclamación", "reconocimiento", "evento especial"],
    titleEs: 'Proclamaciones',
    descriptionEs: 'Proclamaciones oficiales del alcalde y del concejo municipal.',
    linkTextEs: 'Ver Proclamaciones'
  },

  // ============================================================
  // 2. BUSINESS & DEVELOPMENT SERVICES
  // ============================================================

  developmentServices: {
    title: "Development Services",
    description: "Building permits, inspections, planning, and zoning services. Your one-stop shop for development in Midland.",
    url: "https://www.midlandtexas.gov/1258/Development-Services",
    phone: "(432) 685-7450",
    keywords: ["development", "building", "construction", "permits", "inspections", "zoning", "planning", "build", "develop", "new construction", "renovation", "remodel", "contractor", "desarrollo", "construcción", "permisos", "inspecciones", "zonificación", "planificación", "construir", "desarrollar", "nueva construcción", "renovación", "remodelación", "contratista"],
    titleEs: 'Servicios de Desarrollo',
    descriptionEs: 'Permisos de construcción, inspecciones, planificación y servicios de zonificación. Su ventanilla única para el desarrollo en Midland.',
    linkTextEs: 'Visitar Servicios de Desarrollo'
  },

  permitMidland: {
    title: "PermitMidland - Online Portal",
    description: "Apply for permits, pay fees, schedule inspections, and track applications 24/7 through the online portal.",
    url: "https://www.midlandtexas.gov/1424/Permit-Midland",
    portalUrl: "comapps.midlandtexas.gov/energovtest/selfservice#/home",
    phone: "(432) 685-7450",
    keywords: ["permit midland", "online permit", "apply permit", "permit application", "building permit", "permit portal", "submit permit", "permit system", "online application", "digital permit", "permiso midland", "permiso en línea", "solicitar permiso", "solicitud de permiso", "permiso de construcción", "portal de permisos", "enviar permiso", "sistema de permisos", "solicitud en línea", "permiso digital"],
    titleEs: 'PermitMidland - Portal en Línea',
    descriptionEs: 'Solicite permisos de construcción, realice un seguimiento del estado de permisos y programe inspecciones en línea.',
    linkTextEs: 'Abrir Portal'
  },

  shortTermRental: {
    title: "Short-Term Rental Information",
    description: "Learn about short-term rental regulations, requirements, and ordinances for property owners in Midland.",
    url: "https://www.midlandtexas.gov/1029/Short-Term-Rental",
    phone: "(432) 685-7450",
    keywords: ["short term rental", "str", "short-term rental", "vacation rental", "airbnb", "vrbo", "rental property", "rental permit", "rental regulations", "rental rules", "rental ordinance", "property rental", "host", "hosting", "rental compliance", "alquiler a corto plazo", "alquiler vacacional", "propiedad de alquiler", "permiso de alquiler", "regulaciones de alquiler", "reglas de alquiler", "ordenanza de alquiler", "anfitrión", "cumplimiento de alquiler"],
    titleEs: 'Información de Alquileres a Corto Plazo',
    descriptionEs: 'Aprenda sobre las regulaciones, requisitos y ordenanzas para alquileres a corto plazo en Midland.',
    linkTextEs: 'Ver Información'
  },

  shortTermRentalPermit: {
    title: "Short-Term Rental Permit Registration",
    description: "Register your short-term rental property and obtain the required permit through the Host Compliance portal.",
    url: "https://secure.hostcompliance.com/midland-tx/permit-registration/welcome",
    phone: "(432) 685-7450",
    keywords: ["short term rental permit", "str permit", "rental registration", "register rental", "rental license", "permit registration", "host compliance", "rental permit application", "str registration", "apply str permit", "register airbnb", "register vrbo", "permiso de alquiler a corto plazo", "registro de alquiler", "registrar alquiler", "licencia de alquiler", "registro de permiso", "solicitud de permiso de alquiler", "registrar airbnb", "registrar vrbo"],
    titleEs: 'Registro de Permiso de Alquiler a Corto Plazo',
    descriptionEs: 'Registre su propiedad de alquiler a corto plazo y obtenga el permiso requerido a través del portal Host Compliance.',
    linkTextEs: 'Registrar Permiso'
  },

  buildingPermits: {
    title: "Building Permits",
    description: "Get building permits for residential and commercial construction. Learn about the permit process, fees, and requirements.",
    url: "https://www.midlandtexas.gov/1269/Building-Permits",
    phone: "(432) 685-7450",
    keywords: ["building permit", "construction permit", "residential permit", "commercial permit", "permit process", "how to get permit", "permit requirements", "permit fees", "build house", "construction approval", "permiso de construcción", "permiso residencial", "permiso comercial", "proceso de permiso", "cómo obtener permiso", "requisitos de permiso", "tarifas de permiso", "construir casa", "aprobación de construcción"],
    titleEs: 'Permisos de Construcción',
    descriptionEs: 'Solicite permisos de construcción, eléctricos, de plomería y mecánicos.',
    linkTextEs: 'Solicitar Permiso'
  },

  planningZoning: {
    title: "Planning & Zoning",
    description: "Zoning verification, rezoning requests, variances, subdivisions, and site plan reviews.",
    url: "https://www.midlandtexas.gov/1261/Planning-Zoning",
    phone: "(432) 685-7400",
    keywords: ["planning", "zoning", "rezoning", "variance", "subdivision", "site plan", "land use", "zoning map", "zoning change", "property zoning", "zone verification", "plat", "planificación", "zonificación", "rezonificación", "variación", "subdivisión", "plan del sitio", "uso de la tierra", "mapa de zonificación", "cambio de zonificación", "zonificación de propiedad", "verificación de zona"],
    titleEs: 'Planificación y Zonificación',
    descriptionEs: 'Información de zonificación, mapas, casos de planificación y solicitudes de cambio de zonificación.',
    linkTextEs: 'Ver Información'
  },

  codeEnforcement: {
    title: "Code Enforcement",
    description: "Report code violations including junk vehicles, overgrown lots, illegal dumping, and unpermitted structures.",
    url: "https://www.midlandtexas.gov/1260/Code-Enforcement",
    reportUrl: "https://seeclickfix.com/midland_2",
    phone: "(432) 685-7450",
    keywords: ["code enforcement", "violation", "complaint", "junk vehicle", "tall grass", "weeds", "overgrown", "illegal dumping", "trash", "property complaint", "neighbor complaint", "yard violation", "report violation", "aplicación del código", "violación", "queja", "vehículo chatarra", "pasto alto", "maleza", "crecido", "basura ilegal", "queja de propiedad", "queja de vecino", "violación de jardín", "reportar violación"],
    titleEs: 'Cumplimiento de Códigos',
    descriptionEs: 'Reporte violaciones de códigos incluyendo vehículos chatarra, lotes descuidados, vertido ilegal y estructuras sin permiso.',
    linkTextEs: 'Reportar Violación'
  },

  seeClickFix: {
    title: "Report Issues - SeeClickFix",
    description: "Report non-emergency city issues like potholes, graffiti, streetlight outages, and code violations online.",
    url: "https://midlandtexas.gov/1193/Report-an-Issue---SeeClickFix",
    reportUrl: "https://seeclickfix.com/midland_2",
    keywords: ["report issue", "seeclickfix", "pothole", "graffiti", "streetlight", "report problem", "city issue", "maintenance issue", "broken", "damaged", "needs repair", "reportar problema", "seeclickfix", "bache", "grafiti", "alumbrado público", "reportar", "problema de la ciudad", "problema de mantenimiento", "roto", "dañado", "necesita reparación"],
    titleEs: 'Reportar Problemas - SeeClickFix',
    descriptionEs: 'Reporte problemas no emergentes de la ciudad como baches, grafiti, apagones de alumbrado público y violaciones de códigos en línea.',
    linkTextEs: 'Reportar Problema'
  },

  businessResources: {
    title: "Business Resources",
    description: "Resources for businesses in Midland including economic development, permits, and support services.",
    url: "https://midlandtexas.gov/35/Business-Resources",
    keywords: ["business", "business resources", "start business", "business support", "economic development", "business help", "entrepreneur", "business services", "commercial", "negocios", "recursos para negocios", "iniciar negocio", "apoyo para negocios", "desarrollo económico", "ayuda para negocios", "emprendedor", "servicios para negocios", "comercial"],
    titleEs: 'Recursos para Negocios',
    descriptionEs: 'Recursos para empresarios y dueños de negocios incluyendo licencias, permisos y asistencia económica.',
    linkTextEs: 'Ver Recursos'
  },

  economicDevelopment: {
    title: "Economic Development - MDC",
    description: "Midland Development Corporation offers incentives, tax abatements, and support for business growth and job creation.",
    url: "https://www.midlandtxedc.com/",
    phone: "(432) 253-8018",
    email: "saraharris@midlandtexas.gov",
    keywords: ["economic development", "mdc", "business incentives", "tax abatement", "job creation", "business expansion", "attract business", "chapter 380", "business growth", "desarrollo económico", "mdc", "incentivos para negocios", "exención de impuestos", "creación de empleos", "expansión de negocios", "atraer negocios", "capítulo 380", "crecimiento empresarial"],
    titleEs: 'Desarrollo Económico',
    descriptionEs: 'Atracción de negocios, retención, expansión e incentivos económicos en Midland.',
    linkTextEs: 'Más Información'
  },

  purchasing: {
    title: "Purchasing Department",
    description: "Information about bidding on city contracts, vendor registration, and procurement processes.",
    url: "https://midlandtexas.gov/155/Purchasing",
    keywords: ["purchasing", "procurement", "bid", "vendor", "contract", "rfp", "request for proposal", "sell to city", "city contract", "bidding", "compras", "adquisiciones", "licitación", "proveedor", "contrato", "rfp", "solicitud de propuestas", "vender a la ciudad", "contrato de la ciudad", "licitación"],
    titleEs: 'Compras',
    descriptionEs: 'Licitaciones, solicitudes de propuestas y oportunidades para proveedores de la ciudad.',
    linkTextEs: 'Ver Licitaciones'
  },

  feeSchedule: {
    title: "Fee Schedule",
    description: "View the complete schedule of city fees for permits, services, and applications.",
    url: "https://midlandtexas.gov/1113/Fee-Schedule",
    keywords: ["fee schedule", "fees", "cost", "how much", "price", "charges", "payment", "rates", "fee amount", "calendario de tarifas", "tarifas", "costo", "cuánto cuesta", "precio", "cargos", "pago", "tarifas", "monto de tarifa"],
    titleEs: 'Programa de Tarifas',
    descriptionEs: 'Vea el programa completo de tarifas de la ciudad para permisos, licencias y servicios. Encuentre información sobre costos de desarrollo, tarifas de utilidades y tarifas de servicios.',
    linkTextEs: 'Ver Tarifas'
  },

  // ============================================================
  // 3. OIL & GAS SERVICES
  // ============================================================

  oilGasServices: {
    title: "Oil & Gas Services",
    description: "Permits and regulations for oil and gas drilling, re-entry, and production within city limits.",
    url: "https://midlandtexas.gov/1483/Oil-and-Gas-Services",
    phone: "(432) 522-8690",
    email: "gclayton@midlandtexas.gov",
    keywords: ["oil and gas", "drilling", "well permit", "oil permit", "gas permit", "drilling permit", "energy", "petroleum", "oil well", "gas well", "drilling application", "re-entry", "rework", "petróleo y gas", "perforación", "permiso de pozo", "permiso de petróleo", "permiso de gas", "energía", "petróleo", "pozo de petróleo", "pozo de gas", "aplicación de perforación"],
    titleEs: 'Servicios de Petróleo y Gas',
    descriptionEs: 'Permisos y regulaciones para perforación, reingreso y producción de petróleo y gas dentro de los límites de la ciudad.',
    linkTextEs: 'Visitar Servicios de Petróleo y Gas'
  },

  oilGasFAQ: {
    title: "Oil & Gas FAQ",
    description: "Frequently asked questions about oil and gas operations, permits, and regulations in Midland.",
    url: "https://midlandtexas.gov/1486/Oil-and-Gas-FAQ",
    phone: "(432) 522-8690",
    keywords: ["oil gas faq", "drilling questions", "oil permit questions", "drilling regulations", "oil gas rules", "drilling requirements", "preguntas frecuentes petróleo gas", "preguntas sobre perforación", "preguntas sobre permisos de petróleo", "regulaciones de perforación", "reglas de petróleo y gas", "requisitos de perforación"],
    titleEs: 'Preguntas Frecuentes de Petróleo y Gas',
    descriptionEs: 'Preguntas comunes sobre regulaciones de petróleo y gas, permisos y operaciones dentro de los límites de la ciudad.',
    linkTextEs: 'Ver Preguntas'
  },

  oilGasCommittee: {
    title: "Oil & Gas Committee",
    description: "Information about the city's Energy Advisory Commission that oversees oil and gas operations.",
    url: "https://midlandtexas.gov/1493/Oil-and-Gas-Committee",
    keywords: ["oil gas committee", "energy committee", "energy advisory", "drilling oversight", "oil gas board", "comité de petróleo y gas", "comité de energía", "asesor de energía", "supervisión de perforación", "junta de petróleo y gas"],
    titleEs: 'Comité de Petróleo y Gas',
    descriptionEs: 'Información sobre el Comité de Petróleo y Gas de la Ciudad de Midland. Aprenda sobre regulaciones de petróleo y gas, reuniones del comité e información de la industria.',
    linkTextEs: 'Ver Comité'
  },

  // ============================================================
  // 4. ANIMAL SERVICES
  // ============================================================

  animalServices: {
    title: "Animal Services",
    description: "Pet adoption, lost and found pets, spay/neuter vouchers, and animal control services.",
    url: "https://midlandtexas.gov/404/Animal-Services",
    phone: "(432) 685-7420",
    afterHours: "(432) 685-7108",
    address: "1200 N Fairgrounds Road, Midland, TX 79706",
    keywords: ["animal services", "animal control", "pet", "dog", "cat", "animal shelter", "adopt", "lost pet", "found pet", "stray animal", "animal complaint", "loose dog", "puppy", "puppies", "kitten", "kittens", "servicios de animales", "control de animales", "mascota", "perro", "gato", "refugio de animales", "adoptar", "mascota perdida", "animal perdido", "animal callejero", "queja de animales", "perro suelto", "cachorro", "cachorros", "gatito", "gatitos"],
    titleEs: 'Servicios de Animales',
    descriptionEs: 'Adopción de mascotas, mascotas perdidas y encontradas, cupones de esterilización/castración y servicios de control de animales.',
    linkTextEs: 'Visitar Servicios de Animales'
  },

  petAdoption: {
    title: "Adopt a Pet",
    description: "View available pets for adoption. All adoptions include spay/neuter, vaccinations, and microchip.",
    url: "https://midlandtexas.gov/145/Adopt-a-Pet",
    phone: "(432) 685-7420",
    keywords: ["adopt pet", "adopt dog", "adopt cat", "adoption", "available pets", "rescue", "shelter pets", "adopt animal", "pet adoption", "find pet", "adopt puppy", "adopt kitten", "puppies", "kittens", "dogs for adoption", "cats for adoption", "adoptar mascota", "adoptar perro", "adoptar gato", "adopción", "mascotas disponibles", "rescate", "mascotas del refugio", "adoptar cachorro", "adoptar gatito", "cachorros", "gatitos", "perros en adopción", "gatos en adopción"],
    titleEs: 'Adoptar una Mascota',
    descriptionEs: 'Vea las mascotas disponibles para adopción. Todas las adopciones incluyen esterilización/castración, vacunas y microchip.',
    linkTextEs: 'Ver Mascotas'
  },

  lostPets: {
    title: "Lost Pets",
    description: "Report a lost pet and learn how to search for your missing animal. Partnership with Petco Love Lost.",
    url: "https://www.midlandtexas.gov/1195/Lost-Pets",
    phone: "(432) 685-7420",
    keywords: ["lost pet", "missing pet", "lost dog", "lost cat", "find my pet", "pet missing", "lost animal", "can't find pet", "pet ran away", "mascota perdida", "perro perdido", "gato perdido", "encontrar mi mascota", "animal perdido", "no encuentro mi mascota", "mascota se escapó"],
    titleEs: 'Mascotas Perdidas',
    descriptionEs: 'Reporte una mascota perdida y aprenda cómo buscar a su animal desaparecido. Asociación con Petco Love Lost.',
    linkTextEs: 'Reportar Mascota Perdida'
  },

  foundPets: {
    title: "Found Pets",
    description: "Report a found pet or search for pets that have been brought to the shelter.",
    url: "https://www.midlandtexas.gov/1326/Found-Pets",
    phone: "(432) 685-7420",
    keywords: ["found pet", "found dog", "found cat", "found animal", "stray pet", "found stray", "picked up pet", "mascota encontrada", "perro encontrado", "gato encontrado", "animal encontrado", "mascota callejera", "recogí mascota"],
    titleEs: 'Mascotas Encontradas',
    descriptionEs: 'Reporte una mascota encontrada o busque mascotas en el refugio de animales.',
    linkTextEs: 'Buscar Mascotas'
  },

  spayNeuterVoucher: {
    title: "Spay/Neuter Voucher Program",
    description: "$70 voucher for spay/neuter surgery at any Midland County vet. City residents only.",
    url: "https://www.midlandtexas.gov/1185/Spay-and-Neuter-Voucher",
    phone: "(432) 685-7420",
    keywords: ["spay neuter", "spay", "neuter", "voucher", "fix pet", "surgery voucher", "low cost spay", "affordable neuter", "pet surgery", "spay voucher", "esterilizar", "castrar", "vale", "cupón", "cirugía de mascota", "esterilización económica"],
    titleEs: 'Cupones de Esterilización/Castración',
    descriptionEs: 'Cupones de bajo costo para esterilización y castración disponibles para residentes calificados.',
    linkTextEs: 'Solicitar Cupón'
  },

  tnrProgram: {
    title: "TNR (Trap-Neuter-Return) Program",
    description: "Program for feral and community cats. Trap, neuter/spay, and return to manage cat populations humanely.",
    url: "https://www.midlandtexas.gov/1186/TNR-Program",
    phone: "(432) 685-7420",
    keywords: ["tnr", "trap neuter return", "feral cats", "community cats", "stray cats", "outdoor cats", "cat colony", "wild cats", "tnr", "atrapar esterilizar devolver", "gatos ferales", "gatos comunitarios", "gatos callejeros", "gatos al aire libre", "colonia de gatos", "gatos salvajes"],
    titleEs: 'Programa TNR (Atrapar-Esterilizar-Devolver)',
    descriptionEs: 'Programa comunitario de gatos para controlar humanamente las poblaciones de gatos callejeros.',
    linkTextEs: 'Más Información'
  },

  animalVolunteer: {
    title: "Animal Services Volunteer",
    description: "Volunteer at the animal shelter. Help with animal care, socialization, and adoption events.",
    url: "https://www.midlandtexas.gov/1189/Volunteer-Program",
    phone: "(432) 685-7420",
    keywords: ["animal volunteer", "shelter volunteer", "volunteer with animals", "help animals", "volunteer shelter", "animal volunteer program", "voluntario de animales", "voluntario del refugio", "voluntario con animales", "ayudar animales", "voluntario del refugio", "programa de voluntarios de animales"],
    titleEs: 'Voluntariado en el Refugio de Animales',
    descriptionEs: 'Oportunidades de voluntariado en el refugio de animales de Midland.',
    linkTextEs: 'Ser Voluntario'
  },

  // ============================================================
  // 5. PUBLIC SAFETY - FIRE DEPARTMENT
  // ============================================================

  fireDepartment: {
    title: "Fire Department",
    description: "Fire suppression, EMS, HAZMAT, rescue services. 11 stations covering 900+ square miles. ISO Class 1 rated.",
    url: "https://midlandtexas.gov/1426/Fire",
    emergency: "911",
    nonEmergency: "(432) 685-7220",
    fireMarshal: "(432) 685-7333",
    email: "fireinfo@midlandtexas.gov",
    address: "1500 W. Wall Street, Midland, TX 79701",
    keywords: ["fire department", "fire", "firefighter", "fire station", "ems", "ambulance", "paramedic", "fire safety", "smoke detector", "fire inspection", "fire marshal", "hazmat", "rescue", "departamento de bomberos", "bomberos", "fuego", "estación de bomberos", "ambulancia", "paramédico", "seguridad contra incendios", "detector de humo", "inspección de incendios", "rescate"],
    titleEs: 'Departamento de Bomberos',
    descriptionEs: 'Información sobre el Departamento de Bomberos de Midland. Servicios de emergencia, prevención de incendios, seguridad pública y programas comunitarios.',
    linkTextEs: 'Visitar Bomberos'
  },

  bloodPressureChecks: {
    title: "Free Blood Pressure Checks",
    description: "FREE blood pressure checks at all 11 fire stations daily from 8 AM to 8 PM.",
    url: "https://midlandtexas.gov/1426/Fire",
    phone: "(432) 685-7220",
    keywords: ["blood pressure", "bp check", "health screening", "free health check", "blood pressure test", "bp screening", "health service", "presión arterial", "control de presión", "examen de salud", "control de salud gratis", "prueba de presión arterial", "examen de presión arterial", "servicio de salud"],
    titleEs: 'Controles de Presión Arterial Gratuitos',
    descriptionEs: 'Controles de presión arterial GRATUITOS en las 11 estaciones de bomberos diariamente de 8 AM a 8 PM.',
    linkTextEs: 'Más Información'
  },

  carSeatSafety: {
    title: "Car Seat Safety Checks",
    description: "Free car seat safety inspections and installation assistance from certified technicians.",
    url: "https://midlandtexas.gov/1426/Fire",
    phone: "(432) 685-7436",
    keywords: ["car seat", "child safety", "car seat check", "car seat installation", "child car seat", "infant seat", "booster seat", "car seat safety", "asiento de auto", "seguridad infantil", "revisión de asiento de auto", "instalación de asiento de auto", "asiento de auto para niños", "asiento infantil", "asiento elevado", "seguridad de asiento de auto"],
    titleEs: 'Seguridad de Asientos para Niños',
    descriptionEs: 'Inspecciones gratuitas de asientos para niños y capacitación sobre instalación adecuada.',
    linkTextEs: 'Programar Inspección'
  },

  // ============================================================
  // 6. PUBLIC SAFETY - POLICE DEPARTMENT
  // ============================================================

  policeDepartment: {
    title: "Police Department",
    description: "Law enforcement services, crime prevention, and community policing for the City of Midland.",
    url: "https://midlandtexas.gov/1428/Police-Department",
    emergency: "911",
    nonEmergency: "(432) 685-7108",
    records: "(432) 685-7145",
    email: "mpdrecruitment@midlandtexas.gov",
    address: "601 N. Loraine Street, Midland, TX 79701",
    keywords: ["police", "police department", "law enforcement", "cop", "officer", "crime", "report crime", "police report", "theft", "burglary", "assault", "safety", "policía", "departamento de policía", "policias", "oficial", "agente", "crimen", "reportar crimen", "reporte policial", "robo", "asalto", "seguridad", "no emergencia", "número de policía"],
    titleEs: 'Departamento de Policía',
    descriptionEs: 'Contacte al Departamento de Policía de Midland para asistencia no urgente, reportes policiales e información general',
    linkTextEs: 'Visitar Departamento de Policía'
  },

  filePoliceReport: {
    title: "File a Police Report",
    description: "File non-emergency police reports online or by phone for graffiti, theft, vandalism, lost property, and more.",
    url: "https://www.midlandtexas.gov/512/File-A-Police-Report",
    phone: "(432) 685-7108",
    keywords: ["police report", "file report", "report crime", "theft report", "burglary report", "vandalism report", "lost property", "crime report", "incident report", "reporte policial", "hacer reporte", "reportar crimen", "reporte de robo", "reporte de vandalismo", "propiedad perdida", "denuncia", "hacer denuncia"],
    titleEs: 'Presentar Reporte Policial',
    descriptionEs: 'Presente un reporte policial en línea para incidentes no urgentes como robo, vandalismo o daño a la propiedad',
    linkTextEs: 'Presentar Reporte'
  },

  policeRecruiting: {
    title: "Become a Police Officer",
    description: "Join the Midland Police Department. Learn about requirements, benefits, and the application process.",
    url: "https://www.midlandtexas.gov/1316/Become-a-Police-Officer",
    email: "mpdrecruitment@midlandtexas.gov",
    keywords: ["police jobs", "become officer", "police recruiting", "join police", "police career", "law enforcement job", "police hiring", "police academy", "trabajo de policía", "ser oficial", "reclutamiento policial", "unirse a la policía", "carrera policial", "empleo", "contratación policial", "academia de policía"],
    titleEs: 'Reclutamiento Policial',
    descriptionEs: 'Únase al Departamento de Policía de Midland. Información sobre carreras, beneficios y proceso de solicitud.',
    linkTextEs: 'Solicitar Ahora'
  },

  citizensPoliceAcademy: {
    title: "Citizens Police Academy",
    description: "Free 10-week program to learn about police operations, training, and community relations.",
    url: "https://www.midlandtexas.gov/315/Citizen-Police-Academy",
    keywords: ["citizens academy", "police academy", "community program", "police training", "ride along", "police education", "academia ciudadana", "academia de policía", "programa comunitario", "entrenamiento policial", "educación policial"],
    titleEs: 'Academia Ciudadana de Policía',
    descriptionEs: 'Programa educativo de 12 semanas para aprender sobre operaciones policiales y seguridad pública.',
    linkTextEs: 'Más Información'
  },

  nationalNightOut: {
    title: "National Night Out",
    description: "Annual community-building campaign promoting police-community partnerships and neighborhood camaraderie.",
    url: "https://www.midlandtexas.gov/318/National-Night-Out",
    keywords: ["national night out", "neighborhood watch", "community event", "police community", "block party", "crime prevention", "noche nacional", "vigilancia vecinal", "evento comunitario", "fiesta de vecinos", "prevención del crimen"],
    titleEs: 'Noche Nacional de Salida',
    descriptionEs: 'Únase a la Noche Nacional de Salida, un evento anual de seguridad y participación comunitaria. Conozca a la policía local, bomberos y vecinos.',
    linkTextEs: 'Ver Evento'
  },

  // ============================================================
  // 7. HEALTH & COURT SERVICES
  // ============================================================

  healthServices: {
    title: "Midland Health Services",
    description: "Immunizations, vaccines, TB testing, STD testing, pregnancy testing, and public health services. Appointments required.",
    url: "https://midlandtexas.gov/232/Midland-Health-Services",
    phone: "(432) 685-7305",
    altPhone: "(432) 681-7613",
    appointmentUrl: "patientportal.intelichart.com/login/Account/Login",
    address: "3303 W. Illinois Avenue, Space 22, Midland, TX 79703",
    keywords: ["health services", "health department", "immunizations", "vaccines", "shots", "flu shot", "tb test", "std test", "hiv test", "pregnancy test", "public health", "clinic", "servicios de salud", "departamento de salud", "inmunizaciones", "vacunas", "inyecciones", "vacuna contra la gripe", "prueba de tuberculosis", "prueba de ets", "prueba de vih", "prueba de embarazo", "salud pública", "clínica"],
    titleEs: 'Servicios de Salud de Midland',
    descriptionEs: 'Inmunizaciones, vacunas, pruebas de tuberculosis, pruebas de ETS, pruebas de embarazo y servicios de salud pública. Se requiere cita.',
    linkTextEs: 'Visitar Servicios de Salud'
  },

  seniorServices: {
    title: "Senior Services",
    description: "Senior centers, nutrition programs, activities, and health screenings for older adults.",
    url: "https://midlandtexas.gov/232/Midland-Health-Services",
    phone: "(432) 685-7340",
    keywords: ["senior services", "senior center", "elderly", "senior citizens", "older adults", "senior programs", "senior activities", "meals on wheels", "servicios para adultos mayores", "centro para personas mayores", "ancianos", "adultos mayores", "personas mayores", "programas para mayores", "actividades para mayores", "comidas sobre ruedas"],
    titleEs: 'Servicios para Personas Mayores',
    descriptionEs: 'Programas y recursos para adultos mayores incluyendo centros para personas mayores, actividades y servicios de apoyo.',
    linkTextEs: 'Ver Servicios'
  },

  municipalCourt: {
    title: "Municipal Court",
    description: "Pay traffic tickets, request defensive driving, court appearances, and fine payments.",
    url: "https://midlandtexas.gov/184/Municipal-Court",
    phone: "(432) 685-7234",
    paymentsPhone: "(432) 685-7235",
    email: "court@midlandtexas.gov",
    paymentUrl: "https://midlandtx.tylertech.cloud/Court/EPE/PayTickets",
    address: "300 N. Loraine Street, Suite 206",
    keywords: ["court", "municipal court", "traffic ticket", "citation", "fine", "pay ticket", "court date", "defensive driving", "deferred disposition", "ticket payment", "court appearance", "corte", "corte municipal", "multa de tránsito", "citación", "multa", "pagar multa", "fecha de corte", "manejo defensivo", "disposición diferida", "pago de multa", "comparecencia"],
    titleEs: 'Corte Municipal',
    descriptionEs: 'Pague multas, programe audiencias judiciales y obtenga información sobre procedimientos judiciales.',
    linkTextEs: 'Visitar Corte'
  },

  payTicket: {
    title: "Pay Traffic Ticket Online",
    description: "Pay your traffic citation online 24/7 with credit card, debit card, or e-check.",
    url: "https://midlandtx.tylertech.cloud/Court/EPE/PayTickets",
    altUrl: "https://www.municipalonlinepayments.com/midlandtx",
    phone: "(432) 685-7235",
    keywords: ["pay ticket", "ticket payment", "pay citation", "traffic fine", "online payment", "pay fine", "court payment", "pagar multa", "pagar citación", "multa de tránsito", "pago en línea", "pagar infracción", "pago de corte"],
    titleEs: 'Pagar Multa',
    descriptionEs: 'Pague multas de tráfico, citaciones de la corte municipal y violaciones de códigos en línea.',
    linkTextEs: 'Pagar en Línea'
  },

  defensiveDriving: {
    title: "Defensive Driving Course",
    description: "Take defensive driving to dismiss your ticket. Learn about eligibility and how to request the course.",
    url: "https://midlandtexas.gov/186/Ticket-Information",
    phone: "(432) 685-7234",
    keywords: ["defensive driving", "driving safety course", "ticket dismissal", "dismiss ticket", "traffic school", "driver improvement", "take class", "manejo defensivo", "curso de seguridad de manejo", "desestimación de multa", "desestimar multa", "escuela de tráfico", "mejoramiento del conductor", "tomar clase"],
    titleEs: 'Curso de Manejo Defensivo',
    descriptionEs: 'Tome un curso de manejo defensivo para desestimar una multa de tráfico o reducir puntos del seguro.',
    linkTextEs: 'Registrarse'
  },

  deferredDisposition: {
    title: "Deferred Disposition (Probation)",
    description: "Request probation for your traffic ticket. Complete probation successfully and have your ticket dismissed.",
    url: "https://midlandtexas.gov/186/Ticket-Information",
    phone: "(432) 685-7234",
    keywords: ["deferred disposition", "probation", "ticket probation", "deferred adjudication", "probation ticket", "disposición diferida", "libertad condicional", "libertad condicional de multa", "adjudicación diferida", "multa de libertad condicional"],
    titleEs: 'Disposición Diferida',
    descriptionEs: 'Solicite disposición diferida para multas de tráfico elegibles para completar un período de prueba.',
    linkTextEs: 'Solicitar'
  },

  // ============================================================
  // 8. PARKS & RECREATION
  // ============================================================

  parksRecreation: {
    title: "Parks & Recreation",
    description: "29 neighborhood parks, 8 community parks, pools, recreation programs, and facility rentals across Midland.",
    url: "https://midlandtexas.gov/194/Parks-Recreation",
    phone: "(432) 685-7360",
    aquaticsPhone: "(432) 685-7368",
    address: "2701 Elizabeth Ave., Midland, TX 79701",
    keywords: ["parks", "recreation", "parks and rec", "playground", "park", "recreation center", "community center", "activities", "programs", "sports", "parques", "recreación", "parques y recreación", "área de juegos", "parque", "centro recreativo", "centro comunitario", "actividades", "programas", "deportes"],
    titleEs: 'Parques y Recreación',
    descriptionEs: 'Parques de Midland, instalaciones recreativas, ligas deportivas, centros comunitarios y programas.',
    linkTextEs: 'Explorar Parques'
  },

  parkReservations: {
    title: "Reserve Parks & Facilities",
    description: "Book pavilions, fields, courts, and facilities online for events, parties, and activities.",
    url: "https://midlandtexas.gov/882/Online-Reservations",
    bookingUrl: "https://midlandtexas.gov/1147/Recreation-Registration",
    phone: "(432) 685-7360",
    keywords: ["reserve park", "rent pavilion", "book facility", "park rental", "pavilion rental", "reserve field", "book court", "party rental", "event space", "reservar parque", "alquilar pabellón", "reservar instalación", "alquiler de parque", "alquiler de pabellón", "reservar campo", "reservar cancha", "alquiler para fiesta", "espacio para eventos"],
    titleEs: 'Reservaciones de Parques',
    descriptionEs: 'Reserve refugios de parques, instalaciones deportivas y espacios para eventos.',
    linkTextEs: 'Hacer Reservación'
  },

  mlkCommunityCenter: {
    title: "MLK Community Center",
    description: "23,000 sq ft community center with gym, meeting rooms, and programming. Open 6 days a week.",
    url: "https://www.midlandtexas.gov/208/MLK-Community-Center",
    phone: "(432) 685-7355",
    address: "2300 Butternut Lane, Midland, TX 79705",
    keywords: ["mlk center", "community center", "martin luther king center", "rec center", "gym", "basketball court", "meeting room", "community space", "centro mlk", "centro comunitario", "centro martin luther king", "centro recreativo", "gimnasio", "cancha de baloncesto", "sala de reuniones", "espacio comunitario"],
    titleEs: 'Centro Comunitario MLK Jr.',
    descriptionEs: 'Programas, clases, eventos y alquiler de instalaciones en el Centro Comunitario MLK Jr.',
    linkTextEs: 'Visitar Centro'
  },

  swimmingPools: {
    title: "Swimming Pools & Aquatics",
    description: "Public swimming pools open Memorial Day to Labor Day. $5 admission. Multiple locations across Midland.",
    url: "https://midlandtexas.gov/1689/Midland-Swimming-Pools",
    phone: "(432) 685-7368",
    keywords: ["swimming pool", "pool", "swim", "swimming", "aquatics", "water park", "splash pad", "public pool", "swimming lessons", "piscina", "alberca", "nadar", "natación", "parque acuático", "piscina pública", "clases de natación"],
    titleEs: 'Piscinas',
    descriptionEs: 'Horarios de piscinas públicas, tarifas de admisión, lecciones de natación y eventos acuáticos.',
    linkTextEs: 'Ver Piscinas'
  },

  splashPads: {
    title: "Splash Pads",
    description: "FREE splash pads at multiple neighborhood parks. Open April through October, dawn to dusk.",
    url: "https://midlandtexas.gov/1692/Neighborhood-Parks",
    keywords: ["splash pad", "water play", "spray park", "water playground", "free pool", "kids water", "chapoteadero", "juego de agua", "parque de spray", "área de juegos de agua", "piscina gratis", "agua para niños"],
    titleEs: 'Áreas de Chapoteo',
    descriptionEs: 'Ubicaciones de áreas de chapoteo gratuitas, horarios de operación y comodidades.',
    linkTextEs: 'Encontrar Áreas'
  },

  hoganParkGolf: {
    title: "Hogan Park Golf Course",
    description: "Two championship golf courses: Roadrunner (Par 72) and Quail (Par 70). Book tee times online.",
    url: "https://midlandtexas.gov/1425/Hogan-Park-Golf-Course",
    teeTimesUrl: "https://midlandtexas.gov/1362/Book-a-Tee-Time",
    phone: "(432) 685-7360",
    address: "3600 N. Fairgrounds Rd., Midland, TX 79705",
    keywords: ["golf", "golf course", "hogan park", "tee time", "golf reservation", "driving range", "play golf", "golf booking", "roadrunner", "quail course", "golf", "campo de golf", "hogan park", "hora de salida", "reserva de golf", "campo de práctica", "jugar golf", "reserva de golf", "roadrunner", "campo quail"],
    titleEs: 'Campo de Golf Hogan Park',
    descriptionEs: 'Campo de golf público de 36 hoyos con casa club, tienda profesional y campos de práctica.',
    linkTextEs: 'Visitar Campo'
  },

  scharbauerSports: {
    title: "Scharbauer Sports Complex",
    description: "94-acre sports complex with baseball, softball, and soccer fields. Home to RockHounds and Sockers.",
    url: "https://midlandtexas.gov/1097/Scharbauer-Sports-Complex",
    phone: "(432) 689-0864",
    address: "5514 Champions Drive, Midland, TX 79706",
    keywords: ["scharbauer", "sports complex", "baseball field", "soccer field", "softball field", "stadium", "rockhounds", "sports facility", "scharbauer", "complejo deportivo", "campo de béisbol", "campo de fútbol", "campo de softbol", "estadio", "rockhounds", "instalación deportiva"],
    titleEs: 'Complejo Deportivo Scharbauer',
    descriptionEs: 'Instalaciones deportivas de última generación para béisbol, softball, fútbol y otros deportes.',
    linkTextEs: 'Ver Complejo'
  },

  specialEventPermit: {
    title: "Special Event Permit",
    description: "Get a permit for large events (50+ people) in city parks. Required for festivals, tournaments, and gatherings.",
    url: "https://midlandtexas.gov/564/Special-Event-Permit",
    phone: "(432) 685-7360",
    keywords: ["special event", "event permit", "festival permit", "tournament permit", "large event", "park event", "event application", "evento especial", "permiso de evento", "permiso de festival", "torneo", "evento grande", "solicitud de evento"],
    titleEs: 'Permiso para Eventos Especiales',
    descriptionEs: 'Solicite permisos para eventos especiales, carreras, desfiles y reuniones públicas.',
    linkTextEs: 'Solicitar Permiso'
  },

  chalkTheBlock: {
    title: "Chalk the Block",
    description: "Annual sidewalk chalk art festival in downtown Midland. Family-friendly community event.",
    url: "https://midlandtexas.gov/1301/Chalk-the-Block",
    keywords: ["chalk the block", "chalk art", "chalk festival", "downtown event", "art festival", "family event", "chalk the block", "arte con tiza", "festival de tiza", "evento del centro", "festival de arte", "evento familiar"],
    titleEs: 'Chalk the Block',
    descriptionEs: 'Festival anual de arte con tiza en el centro de Midland con artistas, vendedores y entretenimiento.',
    linkTextEs: 'Información del Evento'
  },

  christmasParade: {
    title: "Christmas Parade",
    description: "Annual Christmas parade through downtown Midland featuring floats, bands, and Santa Claus.",
    url: "https://midlandtexas.gov/1353/Christmas-Parade",
    keywords: ["christmas parade", "holiday parade", "santa parade", "xmas parade", "christmas event", "desfile de navidad", "desfile navideño", "desfile de santa", "desfile de xmas", "evento navideño"],
    titleEs: 'Desfile de Navidad',
    descriptionEs: 'Desfile anual de Navidad de Midland con carrozas, bandas y Santa Claus.',
    linkTextEs: 'Detalles del Desfile'
  },

  merryLights: {
    title: "Midland's Merry Lights",
    description: "Holiday light displays and festivities throughout Midland during the Christmas season.",
    url: "https://midlandtexas.gov/1351/Midlands-Merry-Lights",
    keywords: ["christmas lights", "holiday lights", "merry lights", "christmas display", "light show", "luces de navidad", "luces navideñas", "merry lights", "exhibición de navidad", "espectáculo de luces"],
    titleEs: 'Merry Lights',
    descriptionEs: 'Exhibición de luces navideñas en Centennial Plaza con decoraciones festivas.',
    linkTextEs: 'Ver Luces'
  },

  treeLighting: {
    title: "Tree Lighting Ceremony",
    description: "Annual downtown tree lighting ceremony to kick off the holiday season in Midland.",
    url: "https://midlandtexas.gov/1352/Tree-Lighting-Ceremony",
    keywords: ["tree lighting", "christmas tree", "holiday ceremony", "downtown lights", "tree ceremony", "holiday tree", "christmas event", "downtown christmas", "holiday season", "winter celebration", "encendido del árbol", "árbol de navidad", "ceremonia navideña", "luces del centro", "ceremonia del árbol", "árbol navideño", "evento navideño", "navidad del centro", "temporada navideña", "celebración de invierno"],
    titleEs: 'Ceremonia del Árbol de Navidad',
    descriptionEs: 'Ceremonia anual de iluminación del árbol de Navidad con música, entretenimiento y aparición de Santa.',
    linkTextEs: 'Información del Evento'
  },

  moviesInPark: {
    title: "Movies in the Park",
    description: "FREE outdoor movie screenings in city parks during summer months. Bring blankets and chairs!",
    url: "https://midlandtexas.gov/1245/Movies-in-the-Park",
    keywords: ["movies in park", "outdoor movie", "free movie", "park movie", "movie night", "películas en el parque", "película al aire libre", "película gratis", "película en el parque", "noche de película"],
    titleEs: 'Películas en el Parque',
    descriptionEs: 'Proyecciones gratuitas de películas al aire libre en parques durante los meses de verano.',
    linkTextEs: 'Ver Horario'
  },

  // ============================================================
  // 9. UTILITIES & PUBLIC WORKS
  // ============================================================

  utilities: {
    title: "Utility Billing",
    description: "Water, sewer, and solid waste services. Start/stop service, pay bills, and report issues.",
    url: "https://www.midlandtexas.gov/166/Utilities",
    phone: "(432) 685-7500",
    customerService: "(432) 685-7270",
    afterHours: "(432) 685-7340",
    email: "cs@midlandtexas.gov",
    portalUrl: "https://water.midlandtexas.gov",
    address: "1030 Andrews Hwy #220",
    keywords: ["utilities", "water", "sewer", "water bill", "utility bill", "water service", "pay water bill", "start water", "stop water", "trash service", "utilidades", "agua", "alcantarillado", "factura de agua", "factura de utilidades", "servicio de agua", "pagar factura de agua", "iniciar servicio", "detener servicio", "servicio de basura"],
    titleEs: 'Facturación de Servicios Públicos',
    descriptionEs: 'Gestione su cuenta de agua, vea su factura y configure pagos automáticos con el Departamento de Facturación de Servicios Públicos',
    linkTextEs: 'Visitar Facturación de Servicios Públicos'
  },

  startWaterService: {
    title: "Start Water Service",
    description: "Apply for new water service online or in person. Bring valid ID and lease/closing paperwork.",
    url: "https://midlandtexas.gov/169/Utility-Services",
    portalUrl: "https://water.midlandtexas.gov",
    phone: "(432) 685-7270",
    keywords: ["start water", "new service", "turn on water", "water connection", "new water account", "activate water", "water hookup", "iniciar agua", "nuevo servicio", "abrir agua", "conexión de agua", "nueva cuenta de agua", "activar agua", "conectar agua"],
    titleEs: 'Iniciar Servicio de Agua',
    descriptionEs: 'Inicie el servicio de agua para su residencia o negocio. Solicite nuevas conexiones de agua, transferencias de servicio y configuración de cuentas.',
    linkTextEs: 'Iniciar Servicio'
  },

  payWaterBill: {
    title: "Pay Water Bill Online",
    description: "Pay your water, sewer, and trash bill online 24/7. Visa, MasterCard, Discover, and e-check accepted.",
    url: "https://water.midlandtexas.gov",
    altUrl: "https://midlandtexas.gov/Pay",
    phone: "(432) 685-7270",
    keywords: ["pay water bill", "water bill payment", "utility payment", "pay utilities", "online bill pay", "water bill", "pagar factura de agua", "pagar agua", "pago de factura", "pagar utilidades", "pago en línea", "factura de agua", "autopago"],
    titleEs: 'Pagar Factura de Agua en Línea',
    descriptionEs: 'Pague su factura de agua de forma segura en línea con tarjeta de crédito, débito o cuenta bancaria',
    linkTextEs: 'Pagar Factura'
  },

  waterAccountLogin: {
    title: "Water Account Login",
    description: "Access your water utility account to view bills, manage payments, set up autopay, update account information, and view usage history.",
    url: "https://water.midlandtexas.gov/app/login.jsp",
    openInNewTab: true,
    phone: "(432) 685-7275",
    keywords: ["water account", "utility account", "login", "water login", "account access", "my account", "view bill", "usage", "autopay", "account management", "water portal", "cuenta de agua", "portal de agua", "iniciar sesión", "mi cuenta", "ver factura", "uso de agua", "pago automático"],
    titleEs: 'Inicio de Sesión de Cuenta de Agua',
    descriptionEs: 'Acceda a su cuenta de servicios públicos de agua para ver facturas, administrar pagos y actualizar información de la cuenta.',
    linkTextEs: 'Iniciar Sesión'
  },

  waterEmergency: {
    title: "Report Water Emergency",
    description: "Report water main breaks, leaks, and water emergencies 24/7.",
    url: "https://midlandtexas.gov/166/Utilities",
    phone: "(432) 685-7340",
    keywords: ["water emergency", "water leak", "main break", "water line break", "no water", "water problem", "burst pipe", "emergencia de agua", "fuga de agua", "ruptura de tubería", "sin agua", "problema de agua", "tubería rota"],
    titleEs: 'Emergencia de Agua',
    descriptionEs: 'Reporte emergencias relacionadas con el agua incluyendo fugas principales, roturas de tuberías, desbordamientos de alcantarillado y problemas de calidad del agua. Contacto de emergencia 24/7.',
    linkTextEs: 'Reportar Emergencia'
  },

  waterConservation: {
    title: "Water Conservation & Watering Schedule",
    description: "MANDATORY watering schedule: Even addresses water Sunday/Monday/Wednesday/Friday. Odd addresses water Sunday/Tuesday/Thursday/Saturday. Violations up to $500.",
    url: "https://midlandtexas.gov/166/Utilities",
    keywords: ["water conservation", "watering schedule", "lawn watering", "irrigation", "water restrictions", "when can i water", "watering days", "water rules", "conservación de agua", "horario de riego", "regar césped", "irrigación", "restricciones de agua", "cuándo puedo regar", "días de riego", "reglas de agua"],
    titleEs: 'Conservación de Agua',
    descriptionEs: 'Aprenda sobre programas de conservación de agua, consejos para ahorrar agua y reembolsos disponibles',
    linkTextEs: 'Aprender Más'
  },

  solidWaste: {
    title: "Solid Waste & Trash Service",
    description: "Weekly residential trash pickup, bulk item collection, recycling, and landfill services.",
    url: "https://midlandtexas.gov/149/Solid-Waste",
    phone: "(432) 685-7275",
    email: "solidwaste@midlandtexas.gov",
    address: "401 N. Carver St.",
    keywords: ["trash", "garbage", "solid waste", "trash pickup", "garbage collection", "trash service", "waste management", "sanitation", "basura", "desperdicios", "recolección de basura", "servicio de basura", "gestión de residuos", "saneamiento"],
    titleEs: 'Recolección de Basura y Reciclaje',
    descriptionEs: 'Horarios de recolección de basura, reciclaje, recolección de artículos grandes y servicios de desechos sólidos.',
    linkTextEs: 'Ver Horarios'
  },

  trashPickupCalendar: {
    title: "Trash Pickup Calendar",
    description: "Interactive calendar showing your trash pickup day and schedule changes for holidays.",
    url: "https://midlandtexas.gov/728/Trash-Pickup-Calendar",
    phone: "(432) 685-7275",
    keywords: ["trash day", "pickup schedule", "garbage day", "when is trash day", "trash calendar", "pickup day", "collection schedule", "día de basura", "horario de recolección", "día de recolección", "cuándo recogen basura", "calendario de basura"],
    titleEs: 'Calendario de Recolección de Basura',
    descriptionEs: 'Vea su horario de recolección de basura, cambios de días festivos y días de recolección de artículos grandes.',
    linkTextEs: 'Ver Calendario'
  },

  bulkPickup: {
    title: "Bulk Item Pickup",
    description: "Schedule pickup for large items like furniture, appliances, and mattresses. Free for residential customers.",
    url: "https://midlandtexas.gov/727/Bulk-Item-Pickup",
    phone: "(432) 685-7275",
    keywords: ["bulk pickup", "large item", "furniture pickup", "appliance pickup", "mattress pickup", "bulk trash", "heavy trash", "recolección de artículos grandes", "muebles", "electrodomésticos", "colchones", "basura grande", "basura pesada"],
    titleEs: 'Recolección de Artículos Grandes',
    descriptionEs: 'Programe la recolección de artículos grandes como muebles, electrodomésticos y desechos de jardín.',
    linkTextEs: 'Programar Recolección'
  },

  landfill: {
    title: "City Landfill",
    description: "Drop off trash, construction debris, and yard waste. Open Monday-Saturday.",
    url: "https://midlandtexas.gov/728/Landfill",
    phone: "(432) 685-7428",
    address: "7901 E. Garden City Highway",
    keywords: ["landfill", "dump", "disposal", "drop off trash", "construction debris", "yard waste", "bulk disposal", "vertedero", "basurero", "tirar basura", "escombros", "desechos de jardín"],
    titleEs: 'Relleno Sanitario de la Ciudad',
    descriptionEs: 'Ubicación, horarios, tarifas y artículos aceptados en el relleno sanitario de la ciudad.',
    linkTextEs: 'Información del Relleno'
  },

  recycling: {
    title: "Recycling Services",
    description: "Recycling locations and information. Learn what can be recycled and where to take recyclables.",
    url: "https://www.midlandtexas.gov/154/Recycling",
    keywords: ["recycling", "recycle", "recyclables", "recycling center", "recycling drop off", "what can i recycle", "reciclaje", "reciclar", "reciclables", "centro de reciclaje", "dónde reciclar", "qué puedo reciclar"],
    titleEs: 'Reciclaje',
    descriptionEs: 'Aprenda qué se puede reciclar, horarios de recolección y centros de reciclaje en Midland',
    linkTextEs: 'Información de Reciclaje'
  },

  ezRider: {
    title: "EZ-Rider Public Transit",
    description: "Public bus service with fixed routes throughout Midland. $1.50 fare. Runs Monday-Saturday.",
    url: "https://ez-rider.org",
    routesUrl: "https://ez-rider.org/routes-fares",
    phone: "(432) 685-3483",
    keywords: ["bus", "public transit", "ez rider", "public transportation", "bus route", "bus schedule", "city bus", "transit", "autobús", "transporte público", "ruta de autobús", "horario de autobús", "camión"],
    titleEs: 'Transporte Público EZ Rider',
    descriptionEs: 'Transporte público accesible y asequible en Midland. Vea rutas, horarios y tarifas',
    linkTextEs: 'Ver Rutas de Autobús'
  },

  reportProblem: {
    title: "Report a City Problem",
    description: "Report potholes, streetlight outages, water leaks, and other city maintenance issues.",
    url: "https://midlandtexas.gov/Report",
    seeClickFixUrl: "https://midlandtexas.gov/1193/Report-an-Issue---SeeClickFix",
    keywords: ["report problem", "report issue", "city problem", "maintenance issue", "pothole", "streetlight", "broken", "needs fix", "reportar problema", "reportar", "problema de la ciudad", "bache", "alumbrado público", "roto", "necesita reparación"],
    titleEs: 'Reportar Problemas - SeeClickFix',
    descriptionEs: 'Reporte problemas no emergentes de la ciudad como baches, grafiti, apagones de alumbrado público y violaciones de códigos en línea.',
    linkTextEs: 'Reportar Problema'
  },

  powerOutage: {
    title: "Report Power Outage",
    description: "Report electrical outages and power problems in Midland.",
    url: "https://midlandtexas.gov/551/Power-Outage",
    keywords: ["power outage", "no power", "electricity out", "lights out", "electrical problem", "outage report", "apagón", "sin luz", "sin electricidad", "problema eléctrico", "corte de energía"],
    titleEs: 'Corte de Energía',
    descriptionEs: 'Reporte cortes de energía y revise el estado de restauración del servicio eléctrico.',
    linkTextEs: 'Reportar Corte'
  },

  gasLeak: {
    title: "Report Gas Leak",
    description: "Report natural gas leaks immediately. This is an emergency - call if you smell gas!",
    url: "https://midlandtexas.gov/563/Gas-Leak",
    emergency: "911",
    keywords: ["gas leak", "smell gas", "natural gas", "gas odor", "gas emergency", "gas smell", "fuga de gas", "olor a gas", "gas natural", "emergencia de gas", "huele a gas"],
    titleEs: 'Fuga de Gas',
    descriptionEs: 'Reporte fugas de gas de emergencia o olor a gas. Para emergencias llame al 911.',
    linkTextEs: 'Información de Emergencia'
  },

  // ============================================================
  // 10. EMPLOYMENT & HUMAN RESOURCES
  // ============================================================

  employment: {
    title: "Employment Opportunities",
    description: "Browse current job openings with the City of Midland. Apply for positions in various departments.",
    url: "https://midlandtexas.gov/471/Employment-Opportunities",
    keywords: ["jobs", "employment", "careers", "job openings", "apply for job", "city jobs", "work for city", "hiring", "job application", "trabajos", "empleo", "carreras", "vacantes", "solicitar trabajo", "trabajos de la ciudad", "trabajar para la ciudad", "contratación", "solicitud de empleo"],
    titleEs: 'Oportunidades de Empleo',
    descriptionEs: 'Busque ofertas de trabajo actuales con la Ciudad de Midland y presente su solicitud en línea',
    linkTextEs: 'Ver Ofertas de Trabajo'
  },

  humanResources: {
    title: "Human Resources",
    description: "Employee resources, benefits information, and HR services for city employees.",
    url: "https://midlandtexas.gov/142/Human-Relations-and-Development",
    keywords: ["human resources", "hr", "employee benefits", "employee services", "personnel", "recursos humanos", "rrhh", "beneficios para empleados", "servicios para empleados", "personal"],
    titleEs: 'Recursos Humanos',
    descriptionEs: 'Departamento de Recursos Humanos de la Ciudad para empleados y solicitantes',
    linkTextEs: 'Visitar Recursos Humanos'
  },

  // ============================================================
  // 11. FINANCIAL & ADMINISTRATIVE
  // ============================================================

  financeBudget: {
    title: "Finance & Budget",
    description: "City financial reports, budget information, and fiscal transparency documents.",
    url: "https://midlandtexas.gov/231/Finance-Budget",
    keywords: ["finance", "budget", "city budget", "financial report", "spending", "revenue", "fiscal", "finanzas", "presupuesto", "presupuesto de la ciudad", "informe financiero", "gastos", "ingresos", "fiscal"],
    titleEs: 'Finanzas y Presupuesto',
    descriptionEs: 'Información sobre el presupuesto de la ciudad, informes financieros y auditorías',
    linkTextEs: 'Ver Finanzas'
  },

  paymentPortal: {
    title: "Pay City Bills Online",
    description: "General payment portal for city services, utilities, permits, and fees.",
    url: "https://midlandtexas.gov/Pay",
    keywords: ["pay bill", "online payment", "payment portal", "pay fee", "pay city", "pagar factura", "pago en línea", "portal de pagos", "pagar tarifa", "pagar a la ciudad"],
    titleEs: 'Portal de Pagos',
    descriptionEs: 'Pague facturas de servicios públicos, multas de la corte y otros cargos de la ciudad en línea',
    linkTextEs: 'Hacer Pago'
  },

  publicRecords: {
    title: "Public Records Request",
    description: "Request access to public records and city documents under the Texas Public Information Act.",
    url: "https://midlandtexas.gov/460/Open-Public-Records-Request",
    keywords: ["public records", "records request", "open records", "information request", "pia request", "foia", "registros públicos", "solicitud de registros", "registros abiertos", "solicitud de información", "solicitud pia", "foia"],
    titleEs: 'Solicitud de Registros Públicos',
    descriptionEs: 'Solicite registros públicos según la Ley de Información Pública de Texas',
    linkTextEs: 'Solicitar Registros'
  },

  // ============================================================
  // 12. AIRPORT & TRANSPORTATION
  // ============================================================

  airport: {
    title: "Midland International Air & Space Port",
    description: "Flight information, parking, terminal services, and ground transportation at MAF.",
    url: "https://flymaf.com/",
    cityPage: "https://midlandtexas.gov/1311/Midland-International-Air-Space-Port",
    phone: "(432) 560-2200",
    keywords: ["airport", "maf", "flights", "fly", "airline", "terminal", "air travel", "plane", "flight schedule", "aeropuerto", "maf", "vuelos", "volar", "aerolínea", "terminal", "viaje aéreo", "avión", "horario de vuelos"],
    titleEs: 'Aeropuerto Internacional Midland',
    descriptionEs: 'Información sobre vuelos, aerolíneas y servicios del Aeropuerto Internacional Midland',
    linkTextEs: 'Visitar Aeropuerto'
  },

  airportParking: {
    title: "Airport Parking",
    description: "Parking options and rates at Midland International Airport. Short-term and long-term parking available.",
    url: "https://tx-midlandairport.civicplus.com/156/Parking-Rates",
    keywords: ["airport parking", "park at airport", "maf parking", "parking rates", "long term parking", "estacionamiento del aeropuerto", "estacionar en el aeropuerto", "estacionamiento maf", "tarifas de estacionamiento", "estacionamiento a largo plazo"],
    titleEs: 'Estacionamiento del Aeropuerto',
    descriptionEs: 'Información sobre estacionamiento y tarifas del Aeropuerto Internacional Midland',
    linkTextEs: 'Ver Opciones de Estacionamiento'
  },

  // ============================================================
  // 13. COMMUNITY & TOURISM
  // ============================================================

  visitors: {
    title: "Visitors & Tourism",
    description: "Things to do, places to stay, and attractions in Midland. Plan your visit to West Texas.",
    url: "https://midlandtexas.gov/9/Visitors",
    tourismUrl: "http://www.visitmidlandtexas.com/",
    keywords: ["visitors", "tourism", "things to do", "attractions", "visit midland", "tourist information", "travel midland", "visitantes", "turismo", "cosas que hacer", "atracciones", "visitar midland", "información turística", "viajar a midland"],
    titleEs: 'Información para Visitantes',
    descriptionEs: 'Guía para visitantes de atracciones, hoteles y cosas que hacer en Midland',
    linkTextEs: 'Guía de Visitantes'
  },

  bushConventionCenter: {
    title: "Bush Convention Center",
    description: "Convention and event center in downtown Midland. Book events, meetings, and conferences.",
    url: "https://www.bushconventioncenter.com/",
    keywords: ["convention center", "bush center", "event venue", "meeting space", "conference center", "centro de convenciones", "centro bush", "lugar para eventos", "espacio para reuniones", "centro de conferencias"],
    titleEs: 'Centro de Convenciones Bush',
    descriptionEs: 'Reserve el Centro de Convenciones Bush para eventos, conferencias y banquetes',
    linkTextEs: 'Reservar Centro'
  },

  midlandLibraries: {
    title: "Midland County Public Libraries",
    description: "Public library system serving Midland County. Browse books, use computers, and attend programs.",
    url: "https://co.midland.tx.us/166/Public-Libraries",
    keywords: ["library", "public library", "books", "library card", "check out books", "library hours", "biblioteca", "biblioteca pública", "libros", "tarjeta de biblioteca", "sacar libros", "horario de biblioteca"],
    titleEs: 'Bibliotecas del Condado de Midland',
    descriptionEs: 'Ubicaciones de bibliotecas, horarios y servicios del Sistema de Bibliotecas del Condado de Midland',
    linkTextEs: 'Visitar Bibliotecas'
  },

  keepMidlandBeautiful: {
    title: "Keep Midland Beautiful",
    description: "Community organization focused on environmental improvement and beautification of Midland.",
    url: "https://keepmidlandbeautiful.org/resources/recyling-in-midland/recycle-locations",
    keywords: ["keep midland beautiful", "beautification", "volunteer cleanup", "community cleanup", "litter cleanup", "mantener midland hermoso", "embellecimiento", "limpieza voluntaria", "limpieza comunitaria", "limpieza de basura"],
    titleEs: 'Keep Midland Beautiful',
    descriptionEs: 'Programas comunitarios de embellecimiento, limpiezas y reciclaje',
    linkTextEs: 'Participar'
  },

  // ============================================================
  // 14. EMERGENCY & SAFETY
  // ============================================================

  emergencyManagement: {
    title: "Emergency Management",
    description: "Emergency preparedness, disaster response, and community safety planning.",
    url: "https://www.co.midland.tx.us/232/Emergency-Management",
    phone: "(432) 685-7234",
    keywords: ["emergency management", "disaster", "emergency preparedness", "emergency plan", "disaster preparedness", "safety planning", "gestión de emergencias", "desastre", "preparación para emergencias", "plan de emergencia", "preparación para desastres", "planificación de seguridad"],
    titleEs: 'Gestión de Emergencias',
    descriptionEs: 'Información sobre preparación para emergencias, planificación de desastres y respuesta a emergencias. Manténgase informado sobre alertas de clima severo, evacuaciones y recursos de emergencia.',
    linkTextEs: 'Ver Información de Emergencias'
  },

  weatherInformation: {
    title: "Weather Information",
    description: "Official National Weather Service forecast and alerts for Midland area.",
    url: "https://www.weather.gov/",
    keywords: ["weather", "forecast", "weather alert", "severe weather", "weather warning", "radar", "clima", "pronóstico", "alerta del clima", "clima severo", "advertencia del clima", "radar"],
    titleEs: 'Información del Clima',
    descriptionEs: 'Condiciones climáticas actuales, alertas de clima severo y pronósticos para el área de Midland. Manténgase informado sobre avisos de tormentas, temperaturas extremas y condiciones meteorológicas.',
    linkTextEs: 'Ver Clima'
  },

  redCross: {
    title: "American Red Cross",
    description: "Disaster relief, emergency assistance, and community services through the Red Cross.",
    url: "https://www.redcross.org/local/texas/central-and-south-texas.html",
    keywords: ["red cross", "disaster relief", "emergency assistance", "disaster help", "relief services", "cruz roja", "ayuda en desastres", "asistencia de emergencia", "ayuda en desastres", "servicios de ayuda"],
    titleEs: 'Cruz Roja Americana',
    descriptionEs: 'Servicios de emergencia, donación de sangre y clases de seguridad de la Cruz Roja',
    linkTextEs: 'Visitar Cruz Roja'
  },

  // ============================================================
  // 15. TECHNICAL & IT SERVICES
  // ============================================================

  gisMapping: {
    title: "GIS Mapping Services",
    description: "Interactive maps showing property boundaries, zoning, infrastructure, and city features.",
    url: "https://www.midlandtexas.gov/1196/GIS-Mapping",
    keywords: ["gis", "mapping", "maps", "property map", "zoning map", "city map", "interactive map", "gis", "mapeo", "mapas", "mapa de propiedad", "mapa de zonificación", "mapa de la ciudad", "mapa interactivo"],
    titleEs: 'Mapas GIS',
    descriptionEs: 'Mapas interactivos de Midland con información sobre propiedades, zonificación y más',
    linkTextEs: 'Ver Mapas'
  },

  engineeringServices: {
    title: "Engineering Services",
    description: "City engineering department handling infrastructure, streets, drainage, and public works projects.",
    url: "https://midlandtexas.gov/222/Engineering",
    keywords: ["engineering", "city engineer", "infrastructure", "streets", "drainage", "public works", "ingeniería", "ingeniero de la ciudad", "infraestructura", "calles", "drenaje", "obras públicas"],
    titleEs: 'Servicios de Ingeniería',
    descriptionEs: 'Proyectos de ingeniería de la ciudad, gestión de capital y servicios de inspección',
    linkTextEs: 'Ver Servicios'
  },

  itsd: {
    title: "IT Services Department",
    description: "Information technology services and support for city operations.",
    url: "https://midlandtexas.gov/881/ITSD",
    keywords: ["it department", "technology", "it services", "technical support", "information technology", "itsd", "tech support", "computer services", "network services", "city technology", "departamento de ti", "tecnología", "servicios de ti", "soporte técnico", "tecnología de la información", "itsd", "soporte técnico", "servicios informáticos", "servicios de red", "tecnología de la ciudad"],
    titleEs: 'Servicios de Tecnología de la Información',
    descriptionEs: 'Departamento de TI de la ciudad que proporciona soporte técnico y servicios digitales',
    linkTextEs: 'Visitar TI'
  },

  waterTesting: {
    title: "Water Testing Services",
    description: "Laboratory water quality testing services for residents and businesses.",
    url: "https://midlandtexas.gov/463/Water-Testing-Services",
    keywords: ["water testing", "water quality", "water test", "test water", "water analysis", "prueba de agua", "calidad del agua", "probar agua", "análisis de agua"],
    titleEs: 'Pruebas de Calidad del Agua',
    descriptionEs: 'Informes de calidad del agua e información sobre pruebas para residentes',
    linkTextEs: 'Ver Informes'
  },

  // ============================================================
  // 16. STRATEGIC & COMMUNICATIONS
  // ============================================================

  strategicCommunications: {
    title: "Strategic Communications",
    description: "Public information office and communications department. Media inquiries and public information.",
    url: "https://midlandtexas.gov/182/Strategic-Communications",
    keywords: ["public information", "communications", "media", "press release", "news", "announcements", "información pública", "comunicaciones", "medios", "comunicado de prensa", "noticias", "anuncios"],
    titleEs: 'Comunicaciones Estratégicas',
    descriptionEs: 'Relaciones públicas de la ciudad, comunicados de prensa e información para medios',
    linkTextEs: 'Ver Comunicaciones'
  },

  strategicPlanning: {
    title: "Strategic Planning",
    description: "City's long-term planning, goal setting, and strategic initiatives.",
    url: "https://midlandtexas.gov/1175/Strategic-Planning",
    keywords: ["strategic planning", "city planning", "long term planning", "goals", "initiatives", "planificación estratégica", "planificación de la ciudad", "planificación a largo plazo", "metas", "iniciativas"],
    titleEs: 'Planificación Estratégica',
    descriptionEs: 'Plan estratégico de la ciudad, metas e iniciativas comunitarias',
    linkTextEs: 'Ver Plan'
  },

  strategicPartnerships: {
    title: "Strategic Partnerships",
    description: "Collaboration with community organizations, businesses, and regional partners.",
    url: "https://midlandtexas.gov/1242/Strategic-Partnerships-Office",
    keywords: ["partnerships", "collaboration", "community partnerships", "regional cooperation", "strategic partnerships", "partner organizations", "coalition", "collaborative efforts", "partnership office", "community collaboration", "asociaciones", "colaboración", "asociaciones comunitarias", "cooperación regional", "asociaciones estratégicas", "organizaciones asociadas", "coalición", "esfuerzos colaborativos", "oficina de asociaciones", "colaboración comunitaria"],
    titleEs: 'Asociaciones Estratégicas',
    descriptionEs: 'Colaboraciones de la ciudad con organizaciones comunitarias y agencias',
    linkTextEs: 'Ver Asociaciones'
  },

  // ============================================================
  // 17. HOUSING & COMMUNITY DEVELOPMENT
  // ============================================================

  housingCommunityDev: {
    title: "Housing & Community Development",
    description: "Affordable housing programs, community development initiatives, and housing assistance.",
    url: "https://midlandtexas.gov/1234/Housing-Community-Development",
    keywords: ["housing", "affordable housing", "housing assistance", "community development", "housing programs", "rental assistance", "vivienda", "vivienda asequible", "asistencia de vivienda", "desarrollo comunitario", "programas de vivienda", "asistencia de alquiler"],
    titleEs: 'Vivienda y Desarrollo Comunitario',
    descriptionEs: 'Programas de vivienda asequible, subvenciones comunitarias y desarrollo de vecindarios',
    linkTextEs: 'Ver Programas'
  },

  newResidentInfo: {
    title: "New Resident Information",
    description: "Welcome packet for new residents with essential information about living in Midland.",
    url: "https://midlandtexas.gov/1322/New-Resident-Information-Flyer",
    keywords: ["new resident", "moving to midland", "newcomer", "new to midland", "moving guide", "resident guide", "nuevo residente", "mudarse a midland", "recién llegado", "nuevo en midland", "guía de mudanza", "guía del residente"],
    titleEs: 'Información para Nuevos Residentes',
    descriptionEs: 'Guía para nuevos residentes sobre servicios de la ciudad, servicios públicos y recursos',
    linkTextEs: 'Guía de Nuevos Residentes'
  },

  // ============================================================
  // 18. LEGAL & COMPLIANCE
  // ============================================================

  cityAttorney: {
    title: "City Attorney's Office",
    description: "Legal services and counsel for city government operations.",
    url: "https://midlandtexas.gov/914/City-Attorneys-Office",
    keywords: ["city attorney", "legal", "legal services", "legal counsel", "attorney office", "city lawyer", "legal department", "legal advice", "city legal", "municipal attorney", "abogado de la ciudad", "legal", "servicios legales", "asesor legal", "oficina del abogado", "abogado de la ciudad", "departamento legal", "asesoramiento legal", "legal de la ciudad", "abogado municipal"],
    titleEs: 'Procuraduría de la Ciudad',
    descriptionEs: 'Oficina de la Procuraduría de la Ciudad que proporciona asesoría legal a la ciudad',
    linkTextEs: 'Visitar Procuraduría'
  },

  riskManagement: {
    title: "Risk Management",
    description: "City's risk management and insurance services. Handle claims and liability issues.",
    url: "https://www.midlandtexas.gov/973/Risk-Management-Division",
    keywords: ["risk management", "insurance", "claims", "liability", "file claim", "gestión de riesgos", "seguro", "reclamos", "responsabilidad", "presentar reclamo"],
    titleEs: 'Gestión de Riesgos',
    descriptionEs: 'Programa de gestión de riesgos de la ciudad y reclamaciones de responsabilidad',
    linkTextEs: 'Ver Información'
  },

  cityAuditor: {
    title: "City Auditor & Fraud Hotline",
    description: "Internal audit services and fraud reporting hotline for city operations.",
    url: "https://midlandtexas.gov/231/Finance-Budget",
    phone: "(432) 685-7399",
    keywords: ["city auditor", "fraud hotline", "report fraud", "waste", "abuse", "audit", "auditor de la ciudad", "línea de fraude", "reportar fraude", "desperdicio", "abuso", "auditoría"],
    titleEs: 'Auditoría de la Ciudad',
    descriptionEs: 'Oficina de Auditoría Interna que proporciona supervisión independiente de las operaciones de la ciudad',
    linkTextEs: 'Ver Auditorías'
  },

  // ============================================================
  // 19. SPECIAL PROGRAMS & SERVICES
  // ============================================================

  blueSanta: {
    title: "Blue Santa Program",
    description: "Police department Christmas program providing toys and gifts to children in need.",
    url: "https://midlandtexas.gov/1357/Blue-Santa",
    keywords: ["blue santa", "christmas program", "toys", "holiday help", "christmas assistance", "toy drive", "santa azul", "programa de navidad", "juguetes", "ayuda navideña", "asistencia de navidad", "campaña de juguetes"],
    titleEs: 'Programa Blue Santa',
    descriptionEs: 'Programa navideño que proporciona juguetes y alimentos a familias necesitadas',
    linkTextEs: 'Información del Programa'
  },

  youthAdvisoryCouncil: {
    title: "Midland Youth Advisory Council",
    description: "Youth leadership program giving students voice in city government and community service.",
    url: "https://midlandtexas.gov/1305/Midland-Youth-Advisory-Council-2025-2026",
    keywords: ["youth council", "youth advisory", "student government", "youth leadership", "teen program", "consejo juvenil", "consejo asesor juvenil", "gobierno estudiantil", "liderazgo juvenil", "programa para adolescentes"],
    titleEs: 'Consejo Asesor Juvenil',
    descriptionEs: 'Consejo dirigido por jóvenes que asesora al gobierno de la ciudad sobre temas juveniles',
    linkTextEs: 'Unirse al Consejo'
  },

  springHealthFair: {
    title: "Spring Health Fair",
    description: "Annual community health fair offering free health screenings and wellness information.",
    url: "https://midlandtexas.gov/1385/Spring-Health-Fair",
    keywords: ["health fair", "health screening", "wellness fair", "free health check", "community health", "feria de salud primaveral", "exámenes de salud", "feria de bienestar", "revisión de salud gratis", "salud comunitaria"],
    titleEs: 'Feria de Salud de Primavera',
    descriptionEs: 'Evento anual de salud comunitaria con exámenes de salud gratuitos y recursos',
    linkTextEs: 'Información del Evento'
  },

  easterEggstravaganza: {
    title: "Easter Eggstravaganza",
    description: "Annual Easter egg hunt and family festival in city parks.",
    url: "https://midlandtexas.gov/1386/Easter-Eggstravaganza",
    keywords: ["easter", "egg hunt", "easter egg hunt", "easter event", "spring event", "pascua", "búsqueda de huevos", "búsqueda de huevos de pascua", "evento de pascua", "evento de primavera"],
    titleEs: 'Easter Eggstravaganza',
    descriptionEs: 'Búsqueda anual de huevos de Pascua para niños en los parques de la ciudad',
    linkTextEs: 'Información del Evento'
  },

  halloweenfest: {
    title: "Halloweenfest",
    description: "Family-friendly Halloween celebration with trick-or-treating, games, and activities.",
    url: "https://midlandtexas.gov/1466/Halloweenfest",
    keywords: ["halloween", "halloweenfest", "trick or treat", "halloween event", "fall festival", "halloween", "halloweenfest", "dulce o truco", "evento de halloween", "festival de otoño"],
    titleEs: 'Halloweenfest',
    descriptionEs: 'Evento familiar de Halloween con dulces o travesuras, juegos y actividades',
    linkTextEs: 'Información del Evento'
  },

  truckOrTreat: {
    title: "Truck or Treat",
    description: "Halloween event where children trick-or-treat from vehicle to vehicle in safe environment.",
    url: "https://www.midlandtexas.gov/1464/Truck-or-Treat",
    keywords: ["truck or treat", "trunk or treat", "halloween", "safe halloween", "trick or treat", "truck or treat", "trunk or treat", "halloween", "halloween seguro", "dulce o truco"],
    titleEs: 'Truck or Treat',
    descriptionEs: 'Evento de dulces o travesuras con vehículos de emergencia y camiones de la ciudad',
    linkTextEs: 'Información del Evento'
  },

  fallFestival: {
    title: "Fall Festival Resource Fair",
    description: "Community resource fair connecting residents with city services and local organizations.",
    url: "https://midlandtexas.gov/1465/Fall-Festival-Resource-Fair",
    keywords: ["fall festival", "resource fair", "community fair", "resource fair", "city services", "festival de otoño", "feria de recursos", "feria comunitaria", "feria de recursos", "servicios de la ciudad"],
    titleEs: 'Festival de Otoño',
    descriptionEs: 'Celebración anual de otoño con actividades familiares y entretenimiento',
    linkTextEs: 'Información del Evento'
  },

  flyIntoFall: {
    title: "Fly Into Fall",
    description: "Annual kite festival and fall celebration at city parks.",
    url: "https://midlandtexas.gov/1246/Fly-Into-Fall",
    keywords: ["fly into fall", "kite festival", "fall event", "kite flying", "fall festival", "kite event", "autumn festival", "family kite", "outdoor fall event", "park festival", "fly into fall", "festival de cometas", "evento de otoño", "volar cometas", "festival de otoño", "evento de cometas", "festival de otoño", "cometa familiar", "evento de otoño al aire libre", "festival del parque"],
    titleEs: 'Fly Into Fall',
    descriptionEs: 'Evento familiar de otoño en el Aeropuerto Internacional Midland',
    linkTextEs: 'Información del Evento'
  },

  midland101: {
    title: "Midland 101",
    description: "Educational program teaching residents about city government, services, and operations.",
    url: "https://midlandtexas.gov/1255/Midland-101",
    keywords: ["midland 101", "citizen academy", "learn about city", "city education", "government education", "midland 101", "academia ciudadana", "aprender sobre la ciudad", "educación de la ciudad", "educación gubernamental"],
    titleEs: 'Midland 101',
    descriptionEs: 'Programa educativo sobre gobierno de la ciudad y servicios comunitarios',
    linkTextEs: 'Información del Programa'
  },

  // ============================================================
  // 20. ALARM & SAFETY PERMITS
  // ============================================================

  alarmPermit: {
    title: "Alarm Permit",
    description: "Register your home or business alarm system with the city. Required for police response to alarms.",
    url: "https://midlandtexas.gov/844/Get-An-Alarm-Permit",
    keywords: ["alarm permit", "alarm registration", "security system", "alarm system", "burglar alarm", "register alarm", "permiso de alarma", "registro de alarma", "sistema de seguridad", "sistema de alarma", "alarma contra robos", "registrar alarma"],
    titleEs: 'Permiso de Alarma',
    descriptionEs: 'Registre su sistema de alarma residencial o comercial con la ciudad',
    linkTextEs: 'Registrar Alarma'
  },

  publicSafetyCommunications: {
    title: "Public Safety Communications",
    description: "911 dispatch center and emergency communications for police, fire, and EMS services.",
    url: "https://midlandtexas.gov/160/Public-Safety-Communications",
    keywords: ["911", "dispatch", "emergency communications", "911 center", "dispatchers", "911", "despacho", "comunicaciones de emergencia", "centro 911", "despachadores"],
    titleEs: 'Comunicaciones de Seguridad Pública',
    descriptionEs: 'Información de seguridad pública, alertas y actualizaciones de emergencias',
    linkTextEs: 'Ver Actualizaciones'
  },

  // ============================================================
  // 21. CIVIC ENGAGEMENT & INFORMATION
  // ============================================================

  civicAlerts: {
    title: "Civic Alerts & Notifications",
    description: "Subscribe to email and text alerts for city news, events, and important announcements.",
    url: "https://midlandtexas.gov/CivicAlerts.aspx?CID=5",
    keywords: ["civic alerts", "notifications", "email alerts", "text alerts", "city news", "announcements", "stay informed", "alertas cívicas", "notificaciones", "alertas por correo", "alertas por texto", "noticias de la ciudad", "anuncios", "mantenerse informado"],
    titleEs: 'Alertas Cívicas',
    descriptionEs: 'Regístrese para recibir alertas de la ciudad sobre servicios, eventos y emergencias',
    linkTextEs: 'Suscribirse a Alertas'
  },

  cityAwards: {
    title: "City Awards & Recognition",
    description: "Recognize outstanding community members and organizations. Learn about city awards programs.",
    url: "https://midlandtexas.gov/1441/City-Awards-and-Recognition",
    keywords: ["awards", "recognition", "community awards", "honor", "nominate", "excellence", "premios", "reconocimiento", "premios comunitarios", "honor", "nominar", "excelencia"],
    titleEs: 'Premios de la Ciudad',
    descriptionEs: 'Reconocimientos y premios por servicio comunitario y excelencia cívica',
    linkTextEs: 'Ver Premios'
  },

  midlandFastFacts: {
    title: "Midland Fast Facts",
    description: "Quick facts and statistics about Midland including population, economy, and demographics.",
    url: "https://midlandtexas.gov/1120/Midland-Fast-Facts",
    keywords: ["fast facts", "statistics", "demographics", "population", "city facts", "about midland", "datos rápidos", "estadísticas", "demografía", "población", "datos de la ciudad", "acerca de midland"],
    titleEs: 'Datos Rápidos de Midland',
    descriptionEs: 'Datos y estadísticas rápidas sobre Midland, Texas',
    linkTextEs: 'Ver Datos'
  },

  faqPage: {
    title: "Frequently Asked Questions",
    description: "Browse answers to common questions about city services, utilities, permits, and more.",
    url: "https://midlandtexas.gov/FAQ.aspx",
    keywords: ["faq", "frequently asked questions", "common questions", "help", "questions", "answers", "preguntas frecuentes", "preguntas comunes", "ayuda", "preguntas", "respuestas"],
    titleEs: 'Preguntas Frecuentes',
    descriptionEs: 'Preguntas frecuentes sobre servicios y programas de la ciudad',
    linkTextEs: 'Ver Preguntas Frecuentes'
  },

  councilPresentations: {
    title: "City Council Presentations",
    description: "View presentations made to City Council on various topics and projects.",
    url: "https://midlandtexas.gov/1176/City-Council-Presentations",
    keywords: ["council presentations", "council materials", "presentations", "council documents", "presentation slides", "council reports", "staff presentations", "city presentations", "meeting presentations", "council briefings", "presentaciones del concejo", "materiales del concejo", "presentaciones", "documentos del concejo", "diapositivas de presentación", "informes del concejo", "presentaciones del personal", "presentaciones de la ciudad", "presentaciones de reuniones", "informes del concejo"],
    titleEs: 'Presentaciones del Concejo',
    descriptionEs: 'Vea presentaciones de las reuniones del Concejo Municipal. Acceda a diapositivas, informes del personal y materiales de reuniones actuales y anteriores.',
    linkTextEs: 'Ver Presentaciones'
  },

  redistricting: {
    title: "2022 Redistricting",
    description: "Information about the most recent redistricting of City Council districts.",
    url: "https://midlandtexas.gov/1031/2022-Redistricting",
    keywords: ["redistricting", "council districts", "district map", "redistricting plan", "district boundaries", "voting districts", "council map", "district changes", "reapportionment", "district lines", "redistritación", "distritos del concejo", "mapa de distritos", "plan de redistritación", "límites de distritos", "distritos electorales", "mapa del concejo", "cambios de distritos", "redistribución", "líneas de distritos"],
    titleEs: 'Redistritación',
    descriptionEs: 'Información sobre redistritación del concejo municipal y mapas de distritos',
    linkTextEs: 'Ver Información'
  },

  txdotRoads: {
    title: "TxDOT Roads Information",
    description: "Information about state-maintained roads and highways in Midland.",
    url: "https://midlandtexas.gov/1487/TxDot-Roads",
    keywords: ["txdot", "state roads", "highways", "state highways", "road maintenance", "txdot", "carreteras estatales", "autopistas", "autopistas estatales", "mantenimiento de carreteras"],
    titleEs: 'Carreteras de TxDOT',
    descriptionEs: 'Información sobre carreteras estatales mantenidas por el Departamento de Transporte de Texas',
    linkTextEs: 'Ver Información de TxDOT'
  },

  // ============================================================
  // QUICK ACCESS LINKS - These appear in the static UI cards
  // ============================================================
  
  adoptAnimal: {
    title: "Adopt an Animal",
    description: "Find your new furry friend at the animal shelter",
    url: "https://www.midlandtexas.gov/1030/Adopt-an-Animal-at-the-Shelter",
    phone: "(432) 685-7420",
    keywords: ["adopt", "animal", "pet", "dog", "cat", "shelter", "adoption"]
  },

  animalsInShelter: {
    title: "Animals in Shelter",
    description: "View all animals currently available at the shelter",
    url: "https://www.midlandtexas.gov/1472/Animals-in-the-Shelter",
    phone: "(432) 685-7420",
    keywords: ["animals", "shelter", "available", "pets", "view animals"]
  },

  jobOpportunities: {
    title: "Job Opportunities",
    description: "Browse and apply for City of Midland job openings",
    url: "https://www.governmentjobs.com/careers/midlandtx",
    keywords: ["jobs", "careers", "employment", "hiring", "work", "apply"]
  },

  publicRecords: {
    title: "Public Records Request",
    description: "Request access to public records and documents",
    url: "https://www.midlandtexas.gov/460/Open-Public-Records-Request",
    keywords: ["records", "public", "documents", "request", "information"]
  },

  permits: {
    title: "PermitMidland",
    description: "Apply for building permits and licenses online",
    url: "https://www.midlandtexas.gov/1424/PermitMidland",
    keywords: ["permit", "building", "license", "construction", "application"]
  },

  cityMap: {
    title: "City Map",
    description: "Explore interactive maps of Midland services and facilities",
    url: "https://storymaps.arcgis.com/stories/68340303732f4da4ae5259b2f4be0516",
    keywords: ["map", "location", "directions", "facilities", "services"]
  },

  trashService: {
    title: "Trash Service",
    description: "Trash collection schedules and waste management info",
    url: "https://www.midlandtexas.gov/383/Trash-Service",
    phone: "(432) 685-7275",
    keywords: ["trash", "garbage", "waste", "recycling", "collection"]
  },

  courtPayments: {
    title: "Court Payments",
    description: "Pay municipal court fines and fees online",
    url: "https://midlandtx.municipalonlinepayments.com/midlandtx/court/search",
    phone: "(432) 685-7281",
    keywords: ["court", "payment", "fine", "ticket", "citation"]
  },

  bidOpportunities: {
    title: "Bid Opportunities",
    description: "View and submit bids for city projects and contracts",
    url: "https://www.midlandtexas.gov/156/Bid-Opportunities-Submissions",
    keywords: ["bid", "contract", "vendor", "procurement", "rfp"]
  },

  waterAccount: {
    title: "Water Account Login",
    description: "Manage your water utility account and payments",
    url: "https://water.midlandtexas.gov/app/login.jsp",
    openInNewTab: true,
    phone: "(432) 685-7275",
    keywords: ["water", "utility", "bill", "payment", "account"]
  },

  reportIssue: {
    title: "Report an Issue",
    description: "Report problems like potholes, streetlights, and more",
    url: "https://www.midlandtexas.gov/1193/Report-an-Issue---SeeClickFix",
    keywords: ["report", "issue", "problem", "pothole", "street", "fix"]
  },

  councilMeetings: {
    title: "Council Meetings",
    description: "View agendas, minutes, and schedules for city meetings",
    url: "https://www.midlandtexas.gov/1231/Meetings-Agendas-and-Minutes",
    phone: "(432) 685-7205",
    keywords: ["meeting", "agenda", "minutes", "council", "public"]
  },

  facebook: {
    title: "Facebook",
    description: "Follow us on Facebook for news and updates",
    url: "https://www.facebook.com/CityofMidlandTX",
    keywords: ["facebook", "social", "media", "updates", "news"]
  },

  xTwitter: {
    title: "X (Twitter)",
    description: "Follow us on X for real-time city updates",
    url: "https://www.midlandtexas.gov/x",
    keywords: ["twitter", "x", "social", "media", "updates"]
  },

  instagram: {
    title: "Instagram",
    description: "Follow us on Instagram for photos and stories",
    url: "https://www.instagram.com/cityofmidland/",
    keywords: ["instagram", "social", "media", "photos", "stories"]
  },

  youtube: {
    title: "YouTube",
    description: "Watch city videos and meeting recordings",
    url: "https://www.midlandtexas.gov/youtube",
    keywords: ["youtube", "video", "channel", "recordings"]
  },

  linkedin: {
    title: "LinkedIn",
    description: "Connect with us on LinkedIn for professional updates",
    url: "https://www.linkedin.com/company/city-of-midland",
    keywords: ["linkedin", "professional", "network", "business"]
  }
};

// Export total count for reference
export const totalCards = Object.keys(serviceCards).length;

// Export function to search cards by keywords
export function searchCards(query) {
  const searchTerm = query.toLowerCase();
  return Object.entries(serviceCards).filter(([key, card]) => {
    // Check if search term contains ANY of the keywords (more lenient)
    return card.keywords.some(keyword => searchTerm.includes(keyword.toLowerCase())) ||
           card.title.toLowerCase().includes(searchTerm) ||
           card.description.toLowerCase().includes(searchTerm) ||
           searchTerm.includes(card.title.toLowerCase());
  }).map(([key, card]) => ({ id: key, ...card }));
}

// Export function to get card by ID
export function getCardById(id) {
  return serviceCards[id] ? { id, ...serviceCards[id] } : null;
}

/**
 * USAGE INSTRUCTIONS FOR JACKY 2.0:
 * 
 * 1. Import cards: import { serviceCards, searchCards, getCardById } from './service-cards';
 * 
 * 2. Search for relevant cards based on user query:
 *    const results = searchCards(userQuery);
 * 
 * 3. Present cards when user asks about services:
 *    - Broad keywords ensure various phrasings are captured
 *    - Show 1-3 most relevant cards based on context
 *    - Include URL, phone, and email when available
 * 
 * 4. Card presentation guidelines:
 *    - Show cards when user asks questions about services
 *    - Show cards when user seems confused or needs direction
 *    - Don't overwhelm - limit to 3 cards per response
 *    - Always include the direct link/phone number
 * 
 * Total cards created: ${totalCards}
 */
