# 🧪 Bilingual Voice Command Test Suite
## Testing English & Spanish Voice Recognition

---

## 🎯 Test Instructions

1. Open Jacky 3.0 in your browser: `http://localhost:3000` or `https://jacky-3-0.vercel.app`
2. Enable microphone permissions
3. Click the voice button to start ambient listening
4. Speak the test commands below
5. Verify that Jacky correctly identifies the intent and opens the appropriate service

---

## ✅ English Test Commands

### Payment Intent
- [ ] "I need to pay my water bill"
  - **Expected:** Opens Utility Billing, Intent: payment + utility
- [ ] "Pay my electricity bill"
  - **Expected:** Opens Utility Billing, Intent: payment + utility
- [ ] "How do I pay my invoice?"
  - **Expected:** Opens Utility Billing, Intent: payment + information

### Report Intent
- [ ] "Report a broken streetlight"
  - **Expected:** Opens Public Works, Intent: report + utility
- [ ] "I want to report a pothole"
  - **Expected:** Opens Public Works, Intent: report
- [ ] "There's trash on the street"
  - **Expected:** Opens Solid Waste, Intent: report + utility

### Application Intent
- [ ] "Apply for a building permit"
  - **Expected:** Opens Development Services, Intent: application + permit
- [ ] "How do I register for a program?"
  - **Expected:** Opens Parks & Recreation, Intent: application + event
- [ ] "Sign up for trash service"
  - **Expected:** Opens Solid Waste, Intent: application + utility

### Job Intent
- [ ] "Show me job opportunities"
  - **Expected:** Opens Career Page, Intent: job + information
- [ ] "Are you hiring?"
  - **Expected:** Opens Career Page, Intent: job
- [ ] "City employment openings"
  - **Expected:** Opens Career Page, Intent: job

### Emergency Intent
- [ ] "Police non-emergency report"
  - **Expected:** Opens Police Department, Intent: emergency + report
- [ ] "Fire department contact"
  - **Expected:** Opens Emergency Services, Intent: emergency + contact

### Event Intent
- [ ] "Park programs for kids"
  - **Expected:** Opens Parks & Recreation, Intent: event
- [ ] "Community events"
  - **Expected:** Opens Community Events, Intent: event
- [ ] "Library programs"
  - **Expected:** Opens Library, Intent: event

### Utility Intent
- [ ] "Water account information"
  - **Expected:** Opens Water Account, Intent: utility + information
- [ ] "Trash pickup schedule"
  - **Expected:** Opens Solid Waste, Intent: utility + schedule

### Voice Commands
- [ ] "Open water billing"
  - **Expected:** Opens Utility Billing
- [ ] "Show me building permits"
  - **Expected:** Opens Development Services
- [ ] "Dark mode"
  - **Expected:** Toggles dark mode, Toast: "Theme toggled"
- [ ] "Change language"
  - **Expected:** Toast: "Language changed"

---

## ✅ Spanish Test Commands (Comandos en Español)

### Payment Intent (Intención de Pago)
- [ ] "Necesito pagar mi factura de agua"
  - **Esperado:** Abre Facturación de Servicios, Intención: payment + utility
- [ ] "Pagar mi cuenta de electricidad"
  - **Esperado:** Abre Facturación de Servicios, Intención: payment + utility
- [ ] "¿Cómo pago mi cobro?"
  - **Esperado:** Abre Facturación de Servicios, Intención: payment + information

### Report Intent (Intención de Reportar)
- [ ] "Reportar una luz de calle rota"
  - **Esperado:** Abre Obras Públicas, Intención: report + utility
- [ ] "Quiero reportar un bache"
  - **Esperado:** Abre Obras Públicas, Intención: report
- [ ] "Hay basura en la calle"
  - **Esperado:** Abre Servicios de Basura, Intención: report + utility

### Application Intent (Intención de Aplicación)
- [ ] "Aplicar para un permiso de construcción"
  - **Esperado:** Abre Servicios de Desarrollo, Intención: application + permit
- [ ] "¿Cómo me registro para un programa?"
  - **Esperado:** Abre Parques y Recreación, Intención: application + event
- [ ] "Inscribir para servicio de basura"
  - **Esperado:** Abre Servicios de Basura, Intención: application + utility

### Job Intent (Intención de Trabajo)
- [ ] "Muéstrame oportunidades de trabajo"
  - **Esperado:** Abre Página de Carreras, Intención: job + information
- [ ] "¿Están contratando?"
  - **Esperado:** Abre Página de Carreras, Intención: job
- [ ] "Vacantes de empleo en la ciudad"
  - **Esperado:** Abre Página de Carreras, Intención: job

### Emergency Intent (Intención de Emergencia)
- [ ] "Reporte policial no de emergencia"
  - **Esperado:** Abre Departamento de Policía, Intención: emergency + report
- [ ] "Contacto del departamento de bomberos"
  - **Esperado:** Abre Servicios de Emergencia, Intención: emergency + contact

### Event Intent (Intención de Evento)
- [ ] "Programas del parque para niños"
  - **Esperado:** Abre Parques y Recreación, Intención: event
- [ ] "Eventos comunitarios"
  - **Esperado:** Abre Eventos Comunitarios, Intención: event
