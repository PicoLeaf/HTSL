const fs = require('fs');

// on second thought this is a little bit stupid
const isDefined = el => el !== undefined && el !== null

// these are bassically classes
const DataTypes = {
    string: new DataType("string", el => {
        if (isDefined(el)) {
            if (typeof el === "string") {
                return el;
            }
            // TODO return a error otherwise
        }
    }),
    number: new DataType("number", el => {
        if (isDefined(el)) {
            if (typeof el === "number" && (Number.isFinite(el) || el === NaN)) {
                return el;
            }
            // TODO return a error otherwise
        }else {
            return 0;
        }
    }),
    boolean: new DataType("boolean", el => {
        if (isDefined(el)) {
            if (typeof el === "boolean") {
                return el;
            }
            // TODO return a error otherwise
        }else {
            return false;
        }
    }),
    // the object type is litterally anything, it just holds data
    object: new DataType("object", (el) => el),
    undefined: new DataType("undefined", () => undefined)
};

const values = {};

const systemValues = {
    true: new Value(DataTypes.boolean, true),
    false: new Value(DataTypes.boolean, false),
    undefined: new Value(DataTypes.undefined, undefined),
    null: new Value(DataTypes.object, null),
    NaN: new Value(DataTypes.number, NaN),
};

// passes over everything
module.exports = {
    requestHandler,
    parseHTSL,
    getValue
}

const { parseOperation } = require('./operation');

const singleBalises = ["meta", "br"];

function requestHandler(req, res, config) {
    res.setHeader("Content-Type", "text/html; charset="+config.fileformat.toUpperCase());
    if (config.serverNameIncludedInHTTPHeaders) {
        res.setHeader("server", config.serverName);
    }
    
    let path = req.url;
    
    if (path.endsWith('/')) {
        path += "index.html";
    }
    
    path = config.path+path;
    
    fs.readFile(path, (err, data) => {
        if (err) {
            res.writeHead(ErrorTypes[404].num);
            res.end(`<h1>Error ${ErrorTypes[404].num}: ${ErrorTypes[404].text}</h1>`);
        }else {
            const lines = data.toString(config.fileformat);
            
            const final = parseHTSL(lines, path);
            
            if (final instanceof Error) {
                res.writeHead(final.type.num);
                res.end(`<h1>Error ${final.type.num}: ${final.type.text}</h1>${final.err}`);
                let lineInfo = getLine(87, lines);
                
                // a little messy, maybe I can clean this up later on
                let errorLine = lines.split(/\r?\n/)[lineInfo.lineIndex],
                trimmedErrorLine = errorLine.replace(/ {2,}/, ""),
                trimmedLength = errorLine.length - trimmedErrorLine.length;
                
                console.log(lineInfo.char);
                console.log(trimmedErrorLine);
                // WHY NO WORK LIKE IT SHOOULD
                console.log(" ".repeat(lineInfo.char-trimmedLength-(trimmedErrorLine.length-3))+"^");
                // ^ disgusting code over there, really ew, I don't even know why it doesn't WOOOORK
            }else {
                res.writeHead(200);
                res.end(final);
            }
        }
    });
}

function parseHTSL(lines, url) {
    var final = "";
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === "<") {
            var balise = getBalise(lines, i);
            var name = balise.split(" ")[0].toLowerCase();
            var args = balise.split(" ").slice(1);
            
            if (name === "!doctype" && args[0] && args[0] !== "htsl") {
                console.log("Warning: The DOCTYPE of the document "+  url +" is set to "+args[0]+" instead of htsl.");
            }
            // get the balise content
            
            if (!name.startsWith('/') && !name.startsWith('!') && !singleBalises.includes(name.toLowerCase())) {
                var content = "";
                
                for (let h = i+balise.length+2; !isEndingBalise(lines, h, name) && h < lines.length; h++) {
                    content += lines.charAt(h);
                }


                if (functions.map(a => a.name).includes(name)) {
                    functions.find(a => a.name).execute(new ArgumentManager(args), content);
                }else if (name === "if") {
                    i += balise.length+name.length+content.length+5;
                    
                    if (parseOperation(args[0]).value === true) {
                        final += parseHTSL(content);
                    }else if (parseOperation(args[0]).value !== false) {
                        throwError();
                        return new Error(500, "Invalid argument: "+values[args[0]]+" :"+i);
                    }
                }else if (name === "define") {
                    if (args[0] === "system") {
                        if (args[1]) {
                            if (Object.entries(systemValues).map(a => a[0]).includes(args[1])) {
                                return new Error(500, "Cannot override the system variable \""+systemValues[args[1]]+"\" :"+i);
                            }else {
                                console.log(args[1]);
                                systemValues[args[1]] = parseOperation(parseHTSL(content));
                            }
                        }else {
                            return new Error(500, "Unable to define a variable called \"system\" "+values[args[0]]+" :"+i);
                        }
                    }else {
                        if (Object.entries(systemValues).map(a => a[0]).includes(args[0])) {
                            return new Error(500, "The variable "+args[0]+" is already used by a system variable :"+(i/*-3-content.length-args.join(' ').length*/));
                        }else {
                            values[args[0]] = parseOperation(parseHTSL(content));
                        }
                    }
                    i += balise.length+name.length+content.length+5;
                    
                }else if (name === "value") {
                    i += balise.length+name.length+content.length+5;
                    final += parseOperation(content).value;
                }else if (name === "debug") {
                    i += balise.length+name.length+content.length+5;
                    console.log(parseOperation(content).value);
                }else if (name === "new") {
                    if (args[0] && DataTypes[args[0]]) {
                        i += balise.length+name.length+content.length+5;
                        final += DataTypes[args[0]].constructor(parseOperation(content).value);
                    }
                    // TODO throw a error when no arguments
                }else {
                    i += balise.length+2;
                    final += "<"+balise+">";
                }
            }else {
                if (name === "!doctype") {
                    var modifiedBalise = balise.slice(0, name.length)+" html";
                    
                    i += modifiedBalise.length+2;
                    final += "<"+modifiedBalise+">";
                }else {
                    i += balise.length+2;
                    final += "<"+balise+">";
                }
            }
        }
        final += lines.charAt(i);
    }
    
    return final;
}

