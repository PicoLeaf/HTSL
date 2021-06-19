const fs =  require('fs');
const http = require('http');
const { requestHandler } = require('./htsl');


// getting the config
const configFormat = new Config({
    path: new Field('string', './htdocs'),
    host: new Field('string', 'localhost'),
    port: new Field('number', 8000).restrictLength(4),
    fileformat: new Field('string', 'utf-8'),
    serverName: new Field('string', 'NodeJS.htslserver'),
    serverNameIncludedInHTTPHeaders: new Field('boolean', true)
});

const configPath = './config.json';
const oldConfigPath = './old_config.json'

var config = {};

// this sucks, cause it passes over the config each time a page is loaded
const server = http.createServer((req, res) => {
    requestHandler(req, res, config);
});

startServer();


function startServer() {
    fs.readFile(configPath, (err, data) => {
        if (err && err.code === 'ENOENT') {
            console.log('missing config files, creating it...');
            
            config = createConfigFiles();
            
            console.log(config);
            
            server.listen(config.port, config.host, () => {
                console.log("server started at http://"+config.host+":"+config.port);
            });
        }else {
            try {
                // I know I shouldn't really doing it this way but it work, so...
                var text = JSON.parse(data.toString());
            } catch (error) {
                console.log("invalid config file, json is malformed, creating a new config file...");
                
                var text = createConfigFiles();
            }
            
            if (configFormat.isValid(text)) {
                config = text;
                
                server.listen(config.port, config.host, () => {
                    console.log("server started at http://"+config.host+":"+config.port);
                });
            }else {
                console.log("Incorect config file, deleting the old one...");
                
                deprecateOldConfigFile();
                config = createConfigFiles();
                
                server.listen(config.port, config.host, () => {
                    console.log("server started at http://"+config.host+":"+config.port);
                });
            }
        }
    });
}

function createConfigFiles() {
    let defaultConfig = configFormat.getDefaultConfig();
    
    fs.writeFile(configPath, defaultConfig, (err) => {
        if (err) {
            console.log('Unable to create config file, aborting...');
            console.error(err);
            
            process.exit();
        }
    });
    
    console.log('done!')
    return JSON.parse(defaultConfig);
}

function deprecateOldConfigFile() {
    fs.access(oldConfigPath, err => {
        if (!err) {
            fs.rmSync(oldConfigPath);
        }
    });
    fs.renameSync(configPath, oldConfigPath);
}

function Config(config) {
    this.config = config;
}

Config.prototype.getDefaultConfig = function() {
    // I know I could use some JSON.stringify stuff, but it seems simplier and more flexible to do it this way
    
    let json = new String();
    
    json += "{\r\n";
    
    const Entries = Object.entries(this.config);
    
    // I can't quite choose between forEach or for on this one, lets go for foreach since it is apparently more optimised
    Entries.forEach((field, i) => {
        json += `\t"${field[0]}": ${JSON.stringify(field[1].defaultData)}${i !== Entries.length-1? ',':''}\r\n`;
    });
    
    json += "}";
    
    return json;
}

Config.prototype.isValid = function(config) {
    const Entries = Object.entries(this.config);
    
    for (let i = 0; i < Entries.length; i++) {
        const field = Entries[i];
        const object = config[field[0]];
        
        if (typeof object !== field[1].type) {
            // TODO give a error object with more info in it
            return false;
        }else if (field[1].hasRestrictedLength) {
            if (typeof object === "number") {
                // the object+"" to transform it to string is kinda dirty but I forgot how to do it properly
                if (!((object+"").length <= field[1].minLength && (object+"").length >= field[1].maxLength)) {
                    return false;
                }
            }else if (!(object.length <= field[1].minLength && object.length >= field[1].maxLength)) {
                return false;
            }
        }
    }
    
    return true;
}


/**
 * 
 * @param {string} type 
 * @param {*} defaultData 
 */
 function Field(type, defaultData) {
    this.type = type;
    this.defaultData = defaultData;
    
    this.restrictLength = function(minLength, maxLength) {
        this.minLength = minLength;
        this.maxLength = maxLength ?? minLength;
        this.hasRestrictedLength = true;
        
        return this;
    }

    this.range = function(min, max) {
        this.min = min;
        this.max = max;
        this.hasRestrictedRange = true;
        
        return this;
    }
}