/**
 * Service Cards Data - Updated Links
 * Quick access to City of Odessa services and resources
 */

export const serviceCards = [
    // Priority Order as requested
    {
        id: 'phone-directory',
        title: 'Phone Directory',
        titleEs: 'Directorio Telefónico',
        description: 'Search city employee contacts',
        descriptionEs: 'Buscar contactos de empleados de la ciudad',
        icon: '/icons/Phone Directory.json',
        links: [{ text: 'Search', textEs: 'Buscar', url: 'https://www.Odessatexas.gov/directory.aspx' }],
        keywords: ['phone', 'directory', 'contact', 'employee', 'staff', 'teléfono', 'directorio', 'contacto']
    },
    {
        id: 'permits',
        title: 'Permits',
        titleEs: 'Permisos',
        description: 'Apply for building permits',
        descriptionEs: 'Solicitar permisos de construcción',
        icon: '/icons/Permits.json',
        links: [{ text: 'Apply', textEs: 'Solicitar', url: 'https://www.Odessatexas.gov/1424/PermitOdessa' }],
        keywords: ['permit', 'building', 'permiso', 'construcción']
    },
    {
        id: 'report',
        title: 'Report Issue',
        titleEs: 'Reportar Problema',
        description: 'Report city problems',
        descriptionEs: 'Reportar problemas de la ciudad',
        icon: '/icons/Report Issue.json',
        links: [{ text: 'Report', textEs: 'Reportar', url: 'https://www.Odessatexas.gov/1193/Report-an-Issue---SeeClickFix' }],
        keywords: ['report', 'issue', 'problem', 'reportar', 'problema']
    },
    {
        id: 'water',
        title: 'Water Account',
        titleEs: 'Cuenta de Agua',
        description: 'Manage water utility',
        descriptionEs: 'Gestionar servicio de agua',
        icon: '/icons/Water Account.json',
        links: [{ text: 'Login', textEs: 'Ingresar', url: 'https://water.Odessatexas.gov/app/login.jsp', openInNewTab: true }],
        keywords: ['water', 'utility', 'bill', 'agua', 'servicio', 'factura']
    },
    {
        id: 'alerts',
        title: 'Alerts',
        titleEs: 'Alertas',
        description: 'Emergency notifications',
        descriptionEs: 'Notificaciones de emergencia',
        icon: '/icons/Alerts.json',
        links: [{ text: 'Subscribe', textEs: 'Suscribirse', url: 'https://www.Odessatexas.gov/AlertCenter.aspx' }],
        keywords: ['alert', 'emergency', 'alerta', 'emergencia']
    },
    {
        id: 'meetings',
        title: 'Meetings',
        titleEs: 'Reuniones',
        description: 'City meeting agendas',
        descriptionEs: 'Agendas de reuniones de la ciudad',
        icon: '/icons/Meetings.json',
        links: [{ text: 'View', textEs: 'Ver', url: 'https://www.Odessatexas.gov/1231/Meetings-Agendas-and-Minutes' }],
        keywords: ['meeting', 'agenda', 'reunión']
    },
    {
        id: 'adopt-animal',
        title: 'Adopt an Animal',
        titleEs: 'Adoptar un Animal',
        description: 'Find your new furry friend at the animal shelter',
        descriptionEs: 'Encuentre a su nuevo amigo peludo en el refugio de animales',
        icon: '/icons/Adopt an Animal.json',
        links: [{ text: 'Visit', textEs: 'Visitar', url: 'https://www.Odessatexas.gov/1030/Adopt-an-Animal-at-the-Shelter' }],
        keywords: ['adopt', 'animal', 'pet', 'dog', 'cat', 'adoptar', 'mascota', 'perro', 'gato']
    },
    {
        id: 'animals-shelter',
        title: 'Animals in Shelter',
        titleEs: 'Animales en el Refugio',
        description: 'View available animals',
        descriptionEs: 'Ver animales disponibles',
        icon: '/icons/Animals in Shelter.json',
        links: [{ text: 'View', textEs: 'Ver', url: 'https://www.Odessatexas.gov/1472/Animals-in-the-Shelter' }],
        keywords: ['animals', 'shelter', 'pets', 'animales', 'refugio', 'mascotas']
    },
    {
        id: 'community-events',
        title: 'Community Events and Programs',
        titleEs: 'Eventos y Programas Comunitarios',
        description: 'Discover local events and programs',
        descriptionEs: 'Descubra eventos y programas locales',
        icon: '/icons/Community Events and Porgrams.json',
        links: [{ text: 'View', textEs: 'Ver', url: 'https://www.Odessatexas.gov/1244/Community-Events-Programs' }],
        keywords: ['events', 'programs', 'community', 'activities', 'eventos', 'programas', 'comunidad', 'actividades']
    },
    // Everything else in logical groupings
    {
        id: 'vision-Odessa',
        title: 'Vision Odessa',
        titleEs: 'Visión Odessa',
        description: 'Our City\'s Future',
        descriptionEs: 'El futuro de nuestra ciudad',
        icon: '/icons/Vision Odessa.json',
        links: [{ text: 'View', textEs: 'Ver', url: 'https://storymaps.arcgis.com/stories/68340303732f4da4ae5259b2f4be0516' }],
        keywords: ['vision', 'future', 'plan', 'visión', 'futuro']
    },
    {
        id: 'police-non-emergency',
        title: 'Police Non Emergency Reporting',
        titleEs: 'Reporte Policial No Emergencia',
        description: 'File a non-emergency police report',
        descriptionEs: 'Presentar un informe policial no urgente',
        icon: '/icons/Police Non Emergency Reporting.json',
        links: [{ text: 'Report', textEs: 'Reportar', url: 'https://Odessapolicetx.policetocitizen.com/Home' }],
        keywords: ['police', 'report', 'non-emergency', 'policía', 'reporte', 'no-emergencia']
    },
    {
        id: 'jobs',
        title: 'Job Opportunities',
        titleEs: 'Oportunidades de Empleo',
        description: 'Browse city job openings',
        descriptionEs: 'Buscar ofertas de trabajo de la ciudad',
        icon: '/icons/Job Opportunities.json',
        links: [{ text: 'Apply', textEs: 'Solicitar', url: 'https://www.governmentjobs.com/careers/Odessatx' }],
        keywords: ['jobs', 'careers', 'employment', 'trabajos', 'empleo', 'carreras']
    },
    {
        id: 'records',
        title: 'Public Records',
        titleEs: 'Registros Públicos',
        description: 'Request public records',
        descriptionEs: 'Solicitar registros públicos',
        icon: '/icons/Public Records.json',
        links: [{ text: 'Request', textEs: 'Solicitar', url: 'https://www.Odessatexas.gov/460/Open-Public-Records-Request' }],
        keywords: ['records', 'documents', 'registros', 'documentos']
    },
    {
        id: 'trash',
        title: 'Trash Service',
        titleEs: 'Servicio de Basura',
        description: 'Collection schedules',
        descriptionEs: 'Horarios de recolección',
        icon: '/icons/Trash Service.json',
        links: [{ text: 'Info', textEs: 'Info', url: 'https://www.Odessatexas.gov/383/Trash-Service' }],
        keywords: ['trash', 'garbage', 'waste', 'basura', 'desperdicios']
    },
    {
        id: 'court',
        title: 'Court Payments',
        titleEs: 'Pagos de Corte',
        description: 'Pay court fines online',
        descriptionEs: 'Pagar multas de corte en línea',
        icon: '/icons/Court Payments.json',
        links: [{ text: 'Pay', textEs: 'Pagar', url: 'https://Odessatx.municipalonlinepayments.com/Odessatx/court/search' }],
        keywords: ['court', 'payment', 'fine', 'corte', 'pago', 'multa']
    },
    {
        id: 'bids',
        title: 'Bid Opportunities',
        titleEs: 'Oportunidades de Licitación',
        description: 'View city bids',
        descriptionEs: 'Ver licitaciones de la ciudad',
        icon: '/icons/Bid Opportunities.json',
        links: [{ text: 'View', textEs: 'Ver', url: 'https://www.Odessatexas.gov/156/Bid-Opportunities-Submissions' }],
        keywords: ['bid', 'contract', 'licitación', 'contrato']
    },
    // Social Media Cards
    {
        id: 'facebook',
        title: 'Facebook',
        titleEs: 'Facebook',
        description: 'Follow us on Facebook',
        descriptionEs: 'Síguenos en Facebook',
        icon: '/icons/facebook.svg',
        links: [{ text: 'Follow', textEs: 'Seguir', url: 'https://www.facebook.com/CityofOdessaTX' }],
        keywords: ['facebook', 'social']
    },
    {
        id: 'twitter',
        title: 'X (Twitter)',
        titleEs: 'X (Twitter)',
        description: 'Follow us on X',
        descriptionEs: 'Síguenos en X',
        icon: '/icons/twitter.svg',
        links: [{ text: 'Follow', textEs: 'Seguir', url: 'https://www.Odessatexas.gov/x' }],
        keywords: ['twitter', 'x']
    },
    {
        id: 'instagram',
        title: 'Instagram',
        titleEs: 'Instagram',
        description: 'Photos and stories',
        descriptionEs: 'Fotos e historias',
        icon: '/icons/instagram.svg',
        links: [{ text: 'Follow', textEs: 'Seguir', url: 'https://www.instagram.com/cityofOdessa/' }],
        keywords: ['instagram']
    },
    {
        id: 'youtube',
        title: 'YouTube',
        titleEs: 'YouTube',
        description: 'City videos',
        descriptionEs: 'Videos de la ciudad',
        icon: '/icons/youtube.svg',
        links: [{ text: 'Subscribe', textEs: 'Suscribirse', url: 'https://www.Odessatexas.gov/youtube' }],
        keywords: ['youtube', 'video']
    },
    {
        id: 'linkedin',
        title: 'LinkedIn',
        titleEs: 'LinkedIn',
        description: 'Professional network',
        descriptionEs: 'Red profesional',
        icon: '/icons/linkedin.svg',
        links: [{ text: 'Connect', textEs: 'Conectar', url: 'https://www.linkedin.com/company/city-of-Odessa' }],
        keywords: ['linkedin']
    }
];

export function searchCards(query) {
    const lowerQuery = query.toLowerCase();
    return serviceCards.filter(card => 
        card.keywords.some(kw => lowerQuery.includes(kw.toLowerCase())) ||
        card.title.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery)
    );
}

export function getCardById(id) {
    return serviceCards.find(card => card.id === id);
}
