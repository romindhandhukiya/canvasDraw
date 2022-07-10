let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColors = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");

let pencilColor = "red";
let eraserColor = "white";
let pencilWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let defaultUrl = canvas.toDataURL();
let undoRedoTracker = []; //data
let tracker = 0; //track the data erray

let mouseDown = false;

//api
let tool = canvas.getContext("2d");

tool.strokeStyle = pencilColor;
tool.lineWidth = pencilWidth;

// tool.beginPath(); //new path of graphic
// tool.moveTo(10, 10); //start point
// tool.lineTo(100, 150);
// tool.stroke(); //fill color/graphic

// tool.beginPath();
// tool.moveTo(10,10);
// tool.lineTo(200, 250);
// tool.stroke();

//mousedown ->path starts, mousemove ->path fills
canvas.addEventListener("mousedown", (e)=> {
    mouseDown = true;
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // })
    
    let data = {
        x: e.clientX,
        y: e.clientY
    }
    socket.emit("beginPath", data);
})
canvas.addEventListener("mousemove", (e)=> {
    if(mouseDown){
        let data = {
            x: e.clientX,
            y: e.clientY, 
            color : eraserFlag ? eraserColor : pencilColor,
            width : eraserFlag ? eraserWidth : pencilWidth 
        }
        //send data to server
        socket.emit("drawStroke", data);
    }
    // drawStroke({
    //     x: e.clientX,
    //     y: e.clientY, 
    //     color : eraserFlag ? eraserColor : pencilColor,
    //     width : eraserFlag ? eraserWidth : pencilWidth 
    // })
})
canvas.addEventListener("mouseup", (e)=> {
    mouseDown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    tracker = undoRedoTracker.length - 1;
})

undo.addEventListener("click", (e)=> {
    if(tracker>0){
        tracker--;
    }

    let data = {
        trackerValue : tracker,
        undoRedoTracker
    }
    // let trackObj = {
    //     trackerValue : tracker,
    //     undoRedoTracker
    // }
    // undoRedoManage(trackObj);

    socket.emit("undoRedo", data);
})
redo.addEventListener("click", (e)=> {
    if(tracker < undoRedoTracker.length-1){
        tracker++;
    }

    let trackObj = {
        trackerValue : tracker,
        undoRedoTracker
    }
    undoRedoManage(trackObj);
})

function undoRedoManage(trackObj){
    tracker = trackObj.trackerValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[tracker];
    let img = new Image(); //new image reference
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj){
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}
function drawStroke(strokeObj){
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColors.forEach((colorElem) => {
    colorElem.addEventListener("click", (e)=>{
        let color = colorElem.classList[0];
        pencilColor = color;
        tool.strokeStyle = pencilColor;
        mouseDown = false;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    pencilWidth = pencilWidthElem.value;
    tool.lineWidth = pencilWidth;
})
eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e)=> {
    if(eraserFlag){ 
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }
    else{
        tool.strokeStyle = pencilColor;
        tool.lineWidth = pencilWidth;
    }
})

download.addEventListener("click", (e)=> {
    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    //data from server
    beginPath(data);
})
socket.on("drawStroke", (data) => {
    //data from server
    drawStroke(data);
})
socket.on("undoRedo", (data) => {
    //data from server
    undoRedoManage(data);
})