class Ant {
    constructor(x, y) {
        // Initialize position randomly if x, y are not provided
        // Otherwise, use the provided coordinates
        this.position = createVector(x !== undefined ? x : random(width), y !== undefined ? y : random(height));
        // Initialize velocity with a small random vector for movement
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(1, 3)); // Give it some initial speed
        this.acceleration = createVector(0, 0); // << New: Acceleration vector

        this.state = 'searching'; // Initialize state: 'searching' or 'returning'

        // << New: Steering and Sensing parameters
        this.maxSpeed = 3; // Max speed limit
        this.maxForce = 0.2; // Max steering force limit
        this.senseDistance = 15; // << Modified: How far ahead to sense (20 to 15)
        this.senseAngle = PI / 4; // Angle offset for side sensors (45 degrees)

        // --- Q-Learning Parameters ---
        this.qTable = {}; // Using a simple Object for now: qTable[stateString] = {action1: value, action2: value}
        this.learningRate = 0.1; // Alpha: How quickly we accept new Q-values
        this.discountFactor = 0.9; // Gamma: Importance of future rewards
        this.epsilon = 0.1; // Exploration rate (10% chance of random action)
        this.actions = [-this.senseAngle / 2, 0, this.senseAngle / 2]; // Actions: Steer left, straight, right (adjust angles as needed)
        this.prevStateAction = null; // Store { state: s, action: a } for Q-update
        // -----------------------------
        this.wasExploring = false; // << Visualization: Flag set true if last action was random exploration
        this.exploreHighlightTimer = 0; // << Visualization: Timer to keep highlight for a few frames
    }

    // Method to update ant's position
    update(buffer) {
        // Decrement highlight timer
        if (this.exploreHighlightTimer > 0) {
            this.exploreHighlightTimer--;
        }

        // --- Q-Learning Core Logic ---
        const currentStateKey = this.getCurrentState(buffer); 
        let chosenAction; // This will be the *angle* to turn

        // Initialize Q-table entry for the state if it doesn't exist
        if (!this.qTable[currentStateKey]) {
            this.qTable[currentStateKey] = {};
            // Initialize Q-values for all actions to 0 for this new state
            this.actions.forEach(action => {
                this.qTable[currentStateKey][action] = 0;
            });
        }

        // Epsilon-greedy action selection
        if (random(1) < this.epsilon) {
            // Explore: Choose a random action
            chosenAction = random(this.actions);
            this.wasExploring = true; // Keep this flag if needed elsewhere, but timer is main display logic now
            this.exploreHighlightTimer = 20; // << Set timer on exploration
            // console.log(`Ant ${this.position.x.toFixed(0)} exploring: random action ${chosenAction.toFixed(2)}`);
        } else {
            // Exploit: Choose the best known action
            chosenAction = this.getBestAction(currentStateKey);
            this.wasExploring = false; 
            // Timer simply decrements if not exploring
            // console.log(`Ant ${this.position.x.toFixed(0)} exploiting: best action ${chosenAction.toFixed(2)} for state ${currentStateKey}`);
        }

        // Store current state and chosen action for the Q-update later
        // We need to do the update *after* observing the reward and next state
        const stateActionToUpdate = { state: currentStateKey, action: chosenAction }; 
        // --------------------------

        // --- Determine Target/Goal based on Ant State ---
        let targetForce = createVector(0, 0);
        if (this.state === 'searching') {
            let distanceToFood = dist(this.position.x, this.position.y, foodSource.x, foodSource.y);
            if (distanceToFood < 10) { 
                this.state = 'returning';
                this.velocity.mult(-1); 
                this.acceleration.mult(0); 
                console.log("Ant found food! Returning...");
                // TODO: Assign Reward for finding food
                this.prevStateAction = null; // Reset previous state/action when goal reached
            } else {
                // In Q-learning, we don't directly use pheromone/wander forces for steering
                // The chosenAction dictates the turn.
                // We might still use wander slightly? Or rely purely on Q-learning?
                // Let's rely on Q-learning for now.
            }
        } else if (this.state === 'returning') {
            let distanceToNest = dist(this.position.x, this.position.y, nestPosition.x, nestPosition.y); 
            if (distanceToNest < 15) { 
                this.state = 'searching';
                this.velocity = p5.Vector.random2D(); 
                this.velocity.setMag(random(1, 3));
                this.acceleration.mult(0); 
                console.log("Ant returned to nest. Searching again...");
                // TODO: Assign Reward for returning to nest
                this.prevStateAction = null; // Reset previous state/action when goal reached
            } else {
                 // Rely on Q-learning action to steer towards nest implicitly
            }
        }

        // --- Apply Chosen Action ---
        // Rotate the ant's velocity vector by the chosen action angle
        const positionBeforeMove = this.position.copy(); // Store position *before* applying action/avoidance
        this.velocity.rotate(chosenAction);

        // --- Obstacle Avoidance (Override?) ---
        let avoidanceForce = this.avoidObstacles(); 
        this.applyForce(avoidanceForce); 
        const avoidingObstacle = avoidanceForce.magSq() > 0.001; // Check if avoidance kicked in
        
        // --- Update movement --- (Do this *before* calculating reward based on new position)
        this.velocity.add(this.acceleration); 
        this.velocity.limit(this.maxSpeed);   
        this.position.add(this.velocity);     
        this.acceleration.mult(0);            
        this.checkEdges(); // Wrap around if needed
        const positionAfterMove = this.position.copy(); // Position after move and edge check

        // --- Q-Learning Update --- 
        const nextStateKey = this.getCurrentState(buffer); // Get state *after* moving
        
        // --- Calculate Reward --- 
        let reward = -0.01; // Base cost of living

        // Reward for getting closer to the target
        const target = this.state === 'searching' ? foodSource : nestPosition;
        const distBefore = p5.Vector.dist(positionBeforeMove, target);
        const distAfter = p5.Vector.dist(positionAfterMove, target);
        if (distAfter < distBefore) {
            reward += 0.05; // Small reward for progress
        }
        
        // Penalty for hitting obstacle
        if (avoidingObstacle) {
             reward -= 1.0; // Penalty for needing to avoid
             // console.log("--- PENALTY -1.0 (Obstacle Avoidance) ---");
        }

        // Check if the goal state changed (BIG Rewards)
        const previousAntStateGoal = this.prevStateAction ? this.prevStateAction.state.split('_G:')[1].split('_')[0] : null; // Extract goal from prev state key
        const currentAntStateGoal = this.state === 'searching' ? 'Food' : 'Nest'; // What the goal *is* now (might have been changed by goal check)
        
        if (previousAntStateGoal === 'Food' && currentAntStateGoal === 'Nest') {
            reward += 10.0; // Large positive reward for finding food
            console.log("***** REWARD +10 (Found Food) *****")
        } else if (previousAntStateGoal === 'Nest' && currentAntStateGoal === 'Food') {
            reward += 10.0; // Large positive reward for returning home
            console.log("***** REWARD +10 (Returned Nest) *****")
        }
        // -----------------------
        
        // If we have a previous state/action pair to update...
        if (this.prevStateAction) {
             const s = this.prevStateAction.state;
             const a = this.prevStateAction.action;
             const s_prime = nextStateKey; 
             const r = reward; // Use the calculated reward

             // Ensure Q-table entries exist (might be redundant if initialized above, but safe)
             if (!this.qTable[s]) this.qTable[s] = {};
             if (this.qTable[s][a] === undefined) this.qTable[s][a] = 0;
             if (!this.qTable[s_prime]) { // Ensure next state exists for maxQ calculation
                 this.qTable[s_prime] = {};
                  this.actions.forEach(next_action => {
                      this.qTable[s_prime][next_action] = 0;
                  });
             }

             // Q-Learning formula: Q(s, a) = Q(s, a) + alpha * (r + gamma * max_a'(Q(s', a')) - Q(s, a))
             const oldQ = this.qTable[s][a];
             const maxNextQ = this.qTable[s_prime][this.getBestAction(s_prime)]; // Q-value of best action from next state
             const newQ = oldQ + this.learningRate * (r + this.discountFactor * maxNextQ - oldQ);
             
             this.qTable[s][a] = newQ;
            // console.log(`Updated Q(${s}, ${a.toFixed(2)}): ${oldQ.toFixed(3)} -> ${newQ.toFixed(3)} (r=${r}, maxNextQ=${maxNextQ.toFixed(3)})`);
        }
        
        // Store the state and action *we just took* for the *next* iteration's update
        this.prevStateAction = stateActionToUpdate;
        // ------------------------
    }

    // Method to handle canvas boundaries
    checkEdges() {
        if (this.position.x > width) {
            this.position.x = 0;
        }
        if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        }
        if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    // Method to display the ant
    display() {
        // Simple representation: a white circle
        push(); // Isolate drawing styles
        translate(this.position.x, this.position.y);
        // Optional: Rotate based on velocity direction
        // rotate(this.velocity.heading());

        if (this.exploreHighlightTimer > 0) { // << Check timer instead of flag
            fill(255, 255, 0); // Yellow for exploring ants (for a few frames)
        } else if (this.state === 'returning') {
            fill(0, 255, 255); // Cyan for returning ants
        } else {
            fill(255); // White for searching ants
        }
        noStroke();
        ellipse(0, 0, 5, 5); // Draw a smaller circle (was 8x8)
        pop(); // Restore previous drawing styles
    }

    // Method for the ant to drop pheromone trail
    dropPheromone(buffer) {
        // Check if current position is inside any obstacle
        let insideObstacle = false;
        for (let obs of obstacles) {
            if (this.position.x > obs.x && this.position.x < obs.x + obs.width &&
                this.position.y > obs.y && this.position.y < obs.y + obs.height) {
                insideObstacle = true;
                break;
            }
        }

        // Only drop if not inside an obstacle
        if (!insideObstacle) {
            if (this.state === 'returning') {
                // Drop stronger/different pheromone when returning
                buffer.fill(0, 255, 255, 200); // Cyan for returning ants, high alpha
                buffer.noStroke();
                buffer.ellipse(this.position.x, this.position.y, 3, 3); // Smaller trail (was 5x5)
            } else {
                 // Regular pheromone when searching - LET'S NOT DROP SEARCHING TRAILS FOR NOW
                 // This makes following return trails clearer
                // buffer.fill(255, 255, 0, 100); // Yellow, semi-transparent
                // buffer.noStroke();
                // buffer.ellipse(this.position.x, this.position.y, 4, 4);
            }
        }
    }
    
    // << New: Method to sense pheromones
    sensePheromones(buffer) {
        // Calculate sensor positions
        let centerPos = p5.Vector.add(this.position, this.velocity.copy().setMag(this.senseDistance));
        let leftPos = p5.Vector.add(this.position, this.velocity.copy().rotate(-this.senseAngle).setMag(this.senseDistance));
        let rightPos = p5.Vector.add(this.position, this.velocity.copy().rotate(this.senseAngle).setMag(this.senseDistance));

        // Sample buffer at sensor positions (ensure positions are within bounds)
        let centerIntensity = this.getPheromoneIntensity(buffer, centerPos.x, centerPos.y);
        let leftIntensity = this.getPheromoneIntensity(buffer, leftPos.x, leftPos.y);
        let rightIntensity = this.getPheromoneIntensity(buffer, rightPos.x, rightPos.y);

        // Return the raw intensities
        return { left: leftIntensity, center: centerIntensity, right: rightIntensity };
    }

    // << Q-Learning: Method to get the discretized current state string
    getCurrentState(buffer) {
        const intensities = this.sensePheromones(buffer);

        // Discretize pheromone intensities
        const discretizeIntensity = (value) => {
            if (value < 0.2) return 'L';
            if (value < 0.7) return 'M';
            return 'H';
        };

        const pLeft = discretizeIntensity(intensities.left);
        const pCenter = discretizeIntensity(intensities.center);
        const pRight = discretizeIntensity(intensities.right);

        // Determine target and calculate relative direction
        const target = this.state === 'searching' ? foodSource : nestPosition;
        const vectorToTarget = p5.Vector.sub(target, this.position);
        const angleToTarget = vectorToTarget.heading(); // Absolute angle to target
        const antHeading = this.velocity.heading(); // Ant's current direction
        let relativeAngle = angleToTarget - antHeading;

        // Normalize angle to be between -PI and PI
        while (relativeAngle > PI) relativeAngle -= TWO_PI;
        while (relativeAngle <= -PI) relativeAngle += TWO_PI;

        // Discretize relative angle
        let targetDirection = 'Ahead'; // Default
        const angleThreshold = PI / 4; // 45 degrees
        if (relativeAngle > angleThreshold && relativeAngle <= 3 * angleThreshold) {
             targetDirection = 'Right';
        } else if (relativeAngle < -angleThreshold && relativeAngle >= -3 * angleThreshold) {
             targetDirection = 'Left';
        } else if (abs(relativeAngle) > 3 * angleThreshold) {
             targetDirection = 'Behind';
        }

        // Combine into a state string
        const goal = this.state === 'searching' ? 'Food' : 'Nest';
        return `P:${pLeft}-${pCenter}-${pRight}_G:${goal}_T:${targetDirection}`;
    }

    // << Q-Learning: Helper to get the action with the highest Q-value for a state
    getBestAction(stateKey) {
        const stateActions = this.qTable[stateKey];
        if (!stateActions) {
            // If state is unknown, maybe return a default action (e.g., 0 for straight)
            // Or, we could initialize Q-values for this state here
            return 0; // Go straight if state is new
        }

        let bestAction = 0; // Default to straight
        let maxQ = -Infinity;
        let actionsExist = false;

        // Find the action index corresponding to the highest Q-value
        // Note: We are storing Q-values keyed by the *action value* (the angle) itself.
        for (const action of this.actions) {
            const qValue = stateActions[action] !== undefined ? stateActions[action] : 0; // Default Q-value is 0 if action hasn't been tried
            if (qValue > maxQ) {
                maxQ = qValue;
                bestAction = action;
                actionsExist = true;
            }
        }
        
        // If no actions had non-zero Q-values (or state was just initialized), maybe default to straight or random?
        // For now, it defaults to the action with Q=0 (or the last one checked if all are -Infinity, though that shouldn't happen with default 0)
        // Let's stick with returning the action associated with the highest Q found (even if 0)
        return bestAction;
    }

    // << New: Helper to get pheromone intensity from buffer
    getPheromoneIntensity(buffer, x, y) {
        // Clamp coordinates to be within the buffer bounds
        x = constrain(floor(x), 0, buffer.width - 1);
        y = constrain(floor(y), 0, buffer.height - 1);

        let col = buffer.get(x, y); // Returns [R, G, B, A]
        // Check if it's the return pheromone color (Cyan: 0, 255, 255) and return alpha as intensity
        // Allow some tolerance for color matching if needed
        if (col[0] < 50 && col[1] > 200 && col[2] > 200) {
             // Normalize alpha (0-255) to a 0-1 range (or similar) for intensity scaling
             return col[3] / 255.0; 
        }
        return 0; // No return pheromone detected
    }

    // << New: Apply force method
    applyForce(force) {
        this.acceleration.add(force);
    }
    
    // << New: Steering method (calculates steering force towards a target)
    steer(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.maxSpeed);
        let steeringForce = p5.Vector.sub(desired, this.velocity);
        steeringForce.limit(this.maxForce);
        return steeringForce;
    }

    // Method to avoid obstacles
    avoidObstacles() {
        let avoidanceForce = createVector(0, 0);
        // Predict next position (can be based on current velocity or look further ahead)
        let predictDist = this.velocity.mag() * 1.5; // Look slightly ahead
        let nextPos = p5.Vector.add(this.position, this.velocity.copy().setMag(predictDist));

        for (let obs of obstacles) {
            // Check if predicted position intersects obstacle
            if (nextPos.x > obs.x && nextPos.x < obs.x + obs.width &&
                nextPos.y > obs.y && nextPos.y < obs.y + obs.height) {
                
                // Collision predicted! Calculate a force to steer away
                // Simple approach: Force directly away from obstacle center
                let obstacleCenter = createVector(obs.x + obs.width / 2, obs.y + obs.height / 2);
                let desiredAway = p5.Vector.sub(this.position, obstacleCenter); // Vector pointing away
                
                // More robust: Find nearest edge/point and steer perpendicular? (More complex)

                // Apply steering logic
                desiredAway.setMag(this.maxSpeed); // Desire max speed away
                avoidanceForce = p5.Vector.sub(desiredAway, this.velocity);
                avoidanceForce.limit(this.maxForce * 3.0); // Increase avoidance force multiplier (2.0 to 3.0)
                
                // Return immediately after finding one collision to avoid conflicting forces
                return avoidanceForce; 
            }
        }
         return avoidanceForce; // Return zero vector if no collision predicted
    }

    // << Phase 6: Method to get Q-Table information for the current state
    getQInfo(buffer) {
        const currentStateKey = this.getCurrentState(buffer);
        const qValues = this.qTable[currentStateKey];

        let info = {
            state: currentStateKey,
            qLeft: 'N/A',
            qStraight: 'N/A',
            qRight: 'N/A'
        };

        if (qValues) {
            // Assuming this.actions is [-angle, 0, +angle]
            info.qLeft = qValues[this.actions[0]] !== undefined ? qValues[this.actions[0]].toFixed(3) : 'N/A';
            info.qStraight = qValues[this.actions[1]] !== undefined ? qValues[this.actions[1]].toFixed(3) : 'N/A';
            info.qRight = qValues[this.actions[2]] !== undefined ? qValues[this.actions[2]].toFixed(3) : 'N/A';
        } else {
            // State not yet encountered
            info.state += " (Unknown)";
        }
        
        return info;
    }
} 