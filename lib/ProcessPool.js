
var Processor = require("./Processor");
var _ = require("underscore");




var STATUS_IDLE = "IDLE";
var STATUS_RUNNING = "RUNNING";

// 半个小时，回收新增的线程
var timeout = 1800000;
var corePoolSize = 15;
var ProcessProxy = require("./ProcessProxy")

var ProcessorPool = function (options){


    var currentId = 0;
    var idlePool = [];
    var runningPool = [];
    var processorMapping = {};


    var init = function (){
        monitorError();
        recovery();
    }


    /* private */
    var createProcessor = function (obj){
        var p = {id : currentId++ , processor : new ProcessProxy() , status : obj.status || STATUS_IDLE , role : obj.role , createTime : new Date -0   };
        p.processor.__id__ = p.id;
        processorMapping[p.id] = p;
        bindProcessorEvent(p);

        return p;
    }

    var bindProcessorEvent = function (p){
        p.processor.destroy(function (){
            ProcessorPool.destroy(this);
        });
       /* p.processor.on("destroy" , function (){
            ProcessorPool.destroy(this);
        });*/
    }

    var monitorError = function (){
        process.on("exit" , function (){
            _.each(runningPool , function (value){
                value.destroy(true);
            });

            _.each(idlePool , function (value){
                value.destroy(true);
            });
        })
    }

    var idleProcessor = function (p){
        var processor = processorMapping[p.__id__];
        if(processor.status == STATUS_IDLE || processor.processor.isDead() ){
            return ;
        }else {
            var index = 0;
            for(var i = 0 ; i < runningPool.length ; i ++){
                if(runningPool[i].id == p.__id__){
                    index = i;
                    break;
                }
            }
            processor.status = STATUS_IDLE;
            processor.processor.wait();
            idlePool.push(runningPool.splice(index , 1)[0]);
        }
    }

    var recovery = function (){
        setInterval(function (){
            if( idlePool.length <= corePoolSize){
                return ;
            }
            var diff = idlePool.length - corePoolSize;


            for(var i = 0 ; i < diff ; i++){
                var value = idlePool.splice(0,1)[0];
                if(value){
                    value.processor.destroy(true);
                    logger.info("processor("+value.processor.__pid__+")  remove");
                }
            }


            //}, 1000 * 10 );
        },timeout); //15分钟，检测一次是否有多余的进程
    }

    ProcessorPool.createPool = function (options ){
        if(options ){
            corePoolSize = options.corePoolSize || 15;
            timeout = options.timeout || 1800000
        }



        for(var i= 0 ; i <corePoolSize ; i ++) {
            var p = createProcessor({});
          //  p.processor.wait();
            idlePool.push(p);
        }

        monitorError();
    }

    ProcessorPool.getProcessor = function (modulePath){
        var p;
        if(idlePool.length <=0 ){
            p = createProcessor({status : STATUS_RUNNING  } );
        }else {
            p = idlePool.splice(0,1)[0];
        }

        p.status = STATUS_RUNNING;
        runningPool.push(p);

       // p.processor.notify();

        p.processor.send({modulePath : modulePath})

        return p.processor;
    }


    /**
     * destroy processor
     * @param p
     */
    ProcessorPool.destroy = function (p){
        idleProcessor(p);
    }


    /**
     * return number of processor
     * @returns {number}
     */
    ProcessorPool.totalProcessors = function (){
        return runningPool.length + idlePool.length;
    }

    /**
     * return number of running processor
     * @returns {Number}
     */
    ProcessorPool.runningProcessors = function (){
        return runningPool.length;
    }

    /**
     * return number of idle processor
     */
    ProcessorPool.idleProcessors = function (){
        return idlePool.length;
    }


    init();

    return ProcessorPool;
}


module.exports = ProcessorPool();