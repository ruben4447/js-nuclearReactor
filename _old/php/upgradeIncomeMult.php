<?php
  if($_GET['auth'] == "66fr2"){
    include "../php/master.php";
    $current = $_GET['current'];
    $cost = $_GET['cost'];
    if($current=="" || $cost==""){
		die("E405");
    }else{
		$db = dbcon();
		$new = (float)$current + 0.1;
		$new_cost = (int)$cost * 2;
		mysqli_query($db, "UPDATE USER_$username SET value='$new' WHERE name='offline_income_mult'");
		mysqli_query($db, "UPDATE USER_$username SET value='$new_cost' WHERE name='offline_income_mult_upgrade'");
		mysqli_close($db);
    }
  }else{
		die("E401");
  }
?>
