<?php
	Require_Once "/var/services/web/docs/php_require.php";
	Require_Once "/var/services/web_require.php";
  $username = $_SESSION['user'];
  
  if ($username == "") die(header("Location: /index.php?loc=/account/family/nuclear_reactor/&error=4"));
  $token = $_SESSION['RNMC_token'];
  $Tactual = "237tehf75tr";
  //if($token!=$Tactual){header("Location: /account/family/nuclear_reactor/index.php");}
  function dbcon() {
	  return database_login("nuclear_reactor");
  }
?>
