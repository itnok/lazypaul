VERSION = 1.8.1.1
SHELL = /bin/bash
DOWNLOAD = ~/Sites/GitHub/lazypaul
JSMIN    = /usr/bin/jsmin

all: lazypaul minified latest

lazypaul: jquery.lazypaul.js
	cp jquery.lazypaul.js $(DOWNLOAD)/jquery.lazypaul-$(VERSION).js

minified: jquery.lazypaul.js
	cp jquery.lazypaul.min.js $(DOWNLOAD)/jquery.lazypaul-$(VERSION).min.js

latest: jquery.lazypaul.js jquery.lazypaul.min.js
	cp jquery.lazypaul.js $(DOWNLOAD)/jquery.lazypaul.js
	cp jquery.lazypaul.min.js $(DOWNLOAD)/jquery.lazypaul.min.js

