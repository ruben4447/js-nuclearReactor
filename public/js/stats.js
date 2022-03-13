// For stats screen
function ID(a){return document.getElementById(a);}

// General
ID("reactor-est").innerText = REACTOR.est;

// Status info
ID("stats-status-ok").innerText="0C";
ID("stats-status-warning").innerText = `${REACTOR.TBwarning}C`;
ID("stats-status-alert").innerText = `${REACTOR.TBalert}C`;
ID("stats-status-critical").innerText = `${REACTOR.TBcritical}C`;

// Max level info
ID("reactor-size-lvl-limit").innerText = REACTOR.reactorSizeLvlLimit;
ID("turbines-lvl-limit").innerText = REACTOR.turbineLvlLimit;
ID("steam-lvl-limit").innerText = REACTOR.steamLvlLimit;
ID("generators-lvl-limit").innerText = REACTOR.generatorLvlLimit;
ID("fuel-rods-lvl-limit").innerText = REACTOR.fuelRodLifeLvlLimit;
ID("containment-dome-lvl-limit").innerText = REACTOR.containmentDomeLvlLimit;
