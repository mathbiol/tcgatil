console.log('tilmap.js loaded')

tilmap=function(){
    // ini
    tilmap.div=document.body.querySelector('#tilmapDiv')
    tilmap.div.hidden=true
    if(tilmap.div){
        tilmap.homeUI()
        tilmap.ui()
        // make sure first image is onloaded
        function firstLoad(){
            if(!document.getElementById('calcTILblue')){
                console.log('1st Load at '+Date())
                setTimeout(firstLoad,1000)
            }else{
                tilmap.img.onload()
                if(location.hash.length>3){
                    var ts = location.hash.slice(1).split('/')
                    setTimeout(function(){
                        tilmap.selTumorType.value=ts[0]
                        tilmap.selTumorType.onchange()
                        setTimeout(function(){
                            tilmap.selTumorTissue.value=ts[1]
                            tilmap.selTumorTissue.onchange()
                        },1000)

                        //debugger
                    },0)
                    //debugger
                }
            }
        }
        firstLoad()
        //debugger
    }
}

tilmap.parms={ // starting defaults
    cancerRange:100,
    tilRange:100,
    transparency:20,
    threshold:0
}

tilmap.ui=function(div){
    div=div||tilmap.div // default div
    h='<table><tr><td style="vertical-align:top"><h3 style="color:maroon">Til Maps <span id="slideLink" style="color:blue;font-size:small;cursor:pointer">Link</span></h3>'
    h+='<p style="font-size:small">The interactive panel on the left is a synthetic image assembled with the deeplearned classifications of individual patches from the full image, on the right. The YouTube link above demonstrates the interactive operation.</p>'
    h+='<br><input id="searchInput" value="search" style="color:gray"> <span id="searchResults" style="font-size:small">...</span>'
    h+='<br>from tumor type <select id="selTumorType"></select> select tissue <select id="selTumorTissue"></select>'
    /*
    var url = "https://quip1.bmi.stonybrook.edu:8443/camicroscope/osdCamicroscope.php?tissueId=TCGA-2F-A9KO-01Z-00-DX1"
    if(tilmap.selTumorTissue){
        url='https://quip1.bmi.stonybrook.edu:8443/camicroscope/osdCamicroscope.php?tissueId='+tilmap.selTumorTissue.value.replace('.png','')
    }
    */
    h+='<div id="tilShowImgDiv"></div></td><td style="vertical-align:top"><iframe id="caMicrocopeIfr" width="800px" height="800px"></td></tr></table>'
    div.innerHTML=h
    tilmap.selTumorType=div.querySelector('#selTumorType')
    tilmap.selTumorTissue=div.querySelector('#selTumorTissue')
    tilmap.tilShowImgDiv=div.querySelector('#tilShowImgDiv')
    tilmap.selTumorType.style.backgroundColor='lime'
    tilmap.selTumorTissue.style.backgroundColor='orange'
    tilmap.getJSON().then(x=>{
        tilmap.index(x) // build TissueIndex
        for(var t in tilmap.tumorIndex){
            var op = document.createElement('option')
            tilmap.selTumorType.appendChild(op)
            op.textContent=t


            //debugger
        }
        tilmap.optTissue()
        tilmap.showTIL()
    })
    tilmap.selTumorType.onchange=()=>{ // update tissue list
        tilmap.optTissue();
        tilmap.showTIL()
    }
    tilmap.selTumorTissue.onchange=tilmap.showTIL
    tilmap.selTumorType.onclick=tilmap.selTumorTissue.onclick=function(){
        if(cancerRangePlay.style.backgroundColor=="orange"){
            cancerRangePlay.click()
        }
        if(tilRangePlay.style.backgroundColor=="orange"){
            tilRangePlay.click()
        }

        //debugger
    }
    
    //setTimeout(tilmap.showTIL,3000)
    searchInput.onkeyup=searchInput.onclick=tilmap.search
    /*
    if(location.hash.length>3){
        var ts = location.hash.slice(1).split('/')
        setTimeout(function(){
            tilmap.selTumorType.value=ts[0]
            tilmap.selTumorType.onchange()
            setTimeout(function(){
                tilmap.selTumorTissue.value=ts[1]
                tilmap.selTumorTissue.onchange()
            },0)

            //debugger
        },1000)
        //debugger
    }
    */
    
    slideLink.onclick=function(){
        location.hash=`${location.hash=tilmap.selTumorType.value}/${tilmap.selTumorTissue.value}`
        tilmap.copyToClipboard(location.href)
    }

    var n=0
    var t = setInterval(_=>{
        n=n+1 
        //console.log('initial check '+n)
        if((document.querySelectorAll('#cvTop').length>1)&(document.querySelectorAll('#cvBase').length>1)){
            selTumorTissue.onchange()
            //document.querySelectorAll('#cvTop')[1].remove()
            //document.querySelectorAll('#cvBase')[1].remove()
            //tilmap.canvasAlign()
        }
        if(n>30){clearInterval(t)}
    },1000)


}

