module.exports = function(RED) {
    var ui = null;

    function PopupNode(config) {
        try {
            if (!ui) {
                ui = RED.require('node-red-dashboard/ui')(RED);
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
                    let m = {};
                    m.payload = msg.payload.payload;
                    m.topic = node.topic;
                    return m;
                }
            });

            node.on('input', function(msg, send, done) {
                if (node.sendall === true) { delete msg.socketid; }
                config.options.forEach( oField => {oField.value = "";});
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
                    label: config.topic,
                    splitLayout: config.splitLayout || false,
                    dialogHeight: fHeight + 150,
                    dialogWidth: fWidth,
                    dialogContentHeight: fHeight + 100,
                    dialogContentWidth: fWidth - 50,
                    width: fWidth,
                    height: fHeight,
                    ariaLabel: config.ok + " or " + config.cancel,
                    formClass: config.splitLayout ? "formElement formElementSplit" : "formElement"
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
    RED.nodes.registerType("ui_dialog", PopupNode);
};
