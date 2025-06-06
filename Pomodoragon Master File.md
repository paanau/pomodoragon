A dragon-themed Pomodoro game; when you work, the dragon is awake, so your dwarves can only wait and prepare, but once your break starts, the dragon sleeps, and the fun begins!

Extra ideas in [[Pomodoro Generated Plan]]

Pomodoro:


Game:
- **Goal:** steal as much as you can from the dragon's hoard when it sleeps (during breaks)
- **Gameplay:**
	- During tasks, your dwarves(?) prepare for the raid
		- Instructions are set when starting the workday, or carry over from the previous session, and can be changed during breaks, but gain a stacking experience buff if maintained
		- Instructions influence both the development of the player's infrastructure, and raid quality
	- During breaks the player can:
		- Manage their civilization:
			- Society focuses (growth / production / research / exploration / ???)
				- Simple mode assigns priorities from 1-X
				- Advanced mode allocates citizens and requires resource management
				- Growth:
					- Improves population amount and capacity
					- Population produces basic resources passively
				- Production:
					- Craft advanced resources passively
					- Gain crafting tokens to make powerful items for your raiders and explorers
				- Exploration:
					- Wander outside the mountains to find exotic treasures, encounters, and peoples
					- Conducted during work time, length, equipment, and allocated units determine rewards (think KoDP)
					- Exploration takes N work-cycles
					- Upon meeting outside peoples, can establish trade and trade routes, and receive quests to retrieve specific items from the Hoard
					- Rewards include resources, unlockables, and special units of other cultures
				- Research:
					- Use resources to unlock crafting blueprints, stratagems to help with raids and exploration, and improvements to your city
					- Can be discounted through loot from raids and exploration
				- Trade:
					- Once trade is unlocked, small caravans can be set to automatically travel during work cycles
					- Large caravans can be sent during breaks, similar to exploration mechanisms, taking N
					- Other cultures have their own preferences for what they buy and sell, and at what rates
						- These can be figured out by having good relations, prolonged interaction, and having racial special units
					- Influencing factors: size of caravan, quality of goods, special members in trade party, technology unlocks
					- Large caravans take N work-cycles, based on distance and travel speed
						- Can be set to repeat, e.g. if a trade route takes 1.5 work-cycles to complete, doing it twice just makes sense
			- Use resources as well as gold and gems to build and upgrade facilities
				- Construction of facilities takes N work-cycles
				- Gold can be used as a substitute for resources
				- Gems can be used to directly purchase facilities and upgrades, as well as their prerequisites
		- Conduct a raid, either in active or passive mode:
			- Gather a raiding party, equip them with gear **(!!!"Optimize Gear" button!!!)**, and choose a stratagem (same screen)
			- Stratagems:
				- Where to steal from (value), how much (quantity), how carefully (speed)
				- Increase in any should have some trade-offs, compensated by proper gear
			- Passive mode:
				- Randomized results, 25-75% scale based on raid party stats
				- Player is shown the different stage rolls, and can pay gems to gain "advantage" (multiple times have cumulative costs) in different ways:
					- Improve dice quality, roll twice and choose, convert 1s to 6s
					- Rolls table is below
			- Active mode:
			- Results:
				- Should be biased *against* Catastrophes at all times, unless using risky stratagems
				- Glorious success
				- Success
				- Close call
				- Failure
				- Catastrophe
		- Buy and sell from the in-game store, and watch ads
- **Mechanics:**

- Gold is gold, duh
- Gems are red tomato shaped ones



Rolls table:

| Dice quality \ Roll | 1   | 2,3 | 4,5 | 6   | Expected value                 | Min value | Avg  | Max value | Legend:                                                                     |
| ------------------- | --- | --- | --- | --- | ------------------------------ | --------- | ---- | --------- | --------------------------------------------------------------------------- |
| Poor                | CF  | F   | SF  | S   | -3/6 = -2/6 + -2/6 + 1/6       | -2        | -0.5 | 1         | CF = Critical Failure: -2 progress                                          |
| Standard            | F   | SF  | S   | CS  | 19/36 = -1/6 + 2/6 + 2/6 +1/36 | -1        | 0.5  | 3         | F = Failure: -1 progress                                                    |
| Improved            | SF  | S   | CS  | CS  | 121/72 = 2/6 + 1 + 25/72       | 0         | 1.7  | 5         | SF = Safe Failure: +-0 progress                                             |
| Superior            | S   | CS  | CS  | CS  | 1397/432 = 1 + 5/6 + 605/432   | +1        | 3.3  | 7         | S = Success: +1 progress                                                    |
| Immaculate          | CS  | CS  | CS  | CS  | 2261/432 = 2 + 1397/432        | +3        | 5.3  | 9         | CS = Success: +2 progress and roll lower tier (subsequent rolls can't fail) |
