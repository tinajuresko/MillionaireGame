//by clicking on the music note icon (soundImage id) background audio (backgroundMusic id) is turned off/on
const audio = document.getElementById('backgroundMusic');
const audioControl = document.getElementById('soundImage');
const audioStatusText = document.createElement('span');
audioStatusText.classList.add('audioStatusText');

var currentQuestion; //global variable used in getQuestions and checkAnswer functions
var currentLevel = 15; 
var hasFinished = false; //prevents new questions from being fetched automatically after the end of the game
const levels = document.querySelectorAll('.levels li');

//adding event to the music note icon 
audioStatusText.textContent = audio.paused ? 'Off' : 'On';
audioControl.parentNode.insertBefore(audioStatusText, audioControl.nextSibling);

audioControl.addEventListener('click', toggleAudio);
function toggleAudio() {
    if (audio.paused || audio.muted) { 
        audio.play();
        audio.muted = false; 
        audioControl.src = 'images/n.webp';
        audioStatusText.textContent = 'On'; 
    } else {
        audio.pause();
        audio.muted = true; //mute the audio
        audioControl.src = 'images/n.webp';
        audioStatusText.textContent = 'Off';
    }
}
//chosen answer being selected and highlighted
function selectedAnswer(event){
    const selectedButton = event.target;
    const isSelected = selectedButton.classList.contains('selected');
    const allButtons = document.querySelectorAll('.answer-button');
    allButtons.forEach(button => {
        button.classList.remove('selected');
    })

    if (!isSelected) {
        selectedButton.classList.add('selected');
    } 
}

//fetching and displaying questions
var questionsData = [];

async function fetchAllQuestions() {
    const url = 'https://opentdb.com/api.php?amount=15';
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const data = await response.json();
            questionsData = data.results; //fetched questions saved in the array
        }
    } catch (error) {
        console.error(error);
    }
}

async function getQuestions() {
    if(hasFinished){
        return;
    }
    if(questionsData.length === 0){
        await fetchAllQuestions();
    }

    if(questionsData.length > 0){
        currentQuestion = questionsData[0];
        displayQuestions(currentQuestion);
        currentQuestion = questionsData.shift();

    }
}

function displayQuestions(question) {
    console.log('Received question data:', question);

    const questionContainer = document.getElementById('question');
    questionContainer.innerHTML = ''; //clear previous questions

    //adding question in the question container dynamically
    const questionElement = document.createElement('div');
    questionElement.classList.add('question');
    questionElement.innerHTML = `
        <p>${decodeHtml(question.question)}</p>
    `;

    //adding answer options in the question container
    const answersList = document.createElement('div');
    answersList.classList.add('answers');

    const allAnswers = [question.correct_answer, ...question.incorrect_answers];
    const shuffledAnswers = shuffleArray(allAnswers);

    shuffledAnswers.forEach(answer => {
        const answerItem = document.createElement('button');
        answerItem.textContent = decodeHtml(answer);
        answerItem.classList.add('answer-button');
        answersList.appendChild(answerItem);

        answerItem.addEventListener("click", selectedAnswer);
    });

    questionElement.appendChild(answersList);
    questionContainer.appendChild(questionElement);
}

function highlightCurrentLevel() {
    for (let i = levels.length - 1; i >= 0; i--) {
        const level = levels[i];
        if (i === currentLevel-1) {
            level.classList.add('highlighted');
        } else {
            level.classList.remove('highlighted');
        }
    }
}

// Helper functions
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) { //enables the correct answer to be found in a random place in the order
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayWinImage() {
    const questionContainer = document.getElementById('question');
    questionContainer.innerHTML = ''; 

    const winImage = document.createElement('img');
    winImage.src = 'images/win.jpeg';   
    winImage.classList.add('win-image');

    questionContainer.appendChild(winImage);
    hasFinished = true;
}
function displayLoseImage() {
    const questionContainer = document.getElementById('question');
    questionContainer.innerHTML = ''; 

    const loseImage = document.createElement('img');
    loseImage.src = 'images/lose.jpeg';   
    loseImage.classList.add('lose-image');


    questionContainer.appendChild(loseImage);
    hasFinished = true; 

}


//fetch questions when the page is loaded
window.onload = function() {
    fetchAllQuestions()
    getQuestions();
    highlightCurrentLevel();
};


//submit
const wrongAudio = document.getElementById('wrongAudio');
const correctAudio = document.getElementById('correctAudio');
const winAudio = document.getElementById('winAudio');
const submitButton = document.getElementById('submit-answer');
const restartButton =  document.getElementById('restartButton');

submitButton.addEventListener('click', checkAnswer);
restartButton.addEventListener('click', function(){
    location.reload();
})

function checkAnswer(){
    const selectedButton = document.querySelector('.answer-button.selected');
    if(!selectedButton){
        console.log('please select an answer before submiting');
        return;
    }

    const selectedAnswer = decodeHtml(selectedButton.textContent);
    const correctAnswer = decodeHtml(currentQuestion.correct_answer);

    if(selectedAnswer === correctAnswer){
        correctAudio.play();
        console.log('correct');
        currentLevel--;
        if (currentLevel <= 0) { //became a millionaire
            console.log('You have reached the maximum level!');
            audio.pause();
            winAudio.play();
            displayWinImage();
            submitButton.style.display = 'none';
            restartButton.style.display = 'block';
        } else {
            highlightCurrentLevel(); //highlight the next level
        }
        getQuestions();
    }else{ //the end
        audio.pause();
        wrongAudio.play();
        displayLoseImage();
        submitButton.style.display = 'none';
        restartButton.style.display = 'block';
        console.log('wrong');
    }
}

