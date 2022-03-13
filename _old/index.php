<?php
	require "php/master.php";
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<link rel="stylesheet" href="css/master.css">
		<?php if($token==$Tactual){?>
			<title>RNMC - Main Menu</title>
			<link rel="stylesheet" href="css/master2.css">
		<?php }else{?>
			<title>RNMC - Log In</title>
			<link rel="stylesheet" href="css/lockscreen.css">
		<?php }?>
	</head>
	<body>
		<span class="audio_area"></span>
		<?php if($_SESSION['RNMC_token'] == "237tehf75tr") { ?>
			<div class="container">
				<div class="sub" id="main">
						<?php
							$db = dbcon();
							$usr_table = mysqli_query($db, "SELECT * FROM USER_$username");
							if($usr_table==false){require "sql/create_user_table.php"; die(header("Location: index.php")); }else{
								$money = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='money'"))['value'];
								echo "<h2>Total Money: £<b>".number_format($money)."</b></h2>";
								$reactors = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='reactors'"))['value'];
								echo "<h2>Active Reactor Units: <b>".$reactors."</b></h2>";
								echo "<h2><a href='user.php'>See Here For More: <code>User Homepage</code></a></h2>";

								// Cycle through reactors
								echo "<table><tr><th>Unit</th><th>Controls</th><th>Options</th></tr>";
								$query = mysqli_query($db, "SELECT * FROM USER_".$username." WHERE name = 'reactor'");
								while ($row = mysqli_fetch_array($query)) {
									echo "<tr>
										<td>".$row['value']."</td>
										<td><a href='view.php?r=".$row['value']."'>Controls: ".$row['value']."</a></td>
										<td><a href='delReactor.php?r=".$row['value']."'>Decommission: ".$row['value']."</a></td>
									</tr>";
								}
								echo "<tr><th colspan='3'><a href='newReactor.php'>Commission New Unit</a></th></tr>";
								echo "</table>";
							}
							mysqli_close($db);
						?>
				</div>
			</div>
			<footer>
				<a href="php/logout.php" id="logout">Logout</a> |
				<a href="restart.php?token=7t641">Restart</a>
				<span class="login-msg">Logged In as <?php echo $username;?></span>
			</footer>
		<?php } else { ?>
			<div class="container">
				<h2 id="title_">Log In to Remote Nuclear Managing Console</h2>
				<i>Enter your RNMC password (website password) below</i>
				<br><br>
				<input type="text" value="<?php echo$username;?>" placeholder="Username" readonly>
				<br><br>
				<input type="password" id="input" placeholder="Passcode">
				<button type="button" id="login">Log In</button>
				<br><br>
				<i>V2.2 - 14/04/2019, 19:06</i>
			</div>
			<footer>
				<a href="../">Back</a>
				<span class="login-msg">Logged Out</span>
			</footer>
			<script src="js/lockscreen.js" charset="utf-8"></script>
		<?php } ?>
		<script src="js/master.js"></script>
	</body>
</html>