tilmap.search=function(){
    if(this.style.color=="gray"){
        this.style.color="navy"
        this.value=""
    }else{
        if(this.value.length>2){
            var res=[] // results
            for(let t in tilmap.tumorIndex){
                for(let s in tilmap.tumorIndex[t]){
                    if(s.match(RegExp(this.value,'i'))){
                        res.push(`<a href="#${t}/${s}" target="_blank">${t}/${s.replace('.png','')}</a>`)
                    }
                    //debugger
                }
            }
            if(res.length>0){
                searchResults.innerHTML=res.join(', ')
            }else{
                searchResults.innerHTML=' no matches'
            }
            tilmap.canvasAlign()
        }

    }
    //debugger
}

tilmap.copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  slideLink.textContent='Link copied'
  setTimeout(function(){
      slideLink.textContent='Link'
  },1000)
};

tilmap.optTissue=function(){ // fill Tissues once type is chosen
    tilmap.selTumorTissue.innerHTML="" // reset options
    for(var c in tilmap.tumorIndex[tilmap.selTumorType.value]){
        var op = document.createElement('option')
        op.textContent=c
        tilmap.selTumorTissue.appendChild(op)
    }
    //debugger
}

tilmap.getJSON=async function(url){
    url=url||'dir.json'
    return (await fetch(url)).json()
}

tilmap.index=function(x){
    tilmap.tissueIndex={}
    tilmap.tumorIndex=x.PNGs
    for(var t in tilmap.tumorIndex){
        //tilmap.tissueIndex[c]={} // tumor type
        console.log('indexing '+t)
        tilmap.tumorIndex[t]
        for(var c in tilmap.tumorIndex[t]){
            tilmap.tumorIndex[t][c]={
                size:tilmap.tumorIndex[t][c],
                tumorType:t
            }
            tilmap.tissueIndex[c]=t // indexing tissue c to tumor type t
        }
    }
    return tilmap.tissueIndex
}

