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
    }

    // Method to update ant's position
    update(buffer) {
        let wanderForce = createVector(0,0);
        let pheromoneForce = createVector(0,0);

        if (this.state === 'searching') {
            // Check distance to food source
            let distanceToFood = dist(this.position.x, this.position.y, foodSource.x, foodSource.y);

            if (distanceToFood < 10) { // If close enough to food
                this.state = 'returning';
                this.velocity.mult(-1); // Reverse direction simple return logic
                this.acceleration.mult(0); // Reset acceleration
                console.log("Ant found food! Returning...");
            } else {
                // --- Pheromone Sensing and Wandering ---
                // 1. Sense Pheromones (will return a steering vector)
                pheromoneForce = this.sensePheromones(buffer); 
                
                // 2. Apply Wander behavior (modified)
                wanderForce = p5.Vector.random2D();
                wanderForce.setMag(0.02); // << Modified: Reduced wander strength further (0.05 to 0.02)

                // Combine forces (simple addition for now, could be weighted later)
                this.applyForce(wanderForce);
                this.applyForce(pheromoneForce); 
                // this.velocity.limit(this.maxSpeed); // Limit speed (moved below)
            }
        } else if (this.state === 'returning') {
            // Check if back near the nest
            let distanceToNest = dist(this.position.x, this.position.y, nestPosition.x, nestPosition.y); // << Modified: Use nestPosition
            if (distanceToNest < 15) { // If close enough to nest
                this.state = 'searching';
                this.velocity = p5.Vector.random2D(); // Get a new random direction
                this.velocity.setMag(random(1, 3));
                 this.acceleration.mult(0); // Reset acceleration
                console.log("Ant returned to nest. Searching again...");
            } else {
                 // --- Steering towards Nest --- 
                 let nestForce = this.steer(nestPosition); // << New: Calculate steering force towards the nest
                 this.applyForce(nestForce); // << New: Apply the force

                 // Ensure it doesn't stop completely if force calculation is zero
                 if (this.velocity.magSq() < 0.1) {
                     this.velocity = p5.Vector.random2D().setMag(this.maxSpeed); // Use maxSpeed
                 }
                 // this.velocity.limit(this.maxSpeed); // Limit speed (moved below)
            }
        }

        // --- Obstacle Avoidance --- (Should ideally return a force)
        let avoidanceForce = this.avoidObstacles(); // Modify avoidObstacles to return a force
        this.applyForce(avoidanceForce);

        // --- Update movement ---
        this.velocity.add(this.acceleration); // Update velocity with acceleration
        this.velocity.limit(this.maxSpeed);   // Limit speed
        this.position.add(this.velocity);     // Update position
        this.acceleration.mult(0);            // Reset acceleration each cycle

        // Basic boundary check (wrap around)
        this.checkEdges();
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

        if (this.state === 'returning') {
            fill(0, 255, 255); // Cyan for returning ants
        } else {
            fill(255); // White for searching ants
        }
        noStroke();
        ellipse(0, 0, 8, 8); // Draw a small circle
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
                buffer.ellipse(this.position.x, this.position.y, 5, 5); // Slightly larger trail
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
        let steerForce = createVector(0, 0);
        
        // Calculate sensor positions
        let centerPos = p5.Vector.add(this.position, this.velocity.copy().setMag(this.senseDistance));
        let leftPos = p5.Vector.add(this.position, this.velocity.copy().rotate(-this.senseAngle).setMag(this.senseDistance));
        let rightPos = p5.Vector.add(this.position, this.velocity.copy().rotate(this.senseAngle).setMag(this.senseDistance));

        // Sample buffer at sensor positions (ensure positions are within bounds)
        let centerIntensity = this.getPheromoneIntensity(buffer, centerPos.x, centerPos.y);
        let leftIntensity = this.getPheromoneIntensity(buffer, leftPos.x, leftPos.y);
        let rightIntensity = this.getPheromoneIntensity(buffer, rightPos.x, rightPos.y);

        // --- Decision Logic ---
        // Basic: Steer towards the strongest signal
        if (centerIntensity > leftIntensity && centerIntensity > rightIntensity) {
             // Steer forward (already going that way, maybe add slight force?)
             // steerForce = this.velocity.copy().normalize().mult(this.maxForce * 0.5 * centerIntensity); // Intensity used to scale
        } else if (leftIntensity > rightIntensity) {
            // Steer left
            let desiredLeft = p5.Vector.sub(leftPos, this.position);
             steerForce = this.steer(leftPos); // Use the steer method
             steerForce.mult(leftIntensity); // Scale by intensity
        } else if (rightIntensity > leftIntensity) {
            // Steer right
             let desiredRight = p5.Vector.sub(rightPos, this.position);
             steerForce = this.steer(rightPos); // Use the steer method
             steerForce.mult(rightIntensity); // Scale by intensity
        } 
        // If all are zero, steerForce remains (0,0) -> relies on wander

        steerForce.limit(this.maxForce); // Ensure pheromone force doesn't exceed max
        steerForce.mult(2.0); // << New: Amplify the calculated pheromone force
        return steerForce;
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
} 