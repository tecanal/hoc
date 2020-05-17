# hoc
An Hour of Code activity powered by TeCanal Mosaic.

Play with the deployed version on [TeCanal](https://tecanal.org/hoc).

Created by [Rees Draminski](https://github.com/reesdraminski).

## Code
* [js/api.js](js/api.js): Mosaic, Tile, Player, and Color classes that constitute the Mosaic API for the user to create their art/games.
* [js/app.js](js/app.js): UI controls and functionality (CodeMirror setup, docs generation, code execution, etc).
* [js/sw.js](js/sw.js): The ServiceWorker that implements a cache-first approach to speed up load times.
* [js/hoc.js](js/hoc.js): Further Mosaic abstractions that are needed to make the Hour of Code more approachable.

## Content
* [data/lessons.json](data/lessons.json): Basic JavaScript instruction to get the user started with the basics of JavaScript and Mosaic.

## Dependencies
* [Esprima](http://esprima.org/): This is used to parse the AST of user code to do code instrumentation in order to detect and protect against infinite loops.
* [jQuery](https://jquery.com/): This is only for jQuery-resizable, hopefully I can find a vanilla implementation or write my own in the future.
* [jQuery-resizable](https://github.com/RickStrahl/jquery-resizable): This is used to make the resizable split panel view in the application.