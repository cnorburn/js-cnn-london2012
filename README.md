CNN needed a live London 2012 widget on the home and sports pages.

It needed to display the following info:

	Current Medal Table
	Latest Result
	Next Event

The json feed was provided by a third party wrapped up in a function (jsonp) to allow cross domain.

This [file](olympic_widget.js) uses the Javascript Module Pattern to provide a set of callable public methods as well as some private helper methods

This [file](olympic_widget_test.js) provided an on screen test harness which could be dynamically injected into production to mock specific use case via some simple html elements

Please view the screengrabs to see what actually happened!

[Screen 1](London2012-1.png)

[Screen 2](London2012-2.png)

[Screen 3](London2012-3.png)
