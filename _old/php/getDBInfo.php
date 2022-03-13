<?php
	Require_Once "/var/services/web/docs/php_require.php";
	Require_Once "/var/services/web_require.php";
	function fix($x) {
		$x = addslashes($x);
		return preg_replace("/\\\"/", "\\'", $x);
	}
  $username = $_SESSION['user'];
  $db = database_login("nuclear_reactor");

  // vars
  $return = "{";
  $query = mysqli_query($db,"SELECT * FROM vars");
  while ($row = mysqli_fetch_array($query)) {
    $return .= "\"{$row['name']}\":\"".fix($row['value'])."\",";
  }
  $return .= "\"NAME\":\"VALUE\"}";
  echo "var CONSTANTS = JSON.parse('$return');\n";

  // reactor info
  $TABLE = "{$_SESSION['user']}_REACTOR_{$_GET['r']}";
  $return = "{";
  $query = mysqli_query($db,"SELECT * FROM $TABLE");
  while ($row = mysqli_fetch_array($query)) {
    $return .= "\"{$row['name']}\":\"".fix($row['value'])."\",";
  }
  $return .= "\"name\":\"{$_GET['r']}\"}";
  echo "var REACTOR = JSON.parse('$return');\n";

  // User object (containing user variables)
  $TABLE = "USER_{$_SESSION['user']}";
  $return = "{";
  $query = mysqli_query($db,"SELECT * FROM $TABLE");
  while ($row = mysqli_fetch_array($query)) {
    $return .= "\"{$row['name']}\":\"".fix($row['value'])."\",";
  }
  $return .= "\"name\":\"{$_SESSION['user']}\"}";
  echo "var USER = JSON.parse('$return');";
  mysqli_close($db);
?>
