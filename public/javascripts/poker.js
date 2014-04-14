(function(root) {
  Poker = root.Poker = {} || root.Poker;
  Poker.SUITS = ['Hearts', 'Clubs', 'Spades', 'Diamonds'];
  Poker.VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  Poker.VALUESTRINGS = {
        1 : 'Ace', 2 : 'Two', 3 : 'Three', 4 : 'Four', 5 : 'Five', 6 : 'Six', 
        7 : 'Seven', 8 : 'Eight', 9 : 'Nine', 10 : 'Ten', 11 : 'Jack', 12 : 'Queen',
		13 : 'King'
  }
  
  
  Game = Poker.Game = function(players) {
    var that = this;
	this.players = players;
	this.deck = Poker.newDeck();
	this.players.forEach(function(player) {
	  player.hand = that.draw(2);
	})
	this.draw(1);
	this.flop = this.draw(3);
	this.draw(1);
	this.turn = this.draw(1);
	this.draw(1);
	this.river = this.draw(1);
	this.board = this.flop.concat(this.turn).concat(this.river);
	this.pot = 0;
	this.currentBet = 0;
	this.phase = 0;
	this.currentPlayer = 0;
	this.numCalled = 1;
  }  
  Game.PHASES = ['Preflop', 'Flop', 'Turn', 'River', 'Resolve']
  Game.HANDS = {
	  'Royal Flush': 1, 'Straight Flush': 2, 'Four of a Kind': 3, 'Full House': 4, 
	  'Flush': 5, 'Straight': 6, 'Three of a Kind': 7, 'Two Pair': 8, 'One Pair': 9, 'High Card': 10
	}

  Game.prototype.draw = function(num) {
    var cards = [];
	for (var i = 1; i <= num; i++) {
      cards.push(this.deck.pop());
	}
	return cards;
  }
  
  Game.prototype.evaluateHand = function(pocket) {
    var hand = this.board.concat(pocket);
	var suitHash = new Object;
	var handHash = {
	  'Royal Flush': false, 'Straight Flush': false, 'Four of a Kind': false, 'Full House': false, 
	  'Flush': false, 'Straight': false, 'Three of a Kind': false, 'Two Pair': false, 'One Pair': false
	}
	
	function suitedCards(suit) {
      var cards = [];
	  hand.forEach(function(card) {
	    if (card.suit === suit) {
	      cards.push(card)
	    }
	  })
	  return cards;
    }
	
	runningCards = function(set) {
	  valHash = new Object;
	  for (var i = 1; i <= 14; i++) {
	    valHash[i] = [];
	  }
	  set.forEach(function(card) {
	    valHash[card.value].push(card);
		if (card.value == 1) {
		  valHash[14].push(card);
		}
	  })
	  var permRunners = [];
	  var tempRunners = [];
	  for (i = 1; i <= 14; i++) {
	    if (valHash[i].length > 0) {
		  tempRunners.push(valHash[i][0]);
		  if (tempRunners.length > 5) {
		    tempRunners.shift();
			permRunners = tempRunners;
		  } else if (tempRunners.length === 5) {
		    permRunners = tempRunners;
		  }
		} else {
		  tempRunners = [];
		}
	  }
	  if (permRunners.length === 5) {
	    handHash['Straight'] = true;
	    return permRunners;
	  }
	}
	
	var setCards = function() {
	  valHash = new Object;
	  hand.forEach(function(card) {
	    if (!valHash[card.value]) {
		  valHash[card.value] = 1;
		} else {
	      valHash[card.value] += 1;
		}
	  })
	  var setValue1 = 0;
	  var setValue2 = 0;
	  for (var value in valHash) {
	    if (valHash[value] === 4) {
		  handHash['Four of a Kind'] = true;
		  setValue1 = value;
		} else if (valHash[value] === 3) {
		  if (handHash['Three of a Kind']) {
		    handHash['Full House'] = true;
			if (val > setValue1 || val === 1) {
			  setValue2 = setValue1;
			  setValue1 = value;
			}
		  } else {
		    handHash['Three of a Kind'] = true;
		    if (handHash['One Pair']) {
		      handHash['Full House'] = true;
		      setValue2 = setValue1;
			  setValue1 = value;
		    } else {
		      setValue1 = value;
		    }
		  }
		} else if (valHash[value] === 2) {
		  if (handHash['Full House']) {
		    if (value > setValue2 || val === 1) {
			  setValue2 = value
			}
		  } else if (handHash['Three of a Kind']) {
		    handHash['Full House'] = true;
			setValue2 = value;
		  } else if (handHash['One Pair']) {
		    handHash['Two Pair'] = true;
			if (value > setValue1) {
			  setValue2 = setValue1;
			  setValue1 = value;
			} else {
			  setValue2 = value;
			}
		  } else if (handHash['Two Pair']) {
		    if (value > setValue1) {
			  setValue2 = setValue1;
			  setValue1 = value;
			} else if (value > setValue2) {
			  setValue2 = value;
			}
		  } else {
		    handHash['One Pair'] = true;
			setValue1 = value;
		  }
		}		  
	  }
	  return [setValue1, setValue2];
	}
	
	var highCard = function(set) {
	  var highCard = set[0];
	  set.forEach(function(card) {
	    if (card.value === 1) {
		  highCard = card;
		} else if (card.value > highCard.value && highCard.value != 1) {
		  highCard = card;
		}
	  })
	  return highCard;
	}
	
	
	var royalFlush = function(flushed) {
	  if (handHash['Straight'] && handHash['Flush']) {
	    var royalFlushCheck = {10: false, 11: false, 12: false, 13: false, 1: false};
		flushed.forEach(function(card) {
		  if (card.value === 1 || card.value >= 10) {
		    royalFlushCheck[card.value] = true;
	      }
		})
		for (var val in royalFlushCheck) {
		  if (!royalFlushCheck[val]) {
	        return;
	      }
		}
		handHash['Royal Flush'] = true
	  }
	}
	
	var getResult = function() {
	  for (var reveal in handHash) {
	    if (handHash[reveal]) {
		  return reveal;
	    }
      }
	}
	
	var runners	= runningCards(hand);
	var flushSuit = '';
	var flushedCards = [];
	var highFlush = '';
	Poker.SUITS.forEach(function(suit) {
	  suitHash[suit] = suitedCards(suit);
	  if (suitHash[suit].length >= 5) {
	    handHash['Flush'] = true;
		flushSuit = suit;
		highFlush = highCard(suitHash[suit])
		if (handHash['Straight']) {
		  var flushRuns = runningCards(suitHash[suit]);
		  if (flushRuns) {
	        handHash['Straight Flush'] = true;
			royalFlush(suitHash[suit])
          }
	    }
	  }
	})

	
	var setCards = setCards();
	
	var handType = getResult();
	switch (handType) {
	case 'Royal Flush':
	  return handType;
	  break;
	case 'Straight Flush':
	  return handType + ': ' + highFlush.valueString + ' high';
	  break;
	case 'Four of a Kind':
	  return handType + ': ' + Poker.VALUESTRINGS[setCards[0]] + 's';
	  break;
	case 'Full House':
	  return handType + ': ' + Poker.VALUESTRINGS[setCards[0]] + 's full of ' + Poker.VALUESTRINGS[setCards[1]] + 's';
	  break;
	case 'Flush':
	  return handType + ': ' + highFlush.valueString + ' high';
	  break;
	case 'Straight':
	  return handType + ': ' + runners[4].valueString + ' high';
	  break;
	case 'Three of a Kind':
	  return handType + ': ' + Poker.VALUESTRINGS[setCards[0]] + 's';
	  break;
	case 'Two Pair':
	  return handType + ': ' + Poker.VALUESTRINGS[setCards[0]] + 's and ' + Poker.VALUESTRINGS[setCards[1]] + 's';
	  break;
	case 'One Pair':
	  return handType + ': ' + Poker.VALUESTRINGS[setCards[0]] + 's';
	  break;
	default:
	  return 'High Card: ' + highCard(hand).valueString;
	  break;
	}
  }
  
  Card = Poker.Card = function(value, suit) {
    this.value = value;
	this.suit = suit;
	this.string = this.to_s();
	this.valueString = Poker.VALUESTRINGS[this.value];
	this.img = this.imgUrl();
  }
  
  Card.prototype.to_s = function() {
    return Poker.VALUESTRINGS[this.value] + ' of ' + this.suit
  }
  
  Card.prototype.imgUrl = function() {
    return Poker.VALUESTRINGS[this.value] + '_of_' + this.suit;
  }
  
  newDeck = Poker.newDeck = function() {
    var deck = [];
    Poker.SUITS.forEach(function(suit) {
	  Poker.VALUES.forEach(function(value) {
	    deck.push(new Poker.Card(value, suit))
	  })
	})
	for (var i = 1; i <= 5; i++) {
	  deck = deck.shuffle();
	}
	return deck;
  }
  
  Array.prototype.shuffle = function() {
    var that = this;
	var length = that.length
	var newArray = [];
    for (var i = 1; i <= length; i++) {
	  var ind = Math.round(Math.random() * (that.length - i))
	  newArray.push(that.splice(ind, 1)[0]);
	}
	return newArray;
  }
  
  Player = Poker.Player = function(name, socket) {
    this.name = name;
    this.stack = 1000;
    this.hand = [];
	this.room = '';
	this.socket = socket;
	this.currentBet = 0;
	this.game = '';
  }
  
  Player.prototype.bet = function(amt) {
    this.currentBet += amt;
    this.stack -= amt;
	this.game.pot += amt;
  }
  
})(this);