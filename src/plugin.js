import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {
    "controls": false
};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

const judgeHandler = new videojs.EventTarget();

const vjsButton = videojs.getComponent('Button');


// Custom button that includes `vjs-judge-` prefix and adds handlers

class judgeButton extends vjsButton {
    constructor(player, options){
        super(player, options);
        var button = this;
        button.addClass('vjs-judge-button')
        judgeHandler.one("dispose_judge_components", function(){
            button.dispose();
        })
        judgeHandler.one("dispose_judge_buttons", function(){
            button.dispose();
        })        
    }
}

const vjsComponent = videojs.getComponent('Component');

class JudgeComponent extends vjsComponent {
    constructor(player, options){
        super(player, options);
        var component = this;
        judgeHandler.one("dispose_judge_components", function(){
            component.dispose();
        })
    }
}

videojs.registerComponent("JudgeComponent", JudgeComponent)

class JudgeEntry extends JudgeComponent {
    constructor(player, options){
        super(player, options);
        this.createdTimestamp = new Date().toISOString();
        this.winnerColor = null;
        this.sequenceChoice = null;
        this.winnerPointChoice = null;
        this.loserPointChoice = null;
    }

    setWinnerColor(color){
        this.winnerColor = color;
    }

    setSequence(sequence){
        this.sequenceChoice = sequence;
    }

    setWinnerPoint(point){
        this.winnerPointChoice = point;
    }

    setLoserPointChoice(point){
        this.loserPointChoice = point;
    }

    sendResults(){
        console.log('results');
    }

}

videojs.registerComponent("JudgeEntry", JudgeEntry)
// const entryTracker = new videojs.JudgeEntry

// Indicators on left/right sides of the screen indicating color of the fencer on that side
class ColorIndicator extends JudgeComponent {

    constructor(player, options){
        super(player, options)
        this.addClass('vjs-judge-test-color-indicator')
        if (options.side) {
            this.addClass(options.side);
        }
        if (options.color) {
            this.addClass("vjs-judge-color-indicator-" + options.color.name);
            let el = this.contentEl();
            el.setAttribute("style", 'background-color:#' + options.color.hex + ';')
            el.innerHTML = '<span class="vjs-judge-color-label">' + options.color.name + " fencer" + "</span";
        }
    }
}

// Initial start button
class JudgeStartButton extends judgeButton {
    constructor(player, options){
        super(player, options);
        this.controlText('Start Video')
        this.addClass('vjs-judge-start-button')
        this.addClass('vjs-judge-bottom-button')
    }

    handleClick(){
        judgeHandler.trigger('start_video')
    }
}

// Button used to call point
class PointButton extends judgeButton {
    constructor(player, options){
        super(player, options);
        this.controlText('Call Point')
        this.addClass('vjs-judge-point-button');
        this.addClass('vjs-judge-bottom-button');
    }

    handleClick(){
        judgeHandler.trigger('point_called');
    }

}

// Buttons used for displaying selection

class JudgeOptionButton extends judgeButton {
    constructor(player, options){
        super(player, options);
        this.buttonName = options.choice["name"]
        this.next_ui = options.choice["next_ui"];
        this.button_id = options.choice["id"];
        this.color_id = null;
        let el = this.contentEl();
        if (options.color != null){
            this.buttonName += " " + options.color["name"];
            el.setAttribute("style", 'background-color:#' + options.color["hex"] + ';')
            this.color_id = options.color.color_id;
        }
        this.controlText(this.buttonName);
        this.addClass('vjs-judge-option-button');
    }

    handleClick() {
        console.log("Judge Option clicked: " + this.button_id);
        if (options.choice["next_ui"] != undefined && options.choice["next_ui"]) {
            
        }

    }

}


class PointChoiceUI extends JudgeComponent {
    constructor(player, options) {
        super(player, options);
        this.options = options;

        if(this.options[""])

        var buttonColors = options.button_colors ? options.button_colors : options.indicator_colors
        if (this.options.point_judge_choices) {
            this.addHorizontalButtons(this.options.point_judge_choices);
        }
    }
}



/** Class representing a set of judge inputs **/
class SequenceChoiceUI extends JudgeComponent {

    /**
     * Create the UI.
     * @param {Player} player - The VideoJS Player object
     * @param {object} options - The full set of options passed to the player
     */


