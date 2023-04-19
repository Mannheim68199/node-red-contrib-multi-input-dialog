module.exports = function(RED) {
//    const ui = require('../../node_modules/node-red-dashboard/ui')(RED);
//    const  ui = require('../../node-red-dashboard/ui')(RED);
////    var ui = RED.require('node-red-dashboard')(RED);

    var ui = null;

    function HTML(config) {

        let sy = ui.getSizes().sy;  // 13.6
        let cy = ui.getSizes().cy;
        let rowHeight = sy; //50; //(((rowCount -1) * sy) + (config.topic == '' ? sy * 0.3 : 1.2 * sy) + ((rowCount - 1) * cy))/rowCount;
        let height = rowHeight * ((config.splitLayout == true) ? Math.ceil(config.options.length/2) : config.options.length);
        let width = (config.splitLayout == true) ? 450 : 250;
        let rowCount = (config.splitLayout == true) ? Math.ceil(config.options.length/2) : config.options.length;
        rowCount += config.topic == '' ? 1 : 2
        config.options.forEach( oField => {oField.value = "";});
        config.parameters = {
            "label": config.topic,
            "splitLayout": config.splitLayout || false,
            "sy": sy,
            "cy": cy,
            "dialogHeight": height + 150,
            "dialogWidth": width,
            "dialogContHeight": height + 100,
            "dialogContWidth": width - 50,
            "width": width,
            "height": height,
            "rowHeight": rowHeight,
            "rowCount": rowCount
        };
        let formClass = config.splitLayout ? "formElementSplit" : "formElement";
        let html = String.raw`<form name ="form" style="margin-top:0px" class="ng-pristine ng-valid-step ng-invalid ng-invalid-required" style="left: 0px; top: 0px;">
<div class="` + formClass + `" ng-class="{'formElementSplit':(dialog.parameters.splitLayout)}" layout-gt-sm="row" ng-repeat="item in dialog.fields track by $index" style="height: {{ dialog.parameters.rowHeight }}px">
  <md-input-container class="md-block md-auto-horizontal-margin flex" flex>
    <label ng-if="(item.type=='text' || item.type=='number' || item.type=='email' || item.type=='password' || item.type=='date' || item.type=='time')  &amp;&amp; item.label">{{item.label}}</label>
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
</div></form>`;
        /*        let html = String.raw`<md-list>
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
        `; */
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
                    switch (oField.type) {
                        case "time":
                            let dDateTime = new Date(oField.value);
                            oResult[oField.label] = dDateTime.toLocaleString().substring(10,15);
                            break;
                        case "date":
                            let dDate = new Date(oField.value);
                            dDate.setHours(dDate.getHours()+12);
                            oResult[oField.label] = dDate.toISOString().substring(0,10) || "";
                            break;
                        default:
                            oResult[oField.label] = oField.value;
                    }
                });
                this.config.msg.payload = oResult;
                if (oResult === {}) { this.config.msg.payload = ""; }
                this.events.emit({ id:this.config.id, value:this.config.msg });
            };`
            this.html = HTML(config);
            this.parameters = config.parameters || {};
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
                    m.topic = node.topic;
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
                    msg: msg,
                    fields: node.fields,
                    fnConfirm: node.fnConfirm,
                    parameters: this.parameters,
                    raw: node.raw,
                    template: `<md-dialog md-theme="{{ dialog.theme || dialog.defaultTheme }}" aria-label="{{ dialog.ariaLabel }}" ng-class="dialog.css" style="height: {{ dialog.parameters.dialogHeight }}px; width: {{ dialog.parameters.dialogWidth }}px">
<md-dialog-content class="md-dialog-content nr-dashboard-form" role="document" tabIndex="-1" style="left: 0px; top: 0px; height: {{ dialog.parameters.dialogContHeight }}px; width: {{ dialog.parameters.dialogContWidth }}px">
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
