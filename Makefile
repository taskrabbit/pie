.PHONY: clean all test watch document

PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files       := $(shell cat sources.txt)
amd_files          := src/amd/*.txt
deploy             := build/pie.js.min
debug              := build/pie.js
gzip               := build/pie.js.min.gz


all: clean $(debug) $(guide) $(deploy) $(guide_debug) document

$(deploy): $(debug)
	uglifyjs -cmo $(deploy) $(debug)
	gzip -c $(deploy) > $(gzip)

$(debug): $(source_files) $(amd_files)
	mkdir -p build
	cat src/amd/begin.txt $(source_files) src/amd/version.txt src/amd/end.txt > $(debug)

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

