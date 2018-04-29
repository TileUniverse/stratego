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
    var enemyTeam = 'team2';


    BoardMethods.heartBeat;


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

         $.ajax({
           method: "GET",
           url: 'http://tilesuniverse:3000',
           crossDomain: true,
           success: function(result){
               BoardMethods.grid.forEach(function(row, index){
                   row.forEach(function(tile, index2){
                       result = result.map(function(result_row){
                           if(
                               result_row.x === index
                               && result_row.y === index2
                           ){
                               result_row.units = tile.units;
                           }
                           return result_row;
                       });

                   });
               });
               $.ajax({
                   method: "POST",
                   url: 'http://tilesuniverse:3000/',
                   data: {tiles: JSON.stringify(result), field: 'units'}
               })
               .done(function( result2 ) {
                   // console.log( result2 );
               });
           }
       });

    })();

    /**
     * Start the Game 
     *
     * @return void
     */
    BoardMethods.start = function(){
        BoardMethods.updateGrid();
        $('#whoseTurn').addClass(currentTeam)
        clearInterval(BoardMethods.heartBeat);
       BoardMethods.heartBeat = setInterval(function(){
            if(flag) {
               BoardMethods.pollServerForChanges();
            }
           
       }, 7000);
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
            flag = true;
            BoardMethods.getValidMoveTiles(row, column, tileTeam);
        }

        // Second click of a valid tile
        if(tileSelected && $($($('#board').find('.line')[row]).find('.column')[column]).hasClass('possibleMoveTiles')) {
            
            flag = false;
            tileSelected = false;
            
            BoardMethods.grid[row][column] = { units: [{team: currentTeam}], weather: false };

            $($($('#board').find('.line')[row]).find('.column')[column]).addClass(currentTeam).removeClass('unoccupied');
            
            $(originTile).removeClass('team1').removeClass('team2').addClass('unoccupied').removeAttr('id');

            //BATTLE
            if($($($('#board').find('.line')[row]).find('.column')[column]).hasClass(enemyTeam)) {
                BoardMethods.battle(row, column);
            } else {
                // Send off POST with results
                BoardMethods.sendResult(row, column, currentTeam);
            }

            BoardMethods.grid[$(originTile).attr('row')][$(originTile).attr('col')] = { units: [{team: 'unoccupied'}], weather: false };

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
    BoardMethods.sendResult = function(row, column, newTeam){
        // origin tile
        var originX = $(originTile).attr('row');
        var originY = $(originTile).attr('col');
        // target tile 
        var destinationX = $($($('#board').find('.line')[row]).find('.column')[column]).attr('row');
        var destinationY = $($($('#board').find('.line')[row]).find('.column')[column]).attr('col');

        $.post('http://tilesuniverse:3000/', {
            tiles: JSON.stringify([
                {x:originX, y:originY, units:[{team: 'unoccupied'}]},
                {x:destinationX, y:destinationY, units:[{team: newTeam}]}
             ]),
            field: 'units'
        })
            .done(function(data) {
console.log(data);
        
          });

            // $.ajax({
            //        method: "POST",
            //        url: 'http://tilesuniverse:3000/',
            //        data: {tiles: JSON.stringify(result), field: 'units'}
            //    })
            //    .done(function( result2 ) {
            //        // console.log( result2 );
            //    });
            // can delete the .done once verified.
   }

    /**
     * Return an Array of tiles which are valid moves
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
        
        var message = (winner == 'team1') ? "Blue Team wins" : "Red Team wins";
        BoardMethods.showBattleOutcome(team1Strength, team2Strength, message, weatherAffected);
        BoardMethods.updateTileToWinner(row, column, winner);

        BoardMethods.grid[row][column] = { units: [{team: winner}], weather: weatherAffected };
        BoardMethods.sendResult(row, column, winner);
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
        var player1messgae = '<p>Blue Team score: ' + team1Strength;
        var player2messagae = '<br>Red Team score: ' + team2Strength;
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
     */
    BoardMethods.copyTileStatusToDOM = function( row, column ){
        var current_board,
           current_line,
           current_column;

        var that = this;
        var state = that.getTileStatus(row, column);
        
        current_board = $('#board');
        current_line = current_board.find('.line')[row];
        current_column = $(current_line).find('.column')[column];

        $(current_column).attr('class','');
        $(current_column).addClass('column');
        $(current_column).addClass(state);

        if(BoardMethods.hasWeather(row, column)){
            $(current_column).addClass('weather');
        } else {
            $(current_column).removeClass('weather');
        }
    };

    // Hit server for events to update grid
    BoardMethods.pollServerForChanges = function() {
        $.get('http://tilesuniverse:3000/', function(result){
           
            if(result && tileSelected) {
                console.log('test');
                result.forEach(function(tile){

                    BoardMethods.updateGridFromServer(tile.x, tile.y, tile.units[0].team, tile.weather) 
                })
           }
            
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