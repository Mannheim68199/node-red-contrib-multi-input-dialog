module.exports = function(RED) {
//    const ui = require('../../node_modules/node-red-dashboard/ui')(RED);
//    const  ui = require('../../node-red-dashboard/ui')(RED);
////    var ui = RED.require('node-red-dashboard')(RED);

    var ui = null;

    function PopupNode(config) {
        try {
            console.log("NodeRED: PopupNode start");
            if (!ui) {
                ui = require('/home/node-red/.node-red/node-red-dashboard/ui')(RED);
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
                ui.emitSocket('show-dialog', {
                    title: node.topic || msg.topic,
                    toastClass: node.className || msg.className,
                    message: msg.payload,
                    highlight: node.highlight || msg.highlight,
                    displayTime: dt,
                    position: node.position,
                    id: node.id,
                    ok: node.ok,
                    cancel: node.cancel,
                    socketid: msg.socketid,
                    msg: msg,
                    fields: node.fields,
                    parameters: this.parameters,
                    raw: node.raw,
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
