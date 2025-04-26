let swarm = [];
const canvasWidth = 1200;
const canvasHeight = 800;
const numAnts = 100; // More ants!
let pheromoneBuffer; // Off-screen buffer for pheromones
let foodSource; // Variable to hold the food source position
let obstacles = []; // Array to hold obstacles
let nestPosition; // << New: Position of the nest
let selectedAnt = null; // << Phase 6: Track clicked ant

function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container'); // Attach canvas using the new ID
  console.log("Canvas created. Ant simulation starting...");

  // Initialize the pheromone buffer
  pheromoneBuffer = createGraphics(canvasWidth, canvasHeight, { willReadFrequently: true });
  pheromoneBuffer.background(51, 0); // Initialize with background color but fully transparent

  // Initialize food source position
  foodSource = createVector(canvasWidth - 50, canvasHeight - 50); // Bottom-right corner

  // << New: Initialize nest position
  nestPosition = createVector(50, 50); // Top-left corner

  // Initialize obstacles
  obstacles = []; // Clear existing obstacles first
  // Original obstacle (scaled slightly?)
  obstacles.push({ 
    x: canvasWidth / 2 - 75, 
    y: canvasHeight / 2 - 15, 
    width: 150, 
    height: 30 
  });
  // Add some new obstacles
  obstacles.push({
    x: canvasWidth * 0.2, 
    y: canvasHeight * 0.3,
    width: 20, 
    height: canvasHeight * 0.4 // A vertical barrier
  });
   obstacles.push({
    x: canvasWidth * 0.7, 
    y: canvasHeight * 0.6,
    width: canvasWidth * 0.2, 
    height: 25 // A horizontal barrier
  });
   obstacles.push({
    x: 100, 
    y: canvasHeight - 100,
    width: 150, 
    height: 20 
  });
  console.log("Initialized obstacles.");

  // Populate the swarm array
  for (let i = 0; i < numAnts; i++) {
    swarm.push(new Ant()); // Create ants with random starting positions
  }
  console.log(`Initialized swarm with ${numAnts} ants.`);
}

function draw() {
  background(51); // Dark gray background for the main canvas

  // Apply decay effect to the pheromone buffer
  // Draw a semi-transparent rectangle over the buffer to make trails fade
  pheromoneBuffer.background(51, 3); // Increased decay (was 1, previously 2, originally 5)

  // Draw the pheromone buffer onto the main canvas
  image(pheromoneBuffer, 0, 0);

  // Draw the food source
  fill(0, 255, 0); // Green color for food
  noStroke();
  ellipse(foodSource.x, foodSource.y, 8, 8); // Draw a circle for the food

  // << New: Draw the nest
  fill(100, 100, 255); // Light blue for nest
  noStroke();
  ellipse(nestPosition.x, nestPosition.y, 20, 20); // Draw a circle for the nest

  // Draw obstacles
  fill(120, 0, 0); // Dark red color for obstacles
  noStroke();
  for (let obs of obstacles) {
    rect(obs.x, obs.y, obs.width, obs.height);
  }

  // Update, drop pheromones, and display each ant in the swarm
  for (let ant of swarm) {
    ant.update(pheromoneBuffer);
    ant.dropPheromone(pheromoneBuffer);
    ant.display(); // Draw ant on the main canvas (on top of pheromones)
  }

  // << Phase 6: Display Q-info for selected ant
  if (selectedAnt) {
    const qInfo = selectedAnt.getQInfo(pheromoneBuffer);
    fill(255); // White text
    textSize(12);
    textAlign(LEFT, TOP);
    text(`Selected Ant ID: ${selectedAnt.id}`, 10, 10);
    text(`State: ${qInfo.state}`, 10, 25);
    text(`Q(Left): ${qInfo.qLeft}`, 10, 40);
    text(`Q(Straight): ${qInfo.qStraight}`, 10, 55);
    text(`Q(Right): ${qInfo.qRight}`, 10, 70);

    // Highlight selected ant
    push();
    noFill();
    stroke(255, 0, 0); // Red stroke
    strokeWeight(2);
    ellipse(selectedAnt.position.x, selectedAnt.position.y, 15, 15);
    pop();
  }
}

// << Phase 6: Handle mouse clicks to select an ant
function mousePressed() {
  let closestAnt = null;
  let minDist = Infinity;
  const clickThreshold = 10; // How close the click needs to be to select

  for (let ant of swarm) {
    let d = dist(mouseX, mouseY, ant.position.x, ant.position.y);
    if (d < minDist && d < clickThreshold) {
      minDist = d;
      closestAnt = ant;
    }
  }

  selectedAnt = closestAnt;
  if (selectedAnt) {
    console.log(`Selected Ant ID: ${selectedAnt.id}`); // Placeholder
  } else {
    console.log("Clicked empty space.");
  }
} 