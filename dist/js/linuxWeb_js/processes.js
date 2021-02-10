processes={currentlySelectedProcess:null,pid:{},getPidObject:function(){let e={};return Object.values(this.pid).forEach(t=>{"object"==typeof e&&(e[t.id]=t)}),e!={}&&Object.values(e)},getNewPid:function(){return 0==Object.entries(this.pid).length?0:Number(Object.keys(this.pid).sort().slice(-1))+1},getNumberPid:function(e){return Number(e.split("pid")[1])},getFirstPidFormAppName:function(e){let t=this.getPidObject();for(let i=0;i<t.length;i++)if(t[i].appName==e)return t[i]},getRunningInstanceAmount:function(e){let t=0,i=this.getPidObject();for(let o=0;o<i.length;o++)i[o].appName==e&&t++;return t},bringToTop:function(e,t=null){if(null!=t&&t.target.tagName.endsWith("ICON")&&"APP_HEADER"==t.target.parentElement.parentElement.tagName)return!1;const i=this.getNumberPid(e.id);if("function"==typeof this.pid[i].onFocus&&setTimeout(()=>{void 0!==this.pid[i]&&this.pid[i].onFocus()},1),this.currentlySelectedProcess==this.pid[i])return!1;1==this.pid[i].minimized&&(e.style.transform="",e.style.opacity="",e.style.display="",this.pid[i].minimized=!1),appsContainer.insertAdjacentElement("beforeend",e),this.makeProcessResizable("#"+e.id),null!=this.currentlySelectedProcess&&this.currentlySelectedProcess.getProcessBarElement().classList.remove("selected"),this.pid[i].getProcessBarElement().classList.add("selected"),this.currentlySelectedProcess=this.pid[i]},processSchema:{title:"Untitled App",titleColor:"",bodyColor:"",textColor:"",headerColor:"",headerBorderBottomColor:"transparent",bodyBorderSize:"",padding:"",additionalBodyCss:"",opacity:1,HTML:String(),height:300,width:500,minHeight:150,minWidth:150,bodyBorder:Boolean(),fullHeight:!1,fullWidth:!1},createWindowSizeProjection:function(e,t="full"){if(isDefined(document.querySelector(t+"-wsp")))return!1;let i=e.getProcessElement(),o=topBar.offsetHeight,n=0,s=document.body.offsetWidth,r=window.innerHeight-(appList.offsetHeight+topBar.offsetHeight);switch(t){case"full":break;case"left-half":s=document.body.offsetWidth/2;break;case"right-half":s=document.body.offsetWidth/2,n=document.body.offsetWidth/2}let l=`\n            top:${o}px;\n            left:${n}px;\n            width:${s}px;\n            height:${r}px;\n        `;if(e.fillType=t,e.projectedFill={top:o,left:n,width:s,height:r},isDefined(document.querySelector("window_size_projection"))){document.querySelector("window_size_projection").style.cssText=l,i.insertAdjacentElement("beforebegin",document.querySelector("window_size_projection"))}else this.hideWindowFillProjection(e),windowSizeProjectionHTML=`<window_size_projection id='#${t}-wsp' style='${l}' ></window_size_projection>`,i.insertAdjacentHTML("beforebegin",windowSizeProjectionHTML)},scaleToProjectedFill:function(e){isObjectEmpty(e.projectedFill)||("full"==e.fillType?this.maximize(e.elementId):this.scaleToFillArea(e.elementId,e.projectedFill)),this.hideWindowFillProjection(e)},hideWindowFillProjection:function(e,t=!1){if(el=document.querySelector("window_size_projection"),isDefined(el)){if(t)return e.projectedFill={},el.style.opacity=0,setTimeout(()=>{el.style="opacity:0"},100),!0;if("opacity:0;"==el.style.cssText)return!1;e.projectedFill={},el.style.opacity=0}},scaleToFillArea:function(e,t={}){let i=this.getNumberPid(e),o=document.querySelector("#"+e),n=this.pid[i];if(this.bringToTop(o),n.scaledToArea&&isObjectEmpty(t)){let e=n.positionBeforeMaximize.y,t=n.positionBeforeMaximize.x,i=n.sizeBeforeMaximize.height,s=n.sizeBeforeMaximize.width,r=window.innerHeight-appList.offsetHeight,l=window.innerWidth;e+i>r&&(e-=e+i-r),t+s>l&&(t-=t+s-l),o.style.top=e+"px",o.style.left=t+"px",o.style.height=n.sizeBeforeMaximize.height+"px",o.style.width=n.sizeBeforeMaximize.width+"px",o.querySelector("app_resize").style.display="",n.maximized=!1,n.scaledToArea=!1}else n.scaledToArea||(n.positionBeforeMaximize={x:Number(o.style.left.replace("px","")),y:Number(o.style.top.replace("px",""))},n.sizeBeforeMaximize={width:o.clientWidth,height:o.clientHeight}),n.scaledToArea=!0,o.style.transition="all 0.2s ease-in-out",o.style.top=t.top+"px",o.style.left=t.left+"px",o.style.height=t.height+"px",o.style.width=t.width+"px";setTimeout(()=>{o.style.transition=""},200)},maximize:function(e){let t=this.getNumberPid(e),i=document.querySelector("#"+e),o=this.pid[t];this.bringToTop(i),1==o.maximized?(i.style.transition="all 0.2s ease-in-out",o.scaledToArea=!0,this.scaleToFillArea(e,{})):(fillData={top:topBar.offsetHeight,left:0,height:window.innerHeight-(appList.offsetHeight+topBar.offsetHeight),width:window.innerWidth},o.maximized=!0,this.scaleToFillArea(e,fillData))},minimize:function(e){let t=this.getNumberPid(e),i=document.querySelector("#"+e);this.bringToTop(i),i.style.transform="scale(0.5)",i.style.opacity="0",this.pid[t].minimized=!0,this.currentlySelectedProcess=null,this.pid[t].getProcessBarElement().classList.remove("selected"),setTimeout(()=>{i.style.display="none"},500)},remove:function(e){let t=this.getNumberPid(e);document.querySelector("#"+e).remove(),this.pid[t].getProcessBarElement().remove(),delete this.pid[t],this.currentlySelectedProcess=null},create:function(e,t={x:"default",y:"default"}){if(null==apps[e])return console.error(`Not Found: App '${e}' does not exist`),!1;if(apps[e].createData.onlyOneInstanceAllowed&&this.getRunningInstanceAmount(e)>0){return this.bringToTop(this.getFirstPidFormAppName(e).getProcessElement()),!1}let i=processes.getNewPid(),o="pid"+i,n={};Object.assign(n,this.processSchema),Object.assign(n,apps[e].createData),n.height<n.minHeight&&(n.height=n.minHeight),n.width<n.minWidth&&(n.width=n.minWidth),"default"==t.y&&(t.y=window.innerHeight/2-n.height/2),"default"==t.x&&(t.x=window.innerWidth/2-n.width/2);let s=`\n\t\t\tmin-height:${n.minHeight}px;\n\t\t\tmin-width:${n.minWidth}px;\n\t\t\tz-Index: 4;\n\t\t`,r=`\n\t\t\tbackground-color:${n.bodyColor};\n\t\t\tcolor:${n.textColor};\n\t\t\tmargin:${n.bodyBorder&&n.bodyBorderSize||"0px"};\n\t\t\theight:${n.fullHeight?"100%":"auto"};\n\t\t\twidth:${n.fullWidth?"100%":"auto"};\n\t\t\topacity: ${n.opacity};\n\t\t\tpadding: ${n.padding};\n\t\t\t${n.additionalBodyCss}\n\t\t`,l=`\n\t\t\tcolor: ${n.titleColor};\n\t\t\tbackground-color:${n.headerColor};\n\t\t\tborder-bottom: 1px solid ${n.headerBorderBottomColor};\n\t\t`;return appHTML=`\n\t\t\t<app_container onmousedown="processes.bringToTop(this,event)" id='${o}' style = "top: ${t.y}px;left: ${t.x}px;${s}" >\n\t\t\t\t<app_header style="${l}opacity:1;" onmousedown="processes.processMouseDownHandler(event, '${o}')" >\n\t\t\t\t\t<app_title onmousedown="processes.processMouseDownHandler(event, '${o}')">${n.title}</app_title>\n\t\t\t\t\t<app_minimize onclick="processes.minimize('${o}')"><minus_icon></minus_icon></app_minimize>\n\t\t\t\t\t<app_maximize onclick="processes.maximize('${o}')"><square_icon></square_icon></app_maximize>\n\t\t\t\t\t<app_exit onclick="processes.remove('${o}')"><x_icon></x_icon></app_exit>\n\t\t\t\t</app_header>\n\t\t\t\t<app_body style="${r}">\n\t\t\t\t\t${n.getHTML()}\n\t\t\t\t</app_body>\n\t\t\t\t<app_resize>\n\t\t\t\t\t<resize_point class='bottom-right'></resize_point>\n\t\t\t\t\t<resize_point class='bottom-left'></resize_point>\n\t\t\t\t\t<resize_point class='top-right'></resize_point>\n\t\t\t\t\t<resize_point class='top-left'></resize_point>\n\n\t\t\t\t\t<resize_point class='top'></resize_point>\n\t\t\t\t\t<resize_point class='left'></resize_point>\n\t\t\t\t\t<resize_point class='right'></resize_point>\n\t\t\t\t\t<resize_point class='bottom'></resize_point>\n\t\t\t\t\t</app_resize>\n\n\t\t\t\t</app_container>\n\t\t\t\n\t\t`,appsContainer.insertAdjacentHTML("beforeend",appHTML),appList.innerHTML+=`<process onclick="processes.bringToTop(document.querySelector('#${o}'))" id='appListPID${i}'>${n.title}</process>`,processes.pid[i]={},Object.assign(processes.pid[i],n.methods),Object.assign(processes.pid[i],{id:i,elementId:o,appName:e,minimized:!1,maximized:!1,scaledToArea:!1,positionBeforeMaximize:{x:t.x,y:t.y},sizeBeforeMaximize:{width:n.width,height:n.height},originalOffsetY:0,originalOffsetX:0,getProcessElement:function(){return document.querySelector("#"+this.elementId)},getProcessElementBody:function(){return document.querySelector(`#${this.elementId}>app_body`)},getProcessElementHeader:function(){return document.querySelector(`#${this.elementId} app_header`)},getProcessBarElement:function(){return document.querySelector("#appListPID"+this.id)}}),this.makeProcessResizable("#"+processes.pid[i].elementId),this.bringToTop(processes.pid[i].getProcessElement()),null!=apps[e].onStart&&apps[e].onStart(processes.pid[i]),n={},!0},processMouseDownHandler:function(e,t,i=!1){pid=this.getNumberPid(t);let o=this.pid[pid];if("APP_HEADER"!=e.target.tagName&&"APP_TITLE"!=e.target.tagName&&!i)return!1;if(o.maximized||o.scaledToArea){let i=e.clientY,n=e.clientX;return document.body.onmousemove=e=>{if(Math.abs(i-e.clientY)+Math.abs(n-e.clientX)>40){let i=o.getProcessElement();i.style.top=e.layerY,document.body.setAttribute("onmousemove",null);let n=e.layerX/i.offsetWidth*o.sizeBeforeMaximize.width,s=e.clientY,r=e.clientX-n;o.positionBeforeMaximize.x=r,o.positionBeforeMaximize.y=s,o.scaledToArea=!0,processes.scaleToFillArea(t,{}),processes.initiateProcessMouseMoveHandler(o,e.layerY,n)}},!1}this.initiateProcessMouseMoveHandler(o,e.layerY,e.layerX)},initiateProcessMouseMoveHandler:function(e,t,i){e.originalOffsetY=t,e.originalOffsetX=i,document.body.setAttribute("onmousemove",`processes.processMouseMoveHandler(event,processes.pid['${pid}'])`),document.body.onmouseup=()=>{isDefined(e.getProcessElementHeader())?(document.body.setAttribute("onmousemove",null),e.getProcessElementHeader().setAttribute("onmouseup",null),this.scaleToProjectedFill(e),this.hideWindowFillProjection(e,!0)):document.body.onmouseup=null}},processMouseMoveHandler:function(e,t){let i=e.clientY,o=e.clientX,n=i-t.originalOffsetY,s=o-t.originalOffsetX;i<topBar.offsetHeight?this.createWindowSizeProjection(t,"maximum"):o<30?this.createWindowSizeProjection(t,"left-half"):o>document.body.offsetWidth-30?this.createWindowSizeProjection(t,"right-half"):this.hideWindowFillProjection(t),n=n<topBar.offsetHeight?topBar.offsetHeight:n,t.getProcessElement().style.top=n+"px",t.getProcessElement().style.left=s+"px"},makeProcessResizable:function(e){const t=document.querySelector(e),i=document.querySelectorAll(e+" resize_point"),o=t.style.minWidth.replace("px","")||150,n=t.style.minHeight.replace("px","")||150;let s=0,r=0,l=0,d=0,c=0,p=0;i.forEach(e=>{function i(i){const a=e.classList.toString();let h=0,u=0;a.includes("top")?(h=r-(i.pageY-p),h>n&&h<=window.innerHeight&&(t.style.height=h+"px",t.style.top=d+(i.pageY-p)+"px")):a.includes("bottom")&&(h=r+(i.pageY-p),h>n&&h<=window.innerHeight&&(t.style.height=h+"px")),a.includes("left")?(u=s-(i.pageX-c),u>o&&u<=window.innerWidth&&(t.style.width=u+"px",t.style.left=l+(i.pageX-c)+"px")):a.includes("right")&&(u=s+(i.pageX-c),u>o&&u<=window.innerWidth&&(t.style.width=u+"px")),h>=window.innerHeight&&(t.style.height=window.innerHeight),u>=window.innerWidth&&(t.style.width=window.innerWidth)}function a(){document.body.setAttribute("onmousemove",null),window.removeEventListener("mousemove",i)}e.addEventListener("mousedown",(function(e){e.preventDefault(),s=parseFloat(getComputedStyle(t,null).getPropertyValue("width").replace("px","")),r=parseFloat(getComputedStyle(t,null).getPropertyValue("height").replace("px","")),l=t.getBoundingClientRect().left,d=t.getBoundingClientRect().top,c=e.pageX,p=e.pageY,window.addEventListener("mousemove",i),window.addEventListener("mouseup",a)}))})}};