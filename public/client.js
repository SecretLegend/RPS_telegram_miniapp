const gameArea = document.querySelector(".main");
const rock = document.querySelector(".choice__rock");
const paper = document.querySelector(".choice__paper");
const scissor = document.querySelector(".choice__scissor");

const header = document.querySelector(".header");
const scoreTitleUser1 = document.querySelector(".username1");
const scoreTitleUser2 = document.querySelector(".username2");
const scoreNum1 = document.querySelector(".score__number1");
const scoreNum2 = document.querySelector(".score__number2");

const oppoTitle = document.querySelector('.opponents__result');

const rulesBoard = document.querySelector(".rules");
const showRulesBoard = document.querySelector(".show__result_board");

const resultBoard = document.querySelector(".result__board");
const oppoChoice = document.querySelector(".oppo__choice");
const yourChoice = document.querySelector(".your__choice");

const results = document.querySelector(".results");
const resultsHeading = document.querySelector(".results__heading");
const resultButton = document.querySelector(".results__button");

const joinPage = document.querySelector(".join");
const roomId = document.getElementById("room-id");

const paperChoice = `
    <button class="choice__paper" onclick="clickChoice('paper')">
        <div class="choice">
            <img
              src="/icon-paper.svg"
              alt="Paper"
              class="choice__img"
            />
        </div>
    </button>
`;
const rockChoice = `
    <button class="choice__rock" onclick="clickChoice('rock')">
        <div class="choice">
            <img 
                src="/icon-rock.svg" 
                alt="Rock" 
                class="choice__img"
            />
        </div>
    </button>
`;

const scissorChoice = `
    <button class="choice__scissor" onclick="clickChoice('scissor')">
        <div class="choice">
            <img
                src="/icon-scissors.svg"
                alt="Scissor"
                class="choice__img"
            />
        </div>
    </button>
`;

let roomID;
let userName1, userName2;
let player1 = false;
let winner;
let player1Score = 0;
let player2Score = 0;

///Socket
const socket = io.connect( "https://busy-clareta-ultrashiny-9e6e3029.koyeb.app/", { secure: true, transports: [ "flashsocket","polling","websocket" ] } );
// const socket = io.connect( "http://localhost:3000/", { secure: true, transports: [ "flashsocket","polling","websocket" ] } );

window.addEventListener("load", function() {
  const queryParams = new URLSearchParams(window.location.search);
  alert(window.location)
  roomID = queryParams.get('tgWebAppStartParam');
  userName1 = queryParams.get('username');
  alert(userName1);
  console.log(userName1);
  if (roomID) {
    joinRoom(roomID, userName1);
  }
})

const createRoom = () => {
  player1 = true;
  roomID = Math.random().toString(36);
  socket.emit("createRoom", {roomID: roomID, userName: userName1});
};

const joinRoom = (roomID, userName) => {
  // roomID = roomId.value;
  if (!roomID) {
    alert("Room Token is Required ");
    return joinPage.classList.add('flex');
  }

  socket.on('notValidToken', () => {
    return alert('Invalid Token..');
  })
  
  socket.on('roomFull', () => {
    alert('Max player reached !');
    return joinPage.classList.add('flex');
  })

  socket.emit("joinRoom", {roomID: roomID, userName: userName});
};

socket.on("firstPlayer", (data) => {
  player1 = true;
  scoreTitleUser1.innerText = data.userName;
  console.log('Firstplayer: ', data.userName);
})

socket.on("playersConnected", (data) => {
  joinPage.classList.add("none");
  header.classList.add("flex");
  gameArea.classList.add("grid");
  console.log('Secondplayer: ', data.userName);
  scoreTitleUser2.innerText = data.userName;
});

const clickChoice = (rpschoice) => {
  let player;
  if (player1 == true) {
    player = "p1Choice";
  } else if (player1 == false) {
    player = "p2Choice";
  }

  gameArea.classList.add("none");
  resultBoard.classList.add("grid");
  if (rpschoice == "rock") {
    yourChoice.innerHTML = rockChoice;
    yourChoice.classList.toggle("increase-size");
  }
  if (rpschoice == "paper") {
    yourChoice.innerHTML = paperChoice;
    yourChoice.classList.toggle("increase-size");
  }
  if (rpschoice == "scissor") {
    yourChoice.innerHTML = scissorChoice;
    yourChoice.classList.toggle("increase-size");
  }

  const isNoneResultBoard = resultBoard.classList.contains("none");
  if (isNoneResultBoard) {
    resultBoard.classList.remove("none");
    resultBoard.classList.add("grid");
    resultBoard.classList.add("after-choosing");
  }

  socket.emit(player, {
    rpschoice: rpschoice,
    roomID: roomID,
  });

};

const displayResult = (choice) => {
  results.classList.remove("none");
  results.classList.add("grid");
 
  oppoChoice.classList.remove("waiting_to_chose");
  if (choice == "rock") {
    oppoChoice.innerHTML = rockChoice;
    oppoChoice.classList.toggle("increase-size");
  }
  if (choice == "paper") {
    oppoChoice.innerHTML = paperChoice;
    oppoChoice.classList.toggle("increase-size");
  }
  if (choice == "scissor") {
    oppoChoice.innerHTML = scissorChoice;
    oppoChoice.classList.toggle("increase-size");
  }
};

