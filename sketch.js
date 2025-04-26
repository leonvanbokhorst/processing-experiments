let swarm = [];
const canvasWidth = 800;
const canvasHeight = 600;
const numAnts = 50; // Number of ants in our swarm
let pheromoneBuffer; // Off-screen buffer for pheromones
let foodSource; // Variable to hold the food source position
let obstacles = []; // Array to hold obstacles
let nestPosition; // << New: Position of the nest

function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container'); // Attach canvas using the new ID
  console.log("Canvas created. Ant simulation starting...");

  // Initialize the pheromone buffer
  pheromoneBuffer = createGraphics(canvasWidth, canvasHeight, { willReadFrequently: true });
  pheromoneBuffer.background(51, 0); // Initialize with background color but fully transparent

  // Initialize food source position
  foodSource = createVector(canvasWidth * 0.8, canvasHeight * 0.2); // Top-right quadrant

  // << New: Initialize nest position
  nestPosition = createVector(canvasWidth * 0.1, canvasHeight / 2); // Center-left

  // Initialize obstacles
  obstacles.push({ 
    x: canvasWidth / 2 - 50, 
    y: canvasHeight / 2 - 10, 
    width: 100, 
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
  pheromoneBuffer.background(51, 5); // Faster decay

  // Draw the pheromone buffer onto the main canvas
  image(pheromoneBuffer, 0, 0);

  // Draw the food source
  fill(0, 255, 0); // Green color for food
  noStroke();
  ellipse(foodSource.x, foodSource.y, 16, 16); // Draw a circle for the food

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
} 