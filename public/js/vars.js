const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const maxDaysOfMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const availableWeather = {
  "January" : ["snow","frost","windy","rain","blizzard"],
  "February" : ["snow, frost, windy", "rain","blizzard"],
  "March" : ["frost","windy","rain","snow"],
  "April": ["windy","rain","still"],
  "May" : ["windy","rain","still","warm", "heatwave"],
  "June" : ["still","warm","heatwave", "drought"],
  "July" : ["still","warm","heatwave", "drought"],
  "August" : ["still","warm","heatwave"],
  "September" : ["still","rain","windy","indian summer"],
  "October" : ["rain","windy"],
  "November" : ["rain","windy","frost"],
  "December" : ["snow","frost","windy","rain"]
};
const weatherValues = {
  "blizzard" : 1.3,
  "snow" : 1.2,
  "frost" : 1.1,
  "rain" : 1.05,
  "windy" : 1.2,
  "still" : 1,
  "warm" : 0.95,
  "indian summer" : 0.9,
  "heatwave" : 0.8,
  "drought" : 0.7
};
const randomEvents = ["FA Final","BGT Final","Formula One","No TV","New PS6","Christmas Special","Concert"];
const randomEventsValues = {
  "FA Final" : 1.2,
  "BGT Final" : 1.15,
  "Formula One" : 1.1,
  "No TV" : 0.85,
  "Circus" : 0.95,
  "New PS6" : 1.15,
  "Christmas Special" : 1.25,
  "Concert" : 1.4
};
const timeOfDayValues = {
  "midnight" : 0.99,
  "night" : 0.995,
  "twilight" : 0.998,
  "morning" : 1,
  "midday" : 1.00575,
  "afternoon" : 1.003,
  "evening" : 1.0015
};
