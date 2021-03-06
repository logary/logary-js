.PHONY: build_and_test clean build publish release

build_and_test: clean build test

release: clean build test publish

test:
	yarn run test

clean:
	(cd packages/logary-browser && rm -rf dist)
	(cd packages/logary && rm -rf dist node_modules)
	(cd packages/logary-plugin-browser && rm -rf dist node_modules)
	(cd packages/logary-plugin-nextjs && rm -rf dist node_modules)
	(cd packages/logary-plugin-node && rm -rf dist node_modules)
	(cd packages/logary-plugin-react && rm -rf dist node_modules)

build:
	yarn lerna bootstrap
	yarn lerna link
	yarn build
	yarn build:browser

publish:
	yarn lerna publish
