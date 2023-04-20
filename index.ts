import readline from "node:readline";
readline.emitKeypressEvents(process.stdin);
type Coordinate = { x: number; y: number };

// Constants defined that render the world.
const worldWidth = 20;
const worldHeight = 15;

const WC = "🟧"; // world corner
const WV = "⬛"; // world vertical wall (edge)
const WH = "⬛"; // world horizontal wall (edge)
const WS = "⬜"; // world space (a space character)
const SH = "😳"; // snake head
const SB = "🟩"; // snake body
const ST = "🟦"; // snake tail
const SF = "🍎"; // snake food
const SC = "💥"; // snake collision

console.log(WC, WV, WH, WS, SH, SB, SF, SC);

let frameCount = 0;
let currentDirection = [0, 1]; // [0, 1] Up, [0, -1] Down, [1, 0] Right, [-1, 0] Left
let score = 2;

// Create the world.
const world: (typeof WC | typeof WV | typeof WH | typeof WS | typeof SH | typeof SB | typeof SF | typeof SC | typeof ST)[][] = Array.from(
	Array(worldHeight),
	(_, rowIndex) =>
		Array(worldWidth)
			.fill(WS)
			.map((__, index) => {
				if (rowIndex === 0 || rowIndex === worldHeight - 1) return WH;
				if (index === 0 || index === worldWidth - 1) return WV;

				return WS;
			}),
);

async function renderScreen() {
	await renderFrame();
	return world
		.map((row) => row.join(""))
		.reverse()
		.join("\n");
}

async function renderFrame() {
	frameCount++;

	if (frameCount === 1) {
		const { headCoordinates, bodyCoordinates } = getInitalSnakeCoordinates();

		world[headCoordinates.y][headCoordinates.x] = SH;

		bodyCoordinates.forEach((coordinate) => {
			world[coordinate.y][coordinate.x] = SB;
		});
	} else {
		moveSnake();
	}

	const { headCoordinates, bodyCoordinates } = getSnakeCoordinates();

	console.log(
		`Frame: ${frameCount}, Score: ${score}, Direction: ${JSON.stringify(currentDirection)}, Snake Head: ${JSON.stringify(
			headCoordinates,
		)}, Snake body: ${JSON.stringify(bodyCoordinates)}`,
	);
}

function moveSnake() {
	const { headCoordinates, bodyCoordinates } = getSnakeCoordinates();
	const nextHeadCoordinates = getNextCoordinates(headCoordinates);

	const tailCoordinates = bodyCoordinates.sort(
		(a, b) => distanceBetweenTwoPoints(b, nextHeadCoordinates) - distanceBetweenTwoPoints(a, nextHeadCoordinates),
	)[0];

	console.log(bodyCoordinates.map((coordinates) => distanceBetweenTwoPoints(nextHeadCoordinates, coordinates)));

	world[tailCoordinates.y][tailCoordinates.x] = WS;
	world[headCoordinates.y][headCoordinates.x] = SB;
	world[nextHeadCoordinates.y][nextHeadCoordinates.x] = SH;
}

function getInitalSnakeCoordinates() {
	const bodyCoordinates: Coordinate[] = [getRandomCoordinates({ borderOffset: score })];

	for (let i = 0; i < score; i++) {
		bodyCoordinates.push(getNextCoordinates(bodyCoordinates[i]));
	}

	const headCoordinates = getNextCoordinates(bodyCoordinates[bodyCoordinates.length - 1]);

	return { headCoordinates, bodyCoordinates };
}

function getRandomCoordinates({ borderOffset }: { borderOffset: number } = { borderOffset: 1 }) {
	if (borderOffset < 1) borderOffset = 1;

	const result = {
		x: getRandomNumber(borderOffset, worldWidth - borderOffset),
		y: getRandomNumber(borderOffset, worldHeight - borderOffset),
	};

	return { x: result.x, y: result.y };
}

function getNextCoordinates(coordinate: Coordinate) {
	const result = {
		x: coordinate.x + currentDirection[0],
		y: coordinate.y + currentDirection[1],
	};

	if (result.x > worldWidth - 2) {
		result.x = worldWidth - 2;
	}

	if (result.y > worldHeight - 2) {
		result.y = worldHeight - 2;
	}

	if (result.x <= 0) {
		result.x = 1;
	}

	if (result.y <= 0) {
		result.y = 1;
	}

	return result;
}

function getRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min);
}

function distanceBetweenTwoPoints(pointOne: Coordinate, pointTwo: Coordinate) {
	return Math.sqrt(Math.pow(pointOne.x - pointTwo.x, 2) + Math.pow(pointOne.y - pointTwo.y, 2));
}

function getSnakeCoordinates() {
	let headCoordinates: Coordinate = { x: 0, y: 0 };
	let bodyCoordinates: Coordinate[] = [];

	for (let row of world) {
		for (let cell of row) {
			if (cell === SH) {
				headCoordinates = { x: row.indexOf(cell), y: world.indexOf(row) };
			} else if (cell === SB) {
				bodyCoordinates.push({ x: row.indexOf(cell), y: world.indexOf(row) });
			}
		}
	}

	score = bodyCoordinates.length;

	return { headCoordinates, bodyCoordinates };
}

process.stdin.setRawMode(true);

process.stdin.on("keypress", (s, key) => {
	switch (key.name) {
		case "up":
			currentDirection = [0, 1];
			break;
		case "down":
			currentDirection = [0, -1];
			break;
		case "left":
			currentDirection = [-1, 0];
			break;
		case "right":
			currentDirection = [1, 0];
			break;
		case "c": // CTRL+C exit the game
			if (key.ctrl) {
				process.exit();
			}
			break;
	}
});

setInterval(render, 250);

async function render() {
	console.clear();
	console.log(await renderScreen());
}

//render();
