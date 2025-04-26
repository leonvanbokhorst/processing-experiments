class Ant {
    constructor(x, y) {
        // Initialize position randomly if x, y are not provided
        // Otherwise, use the provided coordinates
        this.position = createVector(x !== undefined ? x : random(width), y !== undefined ? y : random(height));
        // Initialize velocity with a small random vector for movement
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(1, 3)); // Give it some initial speed

        // Optional: Define max speed and steering force later
        // this.maxSpeed = 4;
        // this.maxForce = 0.1;
    }

    // Method to update ant's position
    update() {
        // Simple movement: add velocity to position
        this.position.add(this.velocity);

        // Basic boundary check (wrap around)
        this.checkEdges();

        // Simple random perturbation to velocity for exploration (can be refined later)
        let steering = p5.Vector.random2D();
        steering.mult(0.3); // Adjust the magnitude of randomness
        this.velocity.add(steering);
        this.velocity.limit(3); // Limit speed
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

        fill(255); // White color
        noStroke();
        ellipse(0, 0, 8, 8); // Draw a small circle
        pop(); // Restore previous drawing styles
    }

    // Method for the ant to drop pheromone trail
    dropPheromone(buffer) {
        // Draw a small, semi-transparent yellow circle on the provided buffer
        buffer.fill(255, 255, 0, 100); // Yellow, semi-transparent
        buffer.noStroke();
        buffer.ellipse(this.position.x, this.position.y, 4, 4);
    }
} 