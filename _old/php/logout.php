
<?php
  session_start();
  $_SESSION['RNMC_token'] = "null";
  header("Location: ../index.php");
?>
