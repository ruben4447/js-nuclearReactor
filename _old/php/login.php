<?php
  if($_GET['token']=="237tehf75tr"){
    // Get password based off the user
    session_start();
	Require_Once "/var/services/web_require.php";
    $db = database_login("accounts");
    $correct_password = mysqli_fetch_array(mysqli_query($db,"SELECT * FROM main WHERE username='{$_SESSION['user']}'"))['password'];
    $entered_password = sha1($_GET['q']);

    if($entered_password == $correct_password){
      $_SESSION['RNMC_token'] = "237tehf75tr";
      echo "Success";
    } else {
      echo "Error";
    }
    mysqli_close($db);
  } else {
    echo "Error";
  }
?>
