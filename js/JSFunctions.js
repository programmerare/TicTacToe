"use strict";

// variables that are used in multiple functions;
const STEPS = 3;
const NO_WINNER = 0;
const PLAYER_1_WINNER = 1;
const PLAYER_2_WINNER = 2;
const DRAW = 3;
const NAME_LENGTH = 5;
const WHITE = "#ffffff";
const BLACK = "#000000"; 
let names = document.querySelectorAll('input[type=text]');
let colors = document.querySelectorAll('input[type=color]');


//Testutskrifter
/*
console.log( oGameData );
oGameData.initGlobalObject();
console.log( oGameData.gameField );
console.log( oGameData.checkForGameOver() );
*/

/*
console.log( oGameData.checkHorizontal() );
console.log( oGameData.checkVertical() );
console.log( oGameData.checkDiagonalLeftToRight() );
console.log( oGameData.checkDiagonalRightToLeft() );
console.log( oGameData.checkForDraw() );
*/



/**
 * Globalt objekt som innehåller de attribut som ni skall använda.
 * Initieras genom anrop till funktionern initGlobalObject().
 */
let oGameData = {};

/**
 * Initerar det globala objektet med de attribut som ni skall använda er av.
 * Funktionen tar inte emot några värden.
 * Funktionen returnerar inte något värde.
 */
oGameData.initGlobalObject = function() {

    //Datastruktur för vilka platser som är lediga respektive har brickor
    oGameData.gameField = Array('', '', '', '', '', '', '', '', '');
    
    /* Testdata för att testa rättningslösning */
    //oGameData.gameField = Array('X', 'X', 'X', '', '', '', '', '', '');
    //oGameData.gameField = Array('O', 'O', 'O', '', '', '', '', '', '');

    //oGameData.gameField = Array('X', '', '', 'X', '', '', 'X', '', '');
    //oGameData.gameField = Array('O', '', '', 'O', '', '', 'O', '', '');

    //oGameData.gameField = Array('X', '', '', '', 'X', '', '', '', 'X');
    //oGameData.gameField = Array('O', '', '', '', 'O', '', '', '', 'O');

    //oGameData.gameField = Array('', '', 'O', '', 'O', '', 'O', '', '');
    //oGameData.gameField = Array('', '', 'X', '', 'X', '', 'X', '', '');

    //oGameData.gameField = Array('X', 'O', 'X', '0', 'X', 'O', 'O', 'X', 'O');
    //oGameData.gameField = Array('X', 'O', 'X', '0', '', 'O', 'O', 'X', 'O');

    //Indikerar tecknet som skall användas för spelare ett.
    oGameData.playerOne = "X";

    //Indikerar tecknet som skall användas för spelare två.
    oGameData.playerTwo = "O";

    //Kan anta värdet X eller O och indikerar vilken spelare som för tillfället skall lägga sin "bricka".
    oGameData.currentPlayer = "";

    //Nickname för spelare ett som tilldelas från ett formulärelement,
    oGameData.nickNamePlayerOne = "";

    //Nickname för spelare två som tilldelas från ett formulärelement.
    oGameData.nickNamePlayerTwo = "";

    //Färg för spelare ett som tilldelas från ett formulärelement.
    oGameData.colorPlayerOne = "";

    //Färg för spelare två som tilldelas från ett formulärelement.
    oGameData.colorPlayerTwo = "";

    //"Flagga" som indikerar om användaren klickat för checkboken.
    oGameData.timerEnabled = false;

    //Timerid om användaren har klickat för checkboxen. 
    oGameData.timerId = null;
}

 // calls method after site has loaded
window.addEventListener('load', function(e){

    // reference nodes for insert before
    let div = document.querySelector("#div-with-a");
    let startbtn = document.querySelector("#newGame");

    // div for checkbox and label
    let checkboxDiv = document.createElement("div");
    checkboxDiv.setAttribute("id", "div-with-checkbox");
    // add checkbox to checkboxDiv
    let checkbox = this.document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "checkb-for-timer");
    checkboxDiv.appendChild(checkbox);

    // add label to checkboxDiv
    let label = document.createElement("label");
    label.setAttribute("for", "checkb-for-timer");
    label.setAttribute("id", "checkb");
    let labelText = document.createTextNode("Vill du begränsa tiden till 5 sekunder per drag?");
    label.appendChild(labelText);
    checkboxDiv.appendChild(label);

    // add checkboxDiv to form
    div.insertBefore(checkboxDiv, startbtn);

    // initiate game
    oGameData.initGlobalObject();
  
    // makes gameboard invisible on load by 
    // giving element with id game-area the class d-none, which has display:none;
    document.querySelector('#game-area').classList.add('d-none');

    // calls method validateForm by click on start game-btn
    document.querySelector('#newGame').addEventListener('click', function(e){
        if(oGameData.validateForm())
            oGameData.initiateGame();
    });
});

/**
 * Kontrollerar för tre i rad.
 * Returnerar 0 om det inte är någon vinnare, 
 * returnerar 1 om spelaren med ett kryss (X) är vinnare,
 * returnerar 2 om spelaren med en cirkel (O) är vinnare eller
 * returnerar 3 om det är oavgjort.
 * Funktionen tar inte emot några värden.
 */

