debugbrowser:
	node-inspector & && node --debug-brk index.js && chromium --new-window http://localhost:8080 &

debugtty:
	node debug index.js

deploy:
	jitsu deploy

run:
	node index.js

startdb:
	sudo /etc/init.d/mongodb start

test:
	mocha --ui bdd --require should --reporter dot tests/*.js
