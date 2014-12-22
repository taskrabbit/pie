.PHONY: clean all test watch document

PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files       := src/pie.js src/extensions/*.js src/mixins/*.js src/base.js src/app.js src/model.js src/view.js src/activeView.js src/ajax.js src/cache.js src/emitter.js src/errorHandler.js src/formView.js src/i18n.js src/list.js src/navigator.js src/notifier.js src/resources.js src/router.js src/validator.js
deploy             := build/pie.js.min
debug              := build/pie.js

guide_source_files := docs/guide/js/app.js docs/guide/js/gist.js docs/guide/js/highlight.js
guide_debug        := docs/guide/js/compiled.js


all: clean $(debug) $(guide) $(deploy) $(guide_debug) document

$(deploy): $(debug)
	uglifyjs -cmo $(deploy) $(debug)

$(debug):
	mkdir -p build
	cat $(source_files) > $(debug)

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

watch: $(source_files) $(guide_source_files)
	fswatch -o $^ | xargs -n1 -I{} make
