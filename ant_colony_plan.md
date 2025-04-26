# Ant Colony Simulation - Scaffolded Plan

This plan outlines the development steps for creating a p5.js simulation inspired by ant colony behavior, progressing from simple foundations to more complex interactions.

## Phase 1: Basic Movement (✅ Completed)

- **Goal:** Establish individual ant agents capable of independent movement.
- **Steps:**
  - Create an `Ant` class with position, velocity, acceleration.
  - Implement basic physics update (`update()` method).
  - Implement edge handling (e.g., `edges()` method for wrapping).
  - Implement a basic `wander()` behavior using Perlin noise steering.
  - Instantiate multiple ants and observe their independent movement.

## Phase 2: Pheromone Grid & Deposit

- **Goal:** Create a system for ants to leave trails.
- **Steps:**
  - Design a data structure to represent the pheromone map (e.g., a 2D grid covering the canvas).
  - Implement a `depositPheromone()` method in the `Ant` class (or have a central `PheromoneGrid` object handle it). This method increases the pheromone level in the grid cell corresponding to the ant's current position.
  - Call `depositPheromone()` within the ant's `update()` or `display()` loop.
  - _Optional Visualization:_ Add a way to visually represent the pheromone grid values (e.g., drawing faint rectangles or mapping values to brightness/color).

## Phase 3: Pheromone Evaporation & Diffusion

- **Goal:** Make trails fade over time and optionally spread slightly.
- **Steps:**
  - Implement an `update()` method for the `PheromoneGrid`.
  - Inside the grid's update, iterate through all cells and decrease their pheromone value slightly each frame (evaporation). Ensure values don't go below zero.
  - _Optional:_ Implement diffusion by having each cell's value also be slightly influenced by its neighbours (e.g., applying a blur). This makes trails smoother.
  - Call the `PheromoneGrid.update()` once per frame in the main `draw()` loop.

## Phase 4: Pheromone Sensing & Following

- **Goal:** Allow ants to detect and react to pheromone trails.
- **Steps:**
  - Implement a `sensePheromones()` method in the `Ant` class.
  - This method should sample the pheromone grid at points slightly ahead and to the left/right of the ant's current direction.
  - Implement a `followPheromones()` steering behavior. This calculates a steering force directing the ant towards the direction with the strongest sensed pheromone level.
  - Modify the main `draw()` loop (or the `Ant.update()` logic) so ants prioritize following pheromones over simply wandering if strong trails are detected nearby.

## Phase 5: Introducing Goals (Food & Nest)

- **Goal:** Give ants specific objectives.
- **Steps:**
  - Define locations for "food" sources and a central "nest".
  - Introduce states to the `Ant` class (e.g., `SEEKING_FOOD`, `RETURNING_TO_NEST`).
  - Ants initially wander (`SEEKING_FOOD` state).
  - If an ant finds food (gets close to a food source location), it switches to `RETURNING_TO_NEST` state.
  - Implement separate pheromone types (e.g., "food trail", "home trail") or modify deposit behavior based on state (e.g., only deposit "food trail" when returning with food).
  - Ants returning to the nest follow "home trails" (if available) or wander back. Ants seeking food follow "food trails".
  - When an ant reaches the nest, it switches back to `SEEKING_FOOD`.

## Phase 6: Refinement & Exploration

- **Goal:** Enhance realism, visuals, or performance.
- **Steps:**
  - Tune parameters (evaporation rate, diffusion, ant speed, steering forces, number of ants).
  - Improve visual representation (ant shapes, trail appearance).
  - Add environmental elements like obstacles.
  - Optimize performance (e.g., using spatial partitioning if many ants are present).
  - Experiment with different steering behaviors or ant interactions.
