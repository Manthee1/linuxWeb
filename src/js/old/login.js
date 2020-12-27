
function openFullscreen() {
    elem = document.getElementById("body"); 
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

function timeUpdate(){

    d = new Date();
    hour=d.getHours()
    min=d.getMinutes();

    if (hour<10){hour="0"+hour}
    if (min<10){min="0"+min}
    document.getElementById("time").innerHTML = hour+":"+min;

 }


 function login(){
	lpass = document.getElementById("passw").value;
	lname = document.getElementById("logINname").value;
	if (lname == ""){document.getElementById("talert").innerHTML = "Fill in the USERNAME"; 
	}else if (lpass == ""){document.getElementById("talert").innerHTML = "Fill in the PASSWORD"; }else{
	
if (sha256(lpass + lname) == "cefba5b9c859b10d55a6f938199e8999b448b4c8c28d8565933eb8439891b7ae"){
	//	If you're looking for the password well it's encrypted, sorry
  setTimeout(function(){
    document.getElementsByClassName("Pcontent")[0].innerHTML ="<img id ='loading' src = ./img/loading.gif>"
    setTimeout(function(){window.location = "Xorg.php"},Math.random()*2500)
    
  },100)
	

}else{document.getElementById("talert").innerHTML = "The PASSWORD or the USERNAME is incorect";}}}

function loginInEnterPressedCheck(e){
code = (e.keyCode ? e.keyCode : e.which);
if(code == 13) {
    login();
}}
