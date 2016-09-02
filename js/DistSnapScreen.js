/**
 * Date：2016/6/5
 * Author: DistChen
 * Desc：www.chenyp.com
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    if (typeof $ === 'undefined') {
        throw new Error('DistSnapScreen\'s JavaScript requires jQuery');
    }

    var DistSnapScreen=function(){
        this.plugin = null;
        this.context = null;
        this.snapContainer = null;
        this.snapContainerCanvas = null;
        this.snapContainerDownLoad = null;
        this.img = null;
        this.textInput = null;
        this.paintType = 1;
    };

    DistSnapScreen.prototype.PaintType={
        Pencil:1,
        Eraser:1,
        Rect:2,
        Circle:3,
        Text:4
    };

    DistSnapScreen.prototype.config={
        host:"127.0.0.1",
        port:"8080",
        serverApp:"SnapScreen",
        uploadAction:"/upload.jsp?action=uploadimage"
    };

    DistSnapScreen.prototype.init=function(options){
        $.extend(DistSnapScreen.prototype.config,options);
        _insertTemplate.apply(this);
    };

    DistSnapScreen.prototype.snapScreen=function(){
        var result;
        try{
            result = this.plugin.saveSnapshot(this.config.host, "/"+this.config.serverApp+this.config.uploadAction, this.config.port);
        }catch (e){
            this.snapContainer.show();
            this.snapContainerDownLoad.show();
            this.snapContainerCanvas.hide();
            return "";
        }
        result = eval("("+ result +")");
        return "http://"+this.config.host+":"+this.config.port+"/"+this.config.serverApp+"/"+result.url;
    };

    DistSnapScreen.prototype.snapScreenAndScrawl=function(callback){
        var url = this.snapScreen();
        if(url!=""){
            this.callback = callback;
            this.snapContainer.show();
            this.snapContainerCanvas.show();
            _renderBackgroundImg.call(this,url);
        }
    };

    var _renderBackgroundImg = function(url){
        var widget = this;
        this.img.setAttribute('crossOrigin', 'Anonymous');
        this.img.src=url;
        this.img.onload = function(){
            var width = widget.img.naturalWidth;
            var height = widget.img.naturalHeight;
            widget.canvas.width = width;
            widget.canvas.height = height;
            widget.snapContainerCanvas.css({
                width:width+"px",
                height:height+"px",
                left:"calc(50% - "+width/2+"px)",
                top:"calc(50% - "+height/2+"px)"
            });
            _switchBoard.call(widget,{});
        };
    };

    var _insertTemplate=function(){
        var container = $('<div></div>').appendTo(document.body);
        _insertSnapContainer.apply(this,container);
        _insertSnapPlugin.apply(this,container);
    };

    var _insertSnapContainer = function(container){
        this.snapContainer = $('<div class="SnapContainer"></div>').appendTo(container);
        _insertSnapContainerCanvas.apply(this);
        _insertSnapContainerDownLoad.apply(this);
    };

    var _insertSnapContainerCanvas=function(){
        this.snapContainerCanvas = $('<div class="SnapContainerCanvas"></div>').appendTo(this.snapContainer);
        this.img = $('<img onselectstart="return false;" src="#">').appendTo(this.snapContainerCanvas)[0];
        this.canvas = $('<canvas></canvas>').appendTo(this.snapContainerCanvas)[0];
        this.textInput = $('<input type="text">').appendTo(this.snapContainerCanvas)[0];
        _registerOpeBtn.apply(this,$("<div></div>").appendTo(this.snapContainerCanvas));
    };

    var _registerOpeBtn=function(container){
        var widget = this;
        var activeBtn;
        var textBtn = $("<button>文字</button>").appendTo(container);
        textBtn.on("click",function(){
            activeBtn = _activeBtn(activeBtn,textBtn);
            _switchBoard.call(widget,{
                paintType:widget.PaintType.Text,
                fillStyle:"red",
                font:"20px Arial"
            });
        });
        var rectBtn = $("<button>矩形</button>").appendTo(container);
        rectBtn.on("click",function(){
            activeBtn = _activeBtn(activeBtn,rectBtn);
            _switchBoard.call(widget,{
                paintType:widget.PaintType.Rect
            });
        });
        var circleBtn = $("<button>画圆</button>").appendTo(container);
        circleBtn.on("click",function(){
            activeBtn = _activeBtn(activeBtn,circleBtn);
            _switchBoard.call(widget,{
                paintType:widget.PaintType.Circle
            });
        });
        var pencilBtn = $("<button>铅笔</button>").appendTo(container);
        pencilBtn.on("click",function(){
            activeBtn = _activeBtn(activeBtn,pencilBtn);
            _switchBoard.call(widget,{
                paintType:widget.PaintType.Pencil
            });
        });
        var eraserBtn = $("<button>橡皮擦</button>").appendTo(container);
        eraserBtn.on("click",function(){
            activeBtn = _activeBtn(activeBtn,eraserBtn);
            _switchBoard.call(widget,{
                paintType:widget.PaintType.Eraser,
                lineWidth:10,
                globalCompositeOperation:"destination-out"
            });
        });
        var okBtn = $("<button>确定</button>").appendTo(container);
        okBtn.on("click",function(){
            widget.context.globalCompositeOperation = "destination-over";
            widget.context.drawImage(widget.img,0,0);
            widget.snapContainer.css("display","none");
            widget.snapContainerCanvas.css("display","none");
            widget.callback(widget.canvas.toDataURL("image/png"));
        });
        activeBtn = pencilBtn;
        activeBtn.addClass("active");
    };

    var _activeBtn=function(lastBtn,btn){
        lastBtn.removeClass("active");
        btn.addClass("active");
        return btn;
    };

    var _switchBoard = function(paras){
        if(!this.context){
            this.context = this.canvas.getContext("2d");
            _addCanvasEvent.apply(this);
        }
        this.context.closePath();
        this.paintType = paras.paintType||this.paintType;
        this.context.font = paras.font||"14px Arial";
        this.context.lineWidth = paras.lineWidth||3;
        this.context.strokeStyle = paras.strokeStyle||"red";
        this.context.fillStyle=paras.fillStyle||"transparent";
        this.context.lineCap = paras.lineCap||"round";
        this.context.globalCompositeOperation = paras.globalCompositeOperation || "source-over";
        this.textInput.value="";
        $(this.textInput).css({
            display:"none",
            font:this.context.font,
            color:this.context.fillStyle,
            "border-color":this.context.fillStyle
        });
    };

    var _addCanvasEvent = function(){
        var widget = this;
        var painting = false;
        var startX,startY,endX,endY,lineWidth;
        var minX,minY,maxX=0,maxY= 0,maxRadius = -1;
        $(this.canvas).mousedown(function(e){
            lineWidth = widget.context.lineWidth;
            painting = true;
            startX = e.offsetX;
            startY = e.offsetY;
            if(widget.paintType==widget.PaintType.Pencil||
                widget.paintType==widget.PaintType.Eraser){
                widget.context.beginPath();
            }else if(widget.paintType==widget.PaintType.Text){
                painting = false;
                if(widget.textInput.value.trim()!=""){
                    widget.context.fillText(widget.textInput.value.trim(),widget.textX-7,widget.textY+8);
                    widget.textInput.value="";
                    $(widget.textInput).hide();
                }else{
                    $(widget.textInput).css({
                        display:"block",
                        left:startX-10+"px",
                        top:startY-15+"px"
                    });
                    widget.textX = startX;
                    widget.textY = startY;
                }
            }else if(widget.paintType==widget.PaintType.Rect){
                minX = startX;
                minY = startY;
                maxX = startX;
                maxY = startY;
            }else if(widget.paintType==widget.PaintType.Circle){
                maxRadius = -1;
            }
        });
        $(this.canvas).mousemove(function(e){
            if(painting){
                endX = e.offsetX;
                endY = e.offsetY;
                if(widget.paintType==widget.PaintType.Pencil || widget.paintType==widget.PaintType.Eraser) {
                    widget.context.moveTo(startX, startY);
                    widget.context.lineTo(endX, endY);
                    startX = endX;
                    startY = endY;
                    widget.context.stroke();
                }else if(widget.paintType==widget.PaintType.Rect){
                    if(endX > maxX){maxX = endX;}
                    if(endX < minX){minX = endX;}
                    if(endY > maxY){maxY = endY;}
                    if(endY < minY){minY = endY;}
                    widget.context.clearRect(minX-lineWidth,minY-lineWidth,maxX - minX+2*lineWidth,maxY - minY+2*lineWidth);
                    widget.context.strokeRect(startX,startY,e.offsetX -startX,e.offsetY - startY);
                }else if(widget.paintType==widget.PaintType.Circle){
                    var radius = Math.sqrt(Math.pow(e.offsetX -startX,2),Math.pow(e.offsetY - startY,2));
                    if(maxRadius < radius){maxRadius = radius;}
                    widget.context.clearRect(startX-maxRadius-lineWidth,startY-maxRadius-lineWidth,2*maxRadius+2*lineWidth,2*maxRadius+2*lineWidth);
                    widget.context.beginPath();
                    widget.context.arc(startX,startY,radius,0,2*Math.PI);
                    widget.context.stroke();
                    widget.context.closePath();
                }
            }
        });
        $(this.canvas).mouseup(function(e){
            painting = false;
            widget.context.closePath();
        });
    };
    var _insertSnapContainerDownLoad=function(){
        this.snapContainerDownLoad = $('<div class="SnapContainerDownLoad">'+
                                            '<div style="padding-top: 20px;">使用截屏功能需要安装插件,是否下载？</div>'
                                        +'</div>')
                                     .appendTo(this.snapContainer);
        var btns = $('<div style="padding-top: 15px;"></div>').appendTo(this.snapContainerDownLoad);
        var ok = $("<a href='"+"http://"+this.config.host+":"+this.config.port+"/"+this.config.serverApp+"/SnapscreenPlugin.exe"+"'>下载</a>").appendTo(btns);
        var cancel = $("<a>取消</a>").appendTo(btns);
        var widget = this;
        var hiddenDownloadPane = function(){
            widget.snapContainer.hide();
            widget.snapContainerDownLoad.hide();
        };
        ok.on("click",hiddenDownloadPane);
        cancel.on("click",hiddenDownloadPane);
    };

    var _insertSnapPlugin = function(container){
        this.plugin = document.createElement("object");
        try{
            this.plugin.type = "application/x-pluginbaidusnap";
        }catch(e){
            return;
        }
        this.plugin.style.cssText = "position:absolute;left:-9999px;width:0;height:0;";
        this.plugin.setAttribute("width","0");
        this.plugin.setAttribute("height","0");
        container.appendChild(this.plugin);
    };

    window.DistSnapScreen=new DistSnapScreen();
}));
