<?php
  if($_GET['token']=="7t641"){
    ?>
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
        <head>
          <meta charset="utf-8">
          <title>RNMC - Restart Account?</title>
          <link rel="stylesheet" href="css/master.css">
          <link rel="stylesheet" href="css/master2.css">
        </head>
        <body>
          <br><br><br><br><br>
          <center>
            <fieldset>
              <h2>Restart Account?</h2>
              <p>Restarting your account will erase all of your data and create you a new account</p>
              <h4>Are you sure you want to continue?</h4>
              <a style="color:forestgreen" href="index.php">No. Leave my account alone!</a>&nbsp;&nbsp;&nbsp;
              <a style="color:crimson" href="sql/del_account.php?hg=defh">Yes. Delete my account.</a>
            </fieldset>
          </center>
        </body>
      </html>
    <?php
  }else{
    header("Location: index.php");
  }
?>
