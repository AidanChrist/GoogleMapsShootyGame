if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

let myLat = 48.4284;
let myLong = -123.3656;
let map;
let cmap;
let playerMarker;
let player = {name: "Player", x: 0, y: 0, hp: 100, xp: 0, defense: 1, lv: 1, atk: 1};
let enemies = [];
let enemyMarkers = [];
let stop = 0;
let isGame = true;
let left = false;
let right = false;
let up = false;
let down = false;
let myVar;
let searchCounter = -99999;
let respawnCounter = 0;
let spawned = [];
let projectiles = [];
let movementSpeed = 0.000003;
let type = "basic";
let fpros = false;
let boost = 0;


let mc = false;


let bossX = -0.14189358572387695;
let bossY = 51.5013818182111;
let boss = {type: "boss", x: bossX, y: bossY, marker: null, speedx: 0, speedy: 0, attack: 10, hp: 100, reload: 50, rest: 50, xp: 0};



let mbossX = 2.2945;
let mbossY = 48.8584;
let mboss = {type: "mboss", x: mbossX, y: mbossY, marker: null, speedx: 0, speedy: 0, attack: 10, hp: 100, reload: 50, rest: 50, xp: 0};
let mbossDefeated = false;

//md
//29.9792° N, 31.1342° E


//gwc
//40.4319° N, 116.5704° E
//40.43191484954473, 116.5703783919625


//pg
//48.4709255148813, -123.31818229678215


let despawnTime = 500;

let service;

//window.onload = initMap();

function chooseLocation(){
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("cmap").style.display = "block";
  document.getElementById("whereWeDropping").style.display = "block";
  document.getElementById("pause").style.display = "block";
  
  cmap = new google.maps.Map(document.getElementById("cmap"), {
    center: { lat: myLat, lng: myLong },
    zoom: 3,
    disableDefaultUI: true,
  });
  
  cmap.addListener("click", (mapsMouseEvent) => {
      myLat = mapsMouseEvent.latLng.lat();
      myLong = mapsMouseEvent.latLng.lng();
      initMap();
  });
}

function initMap(){
  
  cmap = null;
  console.log(myLat + ", " + myLong);
  
  document.getElementById("cmap").style.display = "none";
  document.getElementById("whereWeDropping").style.display = "none";
  document.getElementById("map").style.display = "block";
  if(mc){
    document.getElementById("buttons").style.display = "block";
    document.getElementById("pbuttons").style.display = "block";
  }
  
  var myStyles =[
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
  ];
  
  //document.getElementById("map").remove();
  //document.createElement("");
  
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: myLat, lng: myLong },
    zoom: 20,
    disableDefaultUI: true,
    gestureHandling: "none",
    keyboardShortcuts: false
    //styles: myStyles
  });
  
  // Configure the click listener.
    map.addListener("mouseup", (mapsMouseEvent) => {
      playerShoot(mapsMouseEvent.latLng);
    });
  
    map.addListener("dragend", (mapsMouseEvent) => {
      map.setCenter({ lat: myLat, lng: myLong });
      playerShoot(mapsMouseEvent.latLng);
    });
  
  let bossIcon = {
    url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2Fqueen.jfif?v=1623269376805",
    scaledSize: new google.maps.Size(200, 200),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(100, 100) // anchor
  }
  boss.marker = new google.maps.Marker({position: {lat: boss.y, lng: boss.x}, map, icon: bossIcon});
  
  if(!mbossDefeated){
    bossIcon = {
      url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(9).gif?v=1623443528647",
      scaledSize: new google.maps.Size(200, 200),
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(100, 100) // anchor
    }
    mboss.marker = new google.maps.Marker({position: {lat: mboss.y, lng: mboss.x}, map, icon: bossIcon});
  }
  
  setPlayer();

  enableMovement();
  
  search();
}

