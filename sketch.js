let swarm = [];
const canvasWidth = 800;
const canvasHeight = 600;
const numAnts = 50; // Number of ants in our swarm
let pheromoneBuffer; // Off-screen buffer for pheromones

function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container'); // Attach canvas using the new ID
  console.log("Canvas created. Ant simulation starting...");

  // Initialize the pheromone buffer
  pheromoneBuffer = createGraphics(canvasWidth, canvasHeight);
  pheromoneBuffer.background(51, 0); // Initialize with background color but fully transparent

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
  pheromoneBuffer.background(51, 1); // Low alpha for slow decay

  // Draw the pheromone buffer onto the main canvas
  image(pheromoneBuffer, 0, 0);

  // Update, drop pheromones, and display each ant in the swarm
  for (let ant of swarm) {
    ant.update();
    ant.dropPheromone(pheromoneBuffer);
    ant.display(); // Draw ant on the main canvas (on top of pheromones)
  }
} 