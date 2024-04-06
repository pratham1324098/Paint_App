document.querySelector('.dropdown .dropbtn').addEventListener('click', function() {
  var dropdownContent = document.querySelector('.dropdown-content');
  if (dropdownContent.style.display === 'block') {
      dropdownContent.style.display = 'none';
  } else {
      dropdownContent.style.display = 'block';
  }
});
const canvas = document.getElementById("canvas");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight-150;
let context = canvas.getContext("2d");
context.fillStyle = "white";
context.fillRect(0,0,canvas.width,canvas.height);

let draw_color = "black";
let draw_width = "2";
let is_drawing =false;
var pencilflow=false;
var bucketflow=false;
var eraserflow =false;
var magnifyflow =false;
var textflow=false;
var colorpickerflow=false;
var bucketflow = false;
canvas.addEventListener("touchstart",start,false);
canvas.addEventListener("touchmove",draw,false);
canvas.addEventListener("mousedown",start,false);
canvas.addEventListener("mousemove",draw,false);
canvas.addEventListener("touchend",stop,false);
canvas.addEventListener("mouseup",stop,false);
canvas.addEventListener("mouseout",stop,false);

let defaultBorderColor = '';
let defaultBackgroundColor = '';
var temp_width = draw_width;

const input_bar = document.getElementById('ranging');
input_bar.addEventListener('mousemove', function() {
    // Get the value of the input range
    const value = parseInt(input_bar.value);
    const cursorDot = document.querySelector("[data-cursor-dot]");
    cursorDot.style.width=`${value}px`;
    cursorDot.style.height=`${value}px`;
    draw_width = value;
 
});


function resetTools() {
  // Reset all tool functionalities
  draw_width = "2";
  draw_color = "black";
  is_drawing = false;

  // Reset all tool button appearances
  const toolImages = document.querySelectorAll('.tools img');
  toolImages.forEach(image => {
      image.style.border = '';
      image.style.backgroundColor = '';
  });
  input_bar.value=2;
  // Reset all tool flow states
  pencilflow = false;
  bucketflow = false;
  eraserflow = false;
  magnifyflow = false;
  textflow = false;
  colorpickerflow = false;

  // Revert cursor style
  document.body.style.cursor = "default";

  // Hide cursor dot
  const cursorDot = document.querySelector("[data-cursor-dot]");
  if (cursorDot) {
      cursorDot.style.display = "none";
  }
}


const eraserImage = document.getElementById("eraser");
var eraserClicked = false;
function RemoveEraser() {
  document.body.style.cursor = "default";
  
  const cursorDot = document.querySelector("[data-cursor-dot]");
  window.addEventListener("mousemove",function(e){
    cursorDot.style.display="none";
  }
)}

const pencilImage = document.getElementById("pencil");
pencilImage.addEventListener('click', function() {
// Reset other tools
resetTools();

if (this.style.border === '') {
  defaultBorderColor = this.style.border;
  defaultBackgroundColor = this.style.backgroundColor;
  this.style.border = '2px solid skyblue';
  this.style.backgroundColor = 'rgb(164, 223, 240)';
  draw_width = "0.05";
  pencilflow = true;
  RemoveEraser();
} else {
  this.style.border = defaultBorderColor;
  this.style.backgroundColor = defaultBackgroundColor;
  draw_width = temp_width;
  pencilflow = false;
}


});


// Initialize the visited set
var visited = new Set();

function getPixelColor(event) {
  // Get the coordinates of the mouse click relative to the canvas
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  // Get the pixel data of the clicked point
  var imageData = context.getImageData(x, y, 1, 1);
  var data = imageData.data;
  return data;
}

