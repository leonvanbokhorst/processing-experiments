# Phase 3: Resource Finding & Exploitation (ACO Basics) 🍎

Now that our ants leave fading trails, let's give them a purpose: finding food! This phase introduces the core mechanics of Ant Colony Optimization (ACO) where successful paths get reinforced.

## Functional Goals (What we want to see)

1.  **Food Placement:** Introduce one or more 'food sources' at specific locations on the canvas.
2.  **Food Detection:** Ants should be able to detect when they reach a food source.
3.  **Returning Behavior:** When an ant finds food, it should change its state (e.g., 'returning') and head back towards its starting point or a 'nest' area (simplification: maybe just reverse direction initially).
4.  **Trail Reinforcement:** Ants returning with food should lay down a stronger or different type of pheromone trail, reinforcing the path that led to the food.
5.  **Basic Pheromone Following (Optional but helpful):** Ants searching for food might start to be slightly influenced by existing pheromone trails, biasing their movement towards stronger paths.
6.  **Visualization:** Clearly display the food sources. Ants carrying food could perhaps change color. Reinforced trails should be visibly distinct or stronger.

## Technical Implementation (How we'll code it in p5.js)

1.  **Food Source (`sketch.js`):**

    - Define variables to store the position(s) and maybe size/amount of food sources.
    - Initialize food sources in `setup()`.
    - Draw the food sources in `draw()`. Simple shapes like circles or rectangles will suffice.

2.  **`Ant` Class (`ant.js`):**

    - **State Management:** Add a state variable (e.g., `this.state = 'searching' / 'returning'`).
    - **Food Sensing:** In `update()`, add logic to check if the ant's position is close to any food source. Use `dist()` function.
    - **State Change:** If food is found and the ant is 'searching', change `this.state` to 'returning', potentially store the location of the food source, and reverse velocity or implement a return-to-origin logic.
    - **Return Logic:** If `this.state` is 'returning', modify movement logic. Maybe head towards `(width/2, height/2)` or `(0,0)` for simplicity, or implement a proper nest. Once returned (e.g., reaches the center/origin), change state back to 'searching'.
    - **Pheromone Modification:** Modify `dropPheromone()`. If `this.state` is 'returning', draw a stronger or different colored pheromone (e.g., higher alpha, different fill color) onto the buffer.
    - **(Optional) Pheromone Following:** In `update()`, when 'searching', sample the pheromone buffer at a few points slightly ahead of the ant. Add a steering force vector that biases the ant's velocity towards areas with stronger pheromone concentration. This is complex and might be deferred or simplified.

3.  **Main Sketch (`sketch.js`):**

    - Ensure food sources are drawn each frame.
    - The existing loop calling `ant.update()`, `ant.dropPheromone()`, and `ant.display()` should work, as the ant's internal state now dictates its behavior and pheromone dropping.

4.  **Pheromone Buffer (`sketch.js`):**
    - Consider if the decay rate needs adjustment. Too fast decay might erase return trails too quickly.
    - The buffer now potentially stores two types of pheromones (search and return), distinguishable by color/intensity.

This phase adds goal-oriented behavior and the positive feedback loop crucial for ACO.
