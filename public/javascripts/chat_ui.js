(function(root) {
  var ChatApp = root.ChatApp = (root.ChatApp || {});
  var socket = io.connect();
  var SUITS = ['Hearts', 'Clubs', 'Spades', 'Diamonds'];
  var VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  var VALUESTRINGS = {
        1 : 'Ace', 2 : 'Two', 3 : 'Three', 4 : 'Four', 5 : 'Five', 6 : 'Six', 
        7 : 'Seven', 8 : 'Eight', 9 : 'Nine', 10 : 'Ten', 11 : 'Jack', 12 : 'Queen',
		13 : 'King'
  }
  
  var images = {};
  SUITS.forEach(function(suit) {
    VALUES.forEach(function(value) {
	  var img = new Image();
	  img.src = '/assets/' + VALUESTRINGS[value] + '_of_' + suit + '.jpg';
	  images[VALUESTRINGS[value] + '_of_' + suit] = img;
	})
  })
  
  var escapeDivText = function(text) {
    return $('<div></div>').text(text);
  }
  
  var processInput = function (chatApp) {
    var text = $('#send-message').val();
	if(text[0] === '/'){
	  chatApp.processCommand(text.slice(1));
	} else {
	  chatApp.sendMessage(text);
	}
	$('#send-message').val('');
  }
  
  var updateRoomList = function(roomData){
    $('.room-listings').empty();
	$.each(roomData, function(room, userList){
	  if (room.length > 0) {
	    var roomListing = $('<div></div>').addClass('room-listing');
		roomListing.append($('<h3></h3>').text(room));
		var usersUL = $('<ul></ul>');
		$.each(userList, function(i, username){
		  usersUL.append($('<li></li>').text(username));
		});
		roomListing.append(usersUL);
		$('.room-listings').append(roomListing);
	  }
	});
  }
  
  var hideButtons = function() {
    $('#check').style.visibility = 'hidden';
	$('#call').style.visibility = 'hidden';
	$('#raise').style.visibility = 'hidden';
	$('#fold').style.visibility = 'hidden';
  }
  
  $(document).ready(function() {
    var chatApp = new ChatApp.Chat(socket);
	var ctx = document.getElementById('my_canvas').getContext('2d');
	socket.on('message', function(message) {
	  var newElement = escapeDivText(message);
	  $('#chat-messages').prepend(escapeDivText(message.text));
	})
	socket.on('nicknameChangeResult', function(result) {
	  if (result.success){
	    $('#chat-messages').append(escapeDivText(result.text))
	  }
	});
	socket.on('roomList', function(roomData){
	  updateRoomList(roomData);
	});
	socket.on('renderFlop', function(data) {
	  for (var i = 0; i <= 2 ; i++) {
	    ctx.drawImage(images[data.cards[i].img] , (i * 80) + (ctx.canvas.width / 2) - 200, (ctx.canvas.height / 2) - 50);
	  }      
	})
	socket.on('renderTurn', function(data) {
	  ctx.drawImage(images[data.card[0].img], (40 + (ctx.canvas.width / 2)), (ctx.canvas.height / 2) - 50);
	})
	socket.on('renderRiver', function(data) {
	  ctx.drawImage(images[data.card[0].img], (120 + (ctx.canvas.width / 2)), (ctx.canvas.height / 2) - 50);
	})
	socket.on('revealPocket', function(data) {
	  ctx.drawImage(images[data.cards[0].img], 400, 500)
	  ctx.drawImage(images[data.cards[1].img], 480, 500)
	})
	socket.on('bettingPhase', function(data) {
	  $('#fold').style.visibility = 'visible';
	  if (data.player.currentBet === data.game.currentBet) {
	    $('#check').style.visibility = 'visible';
	  } else {
	    $('#call').style.visibility = 'visible';
	  }
	  $('#raise').style.visibility = 'visible';
	})
	$('#fold').click(function() {
	  chatApp.fold();
	})
	$('#check').click(function() {
	  chatApp.check();
	})
	$('#raise').click(function() {
	  chatApp.raise();
	})
	$('#call').click(function() {
	  chatApp.call();
	})
	$('.send-form').submit(function(e) {
	  e.preventDefault();
	  processInput(chatApp);
	  return false;
	});
	$('#play-poker').click(function() {
	  console.log('button');
	  chatApp.startPoker();
	})
  });
})(this);