    constructor(player, options) {
        super(player,options);
        this.options = options;

        // Set button colors
        var buttonColors = options.button_colors ? options.button_colors : options.indicator_colors;
        console.log(options);
        var set = this.options["initial_choice_set"];
        var curSet = this.getChoices(set);
        var curSetType = curSet["set_type"];

        console.log(curSetType);

        switch(curSetType){
            case 'bothFightersExclusive':
                this.addBothFightersExclusive(curSet.choices, buttonColors);
                break;
            case 'singleFighterExclusive':
                this.addSingleFighterExlusive(curSet.choices, buttonColor);
                break;
            default:
                console.log('no matching choice found')
        }
        this.addClass('vjs-judge-option-set');
        var optionSet = this;
    }

    getChoices(choice_set){
        return this.options[choice_set]
    }

    addBothFightersExclusive(choices, buttonColors){
        var neutralChoices = choices.filter(choice => choice.neutral == true);
        var fighterChoices = choices.filter(choice => choice.neutral != true);
        this.addVerticalButtons(fighterChoices, buttonColors.left, "left");
        this.addVerticalButtons(fighterChoices, buttonColors.right, "right");
        this.addVerticalButtons(neutralChoices, null, "center");
    }

    addSingleFighterExclusive(choices, color){
        console.log('single exclusive');
        this.addHorizontalButtons(choices, color);
    }

    addVerticalButtons(choices, color, side) {
        var curSection = this.addChild("JudgeComponent");
        curSection.addClass("vjs-judge-vertical-button-set");
        curSection.addClass(side);
        console.log("addVerticalButtons");
        console.log(choices);
        console.log(choices.length);
        for (var i = 0; i < choices.length; i++){
            var curButton = curSection.addChild("JudgeOptionButton", {
                choice: choices[i],
                color: color
            })
        }
    }

    addHorizontalButtons(choices, color) {
        var curSection = this.addChild("JudgeComponent");
        curSection.addClass("vjs-judge-horizontal-button-set");
        for (var i = 0; i< choices.length; i++){
            var curButton = curSection.addChild("JudgeOptionButton", {
                choice: choies[i],
                color: color
            })
        }

    }

    addButtons() { 
        for (var i = 0; i < this.optionList.length; i++) {
            var curButton = this.addChild("JudgeOptionButton", {
                "button": this.optionList[i]
            })
        }
    }
}


videojs.registerComponent("JudgeStartButton", JudgeStartButton);
videojs.registerComponent("JudgeOptionButton", JudgeOptionButton);
videojs.registerComponent("ColorIndicator", ColorIndicator);
videojs.registerComponent("SequenceChoiceUI", SequenceChoiceUI)
videojs.registerComponent("PointButton", PointButton)


const setupStartOverlay = (player, options) => {
    var judge_ui = player.addChild('JudgeComponent')
    judge_ui.addClass("vjs-judge-bar")
    var startButton = judge_ui.addChild('JudgeStartButton')
    var rightIndicator = judge_ui.addChild('ColorIndicator', {
        "color": options.indicator_colors.right,
        "side": "right"
    })

    var leftIndicator = judge_ui.addChild('ColorIndicator', {
        "color": options.indicator_colors.left,
        "side": "left"
    })

true 
    return judge_ui

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

  var judge_ui;

  judgeHandler.one('load_new_video', function(){
    console.log('Loading new video');
    judgeHandler.trigger('dispose_judge_components')
    judge_ui = setupStartOverlay(player, options)
  })

  judgeHandler.one('start_video', function(){
    console.log('start button clicked');
    judgeHandler.trigger('dispose_judge_buttons')
    player.play();
    judge_ui.addChild("PointButton");
  })

  judgeHandler.one("point_called", function(){
    judgeHandler.off("video_ended");
    judgeHandler.trigger('dispose_judge_buttons')
    var timestamp = player.currentTime();
    console.log('point button clicked: ' + timestamp);

    setTimeout(function(){
        player.pause();
        player.addChild("SequenceChoiceUI", options)
        }, options.afterblow_delay)
    })

  judgeHandler.one("video_ended", function(){
    judgeHandler.off("point_called");
    judgeHandler.trigger('dispose_judge_buttons');
    player.addChild("SequenceChoiceUI", options)    
  })

  judgeHandler.one("request_target",function(){
    judgeHandler.trigger('dispose_judge_buttons')
    player.addChild("SequenceChoiceUI", options)
  })

  judgeHandler.one("end_judge", function(){
        console.log('judging over');
    })

  judgeHandler.trigger('load_new_video');

  player.one('ended', function(){
    judgeHandler.trigger('video_ended');
  })

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