tilmap.showTIL=function(){ // get image and display it
    var url='PNGs/'+tilmap.selTumorType.value+'/'+tilmap.selTumorTissue.value
    var h='<div><img id="imgTIL" src='+url+'></div><div><a href="'+url+'" target="_blank">'+url+'</a></div>'

    var h = '<div id="imgTILDiv"><img id="imgTIL" src="'+url+'"></div><a href="'+url+'" target="_blank" style="font-size:small">'+url+'</a></div><div id="calcTIL">...</div>'
    tilmap.tilShowImgDiv.innerHTML=h
    
    tilmap.tilShowImgDiv.style.color='navy'
    var dt=tilmap.tumorIndex[tilmap.selTumorType.value][tilmap.selTumorTissue.value]

    //var h2 ='<h3>Interactive Analytics</h3>'
    var h2 =''
    // Set iFrame src
    let url2;
    if (obfuscatedId)
    {
        tilmap.getSlideData(tilmap.selTumorTissue.value.replace('.png','')).then(x => {
            url2='/viewer.html?slideId='+x[0]['_id']['$oid']
            caMicrocopeIfr.src=url2
        })
    }
    else
    {
        url2='https://quip1.bmi.stonybrook.edu/camicroscope/osdCamicroscope.php?tissueId='+tilmap.selTumorTissue.value.replace('.png','')
        if(!tilmap.selTumorTissue.value.match('-')){ // to accommodate Han's new slides
            let id = tilmap.selTumorTissue.value.match(/\d+/)[0]
            url2="https://quip3.bmi.stonybrook.edu/camicroscope/osdCamicroscope.php?tissueId="+id
        }
        caMicrocopeIfr.src=url2
    }
    //var url2='http://quip1.uhmc.sunysb.edu:443/camicroscope/osdCamicroscope.php?tissueId='+tilmap.selTumorTissue.value.replace('.png','')
    h2 += '<div id="calcTILdiv">CaMicroscope</div>'
    var td = tilmap.div.querySelector('#calcTIL')
    td.innerHTML=h2
    tilmap.calcTILdiv=tilmap.div.querySelector('#calcTILdiv')
    var imgTILDiv = document.getElementById('imgTILDiv')
    if(typeof(jmat)!=="undefined"){
        tilmap.calcTILfun()
    }else{
        var s = document.createElement('script')
        //s.src="https://jonasalmeida.github.io/jmat/jmat.js"
        s.src="jmat.js"
        s.onload=tilmap.calcTILfun
        document.head.appendChild(s)
    }
    //if(document.getElementById('calcTILblue')){
    //    calcTILblue.click()
    //}
    
}

tilmap.zoom2loc=function(){ // event listener pointing to zoom2loc's code
    imgTILDiv.onclick=function(ev){
    //tilmap.img.onclick=function(ev){
        if(typeof(zoom2loc)=="undefined"){
            var s=document.createElement('script')
            if(location.pathname.match('tilmap')){
                s.src="zoom2loc.js"
            }else{
                s.src="https://mathbiol.github.io/tilmap/zoom2loc.js"
            }
            
            s.onload=function(){zoom2loc(ev)}
            document.head.appendChild(s)
        }else{zoom2loc(ev)}
    }
    return tilmap.calcTILdiv
}

