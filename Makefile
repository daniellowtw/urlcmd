serve: 
	python -m SimpleHTTPServer || python -m http.server

extension:
	cp -r css examples js extension
	zip -r extension.zip extension

