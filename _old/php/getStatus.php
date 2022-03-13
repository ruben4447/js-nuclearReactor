<?php
	$gauge = $_GET['v'];

	if($gauge<=300){ $status = "OK"; $temp = "stable"; }
	if($gauge<=200){ $status = "warning"; $temp = "low"; }
	if($gauge<=100){ $status = "alert"; $temp = "very low"; }
	if($gauge<=-150){ $status = "failiure"; $temp = "severely low"; }

	if($gauge>=300){ $status = "OK"; $temp = "stable"; }
	if($gauge>=400){ $status = "warning"; $temp = "high"; }
	if($gauge>=500){ $status = "alert"; $temp = "very high"; }
	if($gauge>=750){ $status = "failiure"; $temp = "critical"; }

	echo "<pre>GAUGE: $gauge<hr>STATUS: $status<br>TEMP.: $temp</pre>";
?>
