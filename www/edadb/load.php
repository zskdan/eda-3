<?php
require_once('thrift.php');

if (!isset($_GET['name'])) {
  die('specify name');
}

$transport->open();
$client->readFromFile('dbs/'.$_GET['name']);
$transport->close();

