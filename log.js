
function gettime(timestamp) {
    let d = timestamp ? new Date(timestamp) : new Date();
    return "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

function isInt(n) {
    return n % 1 === 0;
}

function buildLogStr(args) {
    let thisstr = "";
    for (let i in args) {
        thisstr += " " + args[i];        
    }

    return thisstr;
}


var logid = 0;
function log() {
    let old_content = document.getElementById("log").innerHTML;

    let thisstr = "";
    thisstr += buildLogStr(arguments);

    logid++;    
    document.getElementById("log").innerHTML =  old_content + "<div id='log-" + logid + "'>" + thisstr + "</div>";
    
}


document.getElementById("clear-log").onclick = (e)=>{
    document.getElementById("log").innerHTML = "";
}
