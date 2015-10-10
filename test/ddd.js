/**
 * Created by chriscai on 2015/10/10.
 */


var childProcess = require("child_process");


var process = childProcess.fork("./bb.js");

process.send("fuck")

console.log("ddd.js" , new Date - 0)