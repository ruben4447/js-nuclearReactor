<?php
  require "../php/master.php";
  if($_GET['token']=="666"){
    $reactor_name = $_GET['name'];
    if($reactor_name==""){die("E404 - Missing Information");}else{
      $db = dbcon();
      $DOME_COST = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM vars WHERE name='repair_dome_cost'"))['value'];
      $reactor_vars = array(
        "REACTOR_LOCKED" => "false",
        "mode" => "off",
        "status" => "off",
        "alarmStatus" => "on",
        "controlRods" => "0",
        "fuel" => "100",
        "fuelDecrease" => "0",
        "rFuelDecrease" => "0.01",
        "replaceFuelCost" => "400000",
        "coolantPumps" => "0",
        "temperatureNumber" => "0",
        "temperatureText" => "null",
        "containmentDome" => "100",
        "containmentDomeStatus" => "good",
        "containmentDomeDmgRate" => "0",
        "REPAIR_containmentDomeCost" => "$DOME_COST",
        "steamPressure" => "0",
        "turbineRPM" => "0",
        "powerOutput" => "0",
        "connectedToGrid" => "yes",
        "incomePerKWH" => "0.13",
        "incomePerMWH" => "130",
        "income" => "0",
        "moneyGenerated" => "0",
        "totalMoneyGenerated" => "0",
        "rMode" => "normal",
        // Temperature boundaries
        "TBwarning" => "700",
        "TBalert" => "1000",
        "TBcritical" => "1200",
        "TBmeltdown" => "1300",
        // Multipliers
        "fuelRodsMult" => "15",
        "coolantMult" => "7",
        "steamPressureMult" => "1",
        "turbineRPMMult" => "1",
        "generatorMult" => "1",
        // Upgrades stuff
        "fuelRodLifeLvl" => "1",
        "fuelRodLifeUpgradeCost" => "500000",
        "containmentDomeLvl" => "1",
        "containmentDomeUpgradeCost" => "5000000",
        "turbineLvl" => "1",
        "turbineUpgradeCost" => "2500000",
        "generatorLvl" => "1",
        "generatorUpgradeCost" => "2500000",
        "steamPressureLvl" => "1",
        "steamPressureUpgradeCost" => "3750000",
        "reactorSizeUpgradeCost" => "10000000",
        "reactorSizeIncHowMany" => "2",
        "reactorSize" => "1",
        "numberOfTurbines" => "1",
        "buildTurbineCost" => "2500000",
        "numberOfGenerators" => "1",
        "buildGeneratorCost" => "2000000",
        "howManyTurbinesSupport" => "2",
        "howManyGeneratorsSupport" => "2",
        // Level Limiters
        "containmentDomeLvlLimit" => "3",
        "fuelRodLifeLvlLimit" => "5",
        "turbineLvlLimit" => "5",
        "generatorLvlLimit" => "5",
        "reactorSizeLvlLimit" => "3",
        "steamLvlLimit" => "5",
        // off-line income variables
        "offline" => "no",
        "lastOnline" => "",
        // Demand
        "demandUB" => "",
        "demandLB" => "",
        "demandText" => "",
        "oldDemand" => "",
        "meetingDemand" => "no",
        "demandRewardBoost" => 1.2,
        "baseload" => "",
        "baseloadConst" => "1750",
        // Reactor Time
        "timeRunningNum" => "0",
        "timeRunningText" => "",
        "est" => date("d/m/Y")
      );
      // Insert reactor into users table
      mysqli_query($db, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'reactor', '$reactor_name')");
      // Increment users reactors variable
      $reactors = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='reactors'"))['value'];
      $new_reactors = (int)$reactors + 1;
      mysqli_query($db,"UPDATE USER_$username SET value='$new_reactors' WHERE name='reactors'");
      // Increment all-time reactors
      $alltime_reactors = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='alltime_reactors'"))['value'];
      $new_alltime_reactors = (int)$alltime_reactors + 1;
      mysqli_query($db,"UPDATE USER_$username SET value='$new_alltime_reactors' WHERE name='alltime_reactors'");
      // Take away money from total
      $current_money = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='money'"))['value'];
      $price = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='reactor_commission_price'"))['value'];
      $new_money = (int)$current_money - (int)$price;
      mysqli_query($db, "UPDATE USER_$username SET value='$new_money' WHERE name='money'");
      // Double price of new reactor
      $new_price = ((int)$price) * 2;
      mysqli_query($db,"UPDATE USER_$username SET value='$new_price' WHERE name='reactor_commission_price'");

      // Make reactor table ({$username}_REACTOR_{$reactor_name})
      $reactor_tbl = "{$username}_REACTOR_{$reactor_name}";
      $sql = "CREATE TABLE `nuclear_reactor`.`$reactor_tbl` ( `ID` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , `value` TEXT NOT NULL , PRIMARY KEY (`ID`)) ENGINE = InnoDB";
      mysqli_query($db, $sql);
      foreach ($reactor_vars as $key => $value) {
        mysqli_query($db, "INSERT INTO `$reactor_tbl` (`ID`, `name`, `value`) VALUES (NULL, '$key', '$value')");
      }
      mysqli_close($db);
      echo "Success";
    }
  }else{
    die("E401 - Invalid Token");
  }
?>
