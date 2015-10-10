
var inherit = require("inherit");

var Processor = function (){

    var self = this ;
    process.on("message" , function (data){

            if (self[data.method]) {
                throw new Error("can not found method " + data.method);
            }

            var result = self[data.method].call(self, data.params);
            if(data.shouldReturn) {
                data.result = result;
                delete data.params;
                process.send( data )
            }
    });

}

Processor._path = __filename;
Processor.inherit = inherit;


module.exports = Processor;