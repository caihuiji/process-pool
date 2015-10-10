/**
 * Created by chriscai on 2015/10/9.
 */


var _ = require("underscore");
var events = require('events');
var childProcess = require("child_process");


var ProcessProxy = function (Worker  ){
    this._process = childProcess.fork("./ProcessorWrap" , [Worker._path]);
    this.eventEmitter = new events.EventEmitter();


    var Processor = require(Worker._path );
    var count = 1 ;
    var waitingCallback = {};
    var self = this;
    _.forEach(new Processor).forEach(function (key , value){
        if(_.isFunction(value)){

            self[key] =  function (params , callback){
                ++ count
                if(_.isFunction(params)){
                    callback = params;
                    params={};
                }

                !!callback && (waitingCallback[count + ""] = callback);

                this._sendMessage({method : key , params : params || {} , shouldReturn : !!callback , _id_ : count })
            };
        }
    });

    this._process.on("message" , function (data){
        if(waitingCallback[data._id_]){
            waitingCallback[data._id_].call(self ,data )
            delete data._id_;
        }else {
            self.eventEmitter.emit(data.method , data.params);
        }
    })
}


ProcessProxy.prototype = {

    _sendMessage : function (data){
        this._process.send("message" , data);
    },

    destroy : function (isKill){
        isKill && this._process.kill();

        this._process.removeAllListeners();
        this.eventEmitter.emit("destroy");

        isKill && this.eventEmitter.emit("deal");
    },

    on : function (key , cb){
        var self = this;
        this.eventEmitter.on(key , function (){
            cb.apply(self,arguments);
        })
    }

}


module.exports = ProcessProxy ;