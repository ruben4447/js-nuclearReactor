<?php
  if($_GET['token']=="34"){
    $reactor = $_GET['reactor'];
    $current = $_GET['current'];
    $setting = $_GET['setting'];
    if($reactor=="" or $current=="" or $setting==""){die("ERROR:405");}else{
      $contents = file_get_contents("../data/reactors/$reactor.json") or die("ERROR:404");
      $additional = "__NONE__";
      $old_json = json_decode($contents);
      switch($setting){
        case 'setMode':
          switch ($current) {
            // In this case, $current is what to change the mode TO
            case 'light':
              $new = preg_replace("/\"setMode\":\".*\"/", "\"setMode\":\"light\"", $contents);
              $new = preg_replace("/\"setFuelConsumptionRate\":.*,/", "\"setFuelConsumptionRate\":\"10000\",", $new);
              $new = preg_replace("/\"setCoolantConsumptionRate\":.*,/", "\"setCoolantConsumptionRate\":\"12000\",", $new);
              break;
            case 'normal':
              $new = preg_replace("/\"setMode\":\".*\"/", "\"setMode\":\"normal\"", $contents);
              $new = preg_replace("/\"setFuelConsumptionRate\".*,/", "\"setFuelConsumptionRate\":\"5000\",", $new);
              $new = preg_replace("/\"setCoolantConsumptionRate\":.*,/", "\"setCoolantConsumptionRate\":\"6000\",", $new);
              break;
            case 'heavy':
              $new = preg_replace("/\"setMode\":\".*\"/", "\"setMode\":\"heavy\"", $contents);
              $new = preg_replace("/\"setFuelConsumptionRate\".*,/", "\"setFuelConsumptionRate\":\"2500\",", $new);
              $new = preg_replace("/\"setCoolantConsumptionRate\":.*,/", "\"setCoolantConsumptionRate\":\"3250\",", $new);
              break;
            case 'super':
              $new = preg_replace("/\"setMode\":\".*\"/", "\"setMode\":\"full power\"", $contents);
              $new = preg_replace("/\"setFuelConsumptionRate\".*,/", "\"setFuelConsumptionRate\":\"1000\",", $new);
              $new = preg_replace("/\"setCoolantConsumptionRate\":.*,/", "\"setCoolantConsumptionRate\":\"1500\",", $new);
              break;
          }
          break;
        case 'fuel':
          if($current == "__FILL__"){
            $new = preg_replace("/\"fuel\":.*,/", "\"fuel\":\"100\",", $contents);
          } else {
            $change = (int)$current;
            // Default: add fuel. (-)ve amount to deplete fuel.
            $new_fuel = (int)json_decode($contents)->fuel + $change;
            if($new_fuel<1){$new_fuel=1;}
            if($new_fuel>100){$new_fuel=100;}
            $new = preg_replace("/\"fuel\":.*,/", "\"fuel\":\"$new_fuel\",", $contents);
            $new_json = json_decode($new);
            $fuel = $new_json->fuel;
          }
          break;
        case 'coolant':
          if($current == "__FILL__"){
            $new = preg_replace("/\"coolant\":.*,/", "\"coolant\":\"100\",", $contents);
          } else {
            $change = (int)$current;
            // Default: add fuel. (-)ve amount to deplete fuel.
            $new_coolant = (int)json_decode($contents)->coolant + $change;
            if($new_coolant<1){$new_coolant=1;}
            if($new_coolant>100){$new_coolant=100;}
            $new = preg_replace("/\"coolant\":.*,/", "\"coolant\":\"$new_coolant\",", $contents);
            $new_json = json_decode($new);
            $coolant = $new_json->coolant;
          }
          break;
        case 'controlRods':
          // Lower/Raise Rods
          switch($current){
            case 'lowered':
              // Rods lowered. Raise rods
              $new_json = json_decode($contents);
              $new = preg_replace("/\"controlRods\":\".*\"/", "\"controlRods\":\"raised\"", $contents);
              $new = preg_replace("/\"TEMPERATURE\":\".*\"/", "\"TEMPERATURE\":\"stable\"", $new);
              $new = preg_replace("/\"mode\":\".*\"/", "\"mode\":\"{$new_json->setMode}\"", $new);
              $new = preg_replace("/\"fuelConsumptionRate\":.*,/", "\"fuelConsumptionRate\":\"{$new_json->setFuelConsumptionRate}\",", $new);
              $new = preg_replace("/\"coolantConsumptionRate\":.*,/", "\"coolantConsumptionRate\":\"{$new_json->setCoolantConsumptionRate}\",", $new);
              $new = preg_replace("/\"coolantPumps\":\".*\"/", "\"coolantPumps\":\"on\"", $new);
			  $new = preg_replace("/\"changeTempGaugeBy\":\".*\"/", "\"changeTempGaugeBy\":\"0\"", $new);
			  $new = preg_replace("/\"tempGauge\":.*,/", "\"tempGauge\":\"300\",", $new);
			  $new = preg_replace("/\"changeTempGaugeBy_BY_COOLANT_PUMPS\":.*,/", "\"changeTempGaugeBy_BY_COOLANT_PUMPS\":\"0\",", $new);
              break;
            case 'raised':
              // Rods raised. Lower rods
              $new = preg_replace("/\"controlRods\":\".*\"/", "\"controlRods\":\"lowered\"", $contents);
              $new = preg_replace("/\"TEMPERATURE\":\".*\"/", "\"TEMPERATURE\":\"null\"", $new);
              $new = preg_replace("/\"mode\":\".*\"/", "\"mode\":\"off\"", $new);
              $new = preg_replace("/\"status\":.*,/", "\"status\":\"null\",", $new);
              $new = preg_replace("/\"fuelConsumptionRate\":.*,/", "\"fuelConsumptionRate\":\"0\",", $new);
              $new = preg_replace("/\"coolantConsumptionRate\":.*,/", "\"coolantConsumptionRate\":\"0\",", $new);
              $new = preg_replace("/\"coolantPumps\":\".*\"/", "\"coolantPumps\":\"off\"", $new);
			  $new = preg_replace("/\"changeTempGaugeBy\":\".*\"/", "\"changeTempGaugeBy\":\"0\"", $new);
			  $new = preg_replace("/\"tempGauge\":.*,/", "\"tempGauge\":\"0\",", $new);
			  $new = preg_replace("/\"changeTempGaugeBy_BY_COOLANT_PUMPS\":.*,/", "\"changeTempGaugeBy_BY_COOLANT_PUMPS\":\"0\",", $new);
              break;
          }
          break;
        case 'coolantPumps':
          // Water Pumps on/off
          switch($current){
            case 'on':
              // Turn pumps off
              $new = preg_replace("/\"coolantPumps\":\".*\"/", "\"coolantPumps\":\"off\"", $contents);
              $new = preg_replace("/\"coolantConsumptionRate\":.*,/", "\"coolantConsumptionRate\":\"0\",", $new);
              break;
            case 'off':
              // Turn pumps on
              $new = preg_replace("/\"coolantPumps\":\".*\"/", "\"coolantPumps\":\"on\"", $contents);
              $new = preg_replace("/\"coolantConsumptionRate\":.*,/", "\"coolantConsumptionRate\":\"{$old_json->setCoolantConsumptionRate}\",", $new);
          }
          break;
      }

		$new_json = json_decode($new);
		$REACTOR_STATUS = $new_json->controlRods;
	  // DO changes to changeFuelGaugeBy =====================================
	  // DO NOT change anything if reactor is off ========
	  if($REACTOR_STATUS == "raised"){
		$old_amount = (int)($new_json->changeTempGaugeBy);
		$GAUGE = (int)($new_json->tempGauge);
		$BCP = (int)($new_json->changeTempGaugeBy_BY_COOLANT_PUMPS);
		$new_amount = $old_amount;
		// Coolant
		$coolant = (int)$new_json->coolant;
		$coolantPumps = $new_json->coolantPumps;
    if($coolant<=5){$new_amount += 2;/* Low coolant */}
    if($coolant<0){$new_amount += 5;/* No coolant */}
		if($new_json->coolantPumps=="off"){
			$new_amount +=5;/* No coolant */
			$BCP += 5;
			$new = preg_replace("/\"changeTempGaugeBy_BY_COOLANT_PUMPS\":.*,/", "\"changeTempGaugeBy_BY_COOLANT_PUMPS\":\"$BCP\",", $new);
		}
		// Fuel
		$fuel = (int)$new_json->fuel;
    if($fuel<=5){$new_amount -= 2;/* Amount dec. */}
    if($fuel<0){$new_amount -= 5;/* Amount dec. */}

		if($coolantPumps=="on" and $GAUGE>300 and $coolant>0){
			// Cool reactor down IF pumps are on AND reactor is too hot AND coolant is greater than 0%
			$new_amount -= 10;
			$BCP -= 10;
			$new = preg_replace("/\"changeTempGaugeBy_BY_COOLANT_PUMPS\":.*,/", "\"changeTempGaugeBy_BY_COOLANT_PUMPS\":\"$BCP\",", $new);
		} elseif ($coolantPumps=="on" and $coolant>0 and !empty($BCP) and $BCP!="") {
			$new_amount -= $BCP;
			$new = preg_replace("/\"changeTempGaugeBy_BY_COOLANT_PUMPS\":.*,/", "\"changeTempGaugeBy_BY_COOLANT_PUMPS\":\"0\",", $new);
		}
		// BALANCE
		if($coolant == $fuel){$new_amount = 0; /* All good */}
		$new = preg_replace("/\"changeTempGaugeBy\":.*,/", "\"changeTempGaugeBy\":\"$new_amount\",", $new);
		$new_json = json_decode($new);

		// Determine Status ============================================================
		/*   -150 ......... 100 .......... 200 .......... 300 ........ 400 ........ 500 .......... 750     **
		** failure          Alert        Warning        STABLE       Warning        Alert        failure  */

		$temp = $new_json->TEMPERATURE;
		$gauge = $new_json->tempGauge;
		$status = $new_json->status;
    if($gauge<=300){ $status = "OK"; $temp = "stable"; }
  	if($gauge<=200){ $status = "warning"; $temp = "low"; }
  	if($gauge<=100){ $status = "alert"; $temp = "very low"; }
  	if($gauge<=-150){ $status = "failiure"; $temp = "severely low"; }

  	if($gauge>=300){ $status = "OK"; $temp = "stable"; }
  	if($gauge>=400){ $status = "warning"; $temp = "high"; }
  	if($gauge>=500){ $status = "alert"; $temp = "very high"; }
  	if($gauge>=750){ $status = "failiure"; $temp = "critical"; }


		  $new = preg_replace("/\"status\":.*,/", "\"status\":\"$status\",", $new);
	    $new = preg_replace("/\"TEMPERATURE\":.*,/", "\"TEMPERATURE\":\"$temp\",", $new);
	  }

      if($new!=""){
        file_put_contents("../data/reactors/$reactor.json", $new);
		$FILE = file_get_contents("../data/reactors/$reactor.json");
		$JSON = json_decode($FILE);
		$change = $JSON->changeTempGaugeBy;
		$value = $JSON->tempGauge;

    // Do not inc. temp gauge IF above 750 OR below -150
    if($value<(-150) or $value>750){}else{
		    $new_value = (int)$value + (int)$change;
		    $NEW_FILE = preg_replace("/\"tempGauge\":.*,/", "\"tempGauge\":\"$new_value\",", $FILE);
      }
		file_put_contents("../data/reactors/$reactor.json", $NEW_FILE);
      }
      echo $additional;
    }
  }else{
    die("ERROR:401");
  }
?>