function setPlayer(){
  const scaledIcon = {
    url:
      "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(3).gif?v=1623268932835",
    scaledSize: new google.maps.Size(80, 80),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(40, 40) // anchor
  };
  
  document.getElementById("ui").style.display = "block";
  document.getElementById("lv").style.display = "block";
  document.getElementById("xp").innerHTML = "XP:" + player.xp;
  document.getElementById("hp").innerHTML = "HP:" + player.hp;
  document.getElementById("lv").innerHTML = "Level " + player.lv;
  document.getElementById("hp").style.width = player.hp + "%";
  document.getElementById("xp").style.width = player.xp + "%";
  
  player.x = myLong;
  player.y = myLat;
  
  playerMarker = new google.maps.Marker({
    position: {lat: myLat, lng: myLong},
    map,
    icon: scaledIcon
  });
}

function logCoords(){
  console.log(myLat + ", " + myLong);
}

function search(){
  
  searchForEnemies(map.center, "50", "poi");
  
}

function stopGame(){
  clearInterval(myVar);
}

function kill(){
  //stop();
  if(enemies[enemies.length-1].marker != null){
    enemies[enemies.length-1].marker.setMap(null);
  }
  
  enemies.pop();
  //enableMovement();
}

function infoMessage(message, time){
  document.getElementById("info").style.display = "block";
  document.getElementById("info").innerHTML = message;
  document.getElementById("info").style.opacity = "100%";
  let t = time;
  let o = 100;
  let myVar2 = setInterval(fadeMessage, 6);
  
  function fadeMessage(){
      t--;
      if(t < 0){
        o--;
        document.getElementById("info").style.opacity = o + "%";
      }
      if(o == 0){
        document.getElementById("info").style.display = "none";
        clearInterval(myVar2);
      }
  }
}

function menu(){
  stopGame();
  document.getElementById("menu").style.display = "block";
  document.getElementById("pause").style.display = "none";
}

function resume(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("pause").style.display = "block";
  if(document.getElementById("map").style.display == "block"){
    enableMovement(); 
  }
}

function warp(){
    player.hp = 100;
    player.xp = 0;
    document.getElementById("menu").style.display = "none";
    document.getElementById("map").style.display = "none";
    document.getElementById("ui").style.display = "none";
    document.getElementById("lv").style.display = "none";
    chooseLocation();
  
}

function mainMenu(){
  player.hp = 100;
  player.xp = 0;
  document.getElementById("menu").style.display = "none";
  document.getElementById("map").style.display = "none";
  document.getElementById("ui").style.display = "none";
  document.getElementById("lv").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("instructions").style.display = "none";
  document.getElementById("lore").style.display = "none";
  document.getElementById("buttons").style.display = "none";
  document.getElementById("pbuttons").style.display = "none";
}

function instructions(){
  document.getElementById("instructions").style.display = "block";
  document.getElementById("startScreen").style.display = "none";
}

function lore(){
  document.getElementById("lore").style.display = "block";
  document.getElementById("startScreen").style.display = "none";
}

function mobileControls(){
  if(mc){
    document.getElementById("mc").innerHTML = "Touch Controls: Off"; 
    mc = false;
  }else{
    document.getElementById("mc").innerHTML = "Touch Controls: On";
    mc = true;
  }
}

function mobile(di){
  switch(di){
    case "left": left = true; break;
    case "down": down = true; break;
    case "right": right = true; break;
    case "up": up = true; break;
  }
}

function unmobile(di){
  switch(di){
    case "left": left = false; break;
    case "down": down = false; break;
    case "right": right = false; break;
    case "up": up = false; break;
  }
}


function moveUp(){
  myLat += movementSpeed + boost;
  map.setCenter({ lat: myLat, lng: myLong });
}

function moveDown(){
  myLat -= movementSpeed + boost;
  map.setCenter({ lat: myLat, lng: myLong });
}

function moveRight(){
  myLong += movementSpeed + boost;
  map.setCenter({ lat: myLat, lng: myLong });
}

