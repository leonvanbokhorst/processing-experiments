let swarm = [];
const canvasWidth = 1200;
const canvasHeight = 800;
const numAnts = 50; // More ants!
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
  pheromoneBuffer = createGraphics(canvasWidth, canvasHeight);
  pheromoneBuffer.background(51, 0); // Initialize with background color but fully transparent

  // Initialize food source position
  foodSource = createVector(canvasWidth - 100, canvasHeight - 100); // Bottom-right corner

  // << New: Initialize nest position
  nestPosition = createVector( 100, 100); // Top-left corner

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
  pheromoneBuffer.background(51, 3); // Increased decay rate (was 3)

  // Draw the pheromone buffer onto the main canvas
  image(pheromoneBuffer, 0, 0);

  // Draw the food source
  fill(0, 255, 0); // Green color for food
  noStroke();
  ellipse(foodSource.x, foodSource.y, 20, 20); // Draw a circle for the food

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
  const clickThreshold = 100; // How close the click needs to be to select

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

class Ant {
  constructor() {
    // << Unique ID for debugging Phase 6
    this.id = Math.random().toString(16).substring(2, 8);

    // Start at the nest
    this.position = nestPosition.copy(); // << New: Start at the nest
    this.velocity = p5.Vector.random2D(); // Start with a random direction
    this.velocity.setMag(random(1, 2)); // Slightly randomized speed
    this.maxSpeed = 3;
    this.maxForce = 0.7; // Steering force limit
    this.wanderAngle = random(TWO_PI); // For wandering behavior
    this.hasFood = false; // << New: Track if ant is carrying food

    // Q-Learning parameters
    this.alpha = 0.15; // Learning rate
    this.gamma = 0.8; // Discount factor
    this.epsilon = 0.1; // Exploration rate (Increased from 0.1)
    // Q-table: 16 states (8 for seeking, 8 for returning) x 3 actions (left, straight, right)
    this.qTable = Array(16).fill(0).map(() => [0, 0, 0]); // State 0-7: Seeking, State 8-15: Returning
    this.lastState = null;
    this.lastAction = null;

    // Rewards and Penalties
    this.reward = 5; // Reward for finding food
    this.returnReward = 10; // << New: Reward for returning to nest
    this.penalty = -10; // Penalty for hitting obstacle (Increased from -1)
  }

  update(pheromoneBuffer) {
    // Q-Learning Step 1: Determine current state and choose action
    const currentState = this.getState(pheromoneBuffer);
    const action = this.chooseAction(currentState);

    // If we have a previous state/action, learn from the transition
    if (this.lastState !== null && this.lastAction !== null) {
      // Determine reward based on outcome of LAST action
      let immediateReward = 0; // Default: no immediate reward/penalty
      
      // Check for obstacle collision *before* moving to new state
      if (this.checkObstacleCollision()) {
        immediateReward = this.penalty;
        // Optional: Move ant back slightly or stop? Currently just penalizes.
        // this.position.sub(this.velocity); // Revert move? Needs careful thought
      } else {
        // Check for food pickup
        let dFood = dist(this.position.x, this.position.y, foodSource.x, foodSource.y);
        if (dFood < 10 && !this.hasFood) { 
          this.hasFood = true;
          immediateReward = this.reward; 
          this.velocity.mult(-1); // Turn around
          console.log(`Ant ${this.id} found food!`);
        }
        
        // Check for nest return
        let dNest = dist(this.position.x, this.position.y, nestPosition.x, nestPosition.y);
        if (dNest < 10 && this.hasFood) {
          this.hasFood = false;
          immediateReward = this.returnReward;
          this.velocity.mult(-1); // Turn around
          console.log(`Ant ${this.id} returned food to nest!`);
        }
      }
      
      // Update Q-value based on the reward received from the *last* action
      this.updateQValue(this.lastState, this.lastAction, immediateReward, currentState);
    }

    // Perform the chosen action (turn/move)
    this.performAction(action); 

    // Update velocity and position (Standard movement)
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    
    // Store current state and action for the next update cycle
    this.lastState = currentState;
    this.lastAction = action;
    
    // Apply boundary conditions and obstacle avoidance
    this.avoidObstacles(); // Might adjust velocity
    this.edges(); // Handle screen edges
  }

