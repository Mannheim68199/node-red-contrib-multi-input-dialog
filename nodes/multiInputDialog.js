module.exports = function(RED) {
    const ui = require('../../../node_modules/node-red-dashboard/ui')(RED);
//    const  ui = require('../../node-red-dashboard/ui')(RED);
////    var ui = RED.require('node-red-dashboard')(RED);

    function PopupNode(config) {
        console.log("NodeRED: PopupNode start");
        RED.nodes.createNode(this, config);
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
        var node = this;

        var done = ui.add({
            node: node,
            control: {},
            storeFrontEndInputAsState: false,
            forwardInputMessages: false,
            beforeSend: function (msg) {
                console.log("NodeRED: beforeSend start: " + JSON.stringify(msg.payload));
                m = { oInput: {} }
                node.fields.forEach( oField => {
                    m.oInput[oField.field] = oField.toString();
                })
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
                msg: msg
            });
        });

        node.on("close", function(done) {
            console.log("NodeRED: onClose");
            done();
        });
    }
    RED.nodes.registerType("ui_multiInputDialog", PopupNode);
};