function moveLeft(){
  myLong -= movementSpeed + boost;
  map.setCenter({ lat: myLat, lng: myLong });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function enableMovement(){
		
		myVar = setInterval(moveCharacter, 6);
				
		window.addEventListener('keydown', function (e) {
      if(!mc){
        switch(String.fromCharCode(e.keyCode)){
          case 'A': left = true; break;
          case 'S': down = true; break;
          case 'D': right = true; break;
          case 'W': up = true; break;
        }
        if(fpros && e.keyCode == 32){
          boost = movementSpeed;
        }
      }
			
		});
			
		window.addEventListener('keyup', function (e) {
      if(!mc){
        switch(String.fromCharCode(e.keyCode)){
          case 'A': left = false; break;
          case 'S': down = false; break;
          case 'D': right = false; break;
          case 'W': up = false; break;
        }
        if(fpros && e.keyCode == 32){
          boost = 0;
        }
      }
		});
					
		function moveCharacter(){
      respawnCounter++;
      
      
			if(left){				
				player.x -= movementSpeed + boost;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveLeft();
			}

			if(up){
				player.y += movementSpeed + boost;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveUp();
			}
			
			if(right){
				player.x += movementSpeed + boost;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveRight();
			}
			
			if(down){
				player.y -= movementSpeed + boost;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveDown();
			}
      
      moveEnemies();
      
      moveProjectiles()
      
      despawnTime--;
      if(despawnTime <= 0){
        despawnTime += 250;
        despawnEnemies();
      }
      
      colision();
      
      if(respawnCounter > 1000){
        search();
        respawnCounter = 0;
      }
      
      if(!mbossDefeated && player.y < 48.85925048407346 && player.x > 2.293326563537098 && player.y > 48.85752187665578 && player.x < 2.295748423911692){
        mbossFight();
      }
      
      /*
      if(counter % 500 == 0){
        searchForParks(map.center);
      }
      */
    }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function searchForEnemies(location, distance, t) {
  type = t;
  
  //use places API to search for all parks within 5 km
  let request = {
    location: location,
    radius: distance,
    type: ["poi park restaurant store"]
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, processEnemies);
  
}

let test;

// process search results for parks
function processEnemies(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {

    
    for(let i = 0; i < results.length && i < 10; i++){
        if(results[i].types.includes("park")){
          type = "park";
        }else if(results[i].types.includes("restaurant")){
          type = "restaurant";
        }else if(results[i].types.includes("store")){
          type = "store";
        }else{
          type = "poi";
        }
        enemies.push({type: type, x: results[i].geometry.location.lng(), y: results[i].geometry.location.lat(), marker: null, speedx: 0, speedy: 0, attack: 10, reload: 100, rest: 0, xp: 0});
        spawnEnemy(results[i], enemies[enemies.length-1]);
    }
    
  console.log(results[0]);

    
  }else{
    console.log("No Enemies");
  }
} // processMarker



function spawnEnemy(place, enemy){
  let no;
  for(let i = 0; i < spawned.length; i++){
    if(spawned[i] == place.name){
      no = true;
      console.log(place.name);
    }
  }
  
  if(!no){
    spawned.push(place.name);
    let icon;
    switch(enemy.type){
      case "poi": 
        icon = "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(4).gif?v=1623271555298"; 
        enemy.xp = 1;
        enemy.size = 0.00001;
        break;
        
      case "park": 
        icon = {
          url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(6).gif?v=1623353848725",
          scaledSize: new google.maps.Size(60, 60),
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(30, 30) // anchor
        }
        enemy.xp = 3;
        enemy.size = 0.00002;
        enemy.reload = 200;
        break;
        
      case "restaurant": 
        icon = {
          url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(7).gif?v=1623355510176",
          scaledSize: new google.maps.Size(120, 120),
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(60, 60) // anchor
        }
        enemy.attack = 30;
        enemy.xp = 2;
        enemy.size = 0.00003;
        break;
        
      case "store": 
        icon = {
          url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(8).gif?v=1623437528686",
          scaledSize: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(25, 25) // anchor
        }
        enemy.xp = 4;
        enemy.speedx = 0.0000005;
        enemy.speedy = 0.0000005;
        enemy.size = 0.000015;
        
        break;
        
      
      default:
        console.log(enemy.type);
    }


    enemy.marker = new google.maps.Marker({position: {lat: enemy.y, lng: enemy.x}, map, icon: icon});
    
  }// if
  
}

function moveEnemies(){
  if(enemies.length > 0){
    
    for(let i = 0; i < enemies.length; i++){
      if(enemies[i].marker != null){
        switch(enemies[i].type){
            
            
          case "poi":
            enemies[i].x += enemies[i].speedx;
            enemies[i].y += enemies[i].speedy;
            enemies[i].marker.setPosition({lat: enemies[i].y, lng: enemies[i].x});
            enemies[i].reload--;
            if(enemies[i].reload <= 0){
              let a = (map.center.lng() - enemies[i].x);
              a = a * a;
              let b = (map.center.lat() - enemies[i].y);
              b = b * b;
              let distance = a + b;
              distance = Math.abs(distance);
              distance = Math.sqrt(distance);
              let deltaY = (map.center.lat() - enemies[i].y);
              let sy = (1 * deltaY) / distance;
              let deltaX = (map.center.lng() - enemies[i].x);
              let sx = (1 * deltaX) / distance;
              enemies[i].reload = 250 + Math.floor(Math.random() * 250);
              enemies[i].speedx = sx * 0.0000015;
              enemies[i].speedy = sy * 0.0000015;
              
            }
            break;
            
            
          case "park":
            enemies[i].reload--;
            if(enemies[i].reload % 50 == 0 && enemies[i].reload < 151){
              enemyShoot({lat: enemies[i].y, lng: enemies[i].x});
            }else if(enemies[i].reload <= 0){
              enemies[i].reload = 500 + Math.floor(Math.random() * 250);
            }
          break;
            
            
          case "restaurant":
            if(enemies[i].rest <= 0){
              enemies[i].x += enemies[i].speedx;
              enemies[i].y += enemies[i].speedy;
              enemies[i].marker.setPosition({lat: enemies[i].y, lng: enemies[i].x});
              enemies[i].reload--;
              if(enemies[i].reload <= 0){
                let a = (map.center.lng() - enemies[i].x);
                a = a * a;
                let b = (map.center.lat() - enemies[i].y);
                b = b * b;
                let distance = a + b;
                distance = Math.abs(distance);
                distance = Math.sqrt(distance);
                let deltaY = (map.center.lat() - enemies[i].y);
                let sy = (1 * deltaY) / distance;
                let deltaX = (map.center.lng() - enemies[i].x);
                let sx = (1 * deltaX) / distance;
                enemies[i].reload = 250 + Math.floor(Math.random() * 250);
                enemies[i].rest = 100;
                enemies[i].speedx = sx * 0.000004;
                enemies[i].speedy = sy * 0.000004;

              }
            }else{
              enemies[i].rest--;
            }
            break;
            
            
          case "store":
            enemies[i].reload--;
            if(enemies[i].reload <= 0){
              enemyShoot({lat: enemies[i].y, lng: enemies[i].x});
              enemies[i].reload += 150 + Math.floor(Math.random() * 150);
            }
            
            enemies[i].rest--;
            enemies[i].x += enemies[i].speedx;
            enemies[i].y += enemies[i].speedy;
            enemies[i].marker.setPosition({lat: enemies[i].y, lng: enemies[i].x});
            if(enemies[i].rest <= 0){
              enemies[i].rest = 500;
              enemies[i].speedx *= -1;
            }else if(enemies[i].rest <= Math.floor(Math.random() * 100) + 200){
              enemies[i].speedy *= -1;
            }
            break;
          
            
        
        }
      }

    }

  }
}

function setMapOnAll(map) {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].marker.setMap(map);
  }
}

