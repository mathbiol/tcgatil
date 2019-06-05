console.log('index.js loaded at '+Date());

fs=require('fs')
dirObj={}

function writeCatalog(path){
    path=path||"PNGs"
    console.log('catalogging '+path)
    var ls=[]
    var h = '<ol>'
    fs.readdirSync(path).forEach(d=>{
        if((d[0]!=='.')&&(!d.match(/.*\.json/))&&(!d.match(/.*\.html/))){ // if it is not an hidden file
            h+='<li><a href="'+d+'">'+d+'</a></li>'
            let st = fs.statSync(path+'/'+d)
            if(st.isDirectory()){
                writeCatalog(path+'/'+d)
                //buildDir(path+'/'+d,{})
            }else{
                buildDir(path+'/'+d,st.size)
            }
            ls.push(d)
        }
    })
    h += '</ol>'
    fs.writeFileSync(path+'/index.json',JSON.stringify(ls,null,3))
    fs.writeFileSync(path+'/index.html',h)
    //console.log(catalog)
    //debugger
    //console.log('ls: ',ls)
}

buildDir=function(path,val){
    if(typeof(val)=='string'){
        val='"'+val+'"'
    }else if(typeof(val)=='object'){
        val=JSON.stringify(val)
    }

    path=path.split('/')
    for(var i=0 ; i<path.length ; i++){
        if(!eval('dirObj'+JSON.stringify(path.slice(0,i+1)).replace(/","/g,'"]["'))){
            eval('dirObj'+JSON.stringify(path.slice(0,i+1)).replace(/","/g,'"]["')+'={}')
        }
        if(i==(path.length-1)){
            let str='dirObj'+JSON.stringify(path.slice(0,i+1)).replace(/","/g,'"]["')+'='+val
            //console.log(str)
            try{
                eval(str)
            }catch(err){
                Error(err)
                debugger
            }
        }
    }
}

//debugger


writeCatalog()
fs.writeFileSync('dir.json',JSON.stringify(dirObj,null,3))
console.log('catalog finished:',dirObj)