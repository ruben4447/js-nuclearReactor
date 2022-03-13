<?php
  require "../php/master.php";
  if($_GET['token']=="666"){
    $reactor_name = $_GET['name'];
    if($reactor_name==""){die("E404 - Missing Information");}else{
      $db = dbcon();
      // Delete reactor from users table
      mysqli_query($db, "DELETE FROM USER_$username WHERE name='reactor' AND value='$reactor_name'");
      // Decrement users reactors variable
      $reactors = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM USER_$username WHERE name='reactors'"))['value'];
      $new_reactors = (int)$reactors - 1;
      mysqli_query($db,"UPDATE USER_$username SET value='$new_reactors' WHERE name='reactors'");
      // Take away money from total
      $current_money = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='money'"))['value'];
      $price = mysqli_fetch_array(mysqli_query($db, "SELECT * FROM USER_$username WHERE name='reactor_decommission_price'"))['value'];
      $new_money = (int)$current_money - (int)$price;
      mysqli_query($db, "UPDATE USER_$username SET value='$new_money' WHERE name='money'");

      // -

      // Delete reactor table ({$username}_REACTOR_{$reactor_name})
      $reactor_tbl = "{$username}_REACTOR_{$reactor_name}";
      mysqli_query($db, "DROP TABLE $reactor_tbl") or die(mysqli_error($db).mysqli_close($db));
      mysqli_close($db);
      echo "Success";
    }
  }else{
    die("E401 - Invalid Token");
  }
?>
