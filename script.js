const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const start = document.querySelector(".startScreen");
const selectAgain = document.getElementsByName("versus");
const gameOverScreen = document.querySelector(".gameOverScreen");
const playAgain = document.querySelector("#playAgainText");
const smashSong = new Audio("./sounds/smash.wav");

//Start screen visibility.
let startVisible = false;

// Resize and style the canvas
canvas.width = 800;
canvas.height = 600;

// Draw functions
const drawRect = (x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
};

const drawCircleFilled = (x, y, radius, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
};

const drawCircleStroked = (x, y, radius, width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
};

const drawText = (text, x, y, color, fontSize) => {
    ctx.fillStyle = color;
    ctx.font = fontSize.toString() + "px" + " Helvetica";
    ctx.fillText(text, x, y);
};

// User parameters
const user = {
    x: 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    color: "#ffe227",
    score: 0,
    dx: 0,
    dy: 0,
    speed: 25,
};
//Com paddles parameters
const com = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    color: "#822659",
    score: 0,
    lvl: 0.1,
    speed: 25,
};
//Ball parameters
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 8,
    color: "#fff",
    speed: 5,
    dx: 3,
    dy: 4,
    stop: true,
};
// Draw canvas
const render = () => {
    // Draw background
    drawRect(0, 0, canvas.width, canvas.height, "black");

    //Draw scores
    drawText(user.score, canvas.width / 4, 100, "#fff", 30);
    drawText(com.score, (3 * canvas.width) / 4, 100, "#fff", 30);

    //Draw paddles
    drawRect(
        (user.x += user.dx),
        (user.y += user.dy),
        user.width,
        user.height,
        user.color
    );
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // Draw ball
    drawCircleFilled(ball.x, ball.y, ball.size, ball.color);
};
// Event listeners.
const eventListener = () => {
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    playAgain.addEventListener("click", playAgainGame);
};

// KeyDown event handler.
const keyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Down") {
        moveDownPaddle(user);
        ball.stop = false;
    } else if (e.key === "ArrowUp" || e.key === "Up") {
        moveUpPaddle(user);
        ball.stop = false;
    } else if (e.key == "Enter" || e.which == 13) {
        if (selected) startGame(e);
    } else if (e.key === "w" || e.code === "KeyW") {
        if (selected == "vsUser") {
            moveUpPaddle(com);
            ball.stop = false;
        }
    } else if (e.key === "s" || e.key === "KeyS") {
        if (selected == "vsUser") {
            moveDownPaddle(com);
            ball.stop = false;
        }
    } else if (e.key === "ArrowRight" || e.key === "Right") {
        if (!startVisible) selectAgain[1].checked = true;
    } else if (e.key === "ArrowLeft" || e.key === "Left") {
        if (!startVisible) selectAgain[0].checked = true;
    }
};

// KeyUp event handler.
const keyUp = (e) => {
    if (
        e.key === "ArrowDown" ||
        e.key === "Down" ||
        e.key === "ArrowUp" ||
        e.key === "Up"
    ) {
        user.dy = 0;
    }
};
// Move down paddle function
const moveDownPaddle = (side) => (side.y += side.speed);

//Move up paddle function
const moveUpPaddle = (side) => (side.y -= side.speed);

// User play and detect walls
const playUser = () => {
    checkWallforPlayers(user);
    checkWallforPlayers(com);
};

//Check collision
const checkCollision = (b, s) => {
    b.top = b.y - b.size;
    b.bottom = b.y + b.size;
    b.left = b.x - b.size;
    b.right = b.x + b.size;

    s.top = s.y;
    s.bottom = s.y + s.height;
    s.left = s.x;
    s.right = s.x + s.width;

    return (
        b.top < s.bottom &&
        b.bottom > s.top &&
        b.left < s.right &&
        b.right > s.left
    );
};

//Run ball function
const runBall = () => {
    if (!ball.stop) {
        ball.x += ball.dx;
        ball.y += ball.dy;
    }

    checkWallforBalls();
    // Check ball side
    let side = checkBallSide();

    if (checkCollision(ball, side)) {
        //Topun cubuga carpma acisina gore topun yonu ve hizi belirleniyor
        let intersetY = ball.y - (side.y + side.height / 2);
        intersetY /= side.height / 2;
        let maxBounceRate = Math.PI / 3;
        let bounceAngle = intersetY * maxBounceRate;

        let direction = ball.x < canvas.width / 2 ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(bounceAngle);
        ball.dy = ball.speed * Math.sin(bounceAngle);

        // Carpisma esnasinda ses cikarmasini sagliyor
        if (
            (getComputedStyle(canvas).visibility == "visible") &
            (getComputedStyle(gameOverScreen).visibility == "hidden")
        ) {
            smashSong.play();
        }
        // Her carpmadan sonra topun hizi artiyor
        ball.speed += 0.5;
    }

    if (ball.x + ball.size > canvas.width) {
        user.score++;
        resetPaddles();
        resetBall(1);
    } else if (ball.x - ball.size < 0) {
        com.score++;
        resetPaddles();
        resetBall(-1);
    }
};

// Reset ball position.
const resetBall = (side) => {
    //if side=1 , ball go to com side, else side = -1 ball go to user side
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = side * 3;
    ball.dy = side * 4;
    ball.stop = true;
};

// Check ball side
const checkBallSide = () => {
    if (ball.x < canvas.width / 2) return user;
    else {
        return com;
    }
};

//Check canvas boundaries for keeps the paddles within the boundaries
const checkWallforPlayers = (side) => {
    //top wall
    if (side.y < 0) side.y = 0;
    //Bottom wall
    if (side.y + side.height > canvas.height)
        side.y = canvas.height - side.height;
};

//Check canvas boundaries for keeps the ball within the boundaries
const checkWallforBalls = () => {
    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy = -ball.dy;
    }
};

// Play paddles with Com
const playCom = () => {
    checkWallforPlayers(com);
    com.y += (ball.y - (com.y + com.height / 2)) * com.lvl;
};

// Disable start screen and start the game
const startGame = () => {
    start.style.visibility = "hidden";
    canvas.style.visibility = "visible";
    startVisible = true;
    playGameForVsCom();
};

// If 2 player selected , play with com .
const playGameForVsCom = () => {
    if (selected == "vsCom") playCom();
};

// Get radio group selection value
const radioSelection = () => {
    for (let i = 0; i < selectAgain.length; i++) {
        if (selectAgain[i].checked) selected = selectAgain[i].value;
    }
};

//Show create screen.
const gameOverScreenCreate = () => {
    if (user.score == 5 || com.score == 5)
        gameOverScreen.style.visibility = "visible";
};

// Reset game for new game.
const playAgainGame = () => {
    user.score = 0;
    com.score = 0;
    startVisible = false;
    gameOverScreen.style.visibility = "hidden";
    start.style.visibility = "visible";
    resetPaddles();
    resetBall(1);
    selectAgain[0].checked = true;
};

//Reset paddles position.
const resetPaddles = () => {
    user.y = canvas.height / 2 - 50;
    com.y = canvas.height / 2 - 50;
};

//Game init function.
const game = () => {
    render();
    radioSelection();
    eventListener();
    runBall();
    playUser();
    playGameForVsCom();
    gameOverScreenCreate();
    requestAnimationFrame(game);
};

game();
