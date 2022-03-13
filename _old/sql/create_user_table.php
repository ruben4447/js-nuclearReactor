<?php
  $dbC = dbcon();
  echo "Creating new table";
  // Create User table
  $sql = "CREATE TABLE `nuclear_reactor`.`USER_$username` ( `ID` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , `value` TEXT NOT NULL , PRIMARY KEY (`ID`)) ENGINE = InnoDB";
  mysqli_query($dbC, $sql);
  $starting_money = mysqli_fetch_array(mysqli_query($dbC, "SELECT * FROM vars WHERE name='starting_money'"))['value'];
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'money', '$starting_money')") or die(mysqli_error($dbC).mysqli_close($dbC));
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'reactors', '[]')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'alltime_reactors', '0')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'meltdowns', '0')");

  $date = date("d/m/Y");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'start_date', '$date')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'giftbox', '0')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'offline_income_mult', '1')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'offline_income_mult_upgrade', '50000000')");

  $new_price = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM vars WHERE name='reactor_commission_price'"))['value'];
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'reactor_commission_price', '$new_price')");

  $del_price = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM vars WHERE name='reactor_decommission_price'"))['value'];
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'reactor_decommission_price', '$del_price')");

  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'month', '0')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'day', '0')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'dayOfMonth', '1')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'time', '12')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'timeOfDay', 'midday')");

  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'REACTOR_DO_DAMAGE', 'true')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'REACTOR_DEPLETE_FUEL', 'true')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'REACTOR_MOVE_TIME', 'true')");
  mysqli_query($dbC, "INSERT INTO `USER_$username` (`ID`, `name`, `value`) VALUES (NULL, 'REACTOR_MOVE_TIME_EVERY', '1e3')");

  mysqli_close($dbC);
?>
