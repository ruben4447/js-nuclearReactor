const DEFAULT_CANCEL_TIME = 1000;
const LOADING_BAR_DELAY = 1000;

async function initSound() {
  await Sounds.create("buzzer", "sounds/buzzer.mp3");
  await Sounds.create("buzzer_alarm", "sounds/buzzer.mp3");
  Sounds.get("buzzer_alarm").loop(true);
  await Sounds.create("missile_alert", "sounds/missile-alert.mp3");
  Sounds.get("missile_alert").loop(true);
  await Sounds.create("meltdown", "sounds/meltdown.mp3");
  Sounds.get("meltdown").loop(true);
  await Sounds.create("whoop", "sounds/whoop.mp3");
  Sounds.get("whoop").loop(true);
  await Sounds.create("beep", "sounds/beep.mp3");
  await Sounds.create("beep-alarm", "sounds/beep.mp3");
  Sounds.get("beep-alarm").loop(true);
  await Sounds.create("cash", "sounds/cash.mp3");
}

function styleFuel(ELEMENT, VALUE, ATTR) {
  var COLOUR;
  if (VALUE <= 100) COLOUR = "lightgreen";
  if (VALUE < 80) COLOUR = "green";
  if (VALUE < 60) COLOUR = "orange";
  if (VALUE < 20) COLOUR = "red";
  if (VALUE <= 7) COLOUR = "crimson";
  ELEMENT.setAttribute("style", `${ATTR}: ${COLOUR}`)
}


function displayable(string) {
  var array = string.split('');
  var newString = '';
  for (var i = 0; i < array.length; i++) {
    var char = array[i];
    if (char.toUpperCase() == char) { newString += " "; }
    if (i == 0) { char = char.toUpperCase(); }
    newString += char;
  }
  return newString;
}
function displayLoad(TITLE, TIME, OPT_FROM) {
  if (TITLE == "__CANCEL__") {
    window.isCancelled = true;
    clearInterval(window.ID);
    displayLoad("Canceling Action...", DEFAULT_CANCEL_TIME);
  } else {
    document.getElementById("popup").style.display = 'block';
    document.getElementById("popup-title").innerHTML = TITLE;
    document.getElementById("popup-text").innerHTML = "Please Wait... 0%";
    document.getElementById("popup-bar").setAttribute("max", TIME)
    document.getElementById("popup-bar").setAttribute("value", 0)
    var barValue = 0;
    window.ID = setInterval(add, TIME / 100);
  }
  function add() {
    if (barValue >= TIME) {
      clearInterval(window.ID)
      document.getElementById("popup-text").innerText = "Action Completed";
      setTimeout(() => { Sounds.stop("beep"); document.getElementById("popup").style.display = 'none'; }, LOADING_BAR_DELAY);
    } else {
      barValue += TIME / 100;
      document.getElementById("popup-text").style.textTransform = 'capitalize';
      document.getElementById("popup-bar").setAttribute("value", barValue);
      document.getElementById("popup-text").innerHTML = `Please Wait... ${Math.round((barValue / TIME) * 100)}%`;
    }
  }
}
function displayMessage(title, text) {
  Sounds.play("beep");
  document.getElementById("userMessage").style.display = 'block';
  document.getElementById("userMessage-title").innerHTML = title;
  document.getElementById("userMessage-text").innerHTML = text;
}
function displayMessage(title, text) {
  Sounds.play("beep");
  const wrapper = document.createElement("div");
  wrapper.classList.add("userMessage-wrapper");
  const container = document.createElement("div");
  container.classList.add("userMessage-container");
  wrapper.appendChild(container);
  const titleEl = document.createElement("h2");
  titleEl.innerHTML = title;
  titleEl.classList.add("userMessage-title");
  container.appendChild(titleEl);
  const textEl = document.createElement("strong");
  textEl.classList.add("userMessage-text");
  textEl.innerHTML = text;
  container.appendChild(textEl);
  container.insertAdjacentHTML("beforeend", "<br><br>");
  const btn = document.createElement("button");
  container.appendChild(btn);
  btn.addEventListener("click", () => wrapper.remove());
  btn.innerText = "Close";
  document.body.insertAdjacentElement("afterbegin", wrapper);
  return wrapper;
}

function fancyTimer(seconds) {
  seconds = Number(seconds);
  if (seconds === 0) return '0 seconds';
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function rev(string) {
  return String(string).split("").reverse().join("");
}
function comma(number) {
  if (String(number).length > 4) {
    return rev(rev(String(number).split(".")[0]).match(/.{1,3}/g).join(","));
  } else {
    return String(number);
  }

}
function choice(array = [1, 2, 3]) {
  let index = Math.floor(Math.random() * array.length);
  return array[index];
}
function random(min = 0, max = 1) {
  return Number(Math.floor(Math.random() * max) + min);
}
function numformat(n) {
  return n.toLocaleString("en-GB");
}

function getDomeStatus(health) {
  let status;
  if (health < 100) { status = "good"; }
  if (health < 30) { status = "warning"; }
  if (health < 10) { status = "alert"; }
  if (health < 5) { status = "critical"; }
  if (health < 1) { status = "meltdown"; }
  return status;
}