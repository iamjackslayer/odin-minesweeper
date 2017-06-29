
var myModule = (function(){
	var grids = [];
	var objs = {}; // objs = {obj1:{jqObj:$(....),isItBombed: false,neighbours:["obj1","obj2",...],numberOfSurroundedBombs:3},obj2:{...},obj3:{...}}
	//event handler
	function eventHandler(e){
		//convert id into obj number to access that obj from myModule.objs
		var id = $(e.target).prop("id");
		var objNum = (parseInt(id[3]))*9 + parseInt(id[8]) + 1;

		switch(e.which){
			//left-clicked
			case 1:
				//clicked on bomb
				if(objs["obj"+objNum].isItBombed){
					console.log("bomb");
					revealBombs();
					gameOver();

				}
				else{
					//reveal surrounding if zero
					if(objs["obj"+objNum].numberOfSurroundedBombs == 0){
						$.each(objs["obj"+objNum].neighbours,function(neighbourIndex,neighbour){
							//reveal numberOfSurroundedBombs on target
							objs["obj"+objNum].jqObj.text(objs["obj"+objNum].numberOfSurroundedBombs);
							//reveal numberOfSurroundedBombs on surroundings only if the srrounding neigbour is not marked '?'
							if(objs[neighbour].jqObj.text() ==""){
								objs[neighbour].jqObj.text(objs[neighbour].numberOfSurroundedBombs);
							}
						});
					}else{
						objs["obj"+objNum].jqObj.text(objs["obj"+objNum].numberOfSurroundedBombs);
					}

				}
				break;
			//right-clicked
			case 3:
				//prevent browser default
				e.preventDefault();
				objs["obj"+objNum].jqObj.text("?");

				break;

		}
		checkWin();
	}
	//create objs with properties neighbours 
	function render(){
		for(row=0;row<9;row++){
			grids.push([]);
			for(cell=0;cell<9;cell++){
				var unit = $("<div class='square' id=row"+row+"cell"+cell+"></div>");
				grids.push(unit);
				unit.css({
					'width':'50px',
					'height':'50px',
					'border':'1px black solid',
					'display':'block',
					'float':'left',
					'line-height':'50px',
					'font-size':'30px',
					'text-align':'center'
				});
				$('#board').append(unit);

				//insert unit into objs
				objs["obj"+(row*9+cell+1)] = {};
				objs["obj"+(row*9+cell+1)].jqObj = unit;
				objs["obj"+(row*9+cell+1)].isItBombed = false;
			}
		}
				assignNeighbours();
	}
	//assign the surrounding 8/5/3 neighbours to each obj
	function assignNeighbours(){
		//for objs with 8 neighbours
		for(row=1;row<=7;row++){
			for(col=1;col<=7;col++){
				let i = (row*9+col+1);
				objs["obj"+i].neighbours = ["obj"+(i-10),"obj"+(i-9),"obj"+(i-8),"obj"+(i-1),"obj"+(i+1),"obj"+(i+8),"obj"+(i+9),"obj"+(i+10)];
			}
		}

		//for objs with 5 neighbours
		//top row
		for(row=0;row<1;row++){
			for(col=1;col<=7;col++){
				let i = (row*9+col+1);
				objs["obj"+i].neighbours = ["obj"+(i-1),"obj"+(i+1),"obj"+(i+8),"obj"+(i+9),"obj"+(i+10)];
			}
		}
		//bottom row
		for(row=8;row<9;row++){
			for(col=1;col<=7;col++){
				let i = (row*9+col+1);
				objs["obj"+i].neighbours = ["obj"+(i-10),"obj"+(i-9),"obj"+(i-8),"obj"+(i-1),"obj"+(i+1)];
			}
		}
		//leftmost column
		for(row=1;row<=7;row++){
			for(col=0;col<1;col++){
				let i = (row*9+col+1);
				objs["obj"+i].neighbours = ["obj"+(i-9),"obj"+(i-8),"obj"+(i+1),"obj"+(i+9),"obj"+(i+10)];
			}
		}
		//rightmost column
		for(row=1;row<=7;row++){
			for(col=8;col<9;col++){
				let i = (row*9+col+1);
				objs["obj"+i].neighbours = ["obj"+(i+9),"obj"+(i+8),"obj"+(i-1),"obj"+(i-10),"obj"+(i-9)];
			}
		}

		//for objs with 3 neighbours --> obj1,obj9,obj73,obj81
		(function(){
			var i = 1;
			objs["obj"+i].neighbours = ["obj"+(i+1),"obj"+(i+9),"obj"+(i+10)];
			i = 9;
			objs["obj"+i].neighbours = ["obj"+(i-1),"obj"+(i+8),"obj"+(i+9)];
			i = 73;
			objs["obj"+i].neighbours = ["obj"+(i-9),"obj"+(i-8),"obj"+(i+1)];
			i = 81;
			objs["obj"+i].neighbours = ["obj"+(i-1),"obj"+(i-10),"obj"+(i-9)];
		})();
	}

	function assignNumberOfSurroundedBombs(){
		$.each(objs,function(objKey,obj){
			var count = 0;
			$.each(obj.neighbours,function(neighbourIndex,neighbour){
				if(objs[neighbour].isItBombed){
					count += 1;
				}
			});
			objs[objKey].numberOfSurroundedBombs = count;
		});
	}
	//recreate and rerender objects, and replace bombs
	function restart(){
		$('#board').html("");
		objs = {};
		render();
		placeBombs(10);
		myModule.objs = objs;

		$('#board').on('mousedown','.square',eventHandler);
	}
	//random number generator including both extremes(min and max)
	function randomInt(min,max){
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	//randomly placing 10/num bombs
	//and assign Number of surreounded bombs
	function placeBombs(num){
		for(i=1;i<=num;i++){
			if(objs["obj"+randomInt(1,81)].isItBombed){
				i -= 1;
			} 
			else{
				objs["obj"+randomInt(1,81)].isItBombed = true;
			}
		}
		assignNumberOfSurroundedBombs();
	}

	function gameOver(){
		$("#board").off('mousedown','.square');
		alert('Oppsey doopsey');	

	}
	
	function checkWin(){
		// i=0;i<objs.length;i++
		var bombed = [];
		var nonBombed = []
		for(obj in objs){
			if(objs[obj].isItBombed){
				bombed.push(objs[obj]);
			}else{
				nonBombed.push(objs[obj]);
			}
		}
		if(bombed.every(function(item,index){
			return item.jqObj.text() == '?';
		})&&
		nonBombed.every(function(item,index){
			return item.jqObj.text() != '';
		})){
			alert('Good Job. Very Good.');
		}

	}
	function revealBombs(){
		//make bomb visible 
		$.each(objs,function(index,obj){
			if(obj.isItBombed){
				obj.jqObj.css({
					'background-color':'red',
				})
			}
		});
		
	}
	return{
		objs:objs,
		render: render,
		placeBombs: placeBombs,
		restart:restart,
		revealBombs:revealBombs,
		gameOver:gameOver,
		eventHandler:eventHandler,
		checkWin: checkWin

	}



})();






$(document).ready(function(){
	myModule.render();
	myModule.placeBombs(10);


	$('#board').on('mousedown','.square',myModule.eventHandler);

	$('#restart').on('click',function(e){
		myModule.restart();
	});
});