oGameData.validateForm = function() {
    try{
        // check names length
        for(let i = 0; i < names.length; i++){
            if(names.item(i).value.length < 5)
                throw {message: "Namnen ska ha minst 5 tecken!", elemRef: names[i]};
        }
        // check if names are the same
        if(names[0].value === names[1].value){
            throw {message: "Namnen får inte vara samma!", elemRef: names[0]};
        }

        // check if colors are the same
        if(colors[0].value === colors[1].value){
            throw {message: "Färgerna får inte vara samma!", elemRef: colors[0]};
        }
        // check for illegal colors
        for(let i = 0; i < colors.length; i++){
            if(colors.item(i).value === BLACK || colors.item(i).value === WHITE)
                throw {message: "Svart och vit är ej tillåtna!", elemRef: colors[i]};
        }

        document.querySelector('#errorMsg').textContent = "Starta spelet";
        document.querySelector('#errorMsg').classList.remove("errorMsg");

        return true;
    } catch(oError){
        // display error message
        document.querySelector('#errorMsg').textContent = oError.message;
        document.querySelector('#errorMsg').classList.add("errorMsg");
        oError.elemRef.focus();

        return false;
    }
}

oGameData.checkHorizontal = function(){
    let gameField = oGameData.gameField;

    // check horizontal player 1
    for(let i = 0; i <= 2 * STEPS; i += STEPS){
        if(gameField[i] === "X" && gameField[i + 1] === "X" &&  gameField[i + 2] === "X")
            return PLAYER_1_WINNER;
    }

    // check horizontal player 2
    for(let i = 0; i <= 2 * STEPS; i += STEPS){
        if(gameField[i] === "O" && gameField[i + 1] === "O" &&  gameField[i + 2] === "O")
            return PLAYER_2_WINNER;
    }

    return oGameData.checkForDraw();
}

oGameData.checkVertical = function(){
    let gameField = oGameData.gameField;

    // check vertical player 1
    for(let i = 0; i < STEPS; i++){
        if(gameField[i] === "X" && gameField[i + STEPS] === "X" &&  gameField[i + 2 * STEPS] === "X")
            return PLAYER_1_WINNER;
    }

    // check vertical player 2
    for(let i = 0; i < STEPS; i++){
        if(gameField[i] === "O" && gameField[i + STEPS] === "O" &&  gameField[i + 2 * STEPS] === "O")
            return PLAYER_2_WINNER;
    }

    return oGameData.checkForDraw();
}

oGameData.checkDiagonalLeftToRight = function(){
    let gameField = oGameData.gameField;

    // check diagonal - left to right - player 1 and 2
    if(gameField[6] === "X" && gameField[4] === "X" && gameField[2] === "X")
        return PLAYER_1_WINNER;
    else if(gameField[6] === "O" && gameField[4] === "O" && gameField[2] === "O")
        return PLAYER_2_WINNER;

    return oGameData.checkForDraw();
}

oGameData.checkDiagonalRightToLeft = function(){
    let gameField = oGameData.gameField;

    // check diagonal - right to left - player 1 and 2
    if(gameField[0] === "X" && gameField[4] === "X" && gameField[8] === "X")
        return PLAYER_1_WINNER;
    else if(gameField[0] === "O" && gameField[4] === "O" && gameField[8] === "O")
        return PLAYER_2_WINNER;

    return oGameData.checkForDraw();
}

oGameData.checkForDraw = function(){
    let gameField = oGameData.gameField;
  
    for(let i = 0;  i < gameField.length; i++){
        // no winner - not every box was played
        if(gameField[i] === '')
            return NO_WINNER;
    }
    // draw - every box was played
    return DRAW;
}

oGameData.checkForGameOver = function() {
    let result_arr = [oGameData.checkHorizontal(), oGameData.checkVertical(), oGameData.checkDiagonalLeftToRight(), oGameData.checkDiagonalRightToLeft()];

    for(let i = 0; i < result_arr.length; i++){
        // player 1 won
        if(result_arr[i] === PLAYER_1_WINNER)
            return PLAYER_1_WINNER;
        // player 2 won
        else if(result_arr[i] === PLAYER_2_WINNER)
            return PLAYER_2_WINNER;
    }

    // returns the first value in array; if there is no winner, this value will be equal to the return value of checkForDraw()
    return result_arr[0];
}

