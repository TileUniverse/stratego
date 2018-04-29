/*
grid
tile
teams
game piece
fighting
moving

grid {
    rows
    columns
}
tile {
    occupied
    game piece
    weather
}
game piece {
    team
    strength
    is flag
    is bomb
    is dead
    is affected by Game of Life
}
fighting {
    game piece 1
    game piece 2
    winner
}
moving {
    game piece
    target tile
    is able to move to target tile

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

    var currentTeam = 'team1';


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
        var Tile3 = jQuery.extend({}, Tile);
        Tile3.units = [{team: "team2"}];
        for (var i = width - 1; i >= 0; i--) {
            BoardMethods.grid[7][i] = Tile3;
            BoardMethods.grid[8][i] = Tile3;
            BoardMethods.grid[9][i] = Tile3;
        }
    }

    /**
     * build Abstract Grid
     * 
     @ @todo the original state of the cell will be random
     * @param integer width
     * @param integer height
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

        var tileTeam = this.grid[row][column].units[0].team

        if(!tileSelected && tileTeam != 'unoccupied') {
            BoardMethods.showSelectedTile(row, column);
            tileSelected = true;
            BoardMethods.getValidMoveTiles(row, column, tileTeam);
        }

        if(tileSelected && $($($('#board').find('.line')[row]).find('.column')[column]).hasClass('possibleMoveTiles')) {
            tileSelected = false;
            $($($('#board').find('.line')[row]).find('.column')[column]).addClass(currentTeam);

            if(currentTeam =='team1') {
                currentTeam = 'team2';
            } else if (currentTeam == 'team2') {
                currentTeam = 'team1';
            }

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

    /**
     * Return the status of the specific cell
     */
    BoardMethods.getTileStatus = function(line, column){
        return this.grid[line][column].units[0].team;
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