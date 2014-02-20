<?php
$data=file_get_contents("https://www.facebook.com/feeds/page.php?format=rss20&id=TheHerbBasketLLCr");
$xml = @simplexml_load_string($data);
$i=1;
foreach ($xml->channel->item as $item){
	$publ_timestamp=strtotime($item->pubDate);
	$diffr=abs($current_date – $publ_timestamp);
	$days = floor($diffr/(60*60*24));
	$title=$item->title;
	$description=$item->description;
	$link=$item->link;
	$author=$item->author;

	echo ‘<div>’;
	echo “<h4> $title </h4><br />
	<span> Posted $days days ago </span><br />”;
	echo “<p> $description </p><br />
	<a href=’ $link ‘ >VIEW FULL POST </a><br />”;
	echo “<span>Author: $author; </span><br />”;
	echo ‘</div>’;
	echo ‘<div></div>’;
	if($i==$since) return;
	$i++;
}
?>