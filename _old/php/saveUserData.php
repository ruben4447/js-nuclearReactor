<?php
  Require_Once "/var/services/web/docs/php_require.php";
	Require_Once "/var/services/web_require.php";

  if($_GET['token']=="666999" and $_GET['pass']=="1994" and $_GET['auth']=="4447"){
      if($_POST['json']==""){echo "ERROR 405 - POST `json`"; }else{
        $json = json_decode($_POST['json']);
        $db = database_login("nuclear_reactor");
        $TABLE = "USER_{$_SESSION['user']}";

        // For each key=>value pair in JSON object, UPDATE table (DB)
        foreach ($json as $key => $value) {
          mysqli_query($db, "UPDATE $TABLE SET value='$value' WHERE name='$key'");
        }
        echo "Progress successfully saved to $TABLE";
        mysqli_close($db);
      }
  }else{
    echo "ERROR 401";
  }
?>
