/**
 * Created by ruben on 12/10/2016.
 */
var fs         = require('fs');

module.exports = fs.existsSync || function existsSync(filePath){
        try{
            fs.statSync(filePath);
        }catch(err){
            if(err.code == 'ENOENT') return false;
        }
        return true;
    };