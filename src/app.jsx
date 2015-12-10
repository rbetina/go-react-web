const WHITE = 'WHITE';
const BLACK = 'BLACK';
const EMPTY = 'EMPTY';

const STONE_PLACED = 'STONE_PLACED';

let initialBoard = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const nonPendingBoard = (board) => {
  return board.map(row => {
      return row.map(stone => {
        return { pending: false, stone: stone }
      });
  });
}

const buildGame = ({ currentPlayer, board }) => {
  return {
    player: BLACK,
    currentPlayer: currentPlayer,
    board: nonPendingBoard(board),
  };
}

const initialGame = buildGame({
  currentPlayer: BLACK,
  board: initialBoard
});

const optimisticallyPlace = (game, { rowIndex, cellIndex }) => {
  if (game.player === game.currentPlayer) {
    game.board[rowIndex][cellIndex] = { pending: true, stone: game.player };
    game.currentPlayer = (game.currentPlayer === WHITE) ? BLACK : WHITE;
  }
  return game.board;
};

var App = React.createClass({
  getInitialState: function() {
    return this.props.game;
  },
  stonePlaced: function(rowIndex) {
    return (cellIndex) => {
      return () => {
        if (!this.state.pending) {
          const actionsEndpoint = "http://5eb530ce.ngrok.com/games/4/actions";
          const action = {
            type: STONE_PLACED,
            rowIndex: rowIndex,
            cellIndex: cellIndex,
            player: this.state.player
          };

          const game = this.state;
          const optimisticBoard = optimisticallyPlace(game, action);

          this.setState({ ...game, board: optimisticBoard, pending: true });

          let gameResponded = fetch(
            actionsEndpoint,
            { method: "POST", body: JSON.stringify(action) }
          );

          gameResponded.then(resp => resp.json()).then(response => {
            var nextGame = buildGame(response.game, false);
            this.setState(nextGame);
          })
        }
      };
    };
  },
  render: function() {
    return (
      <div className="app">
        <p>Current Player is {this.state.currentPlayer}</p>
        <Board stonePlaced={this.stonePlaced} board={this.state.board} pending={this.state.pending} />
      </div>
    )
  }
});

var Board = React.createClass({
  render: function() {
    return (
      <div className='board'>
        {this.props.board.map((row, rowIndex) =>
          <Row key={rowIndex} stones={row} onStonePlaced={this.props.stonePlaced(rowIndex)} />
        )}
      </div>
    );
  }
});

var Row = React.createClass({
  render: function() {
    return (
      <div className='row'>
        {this.props.stones.map((stone, cellIndex) =>
          <Cell key={cellIndex} stone={stone} onStonePlaced={this.props.onStonePlaced(cellIndex)} />
        )}
      </div>
    )
  }
});

var Cell = React.createClass({
  render: function() {
    return (
      <div className="cell" onClick={this.props.onStonePlaced} >
        <Stone stone={this.props.stone.stone} pending={this.props.stone.pending} />
      </div>
    )
  }
});

var Stone = React.createClass({
  render: function() {
    const { pending, stone } = this.props;
    return <div className={`stone ${stone.toLowerCase()} ${pending ? 'pending' : ''}`}></div>
  }
});

ReactDOM.render(
  <App game={initialGame} />,
  document.getElementById('container')
);

// set nocindent
// setl autoindent
// setl indentexpr=''