  // << Phase 5: Determine the current state based on pheromone levels
  getState(pheromoneBuffer) {
    const pheromoneThreshold = 10; // How much pheromone is needed to be detected
    const samples = this.samplePheromone(pheromoneBuffer);

    // Original state calculation (0-7 based on pheromones)
    let baseState = 0;
    if (samples.left > pheromoneThreshold) baseState |= 4;   // Bit 2: Left sensor
    if (samples.straight > pheromoneThreshold) baseState |= 2; // Bit 1: Straight sensor
    if (samples.right > pheromoneThreshold) baseState |= 1;  // Bit 0: Right sensor

    // NEW: Offset the state if the ant is carrying food
    if (this.hasFood) {
        return baseState + 8; // States 8-15 represent returning state
    } else {
        return baseState;     // States 0-7 represent seeking state
    }
  }

  // << Phase 5: Choose an action based on the Q-table (epsilon-greedy)
  chooseAction(state) {
    if (random(1) < this.epsilon) {
      // Exploration: Choose a random action
      return floor(random(3)); // 0: left, 1: straight, 2: right
    } else {
      // Exploitation: Choose the best action from Q-table
      const qValues = this.qTable[state];
      let bestAction = 0;
      for (let i = 1; i < qValues.length; i++) {
        if (qValues[i] > qValues[bestAction]) {
          bestAction = i;
        }
      }
       // Tiny noise to break ties randomly
       const bestValue = qValues[bestAction];
       const tiedActions = qValues.reduce((acc, val, idx) => {
         if (abs(val - bestValue) < 0.001) acc.push(idx);
         return acc;
       }, []);
       return random(tiedActions); // Choose randomly among best actions
    }
  }
  
  // << New helper for performing action >>
  performAction(action) {
      let steer = createVector(0, 0);
      switch (action) {
        case 0: // Turn Left
          steer = this.turnLeft();
          break;
        case 1: // Go Straight
          steer = this.goStraight();
          break;
        case 2: // Turn Right
          steer = this.turnRight();
          break;
      }
      this.velocity.add(steer);
  }

