const singleBalises = ["meta", "br"];

function evalHTSL(lines, url) {
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


                if (macros.map(a => a.name).includes(name)) {
                    i += balise.length+name.length+content.length+5;
                    const result = macros.find(a => a.name === name).execute(new ArgumentManager(args), content);
                    final += result !== undefined? result.value : "";
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
    values = {};

    return final;
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
 * @param {string[]} args 
 */
 function ArgumentManager(args) {
    this.args = args;

    this.getArgumentByName = function(argName) {
        return this.args.find(o => o.toLowerCase() === argName.toLowerCase());
    }

    this.getArgumentByIndex = function(argIndex) {
        return args[argIndex];
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

/**
 * 
 * @param {string} name 
 * @param {Function} content 
 * @param {Argument[]} args
 * @param {boolean} isHTSL 
 */
 function Macro(name, content, args, isHTSL) {
    this.name = name;
    this.content = content;
    this.args = args;
    this.isHTSL = isHTSL;

    /**
     * 
     * @param {ArgumentManager} argManager 
     * @param {string} voidContent 
     * @returns {Value}
     */
    this.execute = function(argManager, voidContent) {
        if (isHTSL) {
            // TODO make it work, this will not work since the parseHTSL function is not made to be a function environment, meaning that stuff such as <return> will not work
            return evalHTSL(this.content);
        }else {
            return this.content(argManager, voidContent);
        }
    }
}

const macros = [
    new Macro("debug", (args, content) => {
        console.log(evalHTSL(solveOperation(content).value));
    }),
    new Macro("value", (args, content) => {
        return solveOperation(content);
    }),
    new Macro("if", (args, content) => {
        content = content.split("<then>");

        if (content[0] && content[1]) {
            if (solveOperation(content[0]).value === true) {
                return new Value(DataTypes.string, content[1]);
            }
        }
    }),
];

it('html parsing', () => {
    expect(evalHTSL("<h1></h1>")).toBe("<h1></h1>");
});