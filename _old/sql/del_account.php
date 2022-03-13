<?php
  require "../php/master.php";
  if($_GET['hg']=="defh"){
    $db = dbcon();
    // Get account info
    $account = mysqli_query($db,"SELECT * FROM USER_$username");
    // delete all active reactors in users name
    while($row=mysqli_fetch_array($account)){
      if($row['name']=="reactor"){
        $reactor_tbl = "{$username}_REACTOR_{$row['value']}";
        mysqli_query($db, "DROP TABLE $reactor_tbl");
      }
    }
    // remove user's main table
    mysqli_query($db, "DROP TABLE USER_$username");
    mysqli_close($db);
    $_SESSION['RNMC_token']="-";
    header("Location: ../index.php");
  }else{
    die("Unauthorised");
  }
?>
