PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files     := src/pie.js src/extensions/*.js src/h.js src/m.js src/baseView.js src/services/*.js src/app.js
deploy           := build/pie.js.min
debug            := build/pie.js


all: clean $(debug) $(deploy)

$(deploy): $(debug)
	uglifyjs -cmo $(deploy) $(debug)

$(debug):
	mkdir -p build
	cat $(source_files) > $(debug)

test: $(deploy)
	open specRunner.html

clean:
	rm -rf build
