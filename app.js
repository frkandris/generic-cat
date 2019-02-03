var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {

  // init
  $scope.image = "halfcircle";
  $scope.numberOfPoints = "200";
  $scope.numberOfChangedPoints = "1";
  $scope.numberOfVariations = "5";
  $scope.lineWidth = 1;
  generateCat($scope.image, $scope.numberOfPoints, $scope.numberOfChangedPoints, $scope.numberOfVariations, $scope.lineWidth);

  // onChange
  $scope.onNgChange = function() {
    generateCat($scope.image, $scope.numberOfPoints, $scope.numberOfChangedPoints, $scope.numberOfVariations, $scope.lineWidth);
  };

});



function generateCat(image, numberOfPoints, numberOfChangedPoints, numberOfVariations, lineWidth) {


  // load source image

  switch (image) {
    case 'fullcircle':
      var imgSrc = 'images/fullcircle.png'; 
      break;
    case 'circle':
      var imgSrc = 'images/circle.png'; 
      break;
    case 'halfcircle':
      var imgSrc = 'images/halfcircle.png'; 
      break;
    case 'cat-outline':
      var imgSrc = 'images/cat-outline.png';
      break;
    case 'cat-silhouette':
      var imgSrc = 'images/cat-silhouette.png';
      break;
    default:
      var imgSrc = 'images/halfcircle.png';
      break;
  }

  var img = new Image();
  img.src = imgSrc + '?' + new Date().getTime();
  // img.setAttribute('crossOrigin', '');


  // wait for image load, continue afterwards

  img.onload = function () { 

    // console.log("image loaded.");


    // init canvases

    var imageWidth = img.width;
    var imageHeight = img.height;

    cOriginCanvas = document.getElementById("myCanvasOrigin");
    cOriginCanvas.height = imageHeight;
    cOriginCanvas.width = imageWidth;
    cOrigin = cOriginCanvas.getContext("2d");

    cResultCanvas = document.getElementById("myCanvasResult");
    cResultCanvas.height = imageHeight;
    cResultCanvas.width = imageWidth;
    cResult = cResultCanvas.getContext("2d");

    cOrigin.drawImage(img, 0, 0); 


    // reset variables

    var width = imageWidth;
    var height = imageHeight;

    var globalAlpha = 1;
    var strokeStyle = '#010101';
    var globalCompositeOperation = "darken"; // overlapping lines will darken each other

    // var lineWidth = 1;
    // var numberOfPoints = 200; // the length of the continous line
    // var numberOfChangedPoints = 1; // how many line ending points will we change on every iteration
    // var numberOfVariations = 5; // how many variations compete with each other at every iteration


    // FIXME - this is the part where I was working

    var genericMode = "incremental";

    if (genericMode == "incremental") {
      var currentMaxOfGenericIterations = 2;
    } else {
      var currentMaxOfGenericIterations = numberOfPoints;
    }
    var numberOfTries = 100;


    // inicialize canvases for calculation

    $("#canvasHolder").empty();
    for (q = 1; q<=numberOfVariations; q++) {
      var htmlText = '  <canvas id="myCanvas'+q+'" height="'+imageHeight+'" width="'+imageWidth+'" style="display:inline-block;border:1px solid #000;"></canvas>';
      $("#canvasHolder").append(htmlText);
    }  

    c = new Array();
    for (q = 1; q<=numberOfVariations; q++) {
      c[q] = document.getElementById("myCanvas"+q).getContext("2d");
      c[q].globalAlpha = globalAlpha;
      c[q].strokeStyle = strokeStyle;
      c[q].globalCompositeOperation = globalCompositeOperation;
      c[q].lineWidth = lineWidth;
    }  


    // generate baseline array with random (x,y) coordinates

    lineEndingPointsBaseLineArray = new Array();
    for (i=1;i<=numberOfPoints;i++) {
      var x = Math.floor((Math.random() * width + 1));
      var y = Math.floor((Math.random() * height + 1));
      var coordinatePair = [x,y];
      lineEndingPointsBaseLineArray.push(coordinatePair);
    }
    // console.log(lineEndingPointsBaseLineArray);


    // generate empty variationsarrays

    lineEndingPointsVariationArray = new Array();
    for (q = 1; q<=numberOfVariations; q++) {
      lineEndingPointsVariationArray[q] = new Array();
    }


    // start animation, draw first frame

    var p = 0; // reset iterationcounter

    window.requestAnimationFrame(function(timestamp) {
      iterateStuff(p, numberOfPoints, numberOfVariations, numberOfChangedPoints, width, height, currentMaxOfGenericIterations, numberOfTries);
    });

  }

} // end of GenerateCat function


