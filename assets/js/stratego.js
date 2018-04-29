/*
tile {
    weather
}

game piece {
    is affected by weather
}

request {
    start tile
    target tile post state

}
*/

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
    BoardMethods.grid2 = [];

    var Tile = {
        units: [{team: 'unoccupied'}]
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
            BoardMethods.grid2.push([]);

            for(var j = 0; j < height; j++){
                BoardMethods.grid[i].push(Tile);
                BoardMethods.grid2[i].push(Tile);
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
            
            BoardMethods.grid[row][column] = { units: [{team: currentTeam}] };
            
            $($($('#board').find('.line')[row]).find('.column')[column]).addClass(currentTeam).removeClass('unoccupied');
            
            $(originTile).removeClass('team1').removeClass('team2').addClass('unoccupied').removeAttr('id');

            //BATTLE
            if($($($('#board').find('.line')[row]).find('.column')[column]).hasClass(enemyTeam)) {
                BoardMethods.battle(row, column);
            }

            BoardMethods.grid[$(originTile).attr('row')][$(originTile).attr('col')] = { units: [{team: 'unoccupied'}] };

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
            console.log(originX);
            console.log(originY);
            // target tile 
            var destinationX = $($($('#board').find('.line')[row]).find('.column')[column]).attr('row');
            var destinationY = $($($('#board').find('.line')[row]).find('.column')[column]).attr('col');
            console.log(destinationX);
            console.log(destinationY);

            // need to send as ?x=#&y=#&data=
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
        var message = (winner == 'team1') ? "Team 1 wins" : "Team 2 wins";
        BoardMethods.showBattleOutcome(team1Strength, team2Strength, message);
        BoardMethods.updateTileToWinner(row, column, winner);

        BoardMethods.grid[row][column] = { units: [{team: winner}] };
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

    BoardMethods.hasWeather = function(row, column){
        //returns true if weather is affecting the tile
    }

    BoardMethods.showBattleOutcome = function(team1Strength, team2Strength, message){
        
        outcomeText = '<p>Team 1 score: ' + team1Strength + 
        '<br>Team 2 score: ' + team2Strength + 
        '<br>' + message + '!</p>';
        

        $('#battleOutcome').html(outcomeText);
    }

    /**
     * Return the status of the specific cell
     */
    BoardMethods.getTileStatus = function(row, column){
        return this.grid[row][column].units[0].team;
    };

    /**
     * Will send the update of the board
     * 
     * @param integer line
     * @param integer column
     * @return $('#element')
     */
    BoardMethods.updateBoard = function(line, column){
        // send request with data from outcome of move


        // ***this.grid2[line][column] = !this.grid[line][column];
        // ***return $('#board');
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

    return BoardMethods;
};