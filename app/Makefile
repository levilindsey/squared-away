debugbrowser:
	node-inspector & && node --debug-brk index.js && chromium --new-window http://localhost:8080 &

debugtty:
	node debug index.js

test:
	mocha --ui bdd --require should --reporter dot tests/*.js

run:
	node index.js

startdb:
	sudo /etc/init.d/mongodb start
