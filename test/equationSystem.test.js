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
    // new a
    // new Opperator("==", (a, b) => a - b),
    new Opperator(">", (a, b) => a > b),
    new Opperator("<", (a, b) => a < b),
    // new Opperator(">=", (a, b) => a >= b),
    // new Opperator("<=", (a, b) => a <= b),
];

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
    let num = value.match(/ *[0-9]+ */g);
    num = num === null? NaN: num[0];

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

/**
* 
* @param {string} chars 
* @param {void} execute 
*/
function Opperator(chars, execute) {
    this.chars = chars;
    this.execute = execute;
}

console.time();
console.log(parseEquation("6+4"));
console.timeEnd();

/*
it('unique number', () => {
    expect(parseEquation("9")).toBe(9);
});

it('simple equation', () => {
    expect(parseEquation("6+4")).toBe(10);
});

it('basic equation', () => {
    expect(parseEquation("6+4+1")).toBe(11);
});

it('basic opperation with parethese', () => {
    expect(parseEquation("(6+5)+1")).toBe(12);
});

it('complex equation', () => {
    expect(parseEquation("3+2*5")).toBe(13);
});

it('complex equation with parethese', () => {
    expect(parseEquation("(3+2)*5")).toBe(25);
});*/