function FillColor(x, y, tempColor, toBeFilledColor) {
  // Combine key for visited set (avoids string concatenation)
  const key = `${x},${y}`;

  // Check if the current pixel has already been visited or is filled with the specified color
  if (visited.has(key) || (tempColor[0] === toBeFilledColor[0] && tempColor[1] === toBeFilledColor[1] && tempColor[2] === toBeFilledColor[2])) {
    return;
  }

  // Fill the current pixel with the specified color
  context.fillStyle = `rgb(${toBeFilledColor[0]}, ${toBeFilledColor[1]}, ${toBeFilledColor[2]})`; // Use template literal for cleaner color setting
  context.fillRect(x, y, 20, 20);

  // Define neighboring pixels
  var neighbors = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 }
  ];

  // Mark the current pixel as visited
  visited.add(key);

  var stack = [{ x, y }];
  while (stack.length > 0) {
    const { x, y } = stack.pop();

    for (var i = 0; i < neighbors.length; i++) {
      var neighborX = x + neighbors[i].dx;
      var neighborY = y + neighbors[i].dy;

      // Check if the neighboring pixel is within the canvas boundaries
      if (neighborX >= 0 && neighborX < canvas.width && neighborY >= 0 && neighborY < canvas.height) {
        const neighborKey = `${neighborX},${neighborY}`;
        if (!visited.has(neighborKey)) {
          const neighborColor = getPixelColor({ clientX: neighborX, clientY: neighborY });
          if ((neighborColor[0] === tempColor[0] && neighborColor[1] === tempColor[1] && neighborColor[2] === tempColor[2])) {
            stack.push({ x: neighborX, y: neighborY });
            visited.add(neighborKey);
          }
        }
      }
    }
  }
}

const bucketImage = document.getElementById('bucket');
resetTools();
bucketImage.addEventListener('click', function() {
  // Reset the visited set
  visited.clear();

  // Reset any other tools or states if needed

  if (this.style.border === '') {
    defaultBorderColor = this.style.border;
    defaultBackgroundColor = this.style.backgroundColor;
    this.style.border = '2px solid skyblue';
    this.style.backgroundColor = 'rgb(164, 223, 240)';
    draw_color = "red";
    bucketflow = true;
    window.addEventListener('click', function(e) {
      var temp = getPixelColor(e);
      FillColor(e.clientX, e.clientY, temp, [255, 255, 255]); // Example: Fill white pixels with red color
    })
  } else {
    this.style.border = defaultBorderColor;
    this.style.backgroundColor = defaultBackgroundColor;
    draw_width = temp_width;
    bucketflow = false;
  }
})



function AddEraser() {
  document.body.style.cursor = "none";

  const cursorDot = document.querySelector("[data-cursor-dot]");
  window.addEventListener("mousemove",function(e){
    cursorDot.style.display="block";
    const posX=e.clientX;
    const posY=e.clientY;
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
  }
)}

eraserImage.addEventListener('click', function() {
  resetTools();
  if (this.style.border === '') {
    defaultBorderColor = this.style.border;
    defaultBackgroundColor = this.style.backgroundColor;
    this.style.border = '2px solid skyblue';
    this.style.backgroundColor = 'rgb(164, 223, 240)';
    draw_color = "white";
    draw_width="0.05"
    eraserflow = true;
    eraserClicked=true;
} else {
  this.style.border = defaultBorderColor;
  this.style.backgroundColor = defaultBackgroundColor;
  draw_color = temp_color;
  eraserflow = false;
}
if(eraserflow==true){
 AddEraser(); 
}
});
function start(event){
  is_drawing = true;
  context.beginPath();
  context.moveTo(event.clientX-canvas.offsetLeft,event.clientY-canvas.offsetTop);
  event.preventDefault();
}
function draw(event){
  if(is_drawing){
      context.lineTo(event.clientX-canvas.offsetLeft,event.clientY-canvas.offsetTop);
      context.strokeStyle = draw_color;
      context.lineWidth = draw_width;
      context.stroke();
  }
  event.preventDefault();
}
function stop(event){
  if(is_drawing){
      context.stroke();
      context.closePath();
      is_drawing=false;
  }
  event.preventDefault();
}

