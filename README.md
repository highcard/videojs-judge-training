# videojs-judge-training

IN PROGRESS. NON-FUNCTIONAL.
Judge training overlays and functionality

## Installation

```sh
npm install --save videojs-judge-training
```

## Usage

To include videojs-judge-training on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-judge-training.min.js"></script>
<script>
  var player = videojs('my-video');

  player.judgeTraining();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-judge-training via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-judge-training');

var player = videojs('my-video');

player.judgeTraining();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-judge-training'], function(videojs) {
  var player = videojs('my-video');

  player.judgeTraining();
});
```

## License

MIT. Copyright (c) Toby Hall &lt;toby.m.hall@gmail.com&gt;


[videojs]: http://videojs.com/