tilmap.calcTILfun=function(){
    //var h=' Decode RGB maps:'
    var h='' 
    //h += '<p><span id="hideRGBbuttons" style="color:blue;cursor:hand;font-size:small">RGB[+] </span>'
    h += '<p> '
    h += '<span id="hideRGBbuttons" style="color:blue;cursor:hand;font-size:small">RGB[+] </span>'
        h += '<span id="rgbButtons" hidden=true>'
            h += '<button id="calcTILred" style="background-color:silver"> Lymph prob. </button> '
            h += '<span> <button id="calcTILgreen" style="background-color:silver"> Cancer prob. </button></span> '
            //h += '<span> </span> '
            //h += '<span> <button id="calcTILclass" style="background-color:silver"> Classification </button></span> '
            h += '<button id="calcTIL0" style="background-color:white"> original png </button> <span id="tileSize" style="font-size:small"></span>'
        h += '</span> '
    h += '<button id="calcTILblue" style="background-color:silver;color:black;font-weight:bold"> Classification </button>&nbsp;<span style="font-size:small;background-color:gray;color:white">&nbsp;T&nbsp;</span><span style="font-size:small;background-color:yellow;color:black">&nbsp;C&nbsp;</span><span style="font-size:small;background-color:red;color:black">&nbsp;L&nbsp;</span>'
    h += '</p>'
    h += '<span id="hideRanges" style="color:blue;cursor:hand;font-size:small">Advanced[+] </span>'
    
    h += '<span id="advancedRanges" hidden=false>'
        h += '<p><span><input id="cancerRange" type="range" style="width:200px"> <button id="cancerRangePlay" style="background-color:lime">Cancer</button> <span id="cancerTiles"> counting ...</span></span>'
        h += '<br><input id="tilRange" type="range" style="width:200px"> <button id="tilRangePlay" style="background-color:lime">Lymph</button>  <span id="tilTiles">counting ...</span></p>'
        // h += '<span style="font-size:small;color:gray">... additional classifications will be available here ...</span>'
        // h += '<br>Cancer  &#8592 (prediction) &#8594 TIL</p>'
        h += '<p> <input id="segmentationRange" type="range" style="width:200px" value='+tilmap.parms.threshold+'> <button id="rangeSegmentBt" style="background-color:lime">Backroung suppression</button> <span id="backTiles">...</span>'
        h += '<br>&nbsp;&nbsp;&nbsp;<span style="font-size:small"> 0 &#8592(segmentation threshold)&#8594 1</span> <span style="font-size:small;color:gray">[<span id="segVal"></span>%]</span>'
        h += '<br> <input id="transparencyRange" type="range" style="width:200px" value='+tilmap.parms.transparency+'>'
        h += '<br><span style="font-size:small">&nbsp; 0 &#8592 (segmentation transparency) &#8594 1</span> <span style="font-size:small;color:gray">[<span id="transVal"></span>%]</span></p>'
    h += '<hr> <select><option>add more classifications</option><option>(under development)</option></select> <button id="alignCanvas">Align</button>'
    h += '</span>'
    tilmap.calcTILdiv.innerHTML=h
    segVal.innerText=segmentationRange.value
    transVal.innerText=transparencyRange.value
    hideRGBbuttons.onclick=function(){
        if(rgbButtons.hidden){
            rgbButtons.hidden=false
            hideRGBbuttons.textContent='RGB[-] '
            hideRGBbuttons.style.color="maroon"         
        }else{
            rgbButtons.hidden=true
            hideRGBbuttons.textContent='RGB[+] '
            hideRGBbuttons.style.color="blue"
        }
        tilmap.canvasAlign()
    }
    hideRanges.onclick=function(){
        if(advancedRanges.hidden){
            advancedRanges.hidden=false
            hideRanges.textContent='Advanced[-] '
            hideRanges.style.color="maroon"
            //setTimeout(cancerRange.onclick,0)
            if(!tilmap.demoPlayed){
                tilmap.demoPlayed=true
                setTimeout(_=>{
                    rangeSegmentBt.style.backgroundColor='cyan'
                    setTimeout(_=>{
                        rangeSegmentBt.click()
                        setTimeout(_=>{
                            rangeSegmentBt.style.backgroundColor='lime'
                            calcTILblue.style.backgroundColor='cyan'
                            setTimeout(_=>{
                                calcTILblue.click()
                                calcTILblue.style.backgroundColor='silver'
                            },500)
                        },2000)
                    },500)
                    
                },1000)
            }
        }else{
            advancedRanges.hidden=true
            hideRanges.textContent='Advanced[+] '
            hideRanges.style.color="blue"
        }
        tilmap.canvasAlign()
        
    }
    alignCanvas.onclick=function(){
        tilmap.canvasAlign()
    }
    tilmap.zoom2loc()
    cancerRange.value=tilmap.parms.cancerRange
    tilRange.value=tilmap.parms.tilRange
    rangeSegmentBt.onclick=function(){
        cancerRange.click()
        tilmap.segment()
    }
    cancerRangePlay.onclick=tilRangePlay.onclick=function(){
        // make sure the other play is stopped
        if((this.id=="cancerRangePlay")&(tilRangePlay.style.backgroundColor=="orange")){
            tilRangePlay.click()
        }
        if((this.id=="tilRangePlay")&(cancerRangePlay.style.backgroundColor=="orange")){
            cancerRangePlay.click()
        }


        var range = document.getElementById(this.id.slice(0,-4)) // range input for this button
        if(this.style.backgroundColor=="lime"){
            this.style.backgroundColor="orange"
            if(range.value==""){range.value=tilmap.parms[range.id]}
            tilmap.parms.t = setInterval(function(){
                range.value=parseInt(range.value)+5
                //console.log(cancerTilRange.value)
                if(parseInt(range.value)>=100){
                    range.value="0"
                }
                tilmap.parms[range.id]=range.value
                range.onchange()
            },100)
        }else{
            clearInterval(tilmap.parms.t)
            //this.textContent="Play"
            this.style.backgroundColor="lime"
        }
    }
    // read the image data
    tilmap.img = tilmap.div.querySelector('#imgTIL')
    tilmap.img.onload=function(){
        tilmap.cvBase=document.createElement('canvas');
        //tilmap.cvBase.onclick=tilmap.img.onclick
        tilmap.cvBase.hidden=true
        tilmap.cvBase.width=tilmap.img.width
        tilmap.cvBase.height=tilmap.img.height
        tileSize.textContent=`${tilmap.img.width}x${tilmap.img.height}`
        tilmap.cvBase.id="cvBase"
        tilmap.img.parentElement.appendChild(tilmap.cvBase)
        tilmap.ctx=tilmap.cvBase.getContext('2d');
        tilmap.ctx.drawImage(this,0,0);
        tilmap.imgData=jmat.imread(tilmap.cvBase);
        // extract RGB
        tilmap.imgDataR=tilmap.imSlice(0)
        tilmap.imgDataG=tilmap.imSlice(1)
        tilmap.imgDataB=tilmap.imSlice(2)
        //tilmap.imgDataB_count=tilmap.imgDataB.map(x=>x.map(x=>x/255)).map(x=>x.reduce((a,b)=>a+b)).reduce((a,b)=>a+b)
        tilmap.imgDataB_count=tilmap.imgDataB.map(x=>x.map(x=>(x>0))).map(x=>x.reduce((a,b)=>a+b)).reduce((a,b)=>a+b)
        calcTILred.onclick=function(){tilmap.from2D(tilmap.imSlice(0))}
        calcTILgreen.onclick=function(){tilmap.from2D(tilmap.imSlice(1))}
        //calcTILblue.onclick=function(){tilmap.from2D(tilmap.imSlice(2))}
        calcTILblue.onclick=function(){
            let dd = tilmap.imSlice(2)
            // tilmap.from2D(dd) <-- this is the base function we are expanding here to represent extracted classifications
            tilmap.cvBase.hidden=false
            tilmap.img.hidden=true
            tilmap.cv2D=dd // keeping current value 2D slice
            var cm=jmat.colormap()
            var k = 63/255 // png values are between 0-255 and cm 0-63
            // extract classifications
            // channel B storing 5 codes:
            // 255:[tissue, no cancer, no til]
            // 254:[tissue + cancer + no til]
            // 253:[tissue + no cancer + til]
            // 252:[tissue + cancer + til]
            // 0:[no tissue]
            var ddd = dd.map(function(d){
                return d.map(function(v){
                    let rgba
                    switch(v){
                        case 255: // [tissue + cancer + no til]
                            rgba = [192,192,192,255]
                            break;
                        case 254: // [tissue + cancer + no til]
                            rgba = [255,255,0,255]
                            break;
                        case 253: // [tissue + no cancer + til]
                            rgba = [255,0,0,255]
                            break;
                        case 252: // [tissue + cancer + til]
                            rgba = [255,165,0,255]
                            break;
                        default:
                            rgba = [0,0,0,0] // notice transparency 
                            //rgba = cm[Math.round(v*k)].map(x=>Math.round(x*255)).concat(255)
                    }
                    return rgba
                })
            })
            jmat.imwrite(tilmap.cvBase,ddd)
        }
        calcTIL0.onclick=function(){
            tilmap.img.hidden=false
            tilmap.cvBase.hidden=true
        }
        //debugger
        tilmap.cvBase.onclick=tilmap.img.onclick

        cancerRange.onchange=tilRange.onchange=function(){
            //debugger
            tilmap.cvBase.hidden=false
            tilmap.img.hidden=true
            var cm=jmat.colormap()
            //var k = parseInt(this.value)/100 //slider value
            var cr=parseInt(cancerRange.value)/100
            var tr=parseInt(tilRange.value)/100
            tilmap.parms[this.id]=this.value
            var ddd = tilmap.imgData.map(function(dd){
                return dd.map(function(d){
                    //var r = k*d[0]/255
                    //var g = (1-k)*d[1]/255
                    //return cm[Math.round((r+g)*63)].map(x=>Math.round(x*255)).concat(d[2])
                    return cm[Math.round((Math.max(d[1]*cr,d[0]*tr)/255)*63)].map(x=>Math.round(x*255)).concat(d[2])
                    //debugger
                })
            })
            jmat.imwrite(tilmap.cvBase,ddd)
            //debugger
        }

        // making sure clicking stops play and actas as onchange
        cancerRange.onclick=function(){
            if(cancerRangePlay.style.backgroundColor=="orange"){
                cancerRangePlay.onclick()
            }
            cancerRange.onchange()
        }
        tilRange.onclick=function(){
            if(tilRangePlay.style.backgroundColor=="orange"){
                tilRangePlay.onclick()
            }
            tilRange.onchange()
        }

        //cancerRange.onchange()
        if(!document.getElementById('cvTop')){
            calcTILblue.click() // <-- classify first
        }
        
        
        //if(document.querySelectorAll('#cvTop').length==0){
        //    tilmap.cvTop=document.createElement('canvas')
        //}else{
        //    tilmap.cvTop=document.getElementById('cvTop')
        //} 
        tilmap.cvTop=document.createElement('canvas')
        tilmap.cvTop.width=tilmap.img.width
        tilmap.cvTop.height=tilmap.img.height
        tilmap.cvTop.id="cvTop"
        tilmap.img.parentElement.appendChild(tilmap.cvTop)
        tilmap.cvTop.style.position='absolute'
        tilmap.canvasAlign()
        if(document.querySelectorAll('#cvBase').length<2){
            tilmap.segment()
        }
        console.log('cvTops',document.querySelectorAll('#cvTop').length)
        loading.hidden=true
        continueTool.style.backgroundColor="yellow"
        continueTool.style.color="red"
    }
    segmentationRange.onchange=tilmap.segment //rangeSegmentBt.onclick
    transparencyRange.onchange=tilmap.transpire
    //tilmap.img.onload() // start image
    //cancerTilRange.onchange() // start range


    //setTimeout(function(){cancerTilRange.onchange()},1000)

}

