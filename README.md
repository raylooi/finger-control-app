# Hand Gesture Drawing Web App

A real-time hand gesture drawing application that uses MediaPipe for hand detection and allows users to draw on their webcam feed using hand gestures.

## Features

🎨 **Drawing Modes:**
- Draw with your index finger
- Erase with an open palm
- Clear canvas with button

🌈 **Color Selection:**
- 8 different colors available
- Cycle through colors with peace sign gesture
- Click colors directly on palette

📏 **Brush Controls:**
- Adjustable brush size (1-20px)
- Thumbs up to increase size
- Visual size indicator

👆 **Gesture Controls:**
- **Index finger up:** Draw mode
- **Peace sign (✌️):** Color selection
- **Thumbs up (👍):** Increase brush size
- **Fist (✊):** Stop drawing
- **Open palm (✋):** Erase mode

## Technical Features

- Full-screen webcam display
- Real-time hand landmark detection
- Smooth drawing with line interpolation
- Mirrored display for natural interaction
- Responsive design
- Status indicators for all modes

## Setup & Usage

1. Open `index.html` in a modern web browser
2. Allow camera permissions when prompted
3. Wait for MediaPipe to load
4. Start drawing with hand gestures!

## Requirements

- Modern web browser with webcam support
- Internet connection (for MediaPipe CDN)
- Good lighting for hand detection

## Technologies Used

- HTML5 Canvas for drawing
- MediaPipe Hands for gesture recognition
- WebRTC for camera access
- CSS3 for styling and animations
- Vanilla JavaScript for logic

Enjoy drawing with your hands! 🎨✋