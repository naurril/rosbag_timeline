






let originalTopics = data.topics;

if (data_indexed.topics)
    originalTopics = data_indexed.topics

let topicList = originalTopics;


topicList = topicList.sort((a,b)=> (a.name > b.name ? 1:-1));

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

function indexToColor(i)
{

}

function createOneLane(div, topic, createNavLine=true){

    const svg = document. createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class","lane");

    topic.stamps.forEach((m,i)=>{
        
        if (topic.index)
            i = topic.index[i]

        let pos = translateStamp(m)*100;

        if (pos > 100 || pos < 0)
        {
            return;
        }

        const line = document. createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("y1", "0%");
        line.setAttribute("x1", pos +"%");
        line.setAttribute("y2", "100%");
        line.setAttribute("x2", pos +"%");
        line.setAttribute("stamp", m);
        line.setAttribute("class", "line line-"+i%5 );
        line.setAttribute("title", i);


        svg.appendChild(line);
    });

    if (createNavLine){
        console.log("create mouse nav lines");
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

function dragstart_handler(ev) {
    // Add the target element's id to the data transfer object
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

function dragover_handler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}
function drop_handler(ev) {
    ev.preventDefault();
    // Get the id of the target and add the moved element to the target's DOM
    const data = ev.dataTransfer.getData("text/plain");
    console.log(data);
    console.log(ev.target.id);

    let dragIndex = parseInt(data.split('-')[2]);
    let dropIndex = parseInt(ev.target.id.split('-')[2]);

    if (dragIndex > dropIndex)
    {
        topicList = [
            ...topicList.slice(0,dropIndex),
            topicList[dragIndex],
            ...topicList.slice(dropIndex, dragIndex),
            ...topicList.slice(dragIndex+1)
        ];
        render();
    }
    else if (dragIndex < dropIndex)
    {
        topicList = [
            ...topicList.slice(0,dragIndex),
            ...topicList.slice(dragIndex+1, dropIndex),
            topicList[dragIndex],
            ...topicList.slice(dropIndex)
        ];
        render();

    }


    
}


function randomColor()
{
    return '#'+Math.round(Math.random()*0xffffff).toString(16);
}


function refresh()
{
    topicList.forEach(topic=>{
        let stampDiv = document.getElementById(`stamps-${topic.tableIndex}`);
        stampDiv.innerHTML = "";
        createOneLane(stampDiv, topic);
    });
}


function render(){
    mouseNavLines = [];

    
    let div = document.getElementById("main-view-body");
    div.innerHTML = "<tr><th>operation</th><th>topic</th><th>messages</th></tr>";

    topicList.forEach((topic,i)=>{
        if (!topic.backgroundColor)
        {
            topic.backgroundColor = '#ffffff';
        }

        div.innerHTML += `<tr key='${i}' id='tr-${i}'><td><button id='del-${i}'>x</button><input type='color' value='${topic.backgroundColor}' id='color-${i}'></td><td draggable='true' id='table-topic-${i}'>${topic.name}</td><td class='table-stamp-content' id="stamps-${i}"></td></tr>`;
        let stampDiv = document.getElementById(`stamps-${i}`)
        createOneLane(stampDiv, topic, true);

        document.getElementById(`tr-${i}`).style = `background-color: ${topic.backgroundColor}`;
        
    });
   
    div.innerHTML += "<tr><td></td><td></td><td><span id='mouse-time'></span></td></tr>";

    topicList.forEach((topic,i)=>{

        topic.tableIndex = i;

        document.getElementById(``)

        let dddiv = document.getElementById(`table-topic-${i}`);        
        dddiv.ondragstart = dragstart_handler;
        dddiv.ondragover  = dragover_handler;
        dddiv.ondrop      = drop_handler;

        document.getElementById(`del-${i}`).onclick = ()=>{
            topicList = topicList.slice(0,i).concat(topicList.slice(i+1));
            render();
        };

        document.getElementById(`color-${i}`).onchange = (e)=>{
            let color = e.target.value;
            topic.backgroundColor = color;
            document.getElementById(`tr-${i}`).style = `background-color: ${color}`;
        };

        document.getElementById(`color-${i}`).oninput = (e)=>{
            let color = e.target.value;
            topic.backgroundColor = color;
            document.getElementById(`tr-${i}`).style = `background-color: ${color}`;
        };
      
        let stampEle = document.getElementById(`stamps-${i}`);
        stampEle.topic = topic.name;
        stampEle.onmousewheel = onMouseWheel;
        stampEle.onmousedown = onMouseDown;
        stampEle.onmouseup   = onMouseUp;
        stampEle.onmousemove = onMouseMove;  

    });
       
}

var mouseDownPos = 0;
var mouseDownViewStart = 0;
var mouseDownViewEnd = 0;
var mouseDown = false;
function onMouseDown(e)
{
    mouseDownPos = getMouseRelativePos(e)[0];
    mouseDown = true;
    mouseDownViewEnd = viewRangeEnd;
    mouseDownViewStart = viewRangeStart;
}

function onMouseMove(e)
{
    let originalRange =  (viewRangeEnd - viewRangeStart);

    let [mousePos,title] = getMouseRelativePos(e);
    document.getElementById("mouse-time").innerHTML = ( mousePos *originalRange + viewRangeStart) + ": " + title;
    document.getElementById("mouse-time").style = "left:"+mousePos*100+"%";


    if (!mouseDown){
        let navLines = document.getElementsByClassName('mouse-navigate-line');
        for (let i =0; i <navLines.length; i++)
        {
            let l = navLines.item(i);
            
            l.setAttribute('x1', mousePos*100+"%");
            l.setAttribute('x2', mousePos*100+"%");
            l.setAttribute('stamp', viewRangeStart+ mousePos * originalRange)
        }

        return;
    }
    
    let delta =  - (mousePos - mouseDownPos) * originalRange;
    viewRangeEnd = mouseDownViewEnd + delta;
    viewRangeStart = mouseDownViewStart + delta;

    refresh();
}

function onMouseUp(e)
{
    mouseDown= false;
    let [mousePos,title] = getMouseRelativePos(e);

    if (mousePos === mouseDownPos)
    {
        //click
        let originalRange =  (viewRangeEnd - viewRangeStart);
        log(mousePos *originalRange + viewRangeStart, this.topic);
    }
}

function getMouseRelativePos(e)
{
    let mousePos = 0;
    let targetClass = e.target.getAttribute('class');
    let title = "";

    if (targetClass.search("line") >= 0 || targetClass === "mouse-navigate-line")
    {
        let stamp = e.target.getAttribute("stamp");
        mousePos = (stamp-viewRangeStart)/(viewRangeEnd-viewRangeStart);
        title = e.target.getAttribute("title");
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

    console.log(mousePos, title);
    return [mousePos, title];
}
function onMouseWheel(e)
{
    
    let [mousePos,title] = getMouseRelativePos(e);

    if (mousePos< 0 || mousePos > 1)
 
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

    refresh();
}


function main()
{
     document.getElementById("filename").innerHTML = data.file;
     initViewRange();
     render();    
}

main();