  // << Phase 5: Update the Q-value based on the Bellman equation
  updateQValue(state, action, reward, nextState) {
    const currentQ = this.qTable[state][action];
    const maxNextQ = Math.max(...this.qTable[nextState]); // Q-value of best action in next state
    const newQ = currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ);
    this.qTable[state][action] = newQ;
  }

  // Steering behaviors
  turnLeft() {
    let desired = this.velocity.copy();
    desired.rotate(-0.1); // Small left turn angle
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
    //this.applyForce(steer);
  }

  goStraight() {
    // Maintain current direction, maybe add slight wander?
    let desired = this.velocity.copy(); // Keep going
    desired.setMag(this.maxSpeed);
     // Add slight random wander
     this.wanderAngle += random(-0.1, 0.1); 
     let wanderForce = p5.Vector.fromAngle(this.velocity.heading() + this.wanderAngle);
     wanderForce.setMag(this.maxForce * 0.5); // Wander gently
     
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce * 0.5); // Limit steering force less when going straight?
    steer.add(wanderForce);
    return steer;
    //this.applyForce(steer);
  }

  turnRight() {
    let desired = this.velocity.copy();
    desired.rotate(0.1); // Small right turn angle
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
    //this.applyForce(steer);
  }

  // Pheromone handling
  samplePheromone(buffer) {
    const sampleDistance = 10; // How far ahead to sample
    const sampleAngle = PI / 6; // Angle for side samples

    // Calculate sample points
    let straightPos = p5.Vector.add(this.position, p5.Vector.mult(this.velocity.copy().normalize(), sampleDistance));
    let leftPos = p5.Vector.add(this.position, p5.Vector.mult(this.velocity.copy().rotate(-sampleAngle).normalize(), sampleDistance));
    let rightPos = p5.Vector.add(this.position, p5.Vector.mult(this.velocity.copy().rotate(sampleAngle).normalize(), sampleDistance));

    // Helper to get pheromone strength (alpha value) at a point
    const getStrength = (pos) => {
      if (pos.x < 0 || pos.x >= buffer.width || pos.y < 0 || pos.y >= buffer.height) return 0;
      const col = buffer.get(int(pos.x), int(pos.y));
      // Assuming pheromone strength is stored in alpha channel for simplicity
      return alpha(col); // p5 function to get alpha
    };

    return {
      left: getStrength(leftPos),
      straight: getStrength(straightPos),
      right: getStrength(rightPos)
    };
  }

  dropPheromone(buffer) {
    // Simple pheromone drop at current location
    buffer.fill(255, 255, 0, 150); // Yellowish, semi-transparent 'food' pheromone
    if (this.hasFood) {
        buffer.fill(0, 100, 255, 150); // Bluish 'return' pheromone
    }
    buffer.noStroke();
    buffer.ellipse(this.position.x, this.position.y, 5, 5);
  }

  // Collision and boundary checks
   checkObstacleCollision() {
    for (let obs of obstacles) {
      if (this.position.x > obs.x && this.position.x < obs.x + obs.width &&
          this.position.y > obs.y && this.position.y < obs.y + obs.height) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  }

  avoidObstacles() {
      const avoidanceRadius = 20; // How far ahead to check
      let ahead = this.velocity.copy().normalize().mult(avoidanceRadius);
      let aheadPos = p5.Vector.add(this.position, ahead);
  
      let avoidanceForce = createVector(0, 0);
      let hitObstacle = false;
  
      for (let obs of obstacles) {
        // Simple point check first
        if (aheadPos.x > obs.x && aheadPos.x < obs.x + obs.width &&
            aheadPos.y > obs.y && aheadPos.y < obs.y + obs.height) {
            
           hitObstacle = true;
           // Calculate avoidance force: steer away from center of obstacle
           let center = createVector(obs.x + obs.width / 2, obs.y + obs.height / 2);
           let desired = p5.Vector.sub(this.position, center); // Steer away from center
           desired.setMag(this.maxSpeed); 
           let steer = p5.Vector.sub(desired, this.velocity);
           steer.limit(this.maxForce * 2); // Stronger avoidance force
           avoidanceForce.add(steer);
           break; // Only avoid the first detected obstacle for simplicity
        }
      }
      
      if (hitObstacle) {
        this.velocity.add(avoidanceForce); // Apply avoidance directly to velocity for now
      }
      
      // Also check immediate position for collision (e.g., if pushed into obstacle)
       if (this.checkObstacleCollision()) {
           // Move away strongly if currently inside an obstacle
            let strongestAvoidance = createVector(0,0);
            for (let obs of obstacles) {
                if (this.position.x > obs.x && this.position.x < obs.x + obs.width &&
                    this.position.y > obs.y && this.position.y < obs.y + obs.height) {
                    let center = createVector(obs.x + obs.width / 2, obs.y + obs.height / 2);
                    let desired = p5.Vector.sub(this.position, center); 
                    desired.setMag(this.maxSpeed * 1.5); // Very strong push out
                    strongestAvoidance.add(desired);
                 }
            }
             this.velocity.add(strongestAvoidance); // Add force to get out
             this.velocity.limit(this.maxSpeed); 
             this.position.add(this.velocity.copy().mult(0.5)); // Nudge immediately
       }
  }

  edges() {
    let margin = 5;
    let steer = createVector(0, 0);
    let desired = null;

    if (this.position.x < margin) {
      desired = createVector(this.maxSpeed, this.velocity.y);
    } else if (this.position.x > width - margin) {
      desired = createVector(-this.maxSpeed, this.velocity.y);
    }

    if (this.position.y < margin) {
      desired = createVector(this.velocity.x, this.maxSpeed);
    } else if (this.position.y > height - margin) {
      desired = createVector(this.velocity.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxSpeed);
      steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxForce * 3); // Strong steering away from edge
      this.velocity.add(steer);
    }
  }

  // Display the ant
  display() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + PI / 2;
    push(); // Isolate transformations
    translate(this.position.x, this.position.y);
    rotate(theta);
    fill(127);
    stroke(200);
    if (this.hasFood) {
        fill(0, 200, 0); // Green when carrying food
    }
    beginShape();
    vertex(0, -6); // Triangle pointing upwards relative to ant direction
    vertex(-3, 6);
    vertex(3, 6);
    endShape(CLOSE);
    pop(); // Restore previous transformation state
  }

  // << Phase 6: Get Q-learning info for display
  getQInfo(pheromoneBuffer) {
    const state = this.getState(pheromoneBuffer);
    const qValues = this.qTable[state];
    const stateType = this.hasFood ? 'Returning' : 'Seeking'; // Clarify state type
    return {
      state: `${state} (${stateType})`, // Show state number and type
      qLeft: qValues[0].toFixed(3),
      qStraight: qValues[1].toFixed(3),
      qRight: qValues[2].toFixed(3)
    };
  }
} 