tilmap.from2D=function(dd){
    tilmap.cvBase.hidden=false
    tilmap.img.hidden=true
    tilmap.cv2D=dd // keeping current value 2D slice
    var cm=jmat.colormap()
    var k = 63/255 // png values are between 0-255 and cm 0-63
    var ddd = dd.map(function(d){
        return d.map(function(v){
            return cm[Math.round(v*k)].map(x=>Math.round(x*255)).concat(255)
        })
    })
    //tilmap.ctx.putImageData(jmat.data2imData(ddd),0,0)
    //jmat.imwrite(tilmap.img,ddd)
    jmat.imwrite(tilmap.cvBase,ddd)
    //debugger
}

tilmap.imSlice=function(i){ // slice ith layer of imgData matrix
    i=i||0
    return tilmap.imgData.map(x=>{
        return x.map(y=>{
            return y[i]
        })
    })
}

tilmap.segment=function(){
    segVal.innerText=segmentationRange.value
    // generate mask
    //var k = parseInt(cancerRange.value)/100 // range value
    var cr=parseInt(cancerRange.value)/100
    var tr=parseInt(tilRange.value)/100
    var sv = 2.55*parseInt(segmentationRange.value) // segmentation value
    var tp = Math.round(2.55*parseInt(transparencyRange.value)) // range value
    let countCancer=0
    let countTil=0
    tilmap.segMask = tilmap.imgData.map(dd=>{
          return dd.map(d=>{
              //return (d[0]*(k)+d[1]*(1-k))>sv
              //return (d[0]*(k)+d[1]*(1-k))>=sv
              countCancer+=(d[1]*cr>=sv)&(d[2]>0)
              countTil+=(d[0]*tr>=sv)&(d[2]>0)
              return ((Math.max(d[1]*cr,d[0]*tr))>=sv)&(d[2]>0)

              //return cm[Math.round((Math.max(d[1]*cr,d[0]*tr)/255)*63)].map(x=>Math.round(x*255)).concat(d[2])
          })
    })
    cancerTiles.textContent=`${countCancer} tiles, ${Math.round((countCancer/tilmap.imgDataB_count)*10000)/100}% of tissue`
    tilTiles.textContent=`${countTil} tiles, ${Math.round((countTil/tilmap.imgDataB_count)*10000)/100}% of tissue`
    // find neighbors
    var n = tilmap.imgData.length
    var m = tilmap.imgData[0].length
    tilmap.segNeig = [...Array(n)].map(_=>{
        return [...Array(m)].map(_=>[0])
    })
    var dd=tilmap.segMask
    for(var i=1;i<(n-1);i++){
        for(var j=1;j<(m-1);j++){
            tilmap.segNeig[i][j]=[dd[i-1][j-1],dd[i-1][j],dd[i-1][j+1],dd[i][j-1],dd[i][j],dd[i][j+1],dd[i+1][j-1],dd[i+1][j],dd[i+1][j+1]]
        }
    }
    // find edges
    tilmap.segEdge = tilmap.segNeig.map(dd=>{
        return dd.map(d=>{
            var s=d.reduce((a,b)=>a+b)
            return (s>3 & s<7)
            //return d.reduce((a,b)=>Math.max(a,b))!=d.reduce((a,b)=>Math.min(a,b))
        })
    })
    tilmap.transpire()
    tilmap.parms.threshold=segmentationRange.value
    let countBackTiles=tilmap.segMask.map(x=>x.reduce((a,b)=>a+b)).reduce((a,b)=>a+b)
    backTiles.textContent=`${countBackTiles} tiles, ${Math.round((countBackTiles/tilmap.imgDataB_count)*10000)/100}% of tissue `
    tilmap.canvasAlign() // making sure it doesn't lose alignment
}