function getLine(cursor, fullText) {
    // since we split here, the character \n is removed, it is needed to add it back
    // we do that later on in the "for" loop when we had + 1 to i
    const text = fullText.split(/\n/g);
    
    var i = 0;
    
    for (var lineIndex = 0; i < cursor; lineIndex++) {
        i += text[lineIndex].length + 1;
    }
    
    // reverts the last step of the "for" loop
    lineIndex--;
    
    return {lineIndex: lineIndex, char: i-cursor};
}

function getBalise(line, pointer) {
    var name = "";
    
    for (let i = pointer+1; line[i] !== ">" && i<line.length; i++) {
        name += line[i];
    }
    
    return name;
}

function isEndingBalise(line, pointer, expectedBalise) {
    if (line[pointer] === "<") {
        return getBalise(line, pointer) === "/"+expectedBalise;
    }
    return false;
}

/**
* 
* @param {string} value 
* @returns {Value}
*/
function getValue(value) {
    // console.log(value);

    let num = (value+"").match(/ *[0-9]+ */g);
    num = num === null? NaN: num[0];
    
    if (Number.isFinite(num-0)) {
        if (num.length === (value+"").length) {
            return new Value(DataTypes.number, num-0);
        }else {
            console.log(value +" is not a valid number");
            return systemValues["NaN"];
        }
    }else if ((value+"").match(/("|').*?\1/g) !== null) {
        // there is something immensely satisfying about regEx
        const obj = value.matchAll(/("|').*?\1/g).next().value[0];

        return new Value(DataTypes.string, obj.slice(1, obj.length-1));
    }else if (Object.entries(values).map(a => a[0]).includes(value)) {
        return values[value];
    }else if (Object.entries(systemValues).map(a => a[0]).includes(value)) {
        return systemValues[value];
    }
}

/**
 * 
 * @param {number} num 
 * @param {string} err 
 * @param {number} char 
 */
function Error(num, err, char) {
    this.type = ErrorTypes[num];
    this.err = err;
    this.char = char;
}

/**
 * 
 * @param {number} num 
 * @param {string} text 
 */
function ErrorType(num, text) {
    this.num = num;
    this.text = text;
}

const ErrorTypes = {
    200: new ErrorType(200, "OK"),
    500: new ErrorType(500, "Internal Server Error"),
    404: new ErrorType(404, "File Not Found")
}

function Value(type, value) {
    this.type = type;
    this.value = type.constructor(value);
}

/**
 * 
 * @param {string} name 
 * @param {Function} constructor 
 */
function DataType(name, constructor) {
    this.name = name;
    this.constructor = constructor;
}

/**
 * 
 * @param {string[]} args 
 */
function ArgumentManager(args) {
    this.args = args;

    this.getArgumentByName = function(argName) {
        this.args.find(o => o.toLowerCase() === argName.toLowerCase);
    }

    this.getArgumentByIndex = function(argIndex) {
        return args[argIndex];
    }
}

/**
 * 
 * @param {string} name 
 * @param {Function} content 
 * @param {Argument[]} arguments
 * @param {boolean} isHTSL 
 */
function Func(name, content, arguments, isHTSL) {
    this.name = name;
    this.content = content;
    this.arguments = arguments;
    this.isHTSL = isHTSL;

    /**
     * 
     * @param {ArgumentManager} argManager 
     * @param {string} voidContent 
     * @returns 
     */
    this.execute = function(argManager, voidContent) {
        console.log(this.content.toString());
        if (isHTSL) {
            // TODO make it work, this will not work since the parseHTSL function is not made to be a function environment, meaning that stuff such as <return> will not work
            return parseHTSL(this.content);
        }else {
            return this.content(argManager, voidContent);
        }
    }
}

/**
 * 
 * @param {string} name 
 * @param {boolean} optional 
 * @param {boolean} hasValue 
 * @param {DataType} type 
 */
function Argument(name, optional, hasValue, type) {
    this.name = name;
    this.optional = optional;
    this.hasValue = hasValue;
    this.type = type;
}

const functions = [
    new Func("debug", (args, content) => {
        if (args.getArgumentByName("client")) {
            return `<script>console.log(${ParseHTSL(content)});</script>`;
        }else {
            console.log(parseHTSL(content));
            return "";
        }
    }, [ new Argument("client", true) ]),
    // new Func(),
    // new Func(),
    // new Func(),
    // new Func()
];