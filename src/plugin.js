import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {
    "controls": false
};

const defaultJudgeOptions = [
    {
        "name":"clean_red",
        "trigger":"request_target"
    },
    {
        "name": "fail_red",
        "trigger":"request_target"
    },
    {
        "name": "double"
    },
    {
        "name": "fail_blue",
        "trigger":"request_target"
    },
    {
        "name": "clean_blue",
        "trigger":"request_target"
    },
    {
        "name": "did_not_see",
    }
]

const defaultTargetOptions = [
    {"name":"no_quality"},
    {"name":"quality"},
    {"name":"target"},
    {"name":"control"},
    {"name":"did_not_see"}
]

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;


const vjsButton = videojs.getComponent('Button');

class judgeButton extends vjsButton {
    constructor(player, options){
        super(player, options);
        var button = this;
        judgeModalHandler.one("dispose_judge_ui", function(){
            button.dispose();
        })
    }
}

const vjsComponent = videojs.getComponent('Component');

class judgeComponent extends vjsComponent {
    constructor(player, options){
        super(player, options);
        var component = this;
        judgeModalHandler.one("dispose_judge_ui", function(){
            component.dispose();
        })
    }
}

const judgeModalHandler = new videojs.EventTarget();


class JudgeStartButton extends judgeButton {

    constructor(player, options){
        super(player, options);
        this.controlText('Start Video')
        this.addClass('vjs-judge-start-button')
    }

    handleClick(){
        // var countDown = player.addChild('CountDown');
        judgeModalHandler.trigger('start_video')
    }
}

class PointButton extends judgeButton {

    constructor(player, options){
        super(player, options);
        this.controlText('Call Point')
        this.addClass('vjs-judge-point-button');
        console.log('point button loaded');
    }

    handleClick(){
        judgeModalHandler.trigger('point_called');
    }

}

class JudgeOptionButton extends judgeButton {

    constructor(player, options){
        super(player, options);
        this.buttonName = options.button["name"] ? options.button["name"] : "generic-option";
        this.buttonTrigger = options.button["trigger"] ? options.button["trigger"] : "end_judge";
        this.controlText(this.buttonName);
        this.addClass('vjs-judge-option-button');
        console.log("Judge option added: " + this.buttonName);
    }

    handleClick() {
        console.log("Judge Option clicked: " + this.buttonName);
        if(this.buttonTrigger){
            judgeModalHandler.trigger(this.buttonTrigger);
        }
    }

}

class CountDown extends judgeComponent {

    constructor(player, options){
        super(player, options);
        var curCount = options.count ? options.count : 3;
    }
}


class JudgeOptionSet extends judgeComponent {

    constructor(player, options) {
        super(player,options);
        this.optionList = options.optionList;
        console.log(this.optionList)
        if (this.optionList){
            this.addButtons();
        }
    }

    addButtons() { 
        for (var i = 0; i < this.optionList.length; i++) {
            var curButton = player.addChild("JudgeOptionButton", {
                "button": this.optionList[i]
            })
        }
    }
}


class ColorIndicator extends judgeComponent {

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

  judgeModalHandler.on('load_new_video', function(){
    console.log('Loading new video');
    judgeModalHandler.trigger('dispose_judge_ui')    
    setupStartOverlay(player, options)
  })

  judgeModalHandler.on('start_video', function(){
    console.log('start button clicked');
    judgeModalHandler.trigger('dispose_judge_ui')    
    console.log('video started');
    player.play();
    player.addChild("PointButton");
    //Add in logic to remove any existing overlays?
  })

  judgeModalHandler.on("point_called", function(){
    judgeModalHandler.trigger('dispose_judge_ui')    
    var timestamp = player.currentTime();
    console.log('point button clicked: ' + timestamp);
    player.pause();    
    player.addChild("JudgeOptionSet", {
        "optionList": defaultJudgeOptions
        })
    })

  judgeModalHandler.on("request_target",function(){
    judgeModalHandler.trigger('dispose_judge_ui')
    player.addChild("JudgeOptionSet", {
        "optionList": defaultTargetOptions
    })
  })

  judgeModalHandler.on("end_judge", function(){
        console.log('judging over');
        judgeModalHandler.trigger('dispose_judge_ui');
    })

  judgeModalHandler.trigger('load_new_video');

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
