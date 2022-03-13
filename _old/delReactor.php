<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="css/master.css">
    <link rel="stylesheet" href="css/master2.css">
    <link rel="stylesheet" href="css/interface.css">
    <title>RNMC - Decommission Unit</title>
  </head>
  <body>
    <span class="audio_area"></span>
<?php
  require "php/master.php";
  $reactor = $_GET['r'];
  if($reactor==""){header("Location: index.php");}
  $db = dbcon();
  $money = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='money'"))['value'];
  $price = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='reactor_decommission_price'"))['value'];
  if((int)$money >= (int)$price){
?>
    <div id="popup" class="popup-wrapper" hidden>
      <div class="popup-container">
        <h2 id="popup-title"></h2>
        <p><span id="popup-text"></span> &nbsp;&nbsp; <button id="cancelBtn" onclick="displayLoad('__CANCEL__')">Cancel</button></p>
        <progress id="popup-bar" value="0" max="100"></progress>
      </div>
    </div>
    <div id="userMessage" class="userMessage-wrapper" hidden>
      <div class="userMessage-container">
        <h2 id="userMessage-title"></h2>
        <b id="userMessage-text"></b><br><br>
        <button onclick="this.parentNode.parentNode.style.display='none'">Close</button>
      </div>
    </div>
    <!-- MAIN ******************************************************************************* -->
    <span id="DECOMMISSION_TIME" hidden><?php echo mysqli_fetch_array(mysqli_query($db, "SELECT * FROM vars WHERE name='reactor_decommission_time'"))['value'];?></span>
    <div class="interface sub">
      <h1>Decommission Unit <span id="REACTOR"><?php echo $reactor;?></span></h1>
      <center>
	     <br>
       <h3><a href="index.php">&lt;&lt;&lt; Back</a></h3>
       <br><br>
      <table RAW>
        <tr>
          <th>Payment</th>
          <td>I agree to pay <span id="price">£<?php echo number_format($price);?></span> to decommission unit <?php echo $reactor;?><input type="checkbox" id="agreement"> </td>
        </tr>
		<tr>
			<td colspan="2" error_area></td>
		</tr>
		<tr></tr>
		<tr>
			<td colspan="2"><button style='width:100%;height:50px;' id="decommission">Decomission for £<?php echo number_format($price);?></button></td>
		</tr>
      </table>
    </center>
    </div>
    <footer>
      <a href="php/logout.php" id="logout">Logout</a>|
      <a href="index.php">Back</a>
      <span class="login-msg">Logged In as <?php echo$reactor;?></span>
    </footer>
  <script src="js/master.js" charset="utf-8"></script>
	<script src="js/delReactor.js" charset="utf-8"></script>
<?php
} else {
?>
    <br><br><br><br><br><br>
    <center>
      <fieldset>
        <h2>Not Enough Money</h2>
        <p>You do not have enough money to decommission reactor unit <?php echo $username;?>.<br>
        You have: £<b><?php echo number_format($money); ?></b><br>
        You need: £<b><?php echo number_format($price); ?></b></p>
        <hr>
        <a href="index.php">&lt;&lt; BACK</a>
      </fieldset>
    </center>
    <script src="js/master.js" charset="utf-8"></script>
    <script type="text/javascript">
      BUZZER.play();
    </script>
<?php
}
?>
</body></html> <?php
mysqli_close($db);
?>
