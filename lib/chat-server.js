var socketio = require('socket.io');
var _ = require('lodash');
var poker = require('../public/javascripts/poker.js');
var guestnumber = 1;
var nicknames = {};
var namesUsed = [];
var currentRooms = {};
var players = {};
var playerRooms = {};

var assignGuestName = function(socket, io) {
  var guestName = 'Guest' + guestnumber;
  guestnumber += 1;
  nicknames[socket.id] = guestName;
  players[guestName] = new Poker.Player(guestName, socket);
}

var joinRoom = function(socket, io, room) {
  console.log('JOINING ROOM ', room);
  socket.join(room);
  currentRooms[socket.id] = room
  var name = nicknames[socket.id];
  io.sockets.in(room).emit('message', {
    text: (name + ' has joined ' + room + '.'),
	room: room
  });
  players[name].room = room;
  if (playerRooms[room]) {
    playerRooms[room].push(players[name]);
  } else {
    playerRooms[room] = [players[name]];
  }
  console.log(playerRooms);
}


var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
    io.sockets.in(data.room).emit('message', {
	  text: (nicknames[socket.id] + ': ' + data.text),
	  room: data.room
	})
  })
}

var currentPlayers = function(room) {
  var current = [];
  for (var name in players) {
    if (players[name].room === room) {
	  current.push(players[name]);
	}
  }
  return current;
}

var playPoker = function(socket, io){
  socket.on('poker', function (data) {
    var tablePlayers = playerRooms[data.room];
    var newHand = new Poker.Game(tablePlayers);
	data.chat.game = newHand;
  })
  
  socket.on('betPhase', function(data) {
	if (game.phase === 'preflop') {
	  
	}
	
	socket.emit('betting', {
	  player: playerRooms[data.room][activePlayer]
	}
  })
  
  socket.on('check', function(data) {
    data.game.numCalled += 1;
	checkCalls(data.game);
  })
  
  
  socket.on('raise', function(data) {
    data.game.currentBet += 50;
	data.game.pot += data.game.currentBet - (playerRooms[data.room][data.game.activePlayer].currentBet
	playerRooms[data.room][data.game.activePlayer].currentBet += data.game.currentBet - (playerRooms[data.room][data.game.activePlayer].currentBet
	data.game.numCalled = 1;
	checkCalls(data.game);
  })
  socket.on('call', function() {
    data.game.pot += data.game.currentBet - (playerRooms[data.room][data.game.activePlayer].currentBet
    playerRooms[data.room][data.game.activePlayer].currentBet += data.game.currentBet - (playerRooms[data.room][data.game.activePlayer].currentBet
	data.game.numCalled += 1;
	checkCalls(data.game)
  })
  socket.on('fold', function() {
    data.game.players.splice(data.game.currentPlayer, 1);
	checkCalls(data.game);
  })
  
  socket.on('nextPhase', function(data) {
    switch (data.game.PHASES[data.game.phase]) {
	case 'Preflop':
	  data.game.players.forEach(function(player) {
	    player.game = data.game;
	    player.socket.emit('revealPocket', {
	      cards: player.hand
	    })
	  })
	  currentPlayers(data.room)[game.activePlayer].bet(25);
	  game.activePlayer += 1;
	  currentPlayers(data.room)[game.activePlayer].bet(50)
	  game.activePlayer += 1;
	  socket.emit('betPhase', {
	    game: newHand
	  }
	  break;
	
	case 'Flop':
	  io.sockets.in(data.room).emit('renderFlop', {
	    cards: data.game.flop,
	    room: data.room
	  })
	  break;
	case 'Turn':
	  io.sockets.in(data.room).emit('renderTurn', {
	    card: data.game.turn,
	    room: data.room
	  })
	  break;
	
	case 'River':
	  io.sockets.in(data.room).emit('renderRiver', {
	    card: data.game.river,
	    room: data.room
	  })
	  break;
	
	case 'Resolve':
	  data.game.players.forEach(function(player) {
	    io.sockets.in(data.room).emit('message', {
	      text: player.name + ': ' + data.game.evaluateHand(player.hand),
		  room: data.room
	    })
	  })
	  break;
	}
  })
}

var checkCalls = function(game) {
  game.currentPlayer += 1;
  if (game.currentPlayer === game.players.length) {
    game.currentPlayer = 0;
  }
  if (game.numCalled = game.players.length()) {
    game.numCalled = 0;
	game.currentBet = 0;
	game.phase += 1;
	game.currentPlayer = 0;
	game.players.forEach(function(player) {
	  player.currentBet = 0;
	})
    socket.emit('nextPhase', {
	  game: game
	}
  } else {
    socket.emit('betting', {
	  player: playerRooms[data.room][game.currentPlayer],
	  game: game
    })
  }
}

var checkBet = function(socket, io) {
  socket.on('betting', function(data) {
    data.player.socket.emit('bettingPhase', {
	  player: data.player,
	  game: data.poker
	})
  })
}

var handleDisconnection = function(socket, io) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nicknames[socket.id]);
	delete namesUsed[nameIndex];
	var leavingRoom = currentRooms[socket.id];
	io.sockets.in(leavingRoom).emit('message', {
	  text: (nicknames[socket.id] + ' is leaving' + leavingRoom + '.'),
	  room: leavingRoom
	})
	delete players[nicknames[socket.id]];
	delete nicknames[socket.id];
	delete currentRooms[socket.id];
  })
}

var handleNameChangeRequests = function(socket, io) {
  socket.on('nicknameChangeRequest', function(name) {
    if (name.indexOf('Guest') === 0 ) {
	  socket.emit('nicknameChangeResult', {
	    success: false,
		message: 'Names cannot begin with "Guest".'
	  });
	} else if (namesUsed.indexOf(name) > -1) {
	  socket.emit('nicknameChangeResult', {
	    success: false,
		message: 'That name is taken.'
      });
    } else {
	  console.log(name);
      var room = currentRooms[socket.id];
      var previousName = nicknames[socket.id];
	  players[previousName].name = name;
      var previousNameIndex = namesUsed.indexOf(previousName);
      namesUsed.push(name);
      nicknames[socket.id] = name;
	  console.log(nicknames);
      delete namesUsed[previousNameIndex];
      io.sockets.in(room).emit('nicknameChangeResult', {
        success: true,
        text: (previousName + ' is now known as ' + name + '.'),
        name: name
      });
      io.sockets.emit('roomList', getRoomData(io));
    }	  
  })
}

var handleRoomChangeRequests = function(socket, io) {
  socket.on('roomChangeRequest', function(room) {
    var oldRoom = currentRooms[socket.id];
	socket.leave(oldRoom);
	joinRoom(socket, io, room);
	io.sockets.emit('roomList', getRoomData(io));
  })
}

var getRoomData = function(io){
  var roomHash = io.sockets.manager.rooms;
  var roomData = {};
  _.each(_.keys(roomHash), function(key){
    var socketIDs = roomHash[key];
	var usernames = _.map(socketIDs, function(id){
	  return nicknames[id];
	});
	roomData[key] = usernames;
  });
  return roomData;
}

var socketIOListen = function(server){
  var io = socketio.listen(server);
  
  io.sockets.on('connection', function(socket){
    console.log('received connection from: ', socket.id);
	assignGuestName(socket, io);
    joinRoom(socket, io, 'lobby');
    handleMessages(socket, io);
	playPoker(socket, io);
    handleNameChangeRequests(socket, io);
    handleRoomChangeRequests(socket, io);
    handleDisconnection(socket, io);
    io.sockets.emit('roomList', getRoomData(io));
  })
}

exports.socketIOListen = socketIOListen;