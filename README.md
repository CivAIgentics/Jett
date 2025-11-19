# Odessa Website

A modern, responsive website built with HTML, CSS, and JavaScript.

## Project Structure

```
Odessa/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Stylesheet
├── js/
│   └── script.js       # JavaScript functionality
├── images/             # Image assets (placeholder folder)
├── .github/
│   └── copilot-instructions.md
└── README.md          # This file
```

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Scrolling**: Navigation with smooth scroll effects
- **Interactive Elements**: Hover effects and animations
- **Contact Form**: Functional contact form with validation
- **Modern UI**: Clean, professional design with CSS Grid and Flexbox

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Running the Website

#### Option 1: Direct File Opening
1. Open `index.html` in your web browser

#### Option 2: Using Live Server (Recommended)
1. Install the Live Server extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 3: Using Python HTTP Server
```powershell
# Navigate to the project directory
cd d:\Websites\Odessa

# Start a simple HTTP server
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser

## Sections

- **Home**: Hero section with call-to-action
- **About**: Information about the website/company
- **Services**: Grid layout showcasing services
- **Contact**: Contact form for user inquiries

## Customization

### Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --text-color: #1f2937;
}
```

### Content
- Edit text content in `index.html`
- Modify styles in `css/styles.css`
- Add functionality in `js/script.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.

## Contact

For questions or feedback, use the contact form on the website.
