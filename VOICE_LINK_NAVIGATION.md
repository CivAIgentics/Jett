# Voice Link Navigation Feature

## Overview
Jett now has the ability to open web links from service cards when users ask for them verbally. This creates a seamless experience where users can ask about a service and then immediately be taken to the relevant webpage.

## How It Works

### 1. **Service Cards Display**
When Jett mentions a service or answers a question, relevant service cards are automatically displayed with:
- Service title
- Description
- Contact information (phone, email)
- **Direct web links** to city services

### 2. **Voice Link Opening**
Users can open these links using voice commands in two ways:

#### Method A: Direct Service Request
User says specific service names, and Jett opens the link:
```
User: "Open water account"
User: "Take me to trash service"
User: "Show me building permits"
User: "Go to animal shelter"
User: "Visit the police department"
```

#### Method B: Contextual "Take Me There"
After Jett shows a service card, user can say:
```
User: "Take me there"
User: "Open that"
User: "Open it"
User: "Go there"
User: "Yes, take me"
User: "Yes, open"
User: "Open link"
User: "Click the link"
User: "Visit link"
```

### 3. **Bilingual Support**
Both English and Spanish commands are supported:
```
Spanish:
- "Llevarme allí"
- "Abrirlo"
- "Ir allí"
- "Sí, llevarme"
- "Abrir enlace"
```

## Technical Implementation

### State Management
```javascript
state.lastShownCards = []; // Tracks recently shown cards
```

When service cards are displayed in the transcript or detected from conversation context, they are stored in `state.lastShownCards` for quick access.

### Voice Command Detection
The `detectOpenServiceCardCommand(text)` function:

1. **Analyzes user speech** for intent phrases
2. **Checks for contextual requests** ("take me there")
3. **Searches visible cards** on the screen
4. **Searches comprehensive card catalog** (200+ services)
5. **Scores matches** based on keyword relevance
6. **Opens the best match** in a new browser tab

### Matching Algorithm
Cards are scored based on:
- Title match: +3 points
- Keyword match: +4 points  
- Description match: +1 point
- Exact word boundary match: +2 bonus points

Minimum score threshold: **2 points**
Intent phrases detected: Opens with score > 0

### Visual Feedback
When a link is opened:
```javascript
showToast(`✅ Opening ${cardTitle}...`, 'success', 2500);
```

The service card briefly animates with `.service-card-opening` class.

## Service Card Structure

Each of 200+ service cards includes:

```javascript
{
  title: "Water Utilities",
  titleEs: "Servicios de Agua",
  description: "Manage your water account and payments",
  descriptionEs: "Gestione su cuenta de agua y pagos",
  url: "https://water.Odessatexas.gov",
  phone: "(432) 685-7270",
  email: "cs@Odessatexas.gov",
  keywords: ["water", "utility", "bill", "payment", "agua", "factura"]
}
```

## Examples

### Example 1: Direct Request
```
User: "How do I pay my water bill?"
Jett: "You can pay your water bill online at the utility portal. I'm showing you the link now."
[Water Account card appears with link]
User: "Take me there"
✅ Opens: https://water.Odessatexas.gov
```

### Example 2: Service Navigation
```
User: "Open animal shelter"
✅ Opens: https://Odessatexas.gov/404/Animal-Services
```

### Example 3: Multiple Cards
```
User: "Tell me about parks"
Jett: "We have 29 neighborhood parks and 8 community parks..."
[Parks & Recreation card appears]
[Park Reservations card appears]
User: "Open the first one"
✅ Opens: Parks & Recreation main page
```

## Supported Services

All 200+ City of Odessa services including:
- **Utilities**: Water, trash, recycling
- **Safety**: Police, fire, emergency alerts
- **Recreation**: Parks, pools, golf, events
- **Government**: Council meetings, permits, records
- **Animal Services**: Adoption, lost pets, spay/neuter
- **Health**: Immunizations, health screenings
- **Courts**: Pay tickets, defensive driving
- **Business**: Permits, economic development
- **Transportation**: EZ-Rider bus, airport
- **And many more...**

## Benefits

### For Users
✅ **Hands-free navigation** - No need to click links manually
✅ **Contextual awareness** - "Take me there" works with last shown card
✅ **Bilingual** - Works in English and Spanish
✅ **Fast access** - Direct voice commands to any service
✅ **Visual confirmation** - Toast notifications show what's opening

### For Accessibility
♿ **Screen reader friendly** - All cards have proper ARIA labels
♿ **Voice-only operation** - Complete navigation without mouse/touch
♿ **Large touch targets** - Links are easy to click if needed
♿ **High contrast** - Cards visible in light and dark modes

## Configuration

### Environment Variables
```bash
ANAM_PERSONA_ID=ef1b0530-5288-4505-bde1-8cc72fb09904
ANAM_API_KEY=your-api-key-here
```

### ANAM Persona Instructions
The persona should be configured to:
1. Mention service cards when appropriate
2. Tell users they can say "take me there" to open links
3. Provide clear service names that match card titles

Example instruction:
```
"When you show a service card with a web link, mention that the user can 
say 'take me there' or 'open that' to visit the webpage directly."
```

## Troubleshooting

### Links Not Opening
- Check browser pop-up blocker settings
- Ensure `window.open()` is allowed
- Verify service card has `url` property

### Voice Commands Not Working
- Check microphone permissions
- Ensure ANAM session is active (isStreaming === true)
- Verify console logs show "🔍 Voice navigation: analyzing..."

### Wrong Service Opening
- Check card keywords match user intent
- Review scoring algorithm in console logs
- Adjust keyword lists in `service-cards.js`

## Future Enhancements

Potential improvements:
- [ ] Multiple link selection: "Open the second one"
- [ ] Category browsing: "Show me all park links"
- [ ] Recent links: "Open the last link I visited"
- [ ] Link sharing: "Send me that link via email"
- [ ] Deep linking: Direct to specific page sections
- [ ] Smart suggestions: "You might also need..."

## Related Files

- `public/js/app-anam-only.js` - Main app logic and voice navigation
- `public/js/service-cards.js` - 200+ service card definitions
- `server/index.js` - ANAM session management
- `public/css/styles.css` - Card styling and animations

## Support

For issues or questions:
- GitHub: https://github.com/CivAIgentics/Jett-3.0
- Email: Dr. Steven Sierra Alcabes

---

**Version**: 1.0  
**Last Updated**: November 17, 2025  
**Author**: Dr. Steven Sierra Alcabes
