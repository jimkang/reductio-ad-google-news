pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"

