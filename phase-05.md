# Phase 5: Q-Learning Path Optimization 🤖

Having established robust pheromone following and obstacle avoidance, we now delve into true adaptive learning. This phase introduces Q-learning to allow individual ants to learn optimal steering decisions based on their state and received rewards, moving beyond simple probabilistic following.

## Functional Goals (What we want to see)

1.  **Learned Steering:** Ants should visibly improve their path choices over time, prioritizing actions that lead to rewards (finding food, returning to nest efficiently).
2.  **State Representation:** Ants need a way to perceive their current situation (state) relevant to making steering decisions (e.g., pheromone levels ahead/left/right, current direction, distance/direction to target).
3.  **Action Space:** Define a set of possible actions an ant can take (e.g., steer slightly left, steer slightly right, continue straight).
4.  **Reward System:** Implement rewards for positive outcomes (reaching food, reaching nest) and potentially penalties for negative ones (hitting obstacles, taking too long).
5.  **Q-Table Updates:** Ants update their internal Q-table, associating state-action pairs with expected future rewards.
6.  **Exploration vs. Exploitation:** Implement a strategy (like epsilon-greedy) where ants sometimes explore new actions and sometimes exploit their learned knowledge.
7.  **Visualization (Optional):** Display elements of the learning process, like highlighting ants making exploratory moves or visualizing parts of a representative Q-table.

## Technical Implementation (How we'll code it in p5.js)

1.  **Q-Table Structure (`Ant` class in `ant.js`):**

    - Each ant needs its own Q-table (or potentially a shared one, though individual learning is often intended). This could be a JavaScript object or Map: `qTable[state][action] = value`.
    - Define the state representation. How do we discretize continuous values (like pheromone intensity or direction) into a finite number of states? This is crucial and challenging. Example state could be a string combining discretized sensor readings: `"Phero:HighFwd_LowL_LowR_Dir:N"`.
    - Define the action space: e.g., `actions = [-turnAngle, 0, +turnAngle]`.

2.  **State Discretization (`Ant` class):**

    - Create helper functions to convert sensor readings (pheromones, direction to target) into discrete state categories (e.g., 'Low', 'Medium', 'High').
    - Combine these into a state string/key for the Q-table.

3.  **Action Selection (`Ant` class - within `update`):**

    - Implement epsilon-greedy selection: With probability epsilon, choose a random action (exploration). Otherwise, choose the action with the highest Q-value for the current state (exploitation).
    - Get the current state `s`.
    - Find the best action `a` based on `qTable[s]`.

4.  **Q-Learning Update Rule (`Ant` class - within `update`):**

    - After taking an action `a` in state `s`, observe the reward `r` and the new state `s'`.
    - Apply the Q-learning update formula:
      `Q(s, a) = Q(s, a) + learningRate * (reward + discountFactor * max(Q(s', a')) - Q(s, a))`
    - Requires storing the previous state and action.
    - Define `learningRate` and `discountFactor` (hyperparameters).

5.  **Reward Calculation (`Ant` class or `sketch.js`):**

    - Determine when rewards are given.
      - Positive reward when `state` changes to 'returning' (found food).
      - Positive reward when `state` changes to 'searching' (returned to nest).
      - Potential small negative reward for hitting an obstacle (before avoidance kicks in) or per time step to encourage efficiency.

6.  **Applying Actions (`Ant` class - within `update`):**

    - Instead of calculating forces directly from pheromones/targets, the chosen action (e.g., a turn angle) modifies the ant's velocity/acceleration. The `steer` method might still be useful for converting the chosen _direction_ into a force. Obstacle avoidance might need to override the learned action if a collision is imminent.

7.  **Integration (`sketch.js` & `ant.js`):**
    - Ensure the `update` loop correctly handles state transitions, action selection, reward calculation, and Q-table updates.
    - Initialize Q-tables in the `Ant` constructor.

This phase introduces significant complexity, particularly around state representation and hyperparameter tuning (`learningRate`, `discountFactor`, `epsilon`). Careful discretization and reward shaping will be key to successful learning.
