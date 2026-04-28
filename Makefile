outputDir = "./pages"


all: generate_pages

copies:
	bin/page-copies $@


generate_pages:
	bin/generate-pages