- [ ] "Programas de biblioteca"
  - **Esperado:** Abre Biblioteca, Intención: event

### Utility Intent (Intención de Servicios)
- [ ] "Información de cuenta de agua"
  - **Esperado:** Abre Cuenta de Agua, Intención: utility + information
- [ ] "Horario de recolección de basura"
  - **Esperado:** Abre Servicios de Basura, Intención: utility + schedule

### Voice Commands (Comandos de Voz)
- [ ] "Abrir facturación de agua"
  - **Esperado:** Abre Facturación de Servicios
- [ ] "Muestra permisos de construcción"
  - **Esperado:** Abre Servicios de Desarrollo
- [ ] "Modo oscuro"
  - **Esperado:** Cambia modo oscuro, Toast: "Tema cambiado"
- [ ] "Cambiar idioma"
  - **Esperado:** Toast: "Idioma cambiado"

---

## 🔄 Code-Switching Tests (Mixed Language)

- [ ] "I want to pagar my water bill"
  - **Expected:** Opens Utility Billing, Intent: payment + utility
- [ ] "Necesito to report a broken luz"
  - **Expected:** Opens Public Works, Intent: report + utility
- [ ] "Show me trabajo opportunities"
  - **Expected:** Opens Career Page, Intent: job + information
- [ ] "Abrir building permits"
  - **Expected:** Opens Development Services, Intent: permit

---

## 📊 Scoring Verification

Open browser console (F12) and look for these log messages:

```
🎤 Processing voice search: [your command]
🧠 Detected intent: ['payment', 'utility']
🔤 Keywords extracted: ['pagar', 'factura', 'agua']
✅ Best match: Utility Billing (Score: 23)
```

### Expected Score Breakdown:
```
User: "Pagar mi factura de agua"

Service: "Utility Billing"
- Word match: "agua" (water) = +5 points
- Intent: payment = +5 points
- Intent: utility = +5 points
- Phrase: "pagar.*factura" = +8 points
- Total Score: 23 points ✅ BEST MATCH
```

---

## 🎯 Synonym Test Cases

### English Synonyms
- [ ] "Fix the streetlight" → Matches "repair", "maintenance"
- [ ] "Broken water main" → Matches "damaged", "issue"
- [ ] "Garbage pickup" → Matches "trash", "waste"
- [ ] "Business license" → Matches "commercial", "company"

### Spanish Synonyms
- [ ] "Arreglar la luz" → Matches "reparar", "mantenimiento"
- [ ] "Calle rota" → Matches "dañado", "problema"
- [ ] "Recolección de desechos" → Matches "basura", "reciclaje"
- [ ] "Licencia de negocio" → Matches "comercial", "empresa"

---

## 🚀 Performance Tests

### Stopword Removal
Test that filler words are correctly filtered:

**English:**
- "I really want to maybe pay my water bill" → Extracts: "pay", "water", "bill"
- "Can you please show me the job opportunities?" → Extracts: "show", "job", "opportunities"

**Spanish:**
- "Yo quiero pagar mi factura de agua" → Extracts: "pagar", "factura", "agua"
- "¿Puedes mostrarme las oportunidades de trabajo?" → Extracts: "mostrar", "oportunidades", "trabajo"

### Intent Detection Speed
- [ ] Intent analysis completes in < 10ms
- [ ] Service matching completes in < 50ms
- [ ] Toast appears within 100ms of command

---

## 📝 Test Results Template

```markdown
## Test Session: [Date/Time]
**Tester:** [Your Name]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Device:** [Desktop/Mobile/Tablet]

### English Commands
- ✅ Passed: 25/25
- ❌ Failed: 0/25
- Notes: [Any issues]

### Spanish Commands
- ✅ Passed: 25/25
- ❌ Failed: 0/25
- Notes: [Any issues]

### Code-Switching
- ✅ Passed: 4/4
- ❌ Failed: 0/4
- Notes: [Any issues]

### Performance
- Intent Detection: [X]ms avg
- Service Matching: [X]ms avg
- Total Response Time: [X]ms avg

### Overall Score: [X]%
```

---

## 🐛 Common Issues & Troubleshooting

### Issue: Commands Not Recognized
**Solution:**
1. Check microphone permissions
2. Verify voice button is active (glowing)
3. Speak clearly and at normal volume
4. Check browser console for errors

### Issue: Wrong Service Opens
**Solution:**
1. Check intent detection in console: `🧠 Detected intent:`
2. Verify keywords extracted: `🔤 Keywords extracted:`
3. Try adding more context: "water bill payment" instead of just "water"

### Issue: Spanish Commands Not Working
**Solution:**
1. Verify browser speech recognition supports Spanish
2. Try Chrome (best Spanish support)
3. Check `lang` attribute in HTML: should be `lang="en"` for Web Speech API

### Issue: Mixed Language Not Working
**Solution:**
- This is expected behavior - the system should handle it gracefully
- Report specific combinations that fail

---

## 📞 Support

**Issues or Questions?**
- GitHub Issues: github.com/CivAIgentics/Jacky-3.0/issues
- Email: ssierraalcabes@CivAIgentics.io
- Documentation: BILINGUAL_SUPPORT.md

---

**Test Status:** ⏳ Pending / ✅ Passed / ❌ Failed

**Last Updated:** November 17, 2025