function iterateStuff(p, numberOfPoints, numberOfVariations, numberOfChangedPoints, width, height, currentMaxOfGenericIterations, numberOfTries){

  // console.log("iteration: "+p);

  // clear all variation images

  for (q = 1; q<=numberOfVariations; q++) {
    c[q].clearRect(0, 0, width, height);
  }


  // copy baseline array to variation arrays

  for (q = 2; q<=numberOfVariations; q++) {
    lineEndingPointsVariationArray[q] = lineEndingPointsBaseLineArray.slice();
  }


  // change some points in every variation

  for (q = 2; q<=numberOfVariations; q++) {

    for (i=1;i<=numberOfChangedPoints;i++) {
      changedIndex = Math.floor((Math.random() * currentMaxOfGenericIterations));

      var x = Math.floor((Math.random() * width + 1));
      var y = Math.floor((Math.random() * height + 1));
      var coordinatePair = [x,y];

      lineEndingPointsVariationArray[q][changedIndex] = coordinatePair;
    }
    // console.log(lineEndingPointsBaseLineArray);
    // console.log(lineEndingPointsVariationArray[q]);
  }


  // draw the baseline

  startX = lineEndingPointsBaseLineArray[0][0];
  startY = lineEndingPointsBaseLineArray[0][1];

  for (r = 0; r<currentMaxOfGenericIterations; r++) {
    endX = lineEndingPointsBaseLineArray[r][0];
    endY = lineEndingPointsBaseLineArray[r][1];
    drawLine(c[1], startX, endX, startY, endY);
    startX = endX;
    startY = endY;
  }


  // draw the variation  

  for (q = 2; q<=numberOfVariations; q++) {

    startX = lineEndingPointsVariationArray[q][0][0];
    startY = lineEndingPointsVariationArray[q][0][1];

    for (r = 0; r<currentMaxOfGenericIterations; r++) {
      endX = lineEndingPointsVariationArray[q][r][0];
      endY = lineEndingPointsVariationArray[q][r][1];
      drawLine(c[q], startX, endX, startY, endY);
      startX = endX;
      startY = endY;
    }
  }


  // compare all children to the origin, store results in fitnessArray

  fitnessArray = new Array();
  for (q = 1; q<=numberOfVariations; q++) {
    fitnessArray[q] = compareStuff(cOrigin, c[q], width, height); 
  }


  // search fitnessArray for the largest number

  // console.log(fitnessArray);
  var index = 1;
  var value = fitnessArray[index];
  for (var i = index; i < fitnessArray.length; i++) {
    if (fitnessArray[i] > value) {
      value = fitnessArray[i];
      index = i;
    }
  }
  // console.log("winner index: "+index);
  // console.log("winner score: "+fitnessArray[index]);


  // copy the winner to the baseline

  if (index != 1) {
    lineEndingPointsBaseLineArray = lineEndingPointsVariationArray[index].slice();
  }

  // copy the winner child to the baseline image

  var winnerImageData = c[index].getImageData(0, 0, width, height); 
  cResult.putImageData(winnerImageData, 0, 0); 


  // next iteration

  p++;
  if (p>numberOfTries) {
    p = 0;
    currentMaxOfGenericIterations++;
    console.log("currentMaxOfGenericIterations increased to "+currentMaxOfGenericIterations);
  }

  window.requestAnimationFrame(function(timestamp) {
    iterateStuff(p, numberOfPoints, numberOfVariations, numberOfChangedPoints, width, height, currentMaxOfGenericIterations, numberOfTries);
  });

} // end of iterateStuff function



// draw a line to canvas cx, from x1;y1 to x2;y2

function drawLine(cx, x1, x2, y1, y2) {
    cx.beginPath();
    cx.moveTo(x1, y1);
    cx.lineTo(x2, y2);
    cx.stroke();
} // end of drawLine function



// compare two canvases

function compareStuff(cx, cy, width, height){
  
    var fitness = 0;
    // var sumRed1 = 0;
    // var sumRed2 = 0;

    var color1 = cx.getImageData(0, 0, width, height); 
    var color2 = cy.getImageData(0, 0, width, height); 

    for (var i = 0; i < color1.data.length; i=i+4) {

        var deltaRed = color1.data[i] - color2.data[i];
        var deltaGreen = color1.data[i+1] - color2.data[i+1];
        var deltaBlue = color1.data[i+2] - color2.data[i+2];

        var pixelFitness = deltaRed * deltaRed + deltaGreen * deltaGreen + deltaBlue * deltaBlue;

        // sumRed1 = sumRed1 + color1.data[i+2];
        // sumRed2 = sumRed2 + color2.data[i+2];

        fitness = fitness + pixelFitness;
    }

    // console.log("sumRed1: "+sumRed1);
    // console.log("sumRed2: "+sumRed2);

    // console.log("fitness: "+fitness);
    return fitness;
} // end of compareStuff function