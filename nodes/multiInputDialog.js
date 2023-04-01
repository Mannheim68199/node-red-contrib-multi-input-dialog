module.exports = function(RED) {
    var ui = require('../../node-red-dashboard/ui')(RED);
//    var ui = RED.require('node-red-dashboard')(RED);

    function PopupNode(config) {
        console.log("NodeRED: PopupNode start");
//	    debugger;
        RED.nodes.createNode(this, config);
        if (config.hasOwnProperty("displayTime") && (config.displayTime.length > 0)) {
            try { this.displayTime = parseFloat(config.displayTime) * 1000; }
            catch(e) { this.displayTime = 3000; }
        }
        this.position = "dialog";
        this.highlight = config.highlight;
        this.ok = config.ok;
        this.cancel = config.cancel;
        this.className = config.className;
        this.topic = config.topic;
//        if (config.sendall === undefined) { this.sendall = true; }
//        else { this.sendall = config.sendall; }
	    this.sendall = true;
        this.raw = config.raw || true;
        var node = this;

        // var noscript = function (content) {
        //     if (typeof content === "object") { return null; }
        //     content = '' + content;
        //     content = content.replace(/<.*cript.*/ig, '');
        //     content = content.replace(/.on\w+=.*".*"/g, '');
        //     content = content.replace(/.on\w+=.*\'.*\'/g, '');
        //     return content;
        // }

        var done = ui.add({
            node: node,
            control: {},
            storeFrontEndInputAsState: false,
            forwardInputMessages: false,
            beforeSend: function (msg) {
                console.log("NodeRED: beforeSend start: " + JSON.stringify(msg.payload));
//		        debugger;
                var m = msg.payload.msg;
                m.topic = node.topic || m.topic;
                return m;
            }
        });

        node.on('input', function(msg, send, done) {
		    console.log("NodeRED: onInput: " + JSON.stringify(msg.payload) );
            if (node.sendall === true) { delete msg.socketid; }
            var dt = node.displayTime || msg.timeout * 1000 || 3000;
            if (dt <= 0) { dt = 1; }
            //msg.payload = noscript(msg.payload);
            //msg.payload += " Hallo";
            //send(msg);
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
