.PHONY: clean all test watch document

PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files       := $(shell cat sources.txt)
amd_files          := src/amd/*.txt
deploy             := build/pie.js.min
debug              := build/pie.js
gzip               := build/pie.js.min.gz

guide_source_files := docs/guide/js/app.js docs/guide/js/gist.js docs/guide/js/highlight.js
guide_debug        := docs/guide/js/compiled.js


all: clean $(debug) $(guide) $(deploy) $(guide_debug) document

$(deploy): $(debug)
	uglifyjs -cmo $(deploy) $(debug)
	gzip -c $(deploy) > $(gzip)

$(debug): $(source_files) $(amd_files)
	mkdir -p build
	cat src/amd/begin.txt $(source_files) src/amd/version.txt src/amd/end.txt > $(debug)

$(guide_pie): $(debug)
	cp $(debug) $(guide_pie)

$(guide_debug): $(guide_source_files)
	cat $(guide_source_files) > $(guide_debug)

test: $(deploy)
	open specRunner.html

spec: $(deploy)
	open specRunner.html

clean:
	rm -rf build

document: $(debug)
	docco -o docs/annotated/ $(debug)
	node docs/docco-index.js

watch: $(source_files) $(amd_files) $(guide_source_files)
	fswatch -o $^ | xargs -n1 -I{} make

