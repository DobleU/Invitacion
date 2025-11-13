<?php
$to = "yourmail@gmail.com";
$name = $_POST['name'];
$message = $_POST['message'];
$from = $_POST['email'];
$headers = "From:" . $from;
ini_set("SMTP","smtp.namedomain.xxx"); 
ini_set("sendmail_from","postmaster@domainname.xxx");
mail($to,$name,$message,$headers);
echo "Mail Sent.";
?>