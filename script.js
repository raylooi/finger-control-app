// Fixed Hand Drawing
console.log('🎨 Starting...');

let hands, camera, drawingCtx, videoElement, canvasElement, drawingCanvas;
let isDrawing = false;
let currentColor = '#FF0000';
let brushSize = 5;
let lastPoint = null;

function updateStatus(elementId, text, active) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        element.className = active ? 'status active' : 'status inactive';
    }
}

window.clearCanvas = function() {
    if (drawingCtx) drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
};

window.testDrawing = function() {
    if (drawingCtx) {
        drawingCtx.fillStyle = '#FF0000';
        drawingCtx.fillRect(200, 200, 100, 100);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    videoElement = document.getElementById('videoElement');
    canvasElement = document.getElementById('canvasElement');
    drawingCanvas = document.getElementById('drawingCanvas');
    
    if (drawingCanvas) {
        setupCanvas();
        setTimeout(initMediaPipe, 1000);
    }
});

function setupCanvas() {
    drawingCanvas.width = window.innerWidth;
    drawingCanvas.height = window.innerHeight;
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    
    drawingCtx = drawingCanvas.getContext('2d');
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';
}
function initMediaPipe() {
    console.log('Starting MediaPipe...');
    updateStatus('cameraStatus', 'Camera: Connecting...', false);
    
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    hands.onResults(onHandResults);
    
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    
    camera.start().then(() => {
        console.log('✅ Camera started');
        updateStatus('cameraStatus', 'Camera: Connected', true);
    }).catch(err => {
        console.error('❌ Camera failed:', err);
        updateStatus('cameraStatus', 'Camera: Failed', false);
    });
}

function onHandResults(results) {
    // Update hand detection status
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        updateStatus('handsStatus', 'Hands: Detected', true);
        
        const landmarks = results.multiHandLandmarks[0];
        processHandGesture(landmarks);
        
        // Draw hand landmarks on overlay canvas
        drawHandOverlay(results);
    } else {
        updateStatus('handsStatus', 'Hands: Not Detected', false);
        isDrawing = false;
        updateStatus('drawingStatus', 'Drawing: Off', false);
    }
}

function drawHandOverlay(results) {
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
        }
    }
    
    canvasCtx.restore();
}
function processHandGesture(landmarks) {
    const gesture = detectGesture(landmarks);
    
    if (gesture === 'point') {
        const indexTip = landmarks[8]; // Index finger tip
        drawAtFinger(indexTip);
        updateStatus('drawingStatus', 'Drawing: On', true);
    } else {
        if (isDrawing) {
            isDrawing = false;
            lastPoint = null;
            updateStatus('drawingStatus', 'Drawing: Off', false);
        }
    }
}

function detectGesture(landmarks) {
    // Simple pointing detection
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    
    const indexUp = indexTip.y < indexPIP.y;
    const middleDown = middleTip.y > middlePIP.y;
    const ringDown = ringTip.y > ringPIP.y;
    const pinkyDown = pinkyTip.y > pinkyPIP.y;
    
    // Only index finger is up
    if (indexUp && middleDown && ringDown && pinkyDown) {
        return 'point';
    }
    
    return 'none';
}

function drawAtFinger(fingerPos) {
    if (!drawingCtx) return;
    
    // Convert normalized coordinates to canvas coordinates
    // Note: fingerPos.x is already mirrored by MediaPipe
    const canvasX = fingerPos.x * drawingCanvas.width;
    const canvasY = fingerPos.y * drawingCanvas.height;
    
    if (!isDrawing) {
        // Start drawing
        isDrawing = true;
        lastPoint = { x: canvasX, y: canvasY };
        
        // Draw initial dot
        drawingCtx.fillStyle = currentColor;
        drawingCtx.beginPath();
        drawingCtx.arc(canvasX, canvasY, brushSize / 2, 0, 2 * Math.PI);
        drawingCtx.fill();
    } else if (lastPoint) {
        // Draw line from last point to current point
        drawingCtx.strokeStyle = currentColor;
        drawingCtx.lineWidth = brushSize;
        drawingCtx.beginPath();
        drawingCtx.moveTo(lastPoint.x, lastPoint.y);
        drawingCtx.lineTo(canvasX, canvasY);
        drawingCtx.stroke();
        
        // Update last point
        lastPoint = { x: canvasX, y: canvasY };
    }
}

console.log('🎨 Hand Drawing App Loaded!');