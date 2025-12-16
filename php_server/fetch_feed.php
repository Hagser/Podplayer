<?php
$seconds_to_cache = 60;
$ts               = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
header("Expires: $ts");
header("Pragma: cache");
header("Cache-Control: max-age=$seconds_to_cache");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_GET['url'] != null) {
    $url   = $_GET['url'];
    $limit = $_GET['limit'] != null ? (int) $_GET['limit'] : 10;
    if ($limit < 1) {
        $limit = 10;
    }
    echo json_encode(fetchRSS($url, $limit));
}

/**
 * Hämtar och tolkar ett RSS-flöde
 */
function fetchRSS($url, $limit)
{
    $rssContent = file_get_contents($url);
    //die($rssContent);
    $rss = new SimpleXMLElement($rssContent);

    $items = [];
    $name  = $rss->channel->title;
    $image = $rss->channel->image->url;

    if ($rss && isset($rss->channel->item)) {
        $index = 0;
        foreach ($rss->channel->item as $item) {

            if ($index >= $limit) {
                break;
            }
            // Begränsa antal avsnitt

            $items[] = [
                "name"  => (string) $name,
                "image" => (string) $image,
                "title" => (string) $item->title,
                "audio" => (string) $item->enclosure['url'],
                "date"  => strtotime((string) $item->pubDate) * 1000, // Konvertera datum till timestamp
            ];
            $index++;
        }
    }

    return $items;
}
