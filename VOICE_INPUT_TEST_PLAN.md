# Voice Input Test Plan

## 🧪 Quick Start Testing

### Prerequisites
```bash
# Ensure environment variables are set
export ELEVENLABS_API_KEY="sk_..."
export ELEVENLABS_AGENT_ID="agent-..."
export ANAM_API_KEY="anam_..."
export ANAM_PERSONA_ID="persona-..."

# Install and start
npm install
npm run dev
```

### Access Application
Open browser: http://localhost:3000

## ✅ Test Cases

### Test 1: Basic Voice Input
**Steps:**
1. Click "Start Conversation"
2. Wait for connection (avatar appears, status shows "Connected")
3. Click microphone button (should turn red and pulse)
4. Speak clearly: "Hello, what services do you offer?"
5. Stop speaking (mic should stop pulsing)

**Expected Results:**
- ✅ Microphone button enabled after connection
- ✅ Button turns red and pulses when clicked
- ✅ Your speech appears in text input field (interim results)
- ✅ Message automatically sent when you finish speaking
- ✅ Message appears in chat as "You"
- ✅ ANAM responds with voice and text
- ✅ Response appears in chat as "J"

### Test 2: Text Input Still Works
**Steps:**
1. Start conversation (if not already started)
2. Type in text box: "Tell me about permits"
3. Press Enter (or click send button)

**Expected Results:**
- ✅ Message sent immediately
- ✅ Same behavior as voice input
- ✅ ANAM responds with voice and text

### Test 3: Switching Between Input Modes
**Steps:**
1. Start conversation
2. Click mic, speak: "Hello"
3. Wait for response
4. Type: "What's the weather like?"
5. Click mic again, speak: "Thank you"

**Expected Results:**
- ✅ All messages maintain conversation context
- ✅ No conflicts between input methods
- ✅ Smooth transitions

### Test 4: Error Handling - No Speech
**Steps:**
1. Start conversation
2. Click microphone button
3. Don't speak for 5 seconds

**Expected Results:**
- ✅ Status message: "No speech detected. Please try again."
- ✅ Microphone button returns to idle state
- ✅ Can try again immediately

### Test 5: Error Handling - Permissions Denied
**Steps:**
1. Block microphone permissions in browser
2. Start conversation
3. Click microphone button

**Expected Results:**
- ✅ Error modal appears
- ✅ Message: "Microphone access denied. Please enable microphone permissions."
- ✅ Clear instructions provided

### Test 6: Browser Compatibility
**Test in:**
- ✅ Chrome/Edge (desktop)
- ✅ Safari (desktop)
- ✅ Chrome (mobile)
- ✅ Safari (iOS)
- ⚠️ Firefox (limited support expected)

**Expected Results:**
- ✅ Supported browsers: mic button enabled
- ✅ Unsupported browsers: mic button disabled with tooltip
- ✅ Text input always works regardless

### Test 7: Conversation Stop/Restart
**Steps:**
1. Start conversation
2. Send voice message
3. Send text message
4. Click "End Conversation"
5. Start new conversation

**Expected Results:**
- ✅ Mic button disabled when conversation stops
- ✅ Speech recognition stopped cleanly
- ✅ New conversation starts fresh
- ✅ Mic button re-enabled on new start

### Test 8: Long Speech Input
**Steps:**
1. Start conversation
2. Click mic
3. Speak continuously for 10-15 seconds

**Expected Results:**
- ✅ Interim results update in real-time
- ✅ Full transcription sent when finished
- ✅ No truncation or loss of content

### Test 9: Background Noise Handling
**Steps:**
1. Start conversation in noisy environment
2. Click mic and speak

**Expected Results:**
- ✅ Speech still recognized (browser handles noise reduction)
- ✅ May show "No speech detected" if too noisy
- ✅ User can retry

### Test 10: Initial Greeting Display
**Steps:**
1. Start conversation
2. Observe chat window

**Expected Results:**
- ✅ First agent message appears immediately
- ✅ Message is spoken by ANAM
- ✅ No blank chat window

## 🐛 Known Limitations

