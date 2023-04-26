module.exports = function(RED) {
    var ui = null;

    function PopupNode(config) {
        try {
            console.log("NodeRED: PopupNode start");
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
                    label: config.topic,
                    splitLayout: config.splitLayout || false,
                    dialogHeight: fHeight + 150,
                    dialogWidth: fWidth,
                    dialogContentHeight: fHeight + 100,
                    dialogContentWidth: fWidth - 50,
                    width: fWidth,
                    height: fHeight,
                    ariaLabel: config.ok + " or " + config.cancel,
                    formClass: config.splitLayout ? "formElement formElementSplit" : "formElement",
                    fnConfirm: `function(res) {
                        this.dialog.msg.payload = this.dialog.ok;
                        let oResult = {};
                        let bError = false;
                        this.dialog.fields.forEach( oField => {
                            if ( oField.required && !oField.value && oField.typ2 !== 'switch' ) {
                                bError = true;
                                console.log("Value missing for field: " + oField.label );
                            } else {
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
                            }
                        });
                        if (!bError) {
                            this.dialog.msg.payload = oResult;
                            if (oResult === {}) { this.dialog.msg.payload = ""; }
                            this.events.emit({ id: this.dialog.msg.id, value: this.dialog.msg });
                        }
                    }`,
                    fnSubmit: `function (msg) {
                        this.dialog.msg.payload = this.dialog.ok;
                        let oResult = {};
                        let bError = false;
                        this.dialog.fields.forEach( oField => {
                            if ( oField.required && !oField.value && oField.typ2 !== 'switch' ) {
                                bError = true;
                                console.log("Value missing for field: " + oField.label );
                            } else {
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
                            }
                        });
                        if (!bError) {
                            this.$mdDialog.hide();
                        }
                    }`,
                    fnStop: `function(event) {
                        if ((event.charCode === 13) || (event.which === 13)) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }`,
                    fnReset: `function () {
                        for (var x in dialog.fields) {
                            if (dialog.fields[x].type === "checkbox" || dialog.fields[x].type === "switch") {
                                dialog.fields[x].value = false;
                            }
                            else {
                                dialog.fields[x].value = "";
                            }
                        }
                        $scope.$$childTail.form.$setUntouched();
                        $scope.$$childTail.form.$setPristine();
                    }`
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
