(function(){
   
    var port = chrome.runtime.connect();
    
    let app = {}
    app.id = 0;
    app.data = [];
    app.data[0] = "";
    
    
    var currentInput = document.querySelector('#current');
    var body = $('body');
    var html = $('html');
    
    var htmlheightstr = html.css('height')+"".split("px");
    var htmlheight = +htmlheightstr.substring(0,htmlheightstr.length-2);
    
    var bodyheightstr = body.css('height')+"".split("px");
    var bodyheight = +bodyheightstr.substring(0,bodyheightstr.length-2);
    
    var fontStyleNumber = 0;
    var fontStyle = ["Comfortaa","Merienda","Oxygen","Rancho","Roboto Condensed"]

    
    var selectedSize;  
    var baseHeight = 20;
    var baseMargin = 10;
    var basefontSize =15;
    var incrementHeight = baseHeight + baseMargin;

    function setLayout(val){
        var newMargin,newHeight,newFontSize;
        if(val === 0){
            newMargin = baseMargin-3;
            newHeight = baseHeight-5;
            newFontSize= basefontSize-5;
        }
        else if(val === 1){
            newMargin = baseMargin;
            newHeight = baseHeight;
            newFontSize= basefontSize;
        }
        else{
                newMargin = baseMargin+3;
                newHeight = baseHeight+5;
                newFontSize= basefontSize+5;
            
        }
        var len = app.data.length;
        htmlheight = len * (newHeight + newMargin);
        bodyheight = len * (newHeight + newMargin);
        incrementHeight = newHeight + newMargin;

        $('html').css("height",htmlheight+"px");
        $('body').css("height",bodyheight+5+"px");
        $('input').css("height",newHeight)
        $('input').css("margin-bottom",newMargin)
        $('input').css("font-size",newFontSize)
       chrome.storage.sync.set({fontStyleSize:val},()=>{});
 
    }

    document.getElementById("selectSize").addEventListener('click',function(){
        selectedSize = (selectedSize+1)%3;
        setLayout(selectedSize)
    })
    function setInputFont(){
        $('input').css("font-family",fontStyle[fontStyleNumber])
        
        chrome.storage.sync.set({fontStyleNumber: fontStyleNumber}, function() {});
        
    }
    document.getElementById("selectFontStyle").addEventListener('click',function(){
        fontStyleNumber = (fontStyleNumber + 1 )%6;
          setInputFont()  
    })

    function goUp(id){
        var cnt = id;
    
        while(app.data[cnt] === "$$$delete" && cnt>=0){
            cnt--;
        }
        if(cnt >= 0){
            var nextel = document.getElementById(cnt);
            nextel.focus();
            
        }
    
    }
    function setUpListeners(id){
        var properId = "#"+id;
        var el = document.getElementById(id);
        
        el.addEventListener('input', function() {
            app.data[+this.id] = this.value;
            port.postMessage(app.data)
        });

       el.onkeydown=function(event){
                
        var key = event.keyCode;
             if(key === 46){
                 app.data[+this.id] = "$$$delete"
                 port.postMessage(app.data)
                 $(this).next('input').focus();

                 this.remove();
                 setHeight(-incrementHeight)    
             
                }
             if(key === 40){
                 $(this).next('input').focus();
            
            }
             if(key === 38){
                var cnt = +this.id;
                cnt--;
                goUp(cnt);                
                
            }
            }
        el.addEventListener('focus',function(event){
            event.preventDefault();
            var that = this;
            setTimeout(function(){
                that.setSelectionRange(that.value.length*2,that.value.length*2);
            },0)
             
        });    
    
    }
    function setInputStyleById(id){
        var val = selectedSize;

        var newMargin,newHeight,newFontSize;
        if(val === 0){
            newMargin = baseMargin-3;
            newHeight = baseHeight-5;
            newFontSize= basefontSize-5;
        }
        else if(val === 1){
            newMargin = baseMargin;
            newHeight = baseHeight;
            newFontSize= basefontSize;
        }
        else{
                newMargin = baseMargin+3;
                newHeight = baseHeight+5;
                newFontSize= basefontSize+5;
            
        }
        
        $('#'+id).css("height",newHeight)
        $('#'+id).css("margin-bottom",newMargin)
        $('#'+id).css("font-size",newFontSize)
        $('#'+id).css("font-family",fontStyle[fontStyleNumber])
    
    }
    function addInput(val){
        setHeight(incrementHeight)    
     
        var tempInput = $(`<input type="text" />`);
    
        tempInput[0].value = val;
        tempInput[0].id = app.id;
        tempInput[0].spellcheck = false;

        tempInput.insertBefore(currentInput);                 
        setInputStyleById(tempInput[0].id);    
        setUpListeners(app.id)
       
        app.data.push(tempInput[0].value) 
        app.id++; 
    
    }
    function getData(){
           chrome.storage.sync.get(['key'], function(result) {
        result.key = result.key || [];
        if(result.key.length>0){
            currentInput.value = result.key[0];
            currentInput.spellcheck = false;
            app.data[0]= currentInput.value;
            app.id = 1;
        } 

        for(let i =1;i<result.key.length;i++){
          addInput(result.key[i]) 
            
          }
          port.postMessage(app.data)
               
        });
    }
    
    
    function setHeight(val){
        bodyheight += val;
        htmlheight += val; 
        body.css('height',bodyheight+5+"px");
        html.css('height',htmlheight+"px");
    }
    function isEmpty(){
       return currentInput.value.split('').filter(val=>val !== " ").join('').length === 0 
    }    

    currentInput.onkeydown = function(event){
        if(event.keyCode ===  13 && !isEmpty()){
            addInput(currentInput.value)
            app.data[0] = "";
            currentInput.value = "";
            $('html body').animate({scrollTop:bodyheight},500);
            port.postMessage(app.data)
         
        }
        if(event.keyCode ===  38){
            var cnt = app.data.length - 1;
            goUp(cnt)    
        }
        if(event.keyCode === 46){
            app.data[0] = "";
            currentInput.value ="";
            port.postMessage(app.data)
        }

    }
    currentInput.addEventListener('focus',function(event){
        event.preventDefault();
        var that = this;
        setTimeout(function(){
            that.setSelectionRange(that.value.length*2,that.value.length*2);
        },0)
         
    });
    currentInput.addEventListener('input', function() {
        app.data[0] = this.value;
        port.postMessage(app.data)
    });
    
    function getAndSetFontStyle(){
        chrome.storage.sync.get(['fontStyleNumber'], function(result) {
            fontStyleNumber = result.fontStyleNumber || 0; 
            setInputFont()  
        });
        
        chrome.storage.sync.get(['fontStyleSize'], function(result) {
            
            selectedSize = result.fontStyleSize === undefined ? 1 : result.fontStyleSize; 
            console.log(selectedSize);
            
            setLayout(selectedSize);  
            $('html body').animate({scrollTop:bodyheight},500);

        });
        

    }

    getData();
    getAndSetFontStyle();
    
    $("#current").focus();
    
        
})();
  