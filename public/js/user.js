const socket = io();

const token = Array.from(new URLSearchParams(location.search.substring(1)))?.[0]?.[0];
socket.emit('auth', { token, loc: 2 }); // Tell server who and where we are

var data;

socket.on('auth', data_ => {
  if (data_ === false) {
    location.href = '/logout/' + token;
  }
});
socket.on('data', data_ => {
  data = data_;
  if (data.update) main();
});
socket.on("alert", ({ title, txt }) => displayMessage(title, txt));

let init = true;
function main() {
  console.log(data);

  document.querySelectorAll(".username").forEach(el => el.innerText = data.username);
  document.getElementById("money").innerText = data.user.money.toLocaleString("en-GB");
  document.getElementById("link-mainpage").setAttribute("href", "/?" + data.token);
  document.getElementById("start-date").innerText = new Date(data.user.start_date).toString().split(" GMT")[0];
  document.getElementById("active-reactors").innerText = Object.keys(data.user.reactors).length.toLocaleString("en-GB");
  document.getElementById("alltime-reactors").innerText = data.user.alltime_reactors.toLocaleString("en-GB");
  document.getElementById("comission-cost").innerText = data.user.reactor_commission_price.toLocaleString("en-GB");
  document.getElementById("decomission-cost").innerText = data.user.reactor_decommission_price.toLocaleString("en-GB");
  document.getElementById("income-mult").innerHTML = "&times;" + data.user.offline_income_mult.toLocaleString("en-GB");
  document.getElementById("income-mult-next").innerHTML = "&times;" + (data.user.offline_income_mult + data.constants.income_mult_next).toLocaleString("en-GB");
  document.getElementById("income-mult-upgrade-cost").innerHTML = data.user.offline_income_mult_upgrade.toLocaleString("en-GB");
  document.getElementById("meltdown-count").innerHTML = data.user.meltdowns.toLocaleString("en-GB");

  if (init) {
    document.getElementById("link-about-income").addEventListener("click", () => {
      displayMessage("About: income", "You still generated £££ while you are offline, but it is divided by 50 then <b money>multiplied by an income multiplier</b>")
    });

    document.getElementById("income-upgrade-btn").addEventListener("click", () => {
      socket.emit("upgrade-income", { token });
    });
  }

  init = false;
}