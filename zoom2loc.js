console.log('zoom2loc.js loaded');

/**
 * This code is run when someone clicks on the png file.
 * It changes the location, zooming in the slide viewer.
 * NOTE: EXPERIMENTAL SLIDES REQUIRE LOG-IN.
 */
zoom2loc = function (event) {

    let findapi = !obfuscatedId;
    // Get click position
    let clickPos = {};
    clickPos.x = event.offsetX ? (event.offsetX) : event.pageX - document.getElementById("imgTILDiv").offsetLeft;
    clickPos.y = event.offsetY ? (event.offsetY) : event.pageY - document.getElementById("imgTILDiv").offsetTop;
    //console.log("clickPos", clickPos);

    // Get image size
    let canvases = document.getElementsByTagName("canvas");
    let imgDim = {};
    for (let i = 0; i < canvases.length; i++) {
        if (canvases[i].width > 0) {
            imgDim.w = canvases[i].width;
            imgDim.h = canvases[i].height;
            //console.log("imgDim", imgDim.w, imgDim.h);
            break;
        }
    }

    const ifrm = document.getElementById('caMicrocopeIfr');
    const ifrmLoc = new URL(ifrm.src);
    const winLoc = window.location;

    // Build query url
    var queryLoc;
    if (ifrmLoc.protocol !== winLoc.protocol) {
        // Match protocol
        queryLoc = winLoc.protocol;
    } else {
        queryLoc = ifrmLoc.protocol;
    }
    queryLoc += `//${ifrmLoc.hostname}`;

    // Get slide data
    let getSlideData = async function (id) {
        if (findapi) {
            queryLoc += `/quip-findapi?limit=10&db=quip&collection=images&find={"case_id":"${id}"}`;
            console.log('queryLoc', queryLoc);
            return (await fetch(queryLoc)).json()
        } else {
            return (await fetch(`/data/Slide/find?slide=${id}`)).json()
        }
    };

    let slide = tilmap.selTumorTissue.value.slice(0, -4);
    // Patch to correct slide name
    if (slide.includes("til_cancer")) {
        let arr = slide.split("_");
        slide = arr[0];
    }
    
    let setIframe = getSlideData(slide);

    // Get slide dimensions
    //zoom2loc.getFile('slidemeta.json').then(result => {
    setIframe.then(function (result) {

        // Build new iFrame src
        let slideDim = {};
        slideDim.width = result[0].width;
        slideDim.height = result[0].height;
        //console.log("slideDim", slideDim);
        let newIfrmLoc = ifrmLoc.href;
        let scale = {};
        scale.w = slideDim.width / imgDim.w;
        scale.h = slideDim.height / imgDim.h;
        //console.log("scale", scale);

        // States
        let states = {};
        let x1 = clickPos.x * scale.w;
        //console.log('x1', x1);
        let y1 = clickPos.y * scale.h;
        //console.log('y1', y1);
        states.x = parseFloat(x1 / slideDim.width);
        states.y = parseFloat(y1 / slideDim.height);
        states.z = 1.6;
        states.hasMark = true;
        //console.log('states', states);

        // Encode to Base64
        let encodedData = encodeURIComponent(btoa(JSON.stringify(states)));

        // Strip existing x,y search parameters and set new ones
        if (newIfrmLoc.indexOf('&x=') > -1) {
            newIfrmLoc = newIfrmLoc.substring(0, newIfrmLoc.indexOf('&x='));
        }

        // Set frame src to desired location
        if (obfuscatedId) {
            ifrm.src = `/viewer.html?slideId=${result[0]['_id']['$oid']}&states=${encodedData}`;
        } else {
            ifrm.src = `${newIfrmLoc}&x=${Math.ceil(clickPos.x * scale.w)}&y=${Math.ceil(clickPos.y * scale.h)}&zoom=5`;
        }
        console.log('ifrm.src:', ifrm.src);

    });
    return true;

};
