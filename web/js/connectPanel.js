TEMP['connectPanel'] = function(air){
    var afterLogin = function(){
        //air.require("initAir").heartBeat();
        air.require("initAir").tryConnectSocket();
        air.require("initAir").getBaseData();
        air.require("topbar").init();
    };
    var timeGap = 1000;
    var MaxWaitingTime = 30000;
    var key = null;
    var url = null;
    var channel = null;
    
    var loginPanel = null;
    //===============
    var init = function(){
        loginPanel = preparePanel();
        autoGetAfterUploading();
        createQRAndWait();
    };
    var preparePanel=function(){
        return air.require("popup").popup({
            checkFunction:function(con){
                qrDisconnected();
                air.Options.ip = con.find(".input-ip").val();
                air.Options.port = con.find(".input-port").val();
                air.Options.socketPort = con.find(".input-socketPort").val();
                afterLogin();
            },
            cancelFunction:null,
            title:air.Lang.text_initSystem,
            content:air.require("UI").substitute(air.require("Templete").initSystemTemplate,{
                    text_initSystemSocketPort:air.Lang.text_initSystemSocketPort,
                    text_initSystemPort:air.Lang.text_initSystemPort,
                    text_initSystemIp:air.Lang.text_initSystemIp,
                    text_initSystemDesc:air.Lang.text_initSystemDesc,
                    SOCKET:air.Options.socketPort,
                    PORT:air.Options.port,
                    IP:air.Options.ip,
                })
        });
    };
    var ss = null;
    var ssb = null;
    var autoGetAfterUploading = function(){
        ss = loginPanel.find(".input-panel .input-tip");
        ssb = loginPanel.find(".input-panel button");
        var load = function(){
            ss.html(air.Lang.text_remoteIp_getting);
            air.require("dataTran").getJsonFromUrl(air.Options.remoteUrl+"api/ipget.php",
            {key:loginPanel.find(".input-panel .input-id").val()},
            function(data){
                if(data.status=="ok"){
                    loginPanel.find(".input-ip").val(data.ip);
                    loginPanel.find(".input-port").val(data.port);
                    loginPanel.find(".input-socketPort").val(data.socketport);
                    ss.html(air.Lang.text_remoteIp+" ("+data.updatetime+')');
                }
            },
            function(){}
            );
        };
        ssb.click(function(){loginPanel.find(".input-panel .input-id").val()!="" && load();});
    };
    var createQRAndWaita = function(name){
        var ss = loginPanel.find(".input-img .input-tip");
                                ss.html("就绪，正在等待扫码");
        loginPanel.find(".input-img img").attr("src","http://qr.liantu.com/api.php?text=test");
    };
    var createQRAndWait = function(name){
        var ss = loginPanel.find(".input-img .input-tip");
        var loading = air.require("util").setLoading(loginPanel.find(".input-img-div"));
        $.ajax({
            url:air.Options.remoteUrl+"api/newQrKey.php",
            type:"post",
            dataType:"json",
            complete:function(){
                loading.remove();
            },
            success:function(json){
                if(json.status=="ok"){
                    key = json.key;
                    url = json.url;
                    loginPanel.find(".input-img img").attr("src","http://qr.liantu.com/api.php?text="+json.key);
                    $.getScript("libs/channel_api.js",function(){//"http://channel.sinaapp.com/api.js
                        channel = new sae.Channel(url);
                        channel.onopen = function (){
                            ss.html("扫码就绪");
                        }
                        channel.onclose = function (){
                            ss.html("扫码失效");
                            loginPanel.find(".input-qr-tip").html("扫码失效").show();
                        }
                        channel.onerror = function (){
                            ss.html("扫码出现错误");
                            loginPanel.find(".input-qr-tip").html("未知错误").show();
                        }
                        channel.onmessage = function (message) {
                            console.log(message);
                            var json2=JSON.parse(message.data);
                            if(json2.status=="waiting"){
                                ss.html("就绪，正在等待扫码");
                            }else if(json2.status=="ok"){
                                loginPanel.find(".input-qr-tip").html("扫码成功").show();
                                ss.html("扫码成功,界面将在3秒后跳转");
                                loginPanel.find(".input-ip").val(json2.ip);
                                loginPanel.find(".input-port").val(json2.port);
                                loginPanel.find(".input-socketPort").val(json2.socketport);
                                setTimeout(function(){
                                    loginPanel.find(".popup-button-check").click();
                                },3000);
                            }
                        }
                    });
                }
            }
        });
    };
    
    var qrDisconnected = function(){
        channel.close();
    };
    return {
        init:init
    };
};