function playerShoot(loc){
  
  let a = (loc.lng() - player.x);
  a = a * a;
  let b = (loc.lat() - player.y);
  b = b * b;
  let distance = a + b;
  distance = Math.abs(distance);
  distance = Math.sqrt(distance);
  let deltaY = (loc.lat() - player.y);
  let sy = (1 * deltaY) / distance;
  let deltaX = (loc.lng() - player.x);
  let sx = (1 * deltaX) / distance;
  
  const scaledIcon = {
    url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(2).gif?v=1622752548973",
    scaledSize: new google.maps.Size(40, 40),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(20, 20) // anchor
  };
  
  projectiles.push({x: player.x, y: player.y, marker: new google.maps.Marker({
        position: {lat: player.y, lng: player.x},
        map,
        icon: scaledIcon,
      }), speedx: sx * 0.000006, speedy: sy * 0.000006, time: 250, type: "good"});
  
  //console.log(projectiles.length);
  
}

function enemyShoot(loc){
  let a = (map.center.lng() - loc.lng);
  a = a * a;
  let b = (map.center.lat() - loc.lat);
  b = b * b;
  let distance = a + b;
  distance = Math.abs(distance);
  distance = Math.sqrt(distance);
  let deltaY = (map.center.lat() - loc.lat);
  let sy = (1 * deltaY) / distance;
  let deltaX = (map.center.lng() - loc.lng);
  let sx = (1 * deltaX) / distance;
  
  const scaledIcon = {
    url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(1).gif?v=1622751994390",
    scaledSize: new google.maps.Size(30, 30),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(15, 15) // anchor
  };
  
  projectiles.push({x: loc.lng, y: loc.lat, marker: new google.maps.Marker({
        position: {lat: loc.lat, lng: loc.lng},
        map,
        icon: scaledIcon
      }), speedx: sx * 0.000003, speedy: sy * 0.000003, time: 200, type: "bad"});
}

