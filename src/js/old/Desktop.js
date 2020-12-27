TCO="Martin@root : ";
PREVCMD_array=["",""]
pl = 1;

function desktopContextMenu(){

    document.getElementById("desktopContextMenu").style.display="block";

}

printSCR=print;

function clear(){

    TCO="Martin@root : ";
    document.getElementById("terminal-context").value=""
    return "";
}

console.oldLog = console.log;

console.log = function(termLog)
{
    console.oldLog(termLog);
    return ""+termLog+"";
};

print=console.log;

function launchTerminal()  {
document.getElementById("TerminalBody").style.display="inline-block";
document.getElementById("terminal-context").style.opacity="1";
}



function closeTerminal(){
    
    TCMD="" 
    TCO="Martin@root : ";
    pl = 1;
    document.getElementById('TerminalBody').style = 'display:none; top:30px; ;left:10px;'
    document.getElementById("terminal-context").value ="Martin@root : "
}




  // Trigger action when the contexmenu is about to be shown
$(document).bind("contextmenu", function (event) {
    
    // Avoid the real one
    event.preventDefault();
    
    // Show contextmenu
    $(".desktopContextMenu").finish().toggle(100).
    
    // In the right position (the mouse)
    css({
        top: event.pageY + "px",
        left: event.pageX + "px"
    });
});


// If the document is clicked somewhere
$(document).bind("mousedown", function (e) {
    
    // If the clicked element is not the menu
    if (!$(e.target).parents(".desktopContextMenu").length > 0) {
        
        // Hide it
        $(".desktopContextMenu").hide(100);
    }
});

var windowDrag = function(){
    return {
        move : function(divid,xpos,ypos){
            divid.style.left = xpos + 'px';
            divid.style.top = ypos + 'px';
        },
        startMoving : function(divid,container,evt){
            evt = evt || window.event;
            var posX = evt.clientX, 
                posY = evt.clientY,
            divTop = divid.style.top,
            divLeft = divid.style.left,
            eWi = parseInt(divid.style.width),
            eHe = parseInt(divid.style.height),
            cWi = parseInt(document.getElementById(container).style.width),
            cHe = parseInt(document.getElementById(container).style.height);
            
            divTop = divTop.replace('px','');
            divLeft = divLeft.replace('px','');
            var diffX = posX - divLeft,
                diffY = posY - divTop;
            document.onmousemove = function(evt){
                evt = evt || window.event;
                var posX = evt.clientX,
                    posY = evt.clientY,
                    aX = posX - diffX,
                    aY = posY - diffY;
                    if (aX < 0) aX = 0;
                    if (aY < 0) aY = 0;
                    if (aX + eWi > cWi) aX = cWi - eWi;
                    if (aY + eHe > cHe) aY = cHe -eHe;
                    console.log(divid+" - "+aX+":"+aY+":"+posX+":"+posY)
                windowDrag.move(divid,aX,aY);
            }
        },
        stopMoving : function(container){
            var a = document.createElement('script');
            
            document.onmousemove = function(){}
        },
    }
}();


function formatTextArea(textArea) {
   // textArea.value = textArea.value.replace(/(^|\r\n|\n)([^*]|$)/g, "$1*$2");
    
}

window.onload = function() {
    var textArea = document.getElementById("terminal-context");
    textArea.onkeyup = function(evt) {
        evt = evt || window.event;

        if (evt.keyCode == 13) {
            
            terminal_cmd=document.getElementById("terminal-context").value
            TCMD=terminal_cmd.split(TCO)[1].replace("\n","");
            this.value=TCO+TCMD
            try {
                if(typeof eval(TCMD) == null || typeof eval(TCMD) == 'undefined'){document.getElementById("terminal-context").value +="\n"+TCMD +" is undefined"+"\n"; }else{document.getElementById("terminal-context").value +="\n"+eval(TCMD)+"\n"; }
            }
            catch(err) {
                document.getElementById("terminal-context").value +="\n"+err +"\n";
            }
                        PREVCMD_array.push(TCMD);
            pl=PREVCMD_array.length-1
            formatTextArea(this);
            this.value  += "Martin@root : "
               TCO = this.value ;
               this.scrollTo(0,this.scrollHeight);
               
        }else if  (evt.keyCode == 38){
             
         
             this.value=TCO+PREVCMD_array[pl]
             if (pl>0){pl-=1}

        }else if  (evt.keyCode == 40){
             
         
            this.value=TCO+PREVCMD_array[pl]
            if (pl>=PREVCMD_array.length){pl+=1}
        }
    };
};

setTimeout(function(){
// If the menu element is clicked
$(".desktopContextMenu div").click(function(){
    
    // This is the triggered action name
    
    switch($(this).attr("data-action")) {
        
        // A case for each action. Your actions here
       
        case "new": alert("New"); break;
        case "view": alert("view"); break;
        case "sort": alert("sort"); break;
        case "terminal": launchTerminal(); break;
    }
  
    // Hide it AFTER the action was triggered
    $(".desktopContextMenu").hide(100);
  });},1000);



setInterval(function(){

    if (document.getElementById("terminal-context").value.indexOf(TCO) <= -1){

        document.getElementById("terminal-context").value=TCO;

    }

},100)

setInterval(function(){
    terminalH=Number(document.getElementById("terminal-context").style.height.split("px")[0]);
    terminalW=Number(document.getElementById("terminal-context").style.width.split("px")[0]);
if (document.getElementById("terminal-context").style.height != terminalH || document.getElementById("terminal-context").style.width != terminalW){

    document.getElementById("TerminalBody").style.width = terminalW+5+"px";
    document.getElementById("TerminalBody").style.height = terminalH+17+"px";
    document.getElementById("Terminal-titlebar").style.width = terminalW+5+"px";



}



},50)