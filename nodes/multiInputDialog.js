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
            var node = this;
            let sy = ui.getSizes().sy || 48;
            let cy = ui.getSizes().cy || 6;
            let fRowHeight = sy;
            let fHeight = fRowHeight * ((config.splitLayout == true) ? Math.ceil(config.options.length/2) : config.options.length);
            let fWidth = (config.splitLayout == true) ? 450 : 250;

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
                ui.emitSocket('show-dialog', {
                    title: config.name || msg.topic,
                    dialogClass: config.className,
                    message: msg.payload,
                    highlight: node.highlight || msg.highlight,
                    position: node.position,
                    id: node.id,
                    ok: config.submit,
                    cancel: config.cancel,
                    socketid: config.socketid,
                    msg: msg,
                    fields: config.options,
                    sy: sy,
                    cy: cy,
                    rowHeight: fRowHeight,
                    height: fHeight,
                    width: fWidth,
                    rowCount: ((config.splitLayout == true) ? Math.ceil(config.options.length/2) : config.options.length) + (config.topic == '') ? 1 : 2,
                    title: config.title || config.topic,
                    label: config.topic,
                    splitLayout: config.splitLayout || false,
                    dialogHeight: fHeight + 150,
                    dialogWidth: fWidth,
                    dialogContentHeight: fHeight + 100,
                    dialogContentWidth: fWidth - 50,
                    width: fWidth,
                    height: fHeight,
                    ariaLabel: config.ok + " or " + config.cancel,
                    formClass: config.splitLayout ? "formElementSplit" : "formElement"
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