function moveProjectiles(){
  let remove = [];
  for(let i = 0; i < projectiles.length; i++){
    projectiles[i].x += projectiles[i].speedx;
    projectiles[i].y += projectiles[i].speedy;
    projectiles[i].marker.setPosition({lat: projectiles[i].y, lng: projectiles[i].x});
    projectiles[i].time--;
    if(projectiles[i].time <= 0){
      if(projectiles[i].marker != null){
        projectiles[i].marker.setMap(null);
      }
      projectiles.splice(i, 1);
    }
  }
  
}

function despawnEnemies(){
  for(let i = 0; i < enemies.length; i++){
    if(Math.abs(enemies[i].x - player.x) > 0.0015 || Math.abs(enemies[i].y - player.y) > 0.0015){
      //console.log("despawned enemy");
      if(enemies[i].marker != null){
        enemies[i].marker.setMap(null);
        enemies.splice(i, 1);
      }
    }
  }
}




function colision(){
  for(let i = 0; i < enemies.length; i++){
    if(enemies[i].x + enemies[i].size > player.x - 0.000015 && enemies[i].x - enemies[i].size < player.x + 0.000015 && enemies[i].y + enemies[i].size > player.y - 0.000015 && enemies[i].y - enemies[i].size < player.y + 0.000015){
      console.log("Hit By Enemy");
      player.hp -= enemies[i].attack * player.defense;
      if(enemies[i].marker != null){
        enemies[i].marker.setMap(null);
      }
      enemies.splice(i, 1);
      document.getElementById("hp").innerHTML = "HP:" + player.hp;
      document.getElementById("hp").style.width = player.hp + "%";
      if(player.hp <= 0){
        infoMessage("<h1 style='color:red'>YOU DIED</h1><b style='color:red'>Your xp was lost</b>", 500);
        document.getElementById("hp").innerHTML = "HP:0";
        document.getElementById("hp").style.width = "0%";
        player.hp = 100;
        player.xp = 0;
        document.getElementById("map").style.display = "none";
        document.getElementById("pause").style.display = "none";
        document.getElementById("startScreen").style.display = "block";
        document.getElementById("ui").style.display = "none";
        document.getElementById("lv").style.display = "none";
        document.getElementById("buttons").style.display = "none";
        document.getElementById("pbuttons").style.display = "none";
        stopGame();
      }
    }
  }
  for(let i = 0; i < enemies.length; i++){
    for(let j = 0; j < projectiles.length; j++){
      if(enemies[i].x + enemies[i].size > projectiles[j].x - 0.00003 && enemies[i].x - enemies[i].size < projectiles[j].x + 0.00003 && enemies[i].y + enemies[i].size > projectiles[j].y - 0.00003 && enemies[i].y - enemies[i].size < projectiles[j].y + 0.00003 && projectiles[j].type == "good"){
        player.xp += enemies[i].xp;
        if(player.xp >= 100){
          player.xp -= 100;
          player.hp = 100;
          document.getElementById("hp").innerHTML = "HP:" + player.hp;
          document.getElementById("hp").style.width = player.hp + "%";
          if(player.lv != 10){
             player.lv++; 
             player.defense -= 0.1;
             document.getElementById("level").innerHTML = "Level " + player.lv;
             infoMessage("<h1>LEVEL UP</h1><b>Your defense increased</b>", 300);
          }
          document.getElementById("lv").innerHTML = "Level " + player.lv;
        }
        document.getElementById("xp").innerHTML = "XP:" + player.xp;
        document.getElementById("xp").style.width = player.xp + "%";
        if(projectiles[j].marker != null){
          projectiles[j].marker.setMap(null);
          projectiles.splice(j, 1);
        }
        if(enemies[i].marker != null){
          enemies[i].marker.setMap(null);
          enemies.splice(i, 1);
          break;
        }
      }
    }
  }
  for(let i = 0; i < projectiles.length; i++){
    if(projectiles[i].x + 0.000015 > player.x - 0.000015 && projectiles[i].x - 0.000015 < player.x + 0.000015 && projectiles[i].y + 0.000015 > player.y - 0.000015 && projectiles[i].y - 0.000015 < player.y + 0.000015 && projectiles[i].type == "bad"){
      console.log("Hit By Projectile");
      player.hp -= 20 * player.defense;
      if(projectiles[i].marker != null){
        projectiles[i].marker.setMap(null);
        projectiles.splice(i, 1);
      }
      document.getElementById("hp").innerHTML = "HP:" + player.hp;
      document.getElementById("hp").style.width = player.hp + "%";
      if(player.hp <= 0){
        infoMessage("<h1 style='color:red'>YOU DIED</h1><b style='color:red'>Your xp was lost</b>", 500);
        player.hp = 100;
        player.xp = 0;
        document.getElementById("map").style.display = "none";
        document.getElementById("pause").style.display = "none";
        document.getElementById("startScreen").style.display = "block";
        document.getElementById("ui").style.display = "none";
        document.getElementById("lv").style.display = "none";
        document.getElementById("buttons").style.display = "none";
        document.getElementById("pbuttons").style.display = "none";
        stopGame();
      }
    }
  }
}






