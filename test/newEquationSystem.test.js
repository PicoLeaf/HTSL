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
* @param {string} chars 
* @param {void} execute 
*/
function Opperator(chars, execute) {
    this.chars = chars;
    this.execute = execute;
}

/**
* 
* @param {string} value 
* @returns {string}
*/
function getValue(value) {
    console.log(value);

    let num = (value+"").match(/ *[0-9]+ */g);
    num = num === null? NaN: num[0];
    
    if (Number.isFinite(num-0)) {
        if (num.length === (value+"").length) {
            return num-0;
        }else {
            console.log(value +" is not a valid number");
            return systemValues["NaN"];
        }
    }else if ((value+"").match(/("|').+("|')/g) !== null) {
        let obj = value.match(/("|').+("|')/g)[0];
        obj = obj.slice(1, obj.length-1);
        
        return obj;
    }else if (Object.entries(values).map(a => a[0]).includes(value)) {
        return values[value];
    }else if (Object.entries(systemValues).map(a => a[0]).includes(value)) {
        return systemValues[value];
    }
}

// equation parser:

function parseEquation(equation) {
    // pretty much the same parenthese parser as before, expect it is the first thing runned
    
    let parsedEquation = "";
    const equationLength = equation.length;

    const charsOnlyOpperators = opperators.map(a => a.chars[0]);
    let opperatorsIndex = [];
    
    for (let i = 0; i < equationLength; i++) {
        if (equation[i] === "(") {
            let deepness = 0;
            let paretheseContent = "";
            
            for (let h = i; !(equation[h] === ")" && deepness === 0) && h < equationLength; h++) {
                const char = equation[h];
                console.log(char);
                
                if (char === ")") {
                    deepness--;
                }
                
                if (deepness > 0) {
                    paretheseContent += char;
                }
                
                if (char === "(") {
                    deepness++;
                }
                
            }
            
            console.log("paretheseContent: "+ paretheseContent);

            parsedEquation += parseEquation(paretheseContent);

            // the +2 is for the two parentheses
            i += paretheseContent.length+2;

        }
        parsedEquation += equation[i] ?? "";

        if (charsOnlyOpperators.includes(equation[i])) {
            opperatorsIndex.push(charsOnlyOpperators.indexOf(equation[i]));
        }
    }
    
    // I'm wondering if this is more optimised than
    // parsedEquation.split().foreach
    const parsedEquationLength = parsedEquation.length;
    
    const parsedOpperators = opperators.filter((a , i) => opperatorsIndex.includes(i));
    const parsedCharsOnlyOpperators = parsedOpperators.map(a => a.chars);

    console.log("parsedEquation: "+ parsedEquation);
    
    var a = "",
        b = "",
        c = "",
        d = "";
    
        parsedOpperators.forEach(opperator => {
        // c and d are the rest of the equation
        a = "", b = "", c = "", d = "";
        
        for (let i = 0; i < parsedEquationLength; i++) {
            const char = parsedEquation[i];
            
            if (char === opperator.chars[0]) {
                console.log("ITS THE RIGHT ONE!")
                c = parsedEquation.slice(0, i-1);
                finished = true;
                for (let h = i+1; !parsedCharsOnlyOpperators.includes(parsedEquation[h]) && h < parsedEquationLength; h++) {
                    b += parsedEquation[h];
                    if (parsedCharsOnlyOpperators.includes(parsedEquation[h+1])) {
                        d = parsedEquation.slice(h+1, parsedEquationLength);
                    }
                }
                console.log("a:"+a);
                console.log("b:"+b);
                console.log("c:"+c);
                console.log("d:"+d);
                if (c !== "" || d !== "") {
                    // holly mushroom, seems like a terrible idea
                    // might cause infinite recursion
                    parsedEquation = parseEquation(c + opperator.execute(getValue(a), getValue(b)) + d);
                }else {
                    parsedEquation = opperator.execute(getValue(a), getValue(b));
                }
            }else if (parsedCharsOnlyOpperators.includes(char)) {
                a = char;
            }else {
                a += char;
            }
        }
    });
    
    return getValue(parsedEquation);
}

console.time();
console.log(parseEquation("1+1"));
console.timeEnd();

// MONOLOGUE OF THE SOFTWARE DEVELOPER THAT REALISE THAT HIS OPTIMISATIONS (that he spent days on) ARE SLOWER:
// about 9 ms, about 2-1 ms slower than the other one
// why is it slower than the other??
// is recursion faster?
// but I optimised it so much more!?
// is it because of the fact that the thing loops once for the parenthese, and then to calculate the values?
// instead of one big loop
// it could make sense

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