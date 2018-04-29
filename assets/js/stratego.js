/**
 * Board Object
 *
 * @param $('#element') element
 * @param integer width
 * @param integer height
 */
var Board = function (element, width, height) {

    // clean board
    $('#board').html('');

    var BoardMethods = {};

    BoardMethods.grid = [];

    var Tile = {
        units: [{
            team: 'unoccupied'
        }],
        weather: false
    };

    var tileSelected = false;
    var originTile;

    var currentTeam = 'team1';
    var enemyTeam = 'team2'


    /**
     * Create the abstract grids
     */
    function createAbstractGrid(){
        for(var i = 0;i < width; i++){
            BoardMethods.grid.push([]);

            for(var j = 0; j < height; j++){
                BoardMethods.grid[i].push(Tile);
            }
        }
    }

    /**
     * Create the DOM
     */
    function createPhysicalGrid(){
        // loop into the lines
        BoardMethods.grid.forEach(function(element, index){
            var newElement = document.createElement("div");
            newElement.classList.add('line');

            BoardMethods.grid[index].forEach(function(element2, index2){
                var newElement2 = document.createElement("div");
                newElement2.classList.add('column');
                newElement2.setAttribute('row', index);
                newElement2.setAttribute('col', index2);
                $(newElement).append(newElement2);
            });

            $('#board').append(newElement);
        });
    }

    function populateGrid(){
        var Tile2 = jQuery.extend({}, Tile);
        Tile2.units = [{team: "team1"}];
        for (var i = width - 1; i >= 0; i--) {
            BoardMethods.grid[0][i] = Tile2;
            BoardMethods.grid[1][i] = Tile2;
            BoardMethods.grid[2][i] = Tile2;
        }
        for (var i = width - 1; i >= 0; i--) {
            BoardMethods.grid[3][i] = Tile;
            BoardMethods.grid[4][i] = Tile;
            BoardMethods.grid[5][i] = Tile;
            BoardMethods.grid[6][i] = Tile;
        }
        var Tile3 = jQuery.extend({}, Tile);
        Tile3.units = [{team: "team2"}];
        for (var i = width - 1; i >= 0; i--) {
            BoardMethods.grid[7][i] = Tile3;
            BoardMethods.grid[8][i] = Tile3;
            BoardMethods.grid[9][i] = Tile3;
        }
    }

    /**
     * build grids
     */
    (function(){

        createAbstractGrid();

        createPhysicalGrid();

        populateGrid();

    })();

    /**
     * Start the Game 
     *
     * @return void
     */
    BoardMethods.start = function(){
        BoardMethods.updateGrid();
        $('#whoseTurn').addClass(currentTeam)
    };

    /**
     * Update abstract grid based on the rules
     *
     * @return void
     */
    BoardMethods.updateGrid = function(){
        var that = this;

        that.grid.forEach(function(element, index){
            element.forEach(function(element2, index2){

                if( that.getTileStatus(index, index2) ){
                    that.copyTileStatusToDOM( index, index2 );
                }else{
                    that.copyTileStatusToDOM( index, index2 );
                }
            });
        });
    };

    /**
     * Return the abstract cell
     *
     * @param line
     * @param column
     * @return bool
     */
    BoardMethods.getTile = function(row, column){
        return this.grid[row][column];
    };


    BoardMethods.selectTile = function(row, column){

        var tileTeam = this.grid[row][column].units[0].team;

        // First click of an occupied tile
        if(!tileSelected && tileTeam != 'unoccupied') {
            originTile = $($('#board').find('.line')[row]).find('.column')[column];
            BoardMethods.showSelectedTile(row, column);
            tileSelected = true;
            BoardMethods.getValidMoveTiles(row, column, tileTeam);
        }

        // Second click of a valid tile
        if(tileSelected && $($($('#board').find('.line')[row]).find('.column')[column]).hasClass('possibleMoveTiles')) {
            tileSelected = false;
            
            BoardMethods.grid[row][column] = { units: [{team: currentTeam}], weather: false };

            $($($('#board').find('.line')[row]).find('.column')[column]).addClass(currentTeam).removeClass('unoccupied');
            
            $(originTile).removeClass('team1').removeClass('team2').addClass('unoccupied').removeAttr('id');

            //BATTLE
            if($($($('#board').find('.line')[row]).find('.column')[column]).hasClass(enemyTeam)) {
                BoardMethods.battle(row, column);
            }

            BoardMethods.grid[$(originTile).attr('row')][$(originTile).attr('col')] = { units: [{team: 'unoccupied'}], weather: false };

            // Send off POST with results
            BoardMethods.sendResult(row, column);
            

            if(currentTeam =='team1') {
                currentTeam = 'team2';
                enemyTeam = 'team1';
            } else if (currentTeam == 'team2') {
                currentTeam = 'team1';
                enemyTeam = 'team2';
            }

            $('#whoseTurn').attr('class','').addClass(currentTeam);
            $('.possibleMoveTiles').removeClass('possibleMoveTiles');

        }        
    };

    BoardMethods.showSelectedTile = function(row, column){
        var current_board,
           current_row,
           current_column;
        
        current_board = $('#board');
        current_row = current_board.find('.line')[row];
        current_column = $(current_row).find('.column')[column];

        $(current_column).attr('id','selectedTile');
    }

    // send data to update global grid
    BoardMethods.sendResult = function(row, column){
            // origin tile
            var originX = $(originTile).attr('row');
            var originY = $(originTile).attr('col');
            // target tile 
            var destinationX = $($($('#board').find('.line')[row]).find('.column')[column]).attr('row');
            var destinationY = $($($('#board').find('.line')[row]).find('.column')[column]).attr('col');
            console.log('sending result for ' + originX + ',' + originY);

            $.post('http://tilesuniverse:3000/', {tiles:[
                {x:originX,y:originY,data:{units:[{team: 'unoccupied'}]}, weather: false},
                {x:destinationX,y:destinationY,data:{units:[{team: 'unoccupied'}]}, weather: false}
             ]})
                .done(function( data ) {
                console.log(data );
              });

            // $.post('http://tilesuniverse:3000/',
            // {tiles:[
            //     {x:originX,y:originY,data:{units:[{team: 'unoccupied'}]}, weather: false},
            //     {x:destinationX,y:destinationY,data:{units:[{team: 'unoccupied'}]}, weather: false}
            //  ]},
            // function(data){
            //     console.log(data);
            // }).done(function() {
            //     console.log(data);
            // });

            // Body of POST request
            // {tiles:[{x:1,y:2,data:someData},{x:0,y:0,data:someData},{x:3,y:3,data:someData}]}
             // {tiles:[{x:originX,y:originY,data:{units:[{team: 'unoccupied'}]}, weather: false},
             // {x:destinationX,y:destinationY,data:someData}]}

   }

    /**
     * Return an Array of tiles which are valid moves
     * 
     * @param integer line
     * @param integer column
     * @return Array neighbours
     */
    BoardMethods.getValidMoveTiles = function(row, column, tileTeam){

        var validMoveTiles = [];

        row = parseInt(row);
        column = parseInt(column);
        
        // Up
        if(
            typeof this.grid[row-1] !== "undefined"
            && typeof this.grid[row-1][column] !== "undefined" 
            && tileTeam != this.grid[row-1][column].units[0].team
        ){
            $($($('#board').find('.line')[row-1]).find('.column')[column]).addClass('possibleMoveTiles');
            validMoveTiles.push(this.grid[row-1][column]);
        }

        // Down
        if(
            typeof this.grid[row+1] !== "undefined" 
            && typeof this.grid[row+1][column] !== "undefined" 
            && tileTeam != this.grid[row+1][column].units[0].team
        ){
            $($($('#board').find('.line')[row+1]).find('.column')[column]).addClass('possibleMoveTiles');
            validMoveTiles.push(this.grid[row+1][column]);
        }
        
        // Left
        if(typeof this.grid[row][column-1] !== "undefined" 
            && tileTeam != this.grid[row][column-1].units[0].team
        ){
            $($($('#board').find('.line')[row]).find('.column')[column-1]).addClass('possibleMoveTiles');
            validMoveTiles.push(this.grid[row][column-1]);
        }
        
        // Right
        if(typeof this.grid[row][column+1] !== "undefined"
            && tileTeam != this.grid[row][column+1].units[0].team
        ){
            $($($('#board').find('.line')[row]).find('.column')[column+1]).addClass('possibleMoveTiles');
            validMoveTiles.push(this.grid[row][column+1]);
        }

        return validMoveTiles;
    };

    // Battle
    BoardMethods.battle = function(row, column){
        var team1Strength = Math.floor(Math.random()*10);
        var team2Strength = Math.floor(Math.random()*10);
        if(team1Strength == team2Strength) {
            BoardMethods.battle();
        }
        var winner = (team1Strength > team2Strength) ? 'team1' : 'team2'; 
        var weatherAffected = false;
        
        if(BoardMethods.hasWeather(row,column)) {
            winner = (team1) ? 'team2' : 'team1'; 
            weatherAffected = true;
        }
        
        var message = (winner == 'team1') ? "Team 1 wins" : "Team 2 wins";
        BoardMethods.showBattleOutcome(team1Strength, team2Strength, message, weatherAffected);
        BoardMethods.updateTileToWinner(row, column, winner);

        BoardMethods.grid[row][column] = { units: [{team: winner}], weather: weatherAffected };
    }

    // Changes the class on the tile to display the correct colour
    BoardMethods.updateTileToWinner = function(row, column, winner){
        var current_board,
           current_row,
           current_column;
        
        current_board = $('#board');
        current_row = current_board.find('.line')[row];
        current_column = $(current_row).find('.column')[column];

        $(current_column).removeClass('team1').removeClass('team2').addClass(winner);
    }

    // Checks if a given cell has weather
    BoardMethods.hasWeather = function(row, column){
        return this.grid[row][column].weather;
    }

    // Displays a message about the battle
    BoardMethods.showBattleOutcome = function(team1Strength, team2Strength, message, weatherAffected){
        var player1messgae = '<p>Team 1 score: ' + team1Strength;
        var player2messagae = '<br>Team 2 score: ' + team2Strength;
        var weatherMessage = (weatherAffected) ? "Weather changed the outcome!" : "";
        var victoryMessage = '<br>' + message + '!</p>';
        
        outcomeText = player1messgae + player2messagae + weatherMessage + victoryMessage;
        

        $('#battleOutcome').html(outcomeText);
    }

    /**
     * Return the status of the specific cell
     */
    BoardMethods.getTileStatus = function(row, column){
        return this.grid[row][column].units[0].team;
    };

    /**
     * Change the tile in the DOM to reflect it's status
     *
     * @param String action (live|die)
     * @param int line
     * @param int column
     * @return void
     */
    BoardMethods.copyTileStatusToDOM = function( line, column ){
        // get the state of a tile
        // update tile in DOM to reflect state of tile by adding/removing class
        // can be 'unoccupied', 'team1', 'team2'

        var current_board,
           current_line,
           current_column;

        var that = this;
        var state = that.getTileStatus(line, column);
        
        current_board = $('#board');
        current_line = current_board.find('.line')[line];
        current_column = $(current_line).find('.column')[column];

        $(current_column).attr('class','');
        $(current_column).addClass('column');
        $(current_column).addClass(state);
    };

    // Hit server for events to update grid
    BoardMethods.pollServerForChanges = function() {
        $.get('http://tilesuniverse:3000/', function(result){
           console.log(result);
           /* 
           if(success) {
               BoardMethods.updateGridFromServer(x, y, team, weather) 
           }
            */
       });
    }
    
    // Update the grid based on the response from the server, and then copy the status to DOM
    BoardMethods.updateGridFromServer = function(row, column, team, weatherState){
        var updateX = row;
        var updateY = column;
        var currentTeam = team;
        var isWeather = weatherState;

        BoardMethods.grid[updateX][updateY] = { units: [{team: currentTeam}], weather: isWeather };
        BoardMethods.copyTileStatusToDOM(updateX,updateY);
    }

    return BoardMethods;
};