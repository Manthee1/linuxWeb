sliderclick=0;

function shutdownMenu(){

    document.getElementById("shutdownMenu").style.display = "block"
    
    }
    
    function exitShutdown(){
    
        document.getElementById("shutdownMenu").style.display = "none"
    
    
    }
    
    function updateVolume(){
        
        realtimeVolume = document.getElementById("volumeControl").value;
        
        if (realtimeVolume > 74){
            document.getElementById("volumeIcon").src = "./img/volume/high-volume.png"
        }else if(realtimeVolume > 24){ document.getElementById("volumeIcon").src = "./img/volume/medium-volume.png";
        }else if (realtimeVolume > 1){document.getElementById("volumeIcon").src = "./img/volume/low-volume.png";
        }else if(realtimeVolume <= 1 ){document.getElementById("volumeIcon").src = "./img/volume/mute.png";}
    }
    
    function leftUpMenu() {
        
        
        if (document.getElementById("slidecontainer").style.display == "none"){
    
            document.getElementById("slidecontainer").style.display = "block"
            volUp = setInterval(updateVolume,50);
    
        }else {if(volUp!='undifined'){clearInterval(volUp)}
        document.getElementById("slidecontainer").style.display = "none";
        }
        
        sliderclick=1
    }
     function volumeCursorEscape(){
       
         
        if (sliderclick ==0){
        document.getElementById("slidecontainer").style.display = "none"}
        sliderclick=0;
     }
    
     function shutdown(){
        setTimeout(function(){window.location = "./Shutdown.php"},100);
        return "Shuting down..."
     }


     
