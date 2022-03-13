<?php
  include "php/master.php";
  if($token==$Tactual){}else{header("Location: index.php");}

  $db = dbcon();
  $start_date = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='start_date'"))['value'];
  $money = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='money'"))['value'];
  $active_reactors = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='reactors'"))['value'];
  $alltime_reactors = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='alltime_reactors'"))['value'];
  $com_price = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='reactor_commission_price'"))['value'];
  $decom_price = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='reactor_decommission_price'"))['value'];
  $mult = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='offline_income_mult'"))['value'];
  $multCost = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='offline_income_mult_upgrade'"))['value'];
  $nextMult = (float)$mult + 0.1;
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>RNMC - User Homepage</title>
    <link rel="stylesheet" href="css/master.css">
    <link rel="stylesheet" href="css/master2.css">
  </head>
  <body status="ok">
    <div id="userMessage" class="userMessage-wrapper" hidden>
      <div class="userMessage-container">
        <h2 id="userMessage-title"></h2>
        <b id="userMessage-text"></b><br><br>
        <button onclick="this.parentNode.parentNode.style.display='none'">Close</button>
      </div>
    </div>
    <span class="audio_area"></span>
    <div class="container"><center>
      <div class="sub" id="main">
        <h2>User Homepage: <?php echo$username;?></h2>
        <table RAW>
          <tr>
            <td>
              <table class="section">
                <tr>
                  <th colspan="3">Profile</th>
                </tr>
                <tr>
                  <td>Username:</td>
                  <td class="big-text"><?php echo $username;?></td>
                  <td><a href="javascript:void(0)" onclick="About_username()">[?]</a></td>
                </tr>
                <tr>
                  <td>Start Date:</td>
                  <td colspan="2" class="big-text"><?php echo $start_date;?></td>
                </tr>
              </table>
            </td>
            <td>
              <table class="section">
                <tr>
                  <th colspan="2">Money</th>
                </tr>
                <tr>
                  <td>Currency:</td>
                  <td class="big-text">GBP £</td>
                </tr>
                <tr>
                  <td>Balance:</td>
                  <td class="big-text">£<?php echo number_format($money);?></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table class="section">
                <tr>
                  <th colspan="2">Units</th>
                </tr>
                <tr>
                  <td>Active Units:</td>
                  <td class="big-text"><?php echo $active_reactors;?></td>
                </tr>
                <tr>
                  <td>All-Time Units:</td>
                  <td class="big-text"><?php echo $alltime_reactors;?></td>
                </tr>
              </table>
            </td>
            <td>
              <table class="section">
                <tr>
                  <th colspan="2">Unit Prices</th>
                </tr>
                <tr>
                  <td>Commission Price:</td>
                  <td class="big-text">£<?php echo number_format($com_price);?></td>
                </tr>
                <tr>
                  <td>Decommission Price:</td>
                  <td class="big-text">£<?php echo number_format($decom_price);?></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table class="section">
                <tr>
                  <th colspan="2">Income</th>
                </tr>
                <tr>
                  <td colspan="2"><a href="javascript:void(0)" onclick="About_income()">[About]</a></td>
                </tr>
                <tr>
                  <td>Your Income Multiplier:</td>
                  <td class="big-text current-level">&times;<?php echo $mult;?></td>
                </tr>
                <tr>
                  <td>Next Multiplier Level:</td>
                  <td class="big-text next-level">&times;<?php echo $nextMult;?></td>
                </tr>
                <tr>
                  <td colspan="2"><button onclick="upgrade()">Upgrade your Income Multiplier (£<?php echo number_format($multCost);?>)</button></td>
                </tr>
              </table>
            </td>
            <td>
              <table class="section">
                <tr>
                  <th colspan="2">Meltdowns</th>
                </tr>
                <tr>
                  <td>Unit Meltdowns: </td>
                  <td class="big-text"><?php echo mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_{$_SESSION['user']} WHERE name='meltdowns'"))['value']; ?></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center></div>
    </div>
    <footer>
      <a href="index.php">Back</a>
      <span class="login-msg">Logged In as <?php echo $username;?></span>
    </footer>
    <script src="js/master.js" charset="utf-8"></script>
    <script type="text/javascript">
    function About_username(){displayMessage("About: Username","This is your site username and cannot be changed. If you change your site username, you will (at the moment) lose access to your RNMC profile.")}function About_income(){displayMessage("About: income","You still generated \xA3\xA3 while you are offline, but it is divided by 50 then <b money>multiplied by an income multiplier</b>")}function upgrade(){var a=new XMLHttpRequest;a.open("GET",`php/money.php?token=666b&action=DEC&amount=<?php echo$multCost;?>`),a.onload=()=>{if("OK"==a.responseText){var b=new XMLHttpRequest;b.open("GET",`php/upgradeIncomeMult.php?auth=66fr2&current=<?php echo$mult;?>&cost=<?php echo$multCost;?>`),b.onload=()=>{console.log(b.responseText),location.reload()},b.send()}else displayMessage("Unable to Upgrade Income Multiplier",a.responseText)},a.send()}
    </script>
  </body>
</html>
<?php mysqli_close($db); ?>
