# Phase 2: Emergent Paths (Basic Pheromone Dynamics) 🧭

With our ants exploring, it's time to introduce the core concept of stigmergy: indirect communication through the environment. In this phase, ants will start leaving pheromone trails, and these trails will fade over time.

## Functional Goals (What we want to see)

1.  **Trail Dropping:** Ants leave a visual trace (pheromone) as they move across the canvas.
2.  **Trail Fading:** Pheromone trails gradually disappear over time (decay). Older trails become fainter.
3.  **Trail Visualization:** The pheromone trails should be clearly visible, likely underneath the ants, showing their recent paths.
4.  **Emergence (Basic):** Areas frequently traversed by ants should appear to have stronger or more persistent trails due to continuous deposition.

## Technical Implementation (How we'll code it in p5.js)

1.  **Pheromone Layer (`sketch.js`):**

    - **Off-screen Graphics Buffer:** Create an off-screen graphics buffer using `createGraphics(width, height)`. This buffer will act as our pheromone layer.
    - **Initialization:** In `setup()`, initialize this buffer.
    - **Drawing Trails:** In `draw()`, instead of ants drawing directly on the main canvas, they will draw their pheromone trace onto this off-screen buffer.
    - **Decay Effect:** In `draw()`, apply a semi-transparent overlay to the _entire_ pheromone buffer each frame (`pheromoneBuffer.background(R, G, B, Alpha)` or `pheromoneBuffer.fill(R, G, B, Alpha); pheromoneBuffer.rect(0,0,width,height)`). This creates the fading effect naturally.
    - **Rendering:** In `draw()`, draw the pheromone buffer onto the main canvas (`image(pheromoneBuffer, 0, 0)`) _before_ drawing the ants, so ants appear on top of their trails.

2.  **`Ant` Class (`ant.js`):**

    - **`dropPheromone(buffer)` Method:** Add a method to the `Ant` class.
      - This method will take the pheromone graphics buffer as an argument.
      - Inside, it will draw a small, semi-transparent shape (e.g., `buffer.fill(255, 255, 0, 100); buffer.noStroke(); buffer.ellipse(this.position.x, this.position.y, 4, 4);`) onto the passed buffer at the ant's current position.
    - **Call from `update()` or `draw()`:** Decide whether dropping pheromones happens as part of the ant's `update()` cycle or is called explicitly in the main `draw()` loop after updating the ant's position. (Calling from the main loop might be cleaner).

3.  **Main Sketch (`sketch.js`):**
    - **Modify `draw()` Loop:**
      - Apply the decay effect to the pheromone buffer.
      - Render the pheromone buffer to the main canvas.
      - Loop through the `swarm`:
        - Call `ant.update()`.
        - Call `ant.dropPheromone(pheromoneBuffer)`.
        - Call `ant.display()` (draws ant on the main canvas).

This approach keeps the main canvas clean for drawing agents and uses the graphics buffer specifically for managing and displaying the decaying trails.
