<?php
require "master.php";
if ($_GET['token'] == "666b") {
	$price = $_GET['amount'];
	$action = $_GET['action'];
	$db = dbcon();
	$money = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='money'"))['value'];

	if ($action == "DEC") {
		$left_over = (int)$money - (int)$price;
		if ($left_over < 0) {
			echo "You do not have enough money to repair $item<br>You Need: £" . number_format($price) . "<br>You Have: £" . number_format($money);
		} else {
			// Minus money
			mysqli_query($db, "UPDATE USER_$username SET value='$left_over' WHERE name='money'") or die(mysqli_error($db) . mysqli_close($db));
			echo "OK";
		}
	} elseif ($action == "INC") {
		$new_money = (int)$money + (int)$price;
		mysqli_query($db, "UPDATE USER_$username SET value='$new_money' WHERE name='money'");
		echo "OK";
	} else {
		echo "Action Not Specified";
	}
	mysqli_close($db);
} else {
	echo "E401";
}
