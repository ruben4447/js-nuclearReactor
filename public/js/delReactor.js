const DECOMMISSION_TIME = Number(document.getElementById("DECOMMISSION_TIME").innerText);
const name = document.getElementById("REACTOR").innerText;

document.getElementById("decommission").addEventListener("click", Decommission)
document.body.addEventListener("keydown", (event)=>{event.keyCode==13?Decommission():null})

function Decommission(){
	let agreed = document.getElementById("agreement").checked;
	if(agreed != true){
		BUZZER.play();
		document.querySelector("*[error_area]").innerText = `You must agree to pay ${document.getElementById("price").innerText} to decommission reactor ${name}`;
		return false;
	} else {
		document.querySelector("*[error_area]").innerText = "";
	}
	BEEP_ALARM.play();
	displayLoad(`Decommissioning Reactor Unit ${name}`, DECOMMISSION_TIME)
	setTimeout(function(){
		var CON = new XMLHttpRequest();
		CON.open("GET", `sql/del_reactor.php?token=666&name=${name}`);
		CON.onload = function(){
			BEEP_ALARM.pause();
			if(CON.responseText=="Success"){
				window.location.href = `index.php`;
			} else {
				displayMessage("Error", CON.responseText)
			}
		}
		CON.send();
	}, DECOMMISSION_TIME-2500);
}
