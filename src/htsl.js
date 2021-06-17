const fs = require('fs');

const values = {};
const systemValues = {true: true, false: false, undefined: undefined, null: null, NaN: NaN};

const opperators = [
    // new Opperator("**", (a, b) => a ** b),
    new Opperator("*", (a, b) => a * b),
    new Opperator("/", (a, b) => a / b),
    new Opperator("%", (a, b) => a % b),
    new Opperator("+", (a, b) => a + b),
    new Opperator("-", (a, b) => a - b),
    // new Opperator("&&", (a, b) => a && b),
    // new Opperator("||", (a, b) => a || b),
    // new Opperator("!=", (a, b) => a - b),
    // new 
    // new Opperator("==", (a, b) => a - b),
    new Opperator(">", (a, b) => a > b),
    new Opperator("<", (a, b) => a < b),
    // new Opperator(">=", (a, b) => a >= b),
    // new Opperator("<=", (a, b) => a <= b),
];

const singleBalises = ["meta", "br"];

function requestHandler(req, res, config) {
    res.setHeader("Content-Type", "text/html");
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
                
                if (name === "if") {
                    i += balise.length+name.length+content.length+5;
                    
                    if (parseEquation(args[0]) === true) {
                        final += parseHTSL(content);
                    }else if (parseEquation(args[0]) !== false) {
                        return new Error(500, "Invalid argument: "+values[args[0]]+" :"+i);
                    }
                }else if (name === "define") {
                    if (args[0] === "system") {
                        if (args[1]) {
                            if (Object.entries(systemValues).map(a => a[0]).includes(args[1])) {
                                return new Error(500, "Cannot override the system variable \""+systemValues[args[1]]+"\" :"+i);
                            }else {
                                console.log(args[1]);
                                systemValues[args[1]] = parseEquation(parseHTSL(content));
                            }
                        }else {
                            return new Error(500, "Unable to define a variable called \"system\" "+values[args[0]]+" :"+i);
                        }
                    }else {
                        if (Object.entries(systemValues).map(a => a[0]).includes(args[0])) {
                            return new Error(500, "The variable "+args[0]+" is already used by a system variable :"+(i/*-3-content.length-args.join(' ').length*/));
                        }else {
                            values[args[0]] = parseEquation(parseHTSL(content));
                        }
                    }
                    i += balise.length+name.length+content.length+5;
                    
                }else if (name === "value") {
                    i += balise.length+name.length+content.length+5;
                    final += parseEquation(content);
                }else if (name === "debug") {
                    i += balise.length+name.length+content.length+5;
                    console.log(parseEquation(content));
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

// START OF THE PARSING VALUES PART

/**
* 
* @param {string} equation 
* @param {Opperator} opperator 
* @returns {string}
*/
function parseEquation(equation, opperatorIndex) {
    if (!opperatorIndex) {
        opperatorIndex = 0;
    }
    
    opperator = opperators[opperatorIndex];

    /*
    Meaning:
    a is before the equation
    b is the first element of the equation
    c is the second one
    d is after the equation
    */
    var a = '',
    b = '',
    c = '',
    d = ''
    equationCompletion = 0,
    action = null;
    
    for (let i = 0; i < equation.length; i++) {
        
        const cursorChar = equation[i];
        
        if (equationCompletion === 0) {
            if (cursorChar === "(") {
                let output = parseParentheseValue(i, equation);
                
                equationCompletion = 1;
                opperator = opperators[opperatorIndex];
                
                i = output.cursor;
                b += output.result;
            }else if (equation[i+1] === opperator.chars[0]) {
                // TODO fix this
                // to make the long opperator work

                if (opperator.chars.length > 1) {
                    let condition = false,
                    charPos = 1;
                    for (let n = i+2; n < opperator.chars.length; n++, charPos++) {
                        condition = condition && equation[array[n]] === opperator.chars[charPos];
                    }
                    if (condition) {
                        b += equation[i];
                        equationCompletion++;
                        i+=charPos;
                    }
                }else {
                    b += equation[i];
                    equationCompletion++;
                    i++;
                }
            }else if (opperators.map(a => a.chars[0]).includes(equation[i+1])) {
                // TODO replace the search with opperators.find instead of this un optimised thing
                // TODO make opperator longer than 1 char work
                a += b + equation.slice(i, i+2);
                b = "";
                i++;
            }else {
                b += equation[i];
            }
        }else if (equationCompletion === 1) {
            opperator = opperators[opperatorIndex];
            if (cursorChar === "(") {
                let output = parseParentheseValue(i, equation);
                
                c += output.result;
                
                i = output.cursor-1;
                equationCompletion++;
            }else if (opperator.chars[0] === equation[i+1]) {
                // AER8GUIHOJPEK¨ZL%KMLEJHDJOFIGUY9ROUEPZJKL?SMDKNBJFGURIEHOYUZPJLSM?NKDBJFIUGRYE890UOPZIKMLS?DNKBOFHUGIR
                if (opperator.chars.length > 1) {
                    // TODO make the long opperator work
                    let condition = false,
                    charPos = 1;
                    for (let n = i+2; n < opperator.chars.length; n++, charPos++) {
                        condition = condition && equation[array[n]] === opperator.chars[charPos];
                    }
                    if (condition) {
                        c += equation[i];
                        equationCompletion++;
                    }
                }else {
                    i++;
                    c += equation[i];
                    equationCompletion++;
                }
            }else {
                c += equation[i];
            }
        }else {
            d += equation[i];
        }
    }
    
    /*
    console.log("a:"+a);
    console.log("b:"+b);
    console.log("c:"+c);
    console.log("d:"+d);
        used for debugin
    */
    
    
    // TODO optimise this function so it only do the opperators it saw earlier in the equation
    // it would really make HTSL faster
    
    if (c !== '') {
        const result = opperator.execute(getValue(b), getValue(c));
        
        return d !== '' || a !== '' ? parseEquation(a+result+d, opperatorIndex+1) : result;
    }else if (a === '' && d === '') {
        return getValue(b);
    }
    
    if (a !== '' || d !== '') {
        return a !== '' || d !== '' ? parseEquation(a+b+d, opperatorIndex+1) : result;
    }
    
    
}

/**
* 
* @param {number} cursor 
* @param {string} equation 
* @returns {Object}
*/
function parseParentheseValue(cursor, equation) {
    let content = new String();
    let deepness = 0;
    
    for (let h = cursor; !(equation[h+1] === ')' && deepness === 0) && h < equation.length; h++) {
        const char = equation[h];
        
        if (char === ')') {
            deepness--;
        }
        
        if (deepness > 0) {
            content += char;
        }
        
        if (char === '(') {
            deepness++;
        }
    }
    
    cursor += content.length+2;
    
    if (content.length > 1) {
        return {result: parseEquation(content), cursor: cursor};
    }else {
        return {result: content, cursor: cursor};
    }
}

/**
* 
* @param {string} value 
* @returns {string}
*/
function getValue(value) {
    const num = value.match(/ *[0-9]+ */g)[0];
    if (Number.isFinite(num-0)) {
        if (num.length === value.length) {
            return num-0;
        }else {
            console.log(value +" is not a valid number");
            return systemValues["NaN"];
        }
    }else if (value.match(/("|').+("|')/g) !== null) {
        let obj = value.match(/("|').+("|')/g)[0];
        obj = obj.slice(1, obj.length-1);
        
        return obj;
    }else if (Object.entries(values).map(a => a[0]).includes(value)) {
        return values[value];
    }else if (Object.entries(systemValues).map(a => a[0]).includes(value)) {
        return systemValues[value];
    }
}

// END OF THE PARSING VALUES PART

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

// you thought I was going to add them all? heeee, might do it in the- No.
const ErrorTypes = {
    200: new ErrorType(200, "OK"),
    500: new ErrorType(500, "Internal Server Error"),
    404: new ErrorType(404, "File Not Found")
}

/**
* 
* @param {string} chars 
* @param {void} execute 
*/
function Opperator(chars, execute) {
    this.chars = chars;
    this.execute = execute;
}


function Value(type, value) {
    this.type = type;
    this.value = value;
}

function DataType() {
    this.expectedValues = function(...values) {
        this.possibleValues = values;
        this.hasRestrictedValues;
        return this;
    }
    
    this.range = function(min, max) {
        this.min = min;
        this.max = max;
        this.hasRestrictedRange = true;
        
        return this;
    }

    this.defaultValue = function(value) {
        this.hasDefaultValue = true;

        // 
        if (this.hasRestrictedValues && !this.possibleValues.includes(value)) {
            this.defaultValue = possibleValues[0];
        }else if (this.hasExpectedType && typeof value !== this.type) {
            this.hasDefaultValue = false;
        }else {
            this.defaultValue = value;
        }
        
        return this;
    }

    this.expectedType = function(type) {
        this.expectedType = type;
        this.hasExpectedType = true;
        
        return this;
    }
}

// these are bassically classes
const DataTypes = {
    string: new DataType().defaultValue(""),
    number: new DataType().range(-65536, 65536).defaultValue(0),
    boolean: new DataType().expectedValues(false, true).defaultValue(false),
    undefined: new DataType().expectedValues(undefined).defaultValue(undefined)
};

// passes over everything
module.exports = {
    requestHandler,
    parseHTSL
}