tilmap.transpire=function(){
    transVal.innerText=transparencyRange.value
    var tp = Math.round(2.55*parseInt(transparencyRange.value)) // range value
    //var clrEdge = [255,255,0,255-tp] // yellow
    var clrEdge = [255,0,144,255-tp] // magenta
    var clrMask = [255,255,255,tp]
    jmat.imwrite(tilmap.cvTop,tilmap.segEdge.map((dd,i)=>{
        return dd.map((d,j)=>{
            var c =[0,0,0,0]
            if(d){
                c=clrEdge
            }else if(!tilmap.segMask[i][j]){
                c=clrMask
            }
            return c
            //return [255,255,255,255].map(v=>v*d) // white
        })
    }))
    tilmap.parms.transparency=transparencyRange.value
}

tilmap.canvasAlign=function(){
    tilmap.cvTop.style.top=tilmap.cvBase.getBoundingClientRect().top
    tilmap.cvTop.style.left=tilmap.cvBase.getBoundingClientRect().left
    // correction if needed
    tilmap.cvTop.style.top=parseFloat(tilmap.cvTop.style.top)+tilmap.cvBase.getBoundingClientRect().top-tilmap.cvTop.getBoundingClientRect().top
}

tilmap.homeUI=function(){
    var h = '<h3 style="color:maroon"> Tumor Infitrating Lynphocytes (TILs)</h3>'
    h += '<p style="color:navy">'
    h += 'Tumor formation requires evading the surveillance of the patient\'s own immune system.'
    h += ' As such, the visualization of the immune response mediated by Lymphocytes has an important prognostic value for the understanding and treatment of cancer.'
    h += ' To that end, large collaboratory initiatives like <a href="https://www.tilsinbreastcancer.org" style="background-color:yellow" target="_blank">tilsinbreastcancer.org</a> bring together distributed efforts to analyse and classify histopathology slides, each with up to a million individual cells.'
    h += '</p>'
    h += '<h3 style="color:maroon"> Deep Learning (AI)</h3>'
    h += '<p style="color:navy;font-family:Arial;font-size:16px">'
    h += '<i>Deep Learning</i>, an Artificial Intelligence (AI) technique, was used here to scale and automate the laborious TIL and cancer cell classification by Pathologists.'
    h += ' This web-based tool provides an interface with tissue images synthesized from the AI predictions, which can be interactivelly mapped to the raw images they classify.'
    h += ' The result is a collection of 1015 breast cancer whole slide images and their respective synthetic AI maps.'
    h += ' The slide images come from the public <a href="https://www.cancer.gov/about-nci/organization/ccg/research/structural-genomics/tcga" style="background-color:yellow" target="_blank">The Cancer Genome Atlas</a> (TCGA), and the AI calssification image maps are similarly made publicly available with this tool.'
    h += ' To use the interactive tool where AI classifications are mapped to whole slides of breast tumors <button id="continueTool" style="background-color:silver;color:gray;font-size:large;vertical-align:top;border-radius:15px">Click to see TIL/tumor maps</button>'
    h += '</p>'
    h += '<hr>'
    h += '<p style="font-size:small">'
    h += 'For more information and methodological detail see published manuscript:'
    h += '</p>'
    h += '<p style="font-size:small">'
    h += '<i>Han Le, Rajarsi Gupta, Le Hou, Shahira Abousamra, Danielle Fassler, Tahsin Kurc, Dimitris Samaras, Rebecca Batiste, Tianhao Zhao, Alison L. Van Dyke, Ashish Sharma, Erich Bremer, Jonas S Almeida, Joel Saltz (2020) <b>Utilizing Automated Breast Cancer Detection to Identify Spatial Distributions of Tumor Infiltrating Lymphocytes in Invasive Breast Cancer</b>. Am J. Pathol. (20)30188-7. [<a href="https://pubmed.ncbi.nlm.nih.gov/32277893" target="_blank" style="background-color:yellow">PMID:32277893</a>].'
    h += '</p>'
    tilmap.homeDiv=document.getElementById('tilmapHome')
    tilmap.homeDiv.innerHTML=h
    tilmap.homeDiv.style.fontFamily="Arial"
    continueTool.onclick=function(){
        tilmap.div.hidden=false
        tilmap.homeDiv.hidden=true
        setTimeout(tilmap.canvasAlign,100)
    }
}


window.onload=tilmap


// MIS

tilmap.getRelative = async function(id,xy){ // converts relative to absolute coordinates
    var url='https://quip1.bmi.stonybrook.edu:443/camicroscope/api/Data/getImageInfoByCaseID.php?case_id='+id
    return (await fetch(url)).json().then(info=>[xy[0]*info[0].width,xy[1]*info[0].height].map(c=>parseInt(c)))
}

const obfuscatedId = false;
tilmap.getSlideData = async function (slide) {
    url = '/data/Slide/find?slide=' + slide;
    return (await fetch(url)).json()
};

// wiring links teh the header to where the application is
ioUrl.href=location.href
codeSource.href='https://github.com/mathbiol'+location.pathname

// prevent initial canvas duplication
/*
(function(){
    var n=0
    var t = setInterval(_=>{
        n=n+1
        console.log('initial check '+n)
        if((document.querySelectorAll('#cvTop').length>1)&(document.querySelectorAll('#cvBase').length>1)){
            document.querySelectorAll('#cvTop')[0].remove()
            document.querySelectorAll('#cvBase')[0].remove()
            tilmap.canvasAlign()
        }
        if(n>30){clearInterval(t)}
    },1000)
})()

*/