//--------------------------------------------------------------------------------------------------------------------------------
function mbossFight(){
  
  stopGame();
  document.getElementById("pause").style.display = "none";
  document.getElementById("bossUi").style.display = "block";
  
  let rest = 1000;
  let spin = 1999;
  let spinning = true;
  let hit = false;
  
  mboss.speedy = 0;
  mboss.speedx = 0;
  mboss.size = 0.00006;
  mboss.hp = 80;
  
  let spinIcon = {
    url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(9).gif?v=1623443528647",
    scaledSize: new google.maps.Size(200, 200),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(100, 100) // anchor
  }
  
  let restIcon = {
    url: "https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel.png?v=1623442767136",
    scaledSize: new google.maps.Size(200, 200),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(100, 100) // anchor
  }
  
  myVar = setInterval(moveBoss, 6);
					
		function moveBoss(){
      
      if(left){				
				player.x -= movementSpeed;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveLeft();
			}

			if(up){
				player.y += movementSpeed;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveUp();
			}
			
			if(right){
				player.x += movementSpeed;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveRight();
			}
			
			if(down){
				player.y -= movementSpeed;
        playerMarker.setPosition({lat: player.y, lng: player.x});
        moveDown();
			}
      
      moveProjectiles();
      
      for(let i = 0; i < projectiles.length; i++){
        if(projectiles[i].x + 0.000015 > player.x - 0.000015 && projectiles[i].x - 0.000015 < player.x + 0.000015 && projectiles[i].y + 0.000015 > player.y - 0.000015 && projectiles[i].y - 0.000015 < player.y + 0.000015 && projectiles[i].type == "bad"){
          console.log("Hit By Projectile");
          player.hp -= 20 * player.defense;
          if(projectiles[i].marker != null){
            projectiles[i].marker.setMap(null);
            projectiles.splice(i, 1);
          }
          document.getElementById("hp").innerHTML = "HP:" + player.hp;
          document.getElementById("hp").style.width = player.hp + "%";
          if(player.hp <= 0){
            player.hp = 100;
            player.xp = 0;
            document.getElementById("map").style.display = "none";
            document.getElementById("pause").style.display = "none";
            document.getElementById("startScreen").style.display = "block";
            document.getElementById("ui").style.display = "none";
            document.getElementById("lv").style.display = "none";
            document.getElementById("bossUi").style.display = "none";
            stopGame();
          }
        }
      }
      
      if(mboss.x + mboss.size > player.x - 0.000015 && mboss.x - mboss.size < player.x + 0.000015 && mboss.y + mboss.size > player.y - 0.000015 && mboss.y - mboss.size < player.y + 0.000015 && !hit){
        player.hp -= 40 * player.defense;
        document.getElementById("hp").innerHTML = "HP:" + player.hp;
        document.getElementById("hp").style.width = player.hp + "%";
        hit = true;
        if(player.hp <= 0){
          infoMessage("<h1 style='color:red'>YOU DIED</h1><b style='color:red'>Your xp was lost</b>", 500);
          player.hp = 100;
          player.xp = 0;
          document.getElementById("map").style.display = "none";
          document.getElementById("pause").style.display = "none";
          document.getElementById("startScreen").style.display = "block";
          document.getElementById("ui").style.display = "none";
          document.getElementById("lv").style.display = "none";
          document.getElementById("bossUi").style.display = "none";
          document.getElementById("buttons").style.display = "none";
          document.getElementById("pbuttons").style.display = "none";
          stopGame();
        }
      }
      
      if(spinning){
        mboss.x += mboss.speedx;
        mboss.y += mboss.speedy;
        mboss.marker.setPosition({lat: mboss.y, lng: mboss.x});
        spin--;
        if(spin % 200 == 0){
            hit = false;
            let a = (map.center.lng() - mboss.x);
            a = a * a;
            let b = (map.center.lat() - mboss.y);
            b = b * b;
            let distance = a + b;
            distance = Math.abs(distance);
            distance = Math.sqrt(distance);
            let deltaY = (map.center.lat() - mboss.y);
            let sy = (1 * deltaY) / distance;
            let deltaX = (map.center.lng() - mboss.x);
            let sx = (1 * deltaX) / distance;
            mboss.speedx = sx * 0.0000045;
            mboss.speedy = sy * 0.0000045;
        }
        if(spin <= 0){
          spinning = false;
          rest = 1000;
          mboss.marker.setIcon(restIcon);
        }
      }else{
        rest--;
        if(rest <= 0){
          spinning = true;
          spin = 1999;
          mboss.speedx = 0;
          mboss.speedy = 0;
          mboss.marker.setIcon(spinIcon);
        }
      }
      
      
      
      
      
      
      
      for(let i = 0; i < projectiles.length; i++){
        if(projectiles[i].x + 0.00003 > mboss.x - mboss.size && projectiles[i].x - 0.00003 < mboss.x + mboss.size && projectiles[i].y + 0.00003 > mboss.y - mboss.size && projectiles[i].y - 0.00003 < mboss.y + mboss.size && projectiles[i].type == "good"){
          if(spinning){
            enemyShoot({lat: projectiles[i].y, lng: projectiles[i].x});
          }else{
            mboss.hp--;
            document.getElementById("bossBar").style.width = mboss.hp / 80 * 100 + "%";
            console.log(mboss.hp);
            if(mboss.hp <= 0){
              if(mboss.marker != null){
                mboss.marker.setMap(null);
                mboss = null;
              }
              fpros = true;
              document.getElementById("fpros").innerHTML = "<img class='upgrade' src = 'https://cdn.glitch.com/81c9df27-eeec-4c4f-9d72-4c376c276d33%2FNew%20Piskel%20(1).png?v=1623568258172'> Hold [Space] to move faster";
              player.hp = 100;
              document.getElementById("hp").innerHTML = "HP:" + player.hp;
              document.getElementById("hp").style.width = player.hp + "%";
              if(player.lv != 10){
                 player.lv++; 
                 document.getElementById("level").innerHTML = "Level " + player.lv;
                 player.defense -= 0.1;
              }
              document.getElementById("lv").innerHTML = "Level " + player.lv;
              document.getElementById("bossUi").style.display = "none";
              document.getElementById("pause").style.display = "block";
              infoMessage("<h1>Upgrade Acquired</h1><b>Hold [space] to move faster</b>", 600);
              stopGame();
              mbossDefeated = true;
              enableMovement();
            }
          }
          if(projectiles[i].marker != null){
            projectiles[i].marker.setMap(null);
            projectiles.splice(i, 1);
          }
        }
      } 
    }
  
}
//------------------------------------------------------------------------------------------------------------------
 




