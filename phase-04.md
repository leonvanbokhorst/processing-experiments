# Phase 4: Adaptive Learning & Optimization (Pheromone Following & Obstacles) 🧠

With ants finding food and returning, let's make their search smarter and the environment more challenging. This phase introduces probabilistic path selection based on pheromones (a key ACO element) and obstacles.

## Functional Goals (What we want to see)

1.  **Pheromone Following:** Ants actively 'sniff' for pheromones ahead of them and are biased to move towards areas with stronger concentrations, especially the 'return' trails left by successful ants.
2.  **Probabilistic Movement:** The decision to follow a pheromone trail shouldn't be absolute but probabilistic. Stronger trails have a higher chance of being followed.
3.  **Obstacle Placement:** Introduce one or more static obstacles (e.g., rectangles, circles) onto the canvas that block ant movement.
4.  **Obstacle Avoidance:** Ants should detect obstacles in their path and steer around them, finding new routes to food or the nest.
5.  **Adaptive Pathfinding:** The combination of pheromone following and obstacle avoidance should lead to the colony dynamically finding efficient paths around obstacles.
6.  **Visualization:** Clearly display obstacles. It should be visually evident that ants are avoiding obstacles and following reinforced pheromone paths around them.

## Technical Implementation (How we'll code it in p5.js)

1.  **Pheromone Sensing (`Ant` class in `ant.js`):**

    - When `state` is 'searching', implement a 'sensing' mechanism.
    - Sample pheromone levels at multiple points slightly ahead and to the sides of the ant's current direction (e.g., using `pheromoneBuffer.get(x, y)`).
    - Calculate a steering force vector that biases the ant's `velocity` towards the direction with the highest _return_ pheromone concentration (distinguishing between search/return pheromones might require checking color/alpha values).

2.  **Probabilistic Steering (`Ant` class in `ant.js`):**

    - Don't just add the full pheromone steering force. Blend it with the existing random wandering behavior.
    - The strength of the pheromone steering influence could be proportional to the detected pheromone intensity.
    - This requires careful tuning of steering forces (`maxForce`, `maxSpeed`).

3.  **Obstacle Definition (`sketch.js`):**

    - Define an array or object(s) to store obstacle properties (position, shape, size).
    - Initialize obstacles in `setup()`.
    - Draw the obstacles in `draw()`. Use a distinct color (e.g., gray or red).

4.  **Obstacle Avoidance (`Ant` class in `ant.js`):**

    - Implement collision detection between the ant and the obstacles. Check if the ant's next position would be inside an obstacle.
    - A simple approach: If a collision is imminent, drastically change the ant's velocity (e.g., reverse it or steer sharply away). Bounce off.
    - A more sophisticated approach (Steering Behaviors): Predict future position and calculate a steering force that pushes the ant away from the obstacle boundary before collision.

5.  **Integration (`Ant` class in `ant.js`):**

    - The `update()` method needs to combine multiple steering influences: random wandering, pheromone following, and obstacle avoidance.
    - Steering behaviors often involve calculating desired velocities for each behavior and then applying forces to change the current velocity towards the desired ones, respecting `maxForce` and `maxSpeed`.

6.  **Pheromone Buffer (`sketch.js` / `ant.js`):**
    - Ensure obstacles block pheromone trails (ants shouldn't drop pheromones _inside_ obstacles).
    - Consider if pheromones should dissipate faster near obstacles or if obstacle edges affect pheromone readings.

This phase introduces more complex steering behaviors and the core optimization mechanism of ACO, leading to more intelligent and adaptive colony movement.
