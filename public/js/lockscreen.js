document.getElementById("login").addEventListener('click', login);
document.getElementById("input").addEventListener('keydown', hide_error);
document.body.addEventListener('keydown', (event)=>{event.keyCode==13?login():(event.keyCode==27?window.location='../':null)});
document.getElementById("input").focus();

function login() {
  var out;
  var con = new XMLHttpRequest();
  con.open("GET", `php/login.php?token=237tehf75tr&q=${document.getElementById("input").value}`);
  con.onload = () => {
    if(con.status==200){
      out = con.responseText;
      if(out == "Success"){ location.reload(); } else { error(out); }
    }
  }
  con.send();
}

function error(txt) {
  // BUZZER.play();
  console.error(txt);
  document.getElementById("input").setAttribute("placeholder", "Incorrect Passcode");
  document.getElementById("input").value = '';
  document.getElementById("input").setAttribute("class","error");
}
function hide_error() {
  document.getElementById("input").setAttribute("placeholder", "Passcode");
  document.getElementById("input").removeAttribute("class");
}
