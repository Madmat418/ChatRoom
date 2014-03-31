(function(root) {
  Poker = root.Poker = {} || root.Poker;
  Poker.SUITS = ['Hearts', 'Clubs', 'Spades', 'Diamonds'];
  Poker.VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  Poker.VALUESTRINGS = {
        1 : 'Ace', 2 : 'Two', 3 : 'Three', 4 : 'Four', 5 : 'Five', 6 : 'Six', 
        7 : 'Seven', 8 : 'Eight', 9 : 'Nine', 10 : 'Ten', 11 : 'Jack', 12 : 'Queen',
		13 : 'King'
  }
  
  
  Game = Poker.Game = function(server) {
    this.deck = Poker.newDeck();
	this.board = this.draw(5);
	this.hand = this.draw(2);
  }  
  
  Game.prototype.draw = function(num) {
    var cards = [];
	for (var i = 1; i <= num; i++) {
      cards.push(this.deck.pop());
	}
	return cards;
  }
  
  Game.prototype.evaluateHand = function() {
    var hand = this.board.concat(this.hand);
    var valHash = new Hash([]);
	var suitHash = new Hash(0);
	var handHash = {
	  'Royal Flush': false, 'Straight Flush': false, 'Four of a Kind': false, 'Full House': false, 
	  'Flush': false, 'Straight': false, 'Three of a Kind': false, 'Two Pair': false, 'One Pair': false
	}
	
	suitedCards = function(suit) {
      var suitedCards = [];
	  hand.forEach(function(card) {
	    if (card.suit = suit) {
	      suitedCards.push(card)
	    }
	  }
	  return suitedCards;
    }
	
	runningCards = function() {
	  hand.forEach(function(card) {
	    valHash[card.value].push(card);
		if (card.value == 1) {
		  valHash[14].push(card);
		}
	  }
	  permRunners = [];
	  tempRunners = [];
	  for (var i = 1; i <= 14; i++) {
	    if(valHash[i].length > 0) {
		  tempRunners.push(valHash[i][0];
		  if (runners.length > 5) {
		    tempRunners.shift();
		  } else if (tempRunners.length == 5) {
		    permRunners = tempRunners
		  }
		} else {
		  runners = [];
		}
	  }
	  return permRunners
	}
	
	var setCards = function() {
	  valHash = Hash.new(0);
	  hand.forEach(function(card) {
	    valHash[card.value] += 1;
	  }
	  setValue1 = 0;
	  setValue2 = 0;
	  valHash.forEach(function(val, num) {
	    if (num === 4) {
		  handHash['Four of a Kind'] = true;
		  setValue1 = val;
		} else if (num === 3) {
		  handHash['Three of a Kind'] = true;
		  if (handHash['One Pair'] === true) {
		    handHash['Full House'] === true;
		    setValue2 = setValue1;
			setValue1 = val;
		  } else {
		    setValue1 = val;
		  }
		} else if (num >= 2) {
		  if (handHash[
		  } else if (handHash['One Pair'] === true) {
		    handHash['Two Pair'] = true;
			setValue2 = val;
		  } else {
		    handHash['One Pair'] = true;
			setValue1 = val;
		  }
		  if (handHash['Three of a Kind'] === true) {
		    handHash['Full House'] = true;
			setValue2 = val;
		  }
		}		  
	  }
	  return [setValue1, setValue2];
	}
	var flushSuit = ''
	Poker.SUITS.forEach(function(suit) {
	  suitHash[suit] = suitedCards(suit);
	  if (suitHash[suit].length >= 5) {
	    handHash['Flush'] = true;
		flushSuit = suit;
	}

	var runners	= runningCards();
	if (runners) {
	  handHash['Straight'] = true;
	}
	
	var sets
  }
  
  Card = Poker.Card = function(value, suit) {
    this.value = value;
	this.suit = suit;
	this.string = this.to_s();
  }
  
  Card.prototype.to_s = function() {
    return Poker.VALUESTRINGS[this.value] + ' of ' + this.suit
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
	console.log(newArray);
	return newArray;
  }
  
})(this);