1. **Browser Compatibility**
   - Firefox: Web Speech API support is limited
   - IE: Not supported at all

2. **Language**
   - Currently hardcoded to `en-US`
   - To change: edit `state.speechRecognition.lang` in code

3. **Continuous Listening**
   - Currently single-shot mode (one phrase at a time)
   - To enable: set `state.speechRecognition.continuous = true`

4. **Offline Mode**
   - Web Speech API requires internet connection
   - Uses Google's speech recognition servers

## 📊 Performance Metrics

### Expected Response Times:
- Voice input → Transcription: < 1 second
- Transcription → ElevenLabs: 1-3 seconds
- ElevenLabs → ANAM speech: < 1 second
- **Total:** 2-5 seconds end-to-end

### Expected Accuracy:
- Speech recognition: 85-95% (varies with accent, noise)
- Context preservation: 100%
- Error recovery: 100%

## 🔍 Debug Console Output

### Successful Voice Input Flow:
```
🎤 Voice input started
🗣️ Speech recognized: "Hello" Final: false
🗣️ Speech recognized: "Hello, can you help me?" Final: true
📤 Sending message to agent: Hello, can you help me?
👤 User speaking: Hello, can you help me?
📤 Sending to ElevenLabs: Hello, can you help me?
📥 Received from ElevenLabs: {...}
🗣️ Making ANAM speak: [response]
🎤 Voice input ended
```

### Error Scenarios:
```
❌ Speech recognition error: no-speech
❌ Speech recognition error: not-allowed
❌ Failed to start speech recognition: [error]
```

## 🎯 Success Criteria

✅ All 10 test cases pass
✅ No console errors during normal operation
✅ Voice and text input both work seamlessly
✅ ANAM responds to all inputs
✅ Error messages are clear and actionable
✅ Browser compatibility handled gracefully
✅ Initial greeting displays on startup

## 📝 Test Results Template

```markdown
## Test Session: [Date/Time]

**Browser:** [Chrome 120 / Safari 17 / etc.]
**OS:** [Windows / macOS / iOS / Android]
**Tester:** [Name]

### Test Results:
- [ ] Test 1: Basic Voice Input - PASS/FAIL
- [ ] Test 2: Text Input - PASS/FAIL
- [ ] Test 3: Mode Switching - PASS/FAIL
- [ ] Test 4: No Speech Error - PASS/FAIL
- [ ] Test 5: Permission Error - PASS/FAIL
- [ ] Test 6: Browser Compat - PASS/FAIL
- [ ] Test 7: Stop/Restart - PASS/FAIL
- [ ] Test 8: Long Speech - PASS/FAIL
- [ ] Test 9: Background Noise - PASS/FAIL
- [ ] Test 10: Initial Greeting - PASS/FAIL

**Issues Found:**
1. [Description]
2. [Description]

**Notes:**
[Any additional observations]
```

## 🚀 Quick Verification Script

Run this in browser console after starting conversation:

```javascript
// Check if Web Speech API is available
console.log('Speech API:', window.SpeechRecognition || window.webkitSpeechRecognition ? '✅ Available' : '❌ Not Available');

// Check application state
console.log('Conversation Active:', window.appState?.conversationActive ? '✅ Yes' : '❌ No');
console.log('Speech Recognition Initialized:', window.appState?.speechRecognition ? '✅ Yes' : '❌ No');
console.log('ANAM Active:', window.appState?.anamSessionActive ? '✅ Yes' : '❌ No');

// Check mic button state
const micBtn = document.getElementById('mic-btn');
console.log('Mic Button Enabled:', !micBtn?.disabled ? '✅ Yes' : '❌ No');
console.log('Mic Button Listening:', micBtn?.classList.contains('listening') ? '🔴 Active' : '⚪ Idle');
```

Expected output when everything is working:
```
Speech API: ✅ Available
Conversation Active: ✅ Yes
Speech Recognition Initialized: ✅ Yes
ANAM Active: ✅ Yes
Mic Button Enabled: ✅ Yes
Mic Button Listening: ⚪ Idle
```
