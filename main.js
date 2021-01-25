



let originalTopics = topics;

let topicList = [];
for (let i in originalTopics)
{
    topicList.push({
        name: i,
        stamps: originalTopics[i],
    })
}

var mouseNavLines = [];
var viewRangeStart = 0;
var viewRangeEnd = 100;


function initViewRange()
{
    let min = NaN;
    let max = NaN;
    topicList.forEach(topic=>
    {
        topic.stamps.forEach(m=>{

            if (isNaN(min)){
                min = m;
                max = m;
            }

            if (m < min)
                min = m;
            if (m > max)
                max = m;
        })
    });

    viewRangeStart = min;
    viewRangeEnd = max;

    
}


function translateStamp(stamp){
    return (stamp - viewRangeStart)/(viewRangeEnd-viewRangeStart);
}


function createOneLane(div, topic){

    const svg = document. createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class","lane");

    topic.stamps.forEach(m=>{
        let pos = translateStamp(m)*100;

        if (pos > 100 || pos < 0)
        {
            return;
        }

        const line = document. createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("y1", "0%");
        line.setAttribute("x1", translateStamp(m)*100 +"%");
        line.setAttribute("y2", "100%");
        line.setAttribute("x2", translateStamp(m)*100 +"%");
        line.setAttribute("stamp", m);
        line.setAttribute("class", "line");
        svg.appendChild(line);
    });

    if (true){
        const line = document. createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("y1", "0%");
        line.setAttribute("x1", "0%");
        line.setAttribute("y2", "100%");
        line.setAttribute("x2", "0%");
        line.setAttribute("class", "mouse-navigate-line");
        line.setAttribute("id", topic.name);
        svg.appendChild(line);
        mouseNavLines.push(line);
    }

    div.appendChild(svg);
}


function render(){
    mouseNavLines = [];

    
    let div = document.getElementById("main-view-body");
    div.innerHTML = "<tr><th>topic</th><th>lane_operations</th><th>messages</th></tr>";

    topicList.forEach((topic,i)=>{
        div.innerHTML += `<tr key='${i}'><td>${topic.name}</td><td><div class='lane-ops'><button id='del-${i}'>x</button><button id='up-${i}'>u</button><button  id='down-${i}'>d</button></div></td><td class='table-stamp-content' id="stamps-${i}"></td></tr>`;
        let stampDiv = document.getElementById(`stamps-${i}`)
        createOneLane(stampDiv, topic);
    });
   
    div.innerHTML += "<tr><td></td><td></td><td><span id='mouse-time'></span></td></tr>";

    topicList.forEach((topic,i)=>{
        document.getElementById(`del-${i}`).onclick = ()=>{
            topicList = topicList.slice(0,i).concat(topicList.slice(i+1));
            render();
        };

        document.getElementById(`up-${i}`).onclick = ()=>{
            if (i=== 0)
            {
                return;
            }

            topicList = [
                ...topicList.slice(0,i-1),
                topicList[i],
                topicList[i-1],
                ...topicList.slice(i+1)
            ];

            render();
        };
        
        document.getElementById(`down-${i}`).onclick = ()=>{
            if (i === topicList.length-1)
            {
                return;
            }

            topicList = [
                ...topicList.slice(0,i),
                topicList[i+1],
                topicList[i],
                ...topicList.slice(i+2)
            ];

            render();
        };
    });

    installMouseOp();
    
}

var mouseDownPos = 0;
var mouseDownViewStart = 0;
var mouseDownViewEnd = 0;
var mouseDown = false;
function onMouseDown(e)
{
    mouseDownPos = getMouseRelativePos(e);
    mouseDown = true;
    mouseDownViewEnd = viewRangeEnd;
    mouseDownViewStart = viewRangeStart;
}

function onMouseMove(e)
{
    let originalRange =  (viewRangeEnd - viewRangeStart);

    let mousePos = getMouseRelativePos(e);
    document.getElementById("mouse-time").innerHTML = ( mousePos *originalRange + viewRangeStart);



    if (!mouseDown){
        let navLines = document.getElementsByClassName('mouse-navigate-line');
        for (let i in navLines)
        {
            let l = navLines[i];
            console.log(l);
            l.setAttribute('x1', mousePos*100+"%");
            l.setAttribute('x2', mousePos*100+"%");
            l.setAttribute('stamp', viewRangeStart+ mousePos * originalRange)
        }

        return;
    }
    
    let delta =  - (mousePos - mouseDownPos) * originalRange;
    viewRangeEnd = mouseDownViewEnd + delta;
    viewRangeStart = mouseDownViewStart + delta;

    render();
}

function onMouseUp(e)
{
    mouseDown= false;
}

function getMouseRelativePos(e)
{
    let mousePos = 0;
    let targetClass = e.target.getAttribute('class');

    if (targetClass === "line" || targetClass === "mouse-navigate-line")
    {
        let stamp = e.target.getAttribute("stamp");
        mousePos = (stamp-viewRangeStart)/(viewRangeEnd-viewRangeStart);
    }
    else  //if (e.target.getAttribute('class') === "lane")
    {
         let rect = e.target.getBoundingClientRect();
         let x = e.clientX - rect.left; //x position within the element.
         //var y = e.clientY - rect.top;  //y position within the element.
         mousePos = x/rect.width;
         console.log(x, mousePos);
    }
    // else
    // else{
    //     console.log(e.target.className);
    // }

    console.log(mousePos);
    return mousePos;
}
function onMouseWheel(e)
{
    
    let mousePos = getMouseRelativePos(e);
 
    var delta = 0;

    if (!e) 
        e = window.event;
    
    e.preventDefault();
    
    // normalize the delta
    if (e.wheelDelta) {
        // IE and Opera
        delta = e.wheelDelta / 30;
    } 
    else if (e.detail) { 
        delta = -e.detail ;
    }

    console.log(delta);

    let ratio  = (100+delta*2)/100;
    let newRange = (viewRangeEnd-viewRangeStart)/ratio;

    let newStart = viewRangeStart + mousePos * (viewRangeEnd - viewRangeStart) - mousePos * newRange;
    let newEnd   = viewRangeStart + mousePos * (viewRangeEnd - viewRangeStart) + (1-mousePos) * newRange

    viewRangeStart = newStart;
    viewRangeEnd = newEnd;

    render();
}

function installMouseOp()
{
    //let lanes = document.getElementsByClassName('lane');
    let lanes = document.getElementsByClassName('table-stamp-content');
    for (let l in lanes)
    {
        let ele = lanes[l];
    
       ele.onmousewheel = onMouseWheel;
       ele.onmousedown = onMouseDown;
       ele.onmouseup   = onMouseUp;
       ele.onmousemove = onMouseMove;       
   }
}

function main()
{
     initViewRange();
     render();    
}

main();