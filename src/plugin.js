import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {
    "controls": false
};

const defaultJudgeOptions = [
    "clean_red",
    "fail_red",
    "double",
    "fail_blue",
    "clean_blue",
    "did_not_see"
]

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;


const vjsButton = videojs.getComponent('Button');
const vjsComponent = videojs.getComponent('Component');


class JudgeStartButton extends vjsButton {

    constructor(player, options){
        super(player, options);
        this.controlText('Start Video')
        this.addClass('vjs-judge-start-button')
    }

    handleClick(){
        // var countDown = player.addChild('CountDown');
        console.log('start button clicked');
        player.play();
        player.addChild("PointButton");
        this.dispose();
    }
}

class PointButton extends vjsButton {

    constructor(player, options){
        super(player, options);
        this.controlText('Call Point')
        this.addClass('vjs-judge-point-button');
        console.log('point button loaded');
    }

    handleClick(){
        var timestamp = player.currentTime();
        console.log('point button clicked: ' + timestamp);        
        player.pause();
        player.addChild("JudgeOptionSet", {
            "optionList": defaultJudgeOptions
        })
        this.dispose();
    }

}

class JudgeOptionButton extends vjsButton {

    constructor(player, options){
        super(player, options);
        this.buttonName = options.buttonName ? options.buttonName : "generic-option"
        this.controlText(this.buttonName);
        this.addClass('vjs-judge-option-button');
        console.log("Judge option added: " + this.buttonName);
    }

    handleClick() {
        console.log("Judge Option clicked: " + this.buttonName);
    }

}

class CountDown extends vjsComponent {

    constructor(player, options){
        super(player, options);
        var curCount = options.count ? options.count : 3;
    }
}


class JudgeOptionSet extends vjsComponent {

    constructor(player, options) {
        super(player,options);
        this.optionList = options.optionList;
        console.log(this.optionList)
        if (this.optionList){
            this.addButtons();
        }
    }

    addButtons() { 
        console.log('hit');
        for (var i = 0; i < this.optionList.length; i++) {
            var curButton = player.addChild("JudgeOptionButton", {
                "buttonName": this.optionList[i]
            })
        }
    }
}


class ColorIndicator extends vjsComponent {

    constructor(player, options){
        super(player, options)
        this.addClass('vjs-judge-test-color-indicator')
        if (options.side) {
            this.addClass(options.side);
        }
        if (options.color) {
            this.addClass(options.color);
        }

    }

}

videojs.registerComponent("JudgeStartButton", JudgeStartButton);
videojs.registerComponent("JudgeOptionButton", JudgeOptionButton);
videojs.registerComponent("ColorIndicator", ColorIndicator);
videojs.registerComponent("CountDown", CountDown)
videojs.registerComponent("JudgeOptionSet", JudgeOptionSet)
videojs.registerComponent("PointButton", PointButton)


const setupStartOverlay = (player, options) => {
    var startButton = player.addChild('JudgeStartButton')

    var rightIndicator = player.addChild('ColorIndicator', {
        "color": options.colors.right, 
        "side": "right"
    })

    var leftIndicator = player.addChild('ColorIndicator', {
        "color": options.colors.left, 
        "side": "left"
    })

    startButton.on("dispose", function(){
        rightIndicator.dispose();
        leftIndicator.dispose();
    })

    startButton.on("click", function(){
        player.addChild('CountDown', {"count": 2})
    })

}


/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-judge-training');
  setupStartOverlay(player, options)
  


};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function judgeTraining
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const judgeTraining = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('judgeTraining', judgeTraining);

// Include the version number.
judgeTraining.VERSION = VERSION;

export default judgeTraining;
