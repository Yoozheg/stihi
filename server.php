<?php
 $address = "name@domain.com"; // АДРЕС ПОЧТЫ МЕНЯТЬ ТУТ
 $site = "%PROJECTNAME%";
 
 function getStr($data, $default = ""){
  if(!isset($_POST[$data])) return $default;
  $data = $_POST[$data];
  $data = htmlspecialchars(strip_tags(trim($data)));
  return ($data != "" ? $data : $default);
 }
 function out($result){
  echo json_encode(Array('responce' => $result));
 }
 function message($address, $subject, $data, $site, $reply = false){
  $message = '<!doctype html><html><head><meta charset="utf-8"><title>'.$subject.'</title></head><body>';
  if(gettype($data) == 'string'){
   $message .= $data;
  }else{
   foreach($data as $key => $value){
    $message .= '<p><b>'.$key.':</b> <span>'.$value.'</span></p>';
   }
  }
  $message .= '</body></html>';
  $headers = "From: ". $site ."\r\nMIME-Version: 1.0\r\nContent-type: text/html; charset=utf-8\r\nX-Mailer: PHP/" . phpversion();
  if($reply) $headers .= '\r\nReply-To: ' . $reply;
  return mail($address, $subject, $message, $headers);
 }

 $data = Array('ФИО' => getStr('name'), 'Телефон' => getStr('phone'));
 if($_POST['temp']) $data['temp'] = getStr('temp');

 $send = message($address, "Заявка с сайта " . $site, $data, $site);
 out($send ? "Менеджер агентства свяжется с вами в самое ближайшее время" : "Ошибка, сообщение не отправлено!");
?>
