# Service Cards Integration

## Overview
Jacky 2.0 now automatically displays relevant service cards when keywords are detected in conversation. Service cards provide quick access to City of Midland resources, contact information, and online services.

## How It Works

### 1. Keyword Detection
- When the user speaks or types, and when the AI agent responds, the system analyzes the text for keywords
- Keywords are matched against a comprehensive database of City of Midland services
- The system is **broad and lenient** - it catches various phrasings and synonyms

### 2. Automatic Display
- When keywords match a service, up to **3 relevant cards** appear on the right side of the screen
- Cards include:
  - Service title and description
  - Direct website link
  - Phone number (if available)
  - Email address (if available)

### 3. User Interaction
- Cards slide in automatically
- Users can click links to visit websites
- Users can call phone numbers directly (on mobile)
- Users can email directly
- Users can close the cards using the X button

## Example Triggers

### Building & Development
**User says:** "I need a building permit"
**Cards shown:** Development Services, PermitMidland Portal, Building Permits

### Animal Services
**User says:** "I found a lost dog"
**Cards shown:** Animal Services, Lost Pets, Found Pets

### Utilities
**User says:** "How do I pay my water bill?"
**Cards shown:** Utility Billing, Pay Water Bill Online, Start Water Service

### Parks & Recreation
**User says:** "Where can I play basketball?"
**Cards shown:** Parks & Recreation, MLK Community Center, Park Reservations

## Technical Implementation

### Files Modified
1. **`public/js/service-cards.js`** - Service cards database and search functions
2. **`public/js/app.js`** - Integration with conversation flow
3. **`public/css/styles.css`** - Card styling
4. **`public/index.html`** - Card container HTML

### Key Functions
- `searchCards(query)` - Searches for matching cards based on keywords
- `displayServiceCards(text)` - Shows cards when keywords detected
- `createServiceCardElement(card)` - Creates card HTML
- `closeServiceCards()` - Hides the card container

### Card Data Structure
```javascript
{
  title: "Service Name",
  description: "Service description",
  url: "https://midlandtexas.gov/...",
  phone: "(432) 685-XXXX",
  email: "service@midlandtexas.gov",
  keywords: ["keyword1", "keyword2", ...],
  titleEs: "Spanish title",
  descriptionEs: "Spanish description",
  linkTextEs: "Spanish link text"
}
```

## Adding New Service Cards

To add a new service card, edit `public/js/service-cards.js`:

```javascript
newServiceName: {
  title: "Service Title",
  description: "Brief description of the service",
  url: "https://midlandtexas.gov/service-page",
  phone: "(432) 685-XXXX", // Optional
  email: "service@midlandtexas.gov", // Optional
  keywords: [
    "keyword1", 
    "keyword2", 
    "related term",
    "synonym",
    "spanish term"
  ],
  titleEs: 'Título en Español',
  descriptionEs: 'Descripción en español',
  linkTextEs: 'Texto del enlace'
}
```

## Keyword Strategy

### Best Practices
- Include **broad, common phrases** that users actually say
- Add **synonyms** and variations
- Include **Spanish translations**
- Think about **user intent**, not just exact terms
- Include **related questions** users might ask

### Example - Good Keywords
```javascript
keywords: [
  "building permit",
  "construction permit", 
  "permits",
  "build house",
  "how to get permit",
  "permiso de construcción"
]
```

### Example - Poor Keywords (Too Narrow)
```javascript
keywords: [
  "permit midland online application form"
]
```

## Future Enhancements

### Possible Improvements
1. **Bilingual Support** - Auto-detect language and show Spanish cards
2. **Card Ranking** - Show most relevant card first based on context
3. **Card History** - Track which cards users click most
4. **Favorites** - Let users save frequently used cards
5. **Deep Linking** - Link directly to specific forms/sections
6. **Analytics** - Track which services are searched most

## Troubleshooting

### Cards Not Showing
1. Check browser console for errors
2. Verify `service-cards.js` is loaded (type `import` modules)
3. Ensure keywords match user's phrasing
4. Check that `displayServiceCards()` is being called

### Wrong Cards Showing
1. Review keyword overlap between services
2. Make keywords more specific to the service
3. Limit number of keywords per card

### Cards Overlapping UI
1. Adjust position in `styles.css`
2. Modify `z-index` if needed
3. Check responsive breakpoints for mobile

## Support
For questions or issues with service cards, contact the development team or review the code comments in `service-cards.js` and `app.js`.
