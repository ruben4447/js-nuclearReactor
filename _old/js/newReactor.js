const COMMISSION_TIME = Number(document.getElementById("COMMISSION_TIME").innerText);

document.getElementById("commission").addEventListener("click", Commission)
document.body.addEventListener("keydown", (event)=>{event.keyCode==13?Commission():null})

function ERROR(msg){
	BUZZER.play();
	document.getElementById("reactor_name").setAttribute("error", "true");
	document.querySelector("*[error_area]").innerText = msg;
}

function Commission(){
	let agreed = document.getElementById("agreement").checked;
	let name = document.getElementById("reactor_name").value;
	if(agreed != true){
		ERROR(`You must to agree to pay ${document.getElementById("price").innerHTML} to commission the reactor`);
		return false;
	} else if(name==undefined || name==""){
		ERROR("A reactor name is required");
		return false;
	} else if (name.match(" ")){
		ERROR("Reactor name cannot contain whitespace");
		return false;
	} else {
		document.getElementById("reactor_name").removeAttribute("error");
		document.querySelector("*[error_area]").innerText = "";
	}
	BEEP_ALARM.play();
	displayLoad(`Commissioning New Reactor Unit ${name}`, COMMISSION_TIME)
	setTimeout(function(){
		var CON = new XMLHttpRequest();
		CON.open("GET", `sql/new_reactor.php?token=666&name=${name.toUpperCase()}`);
		CON.onload = function(){
			BEEP_ALARM.pause();
			if(CON.responseText=="Success"){
				window.location.href = `index.php`;
			} else {
				displayMessage("Error", CON.responseText)
			}
		}
		CON.send();
	}, COMMISSION_TIME-3000);
}
