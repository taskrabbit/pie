.PHONY: clean all test watch document

PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files     := src/pie.js src/extensions/*.js src/util.js src/inheritance.js src/container.js src/model.js src/view.js src/simpleView.js src/services/*.js src/app.js
deploy           := build/pie.js.min
debug            := build/pie.js


all: clean $(debug) $(deploy) document

$(deploy): $(debug)
	uglifyjs -cmo $(deploy) $(debug)

$(debug):
	mkdir -p build
	cat $(source_files) > $(debug)

test: $(deploy)
	open specRunner.html

clean:
	rm -rf build

document: $(debug)
	docco -o docs/ $(debug)

watch: $(source_files)
	fswatch -o $^ | xargs -n1 -I{} make