oGameData.initiateGame = function()
{
    // toggle timer
    if(document.querySelector("input[type=checkbox]").checked){
        oGameData.timerEnabled=true;
    }
    else{
        oGameData.timerEnabled=false;
    }

    document.querySelector('form').classList.add('d-none');     // makes form invisible
    document.querySelector('#game-area').classList.remove('d-none');    // makes gamefield visible
    document.querySelector('#errorMsg').textContent = '';   // cleares the error message

    // stores the values from form in variables.
    // names
    oGameData.nickNamePlayerOne = names[0].value;
    oGameData.nickNamePlayerTwo = names[1].value;
    // colors
    oGameData.colorPlayerOne = colors[0].value;
    oGameData.colorPlayerTwo = colors[1].value;

    // takes all td elements and loops through them to reset text content and background
    // resets game field
    let tdRefs = document.querySelectorAll('td');
    tdRefs.forEach((td) => {
        td.textContent = "";
        td.style.background = "";
    })

    let currentPlayerName = null;
    let rand = Math.round(Math.random());   // generates number 0 or 1

    // set current player
    // player 1 starts if random == 1
    if(rand){
        currentPlayerName = oGameData.nickNamePlayerOne;
        oGameData.currentPlayer = oGameData.playerOne;
    }
    // player 2 starts if random == 0
    else{
        currentPlayerName = oGameData.nickNamePlayerTwo;
        oGameData.currentPlayer = oGameData.playerTwo;
    }
 
    if(oGameData.timerEnabled){
        oGameData.setTimer(currentPlayerName);
    }
    // shows active player in jumbotron
    document.querySelector("div.jumbotron>h1").textContent = oGameData.printCurrent(currentPlayerName, oGameData.currentPlayer);

    // listener on game area/table
    document.querySelector("table").addEventListener("click", oGameData.executeMove);
}

oGameData.executeMove = function(event){
  
    if(event.target.nodeName === "TD"){ //checks that TD was clickeds
        let fieldIndex = event.target.getAttribute("data-id");  // table data cell that was clicked - 0 indexing is used
        let currentPlayerName = null;
    
        // execute if field is empty
        if(oGameData.gameField[fieldIndex] == ""){
            // fill the field and the corresponding index in the oGameData.gamefield array
            event.target.textContent = oGameData.currentPlayer;
            oGameData.gameField[fieldIndex] = oGameData.currentPlayer;

            // switch players
            // player 1 switching to player 2
            if(oGameData.currentPlayer == oGameData.playerOne){
                event.target.style.backgroundColor = oGameData.colorPlayerOne;  // fill field with current player`s color
                oGameData.currentPlayer = oGameData.playerTwo;
                currentPlayerName = oGameData.nickNamePlayerTwo; // sets name displayed in Jumbotron
            }
            // player 2 switching to player 1
            else{
                event.target.style.background = oGameData.colorPlayerTwo;   // fill field with current player`s color
                oGameData.currentPlayer = oGameData.playerOne;
                currentPlayerName = oGameData.nickNamePlayerOne; // sets name displayed in Jumbotron
            }

            if(oGameData.timerEnabled){
                //clears and sets new timer after turn
                clearInterval(oGameData.timerId);
                oGameData.setTimer();   
            }       
            // shows active player in jumbotron
            document.querySelector("div.jumbotron>h1").textContent = oGameData.printCurrent(currentPlayerName, oGameData.currentPlayer);
        }

        // the game is over - a player won or draw
        let game_result = oGameData.checkForGameOver()
        if(game_result != NO_WINNER){
            // remove event listener from game area/table
            event.currentTarget.removeEventListener("click", oGameData.executeMove)
            
            // show form
            document.querySelector("form").classList.remove('d-none');

            // show game's result
            if(game_result == PLAYER_1_WINNER){
                document.querySelector('div.jumbotron>h1').textContent = oGameData.printWinner(oGameData.nickNamePlayerOne, oGameData.playerOne);
            }
            else if(game_result == PLAYER_2_WINNER){
                document.querySelector('div.jumbotron>h1').textContent = oGameData.printWinner(oGameData.nickNamePlayerTwo, oGameData.playerTwo);
            }
            else if(game_result == DRAW){
                document.querySelector('div.jumbotron>h1').textContent = 'Spelet slutade oavgjort - Spela igen?';
            }

            // hide game area
            document.querySelector("#game-area").classList.add("d-none");

            // clear timer att end of game
            clearInterval(oGameData.timerId);

            oGameData.initGlobalObject();
        }
    }
}

oGameData.setTimer = function(currentPlayerName){
    // clears intervall/timer if one is currently running
    if(oGameData.timerId !== 0){
        clearInterval(oGameData.timerId);
    }
    
    // this code runs every 5 seconds if not reseted and effectively switches the current player automatically
    oGameData.timerId = setInterval(() => {
        if(oGameData.currentPlayer == oGameData.playerOne){
            currentPlayerName = oGameData.nickNamePlayerTwo;
            oGameData.currentPlayer = oGameData.playerTwo;
        }
        else{
            currentPlayerName = oGameData.nickNamePlayerOne;
            oGameData.currentPlayer = oGameData.playerOne;
        }
        // display current player
        document.querySelector("div.jumbotron>h1").textContent = oGameData.printCurrent(currentPlayerName, oGameData.currentPlayer);
    }, 5000);
}

oGameData.printWinner = function(name, symbol){
    // $ and `` instead of using +
    return `Vinnare är ${name} '${symbol}' - Spela igen?`;
}

oGameData.printCurrent = function(name, symbol){
    // $ and `` instead of using +
    return `Aktuell spelare är ${name} '${symbol}'`
}