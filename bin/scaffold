#!/bin/bash
# Generate various scaffolds for pages, components and modals
# 
# Usage:
#
#     sh ./bin/scaffold.sh modal punchcard
#
# Output:
#
#     Generating modals/punchcard/
#     punchcard.js
#     punchcard-modal.js
#     punchcard-style.less
#     punchcard-tmpl.handlebars

# Lowercase inputs
TYPE=$(echo $1 | tr '[:upper:]' '[:lower:]')
NAME=$(echo $2 | tr '[:upper:]' '[:lower:]')

# Copy templates and replace name references
if [ $TYPE = "page" ]; then
	echo Generating pages/$NAME/
	mkdir -p pages/$NAME
	cp bin/scaffolds/pages/index.js pages/$NAME/
	cp bin/scaffolds/pages/page.js pages/$NAME/$NAME-page.js
	cp bin/scaffolds/pages/style.less pages/$NAME/$NAME-style.less
	touch pages/$NAME/$NAME-tmpl.handlebars
	sed -i '' s/NAME/$NAME/g ./pages/$NAME/*
	ls -1 ./pages/$NAME
elif [ $TYPE = "modal" ]; then
	echo Generating modals/$NAME/
	mkdir -p modals/$NAME
	cp bin/scaffolds/modals/index.js modals/$NAME/
	cp bin/scaffolds/modals/modal.js modals/$NAME/$NAME-modal.js
	cp bin/scaffolds/modals/style.less modals/$NAME/$NAME-style.less
	touch modals/$NAME/$NAME-tmpl.handlebars
	sed -i '' s/NAME/$NAME/g ./modals/$NAME/*
	ls -1 ./modals/$NAME
elif [ $TYPE = "component" ]; then
	echo Generating components/$NAME
	mkdir -p components/$NAME
	cp bin/scaffolds/components/component.js components/$NAME/
	cp bin/scaffolds/components/main.js components/$NAME/$NAME.js
	cp bin/scaffolds/components/style.less components/$NAME/$NAME-style.less
	touch components/$NAME/$NAME-tmpl.handlebars
	sed -i '' s/NAME/$NAME/g ./components/$NAME/*
	ls -1 ./components/$NAME
else
	echo "usage: sh scaffold.sh [modal|component|page] [name]"
fi