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

// Operation parser:

function parseOperation(operation) {
    // pretty much the same parenthese parser as before, expect it is the first thing runned
    
    let parsedOperation = "";
    const operationLength = operation.length;

    const charsOnlyOpperators = opperators.map(a => a.chars[0]);
    let opperatorsIndex = [];
    
    for (let i = 0; i < operationLength; i++) {

        if (operation[i] === "(") {
            let deepness = 0;
            let paretheseContent = "";
            
            for (let h = i; !(operation[h] === ")" && deepness === 0) && h < operationLength; h++) {
                const char = operation[h];
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

            parsedOperation += parseOperation(paretheseContent);

            // the +2 is for the two parentheses
            i += paretheseContent.length+2;

        }
        parsedOperation += operation[i] ?? "";

        if (charsOnlyOpperators.includes(operation[i])) {
            opperatorsIndex.push(charsOnlyOpperators.indexOf(operation[i]));
        }
    }
    
    // I'm wondering if this is more optimised than
    // parsedOperation.split().foreach
    const parsedOperationLength = parsedOperation.length;
    
    const parsedOpperators = opperators.filter((a , i) => opperatorsIndex.includes(i));
    const parsedCharsOnlyOpperators = parsedOpperators.map(a => a.chars);

    console.log("parsedOperation: "+ parsedOperation);
    
    var a = "",
        b = "",
        c = "",
        d = "";
    
        parsedOpperators.forEach(opperator => {
        // c and d are the rest of the operation
        a = "", b = "", c = "", d = "";
        
        for (let i = 0; i < parsedOperationLength; i++) {
            const char = parsedOperation[i];
            
            if (char === opperator.chars[0]) {
                c = parsedOperation.slice(0, i-a.length);

                for (let h = i+1; !parsedCharsOnlyOpperators.includes(parsedOperation[h]) && h < parsedOperationLength; h++) {
                    b += parsedOperation[h];
                    if (parsedCharsOnlyOpperators.includes(parsedOperation[h+1])) {
                        d = parsedOperation.slice(h+1, parsedOperationLength);
                    }
                }
                console.log("a:"+a);
                console.log("b:"+b);
                console.log("c:"+c);
                console.log("d:"+d);
                if (c !== "" || d !== "") {
                    parsedOperation = parseOperation(c + opperator.execute(getValue(a), getValue(b)) + d);
                    
                    // holly mushroom, seems like a terrible idea
                    // might cause infinite recursion

                    // UPDATE: it does only when my code is bad, so it should be fine... right?
                    // could be enhanced by moving the cursor to the start of the operation instead, could produce a infinite loop instead 
                }else {
                    parsedOperation = opperator.execute(getValue(a), getValue(b));
                }
            }else if (parsedCharsOnlyOpperators.includes(char)) {
                a = "";
            }else {
                a += char;
            }
        }
    });
    
    return getValue(parsedOperation);
}

console.time();
console.log(parseOperation("6+4+1"));
console.timeEnd();

// MONOLOGUE OF THE SOFTWARE DEVELOPER THAT REALISES THAT HIS OPTIMISATIONS (that he spent days on) ARE SLOWER:
// 9 ms, about 2-1 ms slower than the other one
// why is it slower than the other??
// is recursion faster?
// but I optimised it so much more!?
// is it because of the fact that the thing loops once for the parenthese, and then to calculate the values?
// instead of one big loop
// it could make sense

/*
it('unique number', () => {
    expect(parseOperation("9")).toBe(9);
});

it('simple operation', () => {
    expect(parseOperation("6+4")).toBe(10);
});

it('basic operation', () => {
    expect(parseOperation("6+4+1")).toBe(11);
});

it('basic opperation with parethese', () => {
    expect(parseOperation("(6+5)+1")).toBe(12);
});

it('complex operation', () => {
    expect(parseOperation("3+2*5")).toBe(13);
});

it('complex operation with parethese', () => {
    expect(parseOperation("(3+2)*5")).toBe(25);
});

it('operation with spaces', () => {
    expect(parseOperation("3 +2 *5")).toBe(13);
});

it('string manipulation', () => {
    expect(parseOperation(' "Hello"+" world" ')).toBe("Hello world");
});

it('string manipulation 2', () => {
    expect(parseOperation(' "Hello"+\' world\' ')).toBe("Hello world");
});

it('Incorrect string manipulation', () => {
    expect(parseOperation(' "Hello"-3 ')).toBe(NaN);
});

it('Number & string manipulation', () => {
    expect(parseOperation(' "1"+1 ')).toBe("11");
});*/