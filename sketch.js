function setup() {
  // Create a canvas that fills the browser window
  createCanvas(windowWidth, windowHeight);
  console.log("p5.js sketch initialized! Let the generative journey begin.");
  // Set color mode to HSB for easier random color generation
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  // Slightly transparent background for a subtle trail effect
  background(0, 0, 13, 5); // Dark background with low alpha

  // Draw multiple random shapes each frame
  let numShapes = 10; // How many shapes to draw per frame
  for (let i = 0; i < numShapes; i++) {
    // Random position
    let x = random(width); // random() with one argument gives 0 to width
    let y = random(height);

    // Random size
    let size = random(5, 20);

    // Random color (using HSB)
    let hue = random(360);
    let saturation = random(50, 100);
    let brightness = random(70, 100);
    let alpha = random(30, 80);

    fill(hue, saturation, brightness, alpha);
    noStroke();

    // Draw an ellipse
    ellipse(x, y, size, size);
    // Try uncommenting this for rectangles instead!
    // rect(x, y, size, size);
  }
}

// Optional: Resize canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reset color mode if needed after resize, though it usually persists
  // colorMode(HSB, 360, 100, 100, 100); 
} 