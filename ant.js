class Ant {
    constructor(x, y) {
        // Initialize position randomly if x, y are not provided
        // Otherwise, use the provided coordinates
        this.position = createVector(x !== undefined ? x : random(width), y !== undefined ? y : random(height));
        // Initialize velocity with a small random vector for movement
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(1, 3)); // Give it some initial speed

        this.state = 'searching'; // Initialize state: 'searching' or 'returning'

        // Optional: Define max speed and steering force later
        // this.maxSpeed = 4;
        // this.maxForce = 0.1;
    }

    // Method to update ant's position
    update() {
        if (this.state === 'searching') {
            // Check distance to food source
            let distanceToFood = dist(this.position.x, this.position.y, foodSource.x, foodSource.y);

            if (distanceToFood < 10) { // If close enough to food
                this.state = 'returning';
                this.velocity.mult(-1); // Reverse direction simple return logic
                console.log("Ant found food! Returning...");
            } else {
                // Continue wandering/searching behavior
                let steering = p5.Vector.random2D();
                steering.mult(0.3); // Adjust the magnitude of randomness
                this.velocity.add(steering);
                this.velocity.limit(3); // Limit speed
            }
        } else if (this.state === 'returning') {
            // Check if back near the center (simple nest proxy)
            let distanceToNest = dist(this.position.x, this.position.y, width / 2, height / 2);
            if (distanceToNest < 15) { // If close enough to nest
                this.state = 'searching';
                this.velocity = p5.Vector.random2D(); // Get a new random direction
                this.velocity.setMag(random(1, 3));
                console.log("Ant returned to nest. Searching again...");
            } else {
                 // Optionally, implement more directed return steering here
                 // For now, just continue with current (reversed) velocity
                 // Ensure it doesn't stop
                 if (this.velocity.magSq() < 0.1) {
                     this.velocity = p5.Vector.random2D().setMag(2);
                 }
                 this.velocity.limit(4); // Can move a bit faster when returning
            }
        }

        // Simple movement: add velocity to position
        this.position.add(this.velocity);

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
        if (this.state === 'returning') {
            // Drop stronger/different pheromone when returning
            buffer.fill(255, 255, 0, 200); // Brighter yellow, less transparent
            buffer.noStroke();
            buffer.ellipse(this.position.x, this.position.y, 5, 5); // Slightly larger trail
        } else {
             // Regular pheromone when searching
            buffer.fill(255, 255, 0, 100); // Yellow, semi-transparent
            buffer.noStroke();
            buffer.ellipse(this.position.x, this.position.y, 4, 4);
        }
    }
} 