const DEFAULT_CANCEL_TIME = 1000;
const LOADING_BAR_DELAY = 1000;

try{
  document.querySelector(".audio_area").innerHTML = '<audio id="buzzer_SOUND"> <source src="sounds/buzzer.mp3" type="audio/mp3"></audio><audio loop id="buzzer_alarm_SOUND"> <source src="sounds/buzzer.mp3" type="audio/mp3"></audio><audio loop id="missile-alert_SOUND"> <source src="sounds/missile-alert.mp3" type="audio/mp3"></audio><audio loop id="meltdown_SOUND"> <source src="sounds/meltdown.mp3" type="audio/mp3"></audio><audio loop id="whoop_SOUND"> <source src="sounds/whoop.mp3" type="audio/mp3"></audio><audio id="beep_SOUND"> <source src="sounds/beep.mp3" type="audio/mp3"></audio><audio id="beep_alarm_SOUND" loop> <source src="sounds/beep.mp3" type="audio/mp3"></audio><audio id="cash_SOUND"> <source src="sounds/cash.mp3" type="audio/mp3"></audio>';
} catch(e) {
  console.warn(`Unable to load audio area: ${e}`)
}
// ======== SOUND ===================
const MISSILE_ALERT = document.getElementById("missile-alert_SOUND");
const MELTDOWN = document.getElementById("meltdown_SOUND");
const WHOOP = document.getElementById("whoop_SOUND");
const BEEP_ALARM = document.getElementById("beep_alarm_SOUND");
const BEEP = document.getElementById("beep_SOUND");
const BUZZER_ALARM = document.getElementById("buzzer_alarm_SOUND");
const BUZZER = document.getElementById("buzzer_SOUND");
const CASH = document.getElementById("cash_SOUND");

function getReactorStat(REACTOR, STAT) {
  var CON = new XMLHttpRequest();
  CON.open("GET", `php/getStat.php?token=4447&type=reactors&spec=${REACTOR}&stat=${STAT}`);
  CON.onload = () => {}
  CON.send();
}

function styleFuel(ELEMENT, VALUE, ATTR){
  var COLOUR;
  if(VALUE <= 100) COLOUR = "lightgreen";
  if(VALUE < 80) COLOUR = "green";
  if(VALUE < 60) COLOUR = "orange";
  if(VALUE < 20) COLOUR = "red";
  if(VALUE <= 7) COLOUR = "crimson";
  ELEMENT.setAttribute("style", `${ATTR}: ${COLOUR}`)
}


function displayable(string){
  var array = string.split('');
  var newString = '';
  for (var i = 0; i < array.length; i++) {
    var char = array[i];
    if(char.toUpperCase() == char){ newString += " "; }
    if(i == 0){char = char.toUpperCase();}
    newString += char;
  }
  return newString;
}
function displayLoad(TITLE, TIME, OPT_FROM){
  if(TITLE == "__CANCEL__"){
    window.isCancelled = true;
    clearInterval(window.ID);
    displayLoad("Canceling Action...", DEFAULT_CANCEL_TIME);
  }else{
    document.getElementById("popup").style.display = 'block';
    document.getElementById("popup-title").innerHTML = TITLE;
    document.getElementById("popup-text").innerHTML = "Please Wait... 0%";
	  document.getElementById("popup-bar").setAttribute("max", TIME)
    document.getElementById("popup-bar").setAttribute("value", 0)
	  var barValue = 0;
	  window.ID = setInterval(add, TIME/100);
  }
	function add() {
		if(barValue >= TIME){
			clearInterval(window.ID)
			document.getElementById("popup-text").innerText = "Action Completed";
			setTimeout(()=>{BEEP.pause(); document.getElementById("popup").style.display = 'none';}, LOADING_BAR_DELAY);
		}else{
			barValue += TIME/100;
			document.getElementById("popup-text").style.textTransform = 'capitalize';
			document.getElementById("popup-bar").setAttribute("value", barValue);
			document.getElementById("popup-text").innerHTML = `Please Wait... ${Math.round((barValue/TIME)*100)}%`;
		}
	}
}
function displayMessage(title, text){
  BEEP.pause();
  BEEP.play()
  document.getElementById("userMessage").style.display = 'block';
  document.getElementById("userMessage-title").innerHTML = title;
  document.getElementById("userMessage-text").innerHTML = text;
}

function fancyTimer(seconds) {
seconds = Number(seconds);
var d = Math.floor(seconds / (3600*24));
var h = Math.floor(seconds % (3600*24) / 3600);
var m = Math.floor(seconds % 3600 / 60);
var s = Math.floor(seconds % 60);

var dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
return dDisplay + hDisplay + mDisplay + sDisplay;
}

function rev(string){
  return String(string).split("").reverse().join("");
}
function comma(number){
  if(String(number).length > 4){
    return rev(rev(String(number).split(".")[0]).match(/.{1,3}/g).join(","));
  }else{
    return String(number);
  }

}
function choice(array=[1,2,3]){
  let index = Math.floor(Math.random() * array.length);
  return array[index];
}
function random(min=0,max=1){
  return Number(Math.floor(Math.random() * max) + min);
}
