# Phase 6: Advanced Visualization & Insight 📊

With Q-learning successfully implemented, the ants demonstrate adaptive behavior. However, understanding _how_ they learn and _what_ they've learned can be challenging just by observing movement and trails. This phase focuses on adding deeper visual insights into the simulation, making the emergent intelligence and the learning process more apparent.

## Functional Goals (What we want to see)

1.  **Clearer Exploration:** Improve the visibility of ants performing exploratory actions versus exploiting learned paths (building on the initial implementation).
2.  **Q-Table Glimpse (Optional):** Provide a way to inspect, perhaps on clicking an ant, a simplified representation of its Q-values for its current state, showing which actions it currently prefers.
3.  **Ant Density Map:** Visualize areas of high ant traffic, potentially revealing emergent highways or bottlenecks beyond just pheromone trails.
4.  **Path Evolution (Time-lapse):** Implement functionality (perhaps UI controls) to speed up time or visualize how the dominant paths have changed over longer simulation runs.
5.  **Decision Heatmap (Ambitious):** Visualize the _learned policy_ across the environment - for a given state representation (ignoring pheromones perhaps, focusing on goal/direction), what action does the Q-table recommend in different locations?

## Technical Implementation (How we might code it in p5.js)

1.  **Exploration Highlight (`Ant` class in `ant.js`):**

    - Increase the `exploreHighlightTimer` duration significantly (e.g., 15-20 frames) to make the yellow flash more noticeable during live animation.

2.  **Q-Table Inspector (`sketch.js`, `ant.js`):**

    - Add mouse click detection in `sketch.js`.
    - Find the ant closest to the click position.
    - Add a method to the `Ant` class, e.g., `getQInfo()`, that returns the current state string and the associated Q-values (for Left, Straight, Right actions) from its `qTable`.
    - Display this information textually on the screen, perhaps in a corner or near the clicked ant. Format it clearly (e.g., "State: P:L-M-H_G:Food_T:Ahead | Q(L): 0.5, Q(S): 1.2, Q(R): 0.8").

3.  **Density Map (`sketch.js`):**

    - Create another off-screen graphics buffer (`densityBuffer`) similar to the `pheromoneBuffer`.
    - In the main draw loop, after updating ants, draw a small, highly transparent dot onto `densityBuffer` at each ant's position.
    - Apply a slight fade/decay to `densityBuffer` each frame, similar to pheromones but potentially slower.
    - Render `densityBuffer` underneath the ants but above the pheromones, perhaps using a different color tint (e.g., reddish hues for density).

4.  **Time-lapse Controls (`sketch.js`, `index.html`):**

    - Introduce a variable, e.g., `updatesPerFrame`, initialized to 1.
    - Modify the main `draw()` loop in `sketch.js` to run the ant `update` and pheromone `decay` logic `updatesPerFrame` times within a `for` loop.
    - Add HTML buttons or sliders (using p5.dom library) to increase/decrease `updatesPerFrame` (e.g., 1x, 5x, 10x speed).

5.  **Decision Heatmap (`sketch.js`, `ant.js` - Advanced):**
    - This is complex. Requires iterating over grid cells of the canvas.
    - For each cell, determine a representative 'state' (e.g., assuming 'Searching for Food', target 'Ahead', pheromones 'Low').
    - Query a _representative_ or _average_ Q-table (how to get this? Average all ants? Train a separate global Q-table?) for the best action in that state/location.
    - Color the grid cell based on the preferred action (e.g., Red=Left, Green=Straight, Blue=Right). Requires careful state abstraction and aggregation of learned knowledge.

This phase prioritizes making the simulation a better tool for understanding swarm intelligence and reinforcement learning visually. Start with clearer exploration and perhaps the Q-Table Inspector.
