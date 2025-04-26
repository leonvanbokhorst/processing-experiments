// Ant Colony Simulation - Step 1: Basic Ants

let ants = [];
let numAnts = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(30); // Dark grey background
  // Initialize ants
  for (let i = 0; i < numAnts; i++) {
    ants.push(new Ant(random(width), random(height)));
  }
  console.log(`Initialized ${numAnts} wandering ants.`);
}

function draw() {
  // A slightly fading background for subtle trails
  background(30, 30, 35, 50); 

  // Update and display all ants
  for (let ant of ants) {
    ant.wander(); // Apply wandering force
    ant.update(); // Update position based on velocity
    ant.edges();  // Handle screen edges
    ant.display(); // Draw the ant
  }
}

// Ant class
class Ant {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D(); // Start with a random direction
    this.vel.setMag(random(1, 3)); // Random initial speed
    this.acc = createVector(0, 0);
    this.maxSpeed = 3;    // Max speed limit
    this.maxForce = 0.1;  // Max steering force

    // Perlin noise offsets for wandering
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000);
    this.noiseOffsetAngle = random(3000);
  }

  // Apply force (used by steering behaviors like wander)
  applyForce(force) {
    this.acc.add(force);
  }

  // --- Behaviors ---
  wander() {
    // Use Perlin noise to generate a smoothly changing angle
    let wanderAngle = noise(this.noiseOffsetAngle) * TWO_PI * 2 - TWO_PI; // Map noise (0-1) to (-TWO_PI to TWO_PI)
    this.noiseOffsetAngle += 0.02; // Move through noise space

    // Create a vector pointing slightly ahead
    let wanderTarget = this.vel.copy();
    wanderTarget.normalize();
    wanderTarget.mult(15); // Project target slightly forward
    wanderTarget.add(this.pos);

    // Add a small displacement based on the wander angle
    let wanderRadius = 5;
    let displacement = p5.Vector.fromAngle(wanderAngle + this.vel.heading());
    displacement.mult(wanderRadius);

    let steer = wanderTarget.add(displacement); // Combine forward projection and displacement
    steer.sub(this.pos); // Vector from current pos to target
    steer.setMag(this.maxForce); // Scale to max steering force
    this.applyForce(steer);
  }

  // --- Physics Update ---
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    // Reset acceleration each frame
    this.acc.mult(0);
  }

  // --- Display ---
  display() {
    // Simple display: a point or small circle
    stroke(255, 255, 255, 200); // White, semi-transparent
    strokeWeight(3);
    point(this.pos.x, this.pos.y);

    // Optional: Draw heading vector for debugging
    // push();
    // translate(this.pos.x, this.pos.y);
    // rotate(this.vel.heading());
    // stroke(0, 255, 0);
    // line(0, 0, 10, 0);
    // pop();
  }

  // --- Edge Handling ---
  edges() {
    // Wrap around edges
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(30);
} 