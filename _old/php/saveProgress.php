<?php
  session_start();
  Require_Once "/var/services/web_require.php";

  if($_GET['token']=="666"){
    if($_GET['r']==""){echo "ERROR 405 - GET `r`";}else{
      if($_POST['json']==""){echo "ERROR 405 - POST `json`"; }else{
        $json = json_decode($_POST['json']);
        $db = database_login("nuclear_reactor");
        $TABLE = "{$_SESSION['user']}_REACTOR_{$_GET['r']}";

        // For each key=>value pair in JSON object, UPDATE table (DB)
        foreach ($json as $key => $value) {
          mysqli_query($db, "UPDATE $TABLE SET value='$value' WHERE name='$key'");
        }
        echo "Progress successfully saved to $TABLE";
        mysqli_close($db);
      }
    }
  }else{
    echo "ERROR 401";
  }
?>
