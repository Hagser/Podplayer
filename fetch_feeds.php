<?php
$seconds_to_cache = 60;
$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
header("Expires: $ts");
header("Pragma: cache");
header("Cache-Control: max-age=$seconds_to_cache");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$xmlFile = "podkicker_backup.opml.xml"; // Se till att filen finns i samma mapp

$opmlContent = file_get_contents($xmlFile);
$opml = new SimpleXMLElement($opmlContent);
$podcasts = [];
foreach ($opml->body->outline as $outline) {
  try {
      $attributes = $outline->attributes();
      $url = (string) $attributes->xmlUrl;
      $cacheLimit = (int) $attributes->cachelimit;

      $podcasts[] = [
          "url" => $url,
          "limit" => $cacheLimit
      ];
    }
    catch(Exception $e){}
}

echo json_encode($podcasts);

?>