socket.on("p1Choice", (data) => {
  if (!player1) {
    console.log('p1Choice');
    displayResult(data.rpsValue);
    oppoTitle.innerText = "OPPO PICKED";
    oppoChoice.classList.remove("waiting_to_chose");
  }
});

socket.on("p2Choice", (data) => {
  if (player1) {
    console.log('p2Choice');
    displayResult(data.rpsValue);
    oppoTitle.innerText = "OPPO PICKED";
    oppoChoice.classList.remove("waiting_to_chose");
  }
});

const updateScore = (p1Score, p2Score) => {
  // scoreNum1.innerText = p1Score;
  // scoreNum2.innerText = p2Score;
  if(player1){
    scoreNum1.innerText = p1Score;
  }

  if(!player1){
    scoreNum2.innerText = p2Score;
  }
}

socket.on("winner", data => {
  winner = data;
  console.log('Winnerrrrrrrrrrrr!');
  if (data == "draw") {
    resultsHeading.innerText = "DRAW";
  } else if (data == "p1") {
    player1Score = player1Score + 1;
    if (player1) {
      resultsHeading.innerText = "YOU WIN";
      yourChoice.classList.add("winner");
      updateScore(player1Score, player2Score) 
    } else {
      resultsHeading.innerText = "YOU LOSE";
      oppoChoice.classList.add("winner");
    }
  } else if (data == "p2") {
    player2Score = player2Score + 1;
    if (!player1) {
      resultsHeading.innerText = "YOU WIN";
      yourChoice.classList.add("winner");
      updateScore(player1Score, player2Score); 
    } else {
      resultsHeading.innerText = "YOU LOSE";
      oppoChoice.classList.add("winner");
    }
  }
  console.log('Player1Score: ', player1Score);
  console.log('Player2Score: ', player2Score);
  if ( player1Score == 3 || player2Score == 3 ) {
    console.log('Congratulations!')
    resultButton.classList.add('block')
  } 
  else {
    console.log('Why here even 3?');
    setTimeout(() => {
      playAgain();
    }, 3000);
  }
  resultBoard.classList.add("after-choosing");
  results.classList.remove("none");
  results.classList.add("grid");

});

const returnToGame = () => {
  // player1Score = 0;
  // player2Score = 0;
  resultBoard.classList.remove("grid");
  resultBoard.classList.add("none");
  resultBoard.classList.remove("after-choosing");
  //results
  results.classList.remove("grid");
  results.classList.add("none");
  //choice
  yourChoice.innerHTML = "";
  yourChoice.classList.toggle("increase-size");
  oppoChoice.innerHTML = "";
  oppoChoice.classList.toggle("increase-size");
  //main game area
  gameArea.classList.remove("none");
  gameArea.classList.add("grid");
  //OPPO choice
  oppoTitle.innerText = 'Choosing...';
  oppoChoice.classList.add('waiting_to_chose');
};

const removeWinner = () => {

  if(oppoChoice.classList.contains('winner') || yourChoice.classList.contains('winner')){
    oppoChoice.classList.remove("winner");
    yourChoice.classList.remove("winner");
  }

};

const restartGame = () => {
  socket.emit("restartClicked", {
    roomID: roomID
  });
  player1Score = 0;
  player2Score = 0;
  updateScore(player1Score, player2Score);
  playAgain();
  // playAgain();
}

socket.on('restartGame', () => {
  console.log('Game restarted');
  player1Score = 0;
  player2Score = 0;
  updateScore(player1Score, player2Score);
  playAgain();
  
})

const playAgain = () => {
  socket.emit("playerClicked", {
    roomID: roomID,
    player1: player1,
  });
  removeWinner();
  returnToGame();
  resultButton.classList.remove('block');
  resultButton.classList.add('none');
};

socket.on("playAgain", () => {
  removeWinner();
  returnToGame();
  resultButton.classList.remove('block');
  resultButton.classList.add('none');
});

const returnToLogin = () => {
  joinPage.classList.remove("none");
  joinPage.classList.add('flex');
  header.classList.remove("flex");
  header.classList.add("none");
  gameArea.classList.remove("grid");
  gameArea.classList.add("none");
  // gameFooter.classList.remove("flex");
  // gameFooter.classList.add("none");
  resultBoard.classList.remove("grid");
  resultBoard.classList.add("none");
}

const exitGame =  () => {
  window.telegram.WebApp.close();
  socket.emit('exitGame', {roomID : roomID, player : player1});
  // returnToLogin();
};

socket.on('player1Left', () => {
  if(!player1){
    alert('player 1 left')
    // returnToLogin();
  }
})

socket.on('player2Left', () => {
  if(player1){
    alert('player 2 left')
    // returnToLogin();
  }
})



