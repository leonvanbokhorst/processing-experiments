# Phase 1: Basic Swarm Foundation 🐜

This phase focuses on creating the fundamental building blocks: the individual ants and their basic behaviors within the p5.js environment.

## Functional Goals (What we want to see)

1.  **Individual Ants:** Visually represent ants as simple shapes (e.g., circles, triangles) on the p5.js canvas.
2.  **Population:** Create a collection (swarm) of these ants.
3.  **Movement:** Each ant should move independently on the canvas.
4.  **Randomness:** Initial movement should appear random, simulating exploration.
5.  **Boundary Awareness:** Ants should interact with the edges of the canvas (e.g., wrap around to the other side, or bounce off).

_(Collision avoidance and pheromone response mentioned in the main plan will be tackled in subsequent steps within or after Phase 1 to keep initial complexity low)._

## Technical Implementation (How we'll code it in p5.js)

1.  **`Ant` Class:**

    - Define a JavaScript class named `Ant`.
    - **Properties:**
      - `position`: A `p5.Vector` to store the ant's (x, y) coordinates. Initialize randomly within canvas bounds.
      - `velocity`: A `p5.Vector` to store the ant's current speed and direction. Initialize with a small random vector.
      - _(Optional: `maxSpeed`, `maxForce` for more controlled movement later)._
    - **Methods:**
      - `constructor()`: Initializes the ant's properties.
      - `update()`: Modifies the ant's `position` based on its `velocity`. Implements the random movement logic (e.g., slightly perturbing the velocity vector each frame). Contains boundary checking logic (wrap or bounce).
      - `display()`: Draws the ant shape at its current `position` on the canvas using p5.js drawing functions (e.g., `ellipse()`, `triangle()`).
      - `checkEdges()`: (Or include logic in `update()`) Handles what happens when an ant reaches the canvas boundary.

2.  **Main Sketch (`sketch.js`):**
    - **Global Array:** Declare an array (e.g., `let swarm = [];`) to hold all `Ant` objects.
    - **`setup()` function:**
      - `createCanvas()`: Set up the drawing area.
      - Instantiate multiple `Ant` objects using a loop and the `new Ant()` constructor.
      - Add each new ant instance to the `swarm` array.
    - **`draw()` function:**
      - Clear the background (`background()`).
      - Loop through the `swarm` array.
      - For each `ant` in the `swarm`, call `ant.update()` and `ant.display()`.

This structure provides a clean separation of concerns: the `Ant` class manages individual ant behavior, and the main sketch manages the overall simulation loop and the collection of ants.
