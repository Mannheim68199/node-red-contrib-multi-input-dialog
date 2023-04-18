module.exports = function(RED) {
//    const ui = require('../../node_modules/node-red-dashboard/ui')(RED);
//    const  ui = require('../../node-red-dashboard/ui')(RED);
////    var ui = RED.require('node-red-dashboard')(RED);

    var ui = null;
    var line2class = {
        "one" : null,
        "two" : "md-2-line",
        "three" : "md-3-line"
    };

    // check required configuration
    function checkConfig(node, conf) {
        if (!conf ) {
            node.error(RED._("ui_multi-input-dialog.error.no-config"));
            return false;
        }
        return true;
    }

    function HTML(config) {
        var actionType = config.actionType;
        var allowHTML = config.allowHTML;
        var line_class = line2class[config.lineType];
        var classes = line_class ? [line_class] : [];
        var title = (allowHTML ? String.raw`<span ng-bind-html="item.title | trusted"></span>` : String.raw`{{item.title}}`);
        var desc = (allowHTML ? String.raw`<span ng-bind-html="item.description | trusted"></span>` : String.raw`{{item.description}}`);

/*        config.processInput = function(msg) {
            if (typeof(msg.value) != 'object') { return; }
            for ( var key in msg.value ) {
                if (!config.formValue.hasOwnProperty(key)) { continue; }
                for (var x in config.options) {
                    if ((config.options[x].type === "date" || config.options[x].type === "time") && config.options[x].value === key) {
                        msg.value[key] = new Date(msg.value[key]);
                    }
                    config.formValue[key] = msg.value[key];
                }
            }
        }*/
        config.sy = ui.getSizes().sy / 2;  // 13.6
        config.cy = ui.getSizes().cy;
        config.width = 6;
        config.height = config.splitLayout == true ? Math.ceil(config.options.length/2) : config.options.length;
        config.rowCount = config.splitLayout == true ? Math.ceil(config.options.length/2) : config.options.length;
        config.rowCount += config.label == '' ? 1 : 2
        config.rowCount += config.extraRows;
        config.rowHeight = (((config.rowCount -1) * config.sy) + (config.label == '' ? config.sy * 0.3 : 1.2 * config.sy) + ((config.rowCount - 1) * config.cy))/config.rowCount;
        config.options.forEach( oField => {oField.value = "";});
/*        var html = String.raw`<md-list>
            <md-list-item ng-repeat="item in dialog.fields track by $index">
                <div class="formElement layout-gt-sm-row" ng-class="{'formElementSplit':(dialog.splitLayout)}" layout-gt-sm="row" style="">
                    <md-input-container class="md-block md-auto-horizontal-margin flex" style="height:20px" flex="">
                        <label class="md-required" for="input_$index">{{item.label}}</label>
                        <input ng-model="dialog.fields[$index].value" ng-required="{{item.required}}" step="any" class="ng-pristine ng-untouched md-input ng-empty ng-valid-step ng-invalid ng-invalid-required" id="input_$index" required="required" aria-invalid="true">
                        <div class="md-errors-spacer"></div>
                    </md-input-container>
                </div>        
            </md-list-item></md-list>
        `; */
        var html = String.raw`<md-list>
<md-list-item ng-repeat="item in dialog.fields track by $index">
  <md-input-container class="md-block" style="height:10px" flex>
    <label ng-if="(item.type=='text' || item.type=='number' || item.type=='email' || item.type=='password' || item.type=='date' || item.type=='time') && item.label">{{item.label}}</label>
    <input ng-if="item.type=='text' || item.type=='email' || item.type=='password'" type="{{item.type}}"
        ng-model="dialog.fields[$index].value"
        ng-required="dialog.fields[$index].required">
    <input ng-if="item.type=='date'" type="{{item.type}}"
        ng-model="dialog.fields[$index].value"
        ng-required="dialog.fields[$index].required"
        placeholder="yyyy-mm-dd">
    <input ng-if="item.type=='time'" type="{{item.type}}"
        ng-model="dialog.fields[$index].value"
        ng-required="dialog.fields[$index].required"
        placeholder="HH:MM">
    <input ng-if="item.type=='number'" type="{{item.type}}"
        ng-model="dialog.fields[$index].value"
        ng-required="dialog.fields[$index].required"
        step="any">
    <md-switch ng-if="item.type=='switch'" md-no-ink ng-model="dialog.fields[$index].value">{{item.label}}</md-switch>
    <md-checkbox ng-if="item.type=='checkbox'" md-no-ink aria-label="Checkbox No Ink" ng-model="dialog.fields[$index].value"> {{item.label}}</md-checkbox>
  </md-input-container>
</md-list-item></md-list>
        `;
        return html;
    }

    function PopupNode(config) {
        try {
            console.log("NodeRED: PopupNode start");
            if (!ui) {
                ui = require('../../node_modules/node-red-dashboard/ui')(RED);
//                ui = require("./ui")(RED);
            }

            RED.nodes.createNode(this, config);

            var done = null;
            if (checkConfig(node, config)) {

                if (config.hasOwnProperty("displayTime") && (config.displayTime.length > 0)) {
                    try { this.displayTime = parseFloat(config.displayTime) * 1000; }
                    catch(e) { this.displayTime = 3000; }
                }
                this.position = "dialog";
                this.ok = config.submit;
                this.cancel = config.cancel;
                this.className = config.className;
                this.topic = config.topic;
                this.fields = config.options;
                this.sendall = true;
                this.raw = config.raw || true;
                this.fnConfirm = `function(res) {
                    this.config.msg.payload = this.config.ok;
                    let oResult = {};
                    this.config.fields.forEach( oField => {
                        oResult[oField.label] = oField.value;
                    });
                    this.config.msg.payload = oResult;
                    if (oResult === {}) { this.config.msg.payload = ""; }
                    this.events.emit({ id:this.config.id, value:this.config.msg });
                };`
                this.html = HTML(config);
                var node = this;

                done = ui.add({
                    node: node,
                    control: {},
                    storeFrontEndInputAsState: false,
                    forwardInputMessages: false,
                    beforeSend: function (msg) {
                        console.log("NodeRED: beforeSend start: " + JSON.stringify(msg.payload));
                        let m = {};
                        m.payload = msg.payload.payload;
                        m.topic = node.topic || m.topic;
                        return m;
                    }
                });

                node.on('input', function(msg, send, done) {
                    console.log("NodeRED: onInput: " + JSON.stringify(msg.payload) );
                    if (node.sendall === true) { delete msg.socketid; }
                    var dt = node.displayTime || msg.timeout * 1000 || 3000;
                    if (dt <= 0) { dt = 1; }
                    ui.emitSocket('show-toast', {
                        title: node.topic || msg.topic,
                        toastClass: node.className || msg.className,
                        message: msg.payload,
                        highlight: node.highlight || msg.highlight,
                        displayTime: dt,
                        position: node.position,
                        id: node.id,
                        dialog: true,
                        prompt: true,
                        ok: node.ok,
                        cancel: node.cancel,
                        socketid: msg.socketid,
                        raw: node.raw,
                        msg: msg,
                        fields: node.fields,
                        fnConfirm: node.fnConfirm,
                        fnCancel: "",
                        rowHeight: 27,
                        rowCount: 3,
                        splitLayout: false,
                        label: node.topic,
                        template: `<md-dialog md-theme="{{ dialog.theme || dialog.defaultTheme }}" aria-label="{{ dialog.ariaLabel }}" ng-class="dialog.css">
<md-dialog-content class="md-dialog-content" role="document" tabIndex="-1">
    <h2 class="md-title">{{dialog.title}}</h2>`
    + this.html +
    `<md-dialog-actions>
        <md-button ng-if="dialog.$type === \'confirm\' || dialog.$type === \'prompt\'"ng-click="dialog.abort()" class="md-primary md-cancel-button">{{ dialog.cancel }}</md-button>
        <md-button ng-click="dialog.hide()" class="md-primary md-confirm-button" md-autofocus="dialog.$type===\'alert\'" ng-disabled="dialog.required && !dialog.result">{{ dialog.ok }}</md-button>
    </md-dialog-actions>
</md-dialog>`
                    });
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        node.on("close", function() {
            if (done) {
                // finalize widget on close
                done();
            }
        });
    }
    RED.nodes.registerType("ui_multiInputDialog", PopupNode);
};
