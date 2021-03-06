module.exports = (getValue) => {
    /**
    * 
    * @param {string} chars 
    * @param {void} execute 
    */
    function Operator(chars, execute) {
        this.chars = chars;
        this.execute = execute;
    }
    
    // the 2 characters long operator are commented out, simple because those aren't implemented yet
    // the fact that there is .value each time make it a pain to read! All according to plan
    // TODO find a ingenious way to clean it up, like using typeof to get the type
    // TODO also implement type restriction were only certain type can be opperated
    const operators = [
        // new Operator("**", (a, b) => a.value ** b.value),
        new Operator("*", (a, b) => a.value * b.value),
        new Operator("/", (a, b) => a.value / b.value),
        new Operator("%", (a, b) => a.value % b.value),
        new Operator("+", (a, b) => {
            if (a.type.name === "string" || b.type.name === "string") {
                return "\""+a.value + b.value+"\"";
            }else {
                return a.value + b.value;
            }
        }),
        new Operator("-", (a, b) => a.value - b.value),
        // new Operator("&&", (a, b) => a.value && b.value),
        // new Operator("||", (a, b) => a.value || b.value),
        // new Operator("!=", (a, b) => a.value - b.value),
        // new Operator("==", (a, b) => a.value - b.value),
        new Operator(">", (a, b) => a.value > b.value),
        new Operator("<", (a, b) => a.value < b.value),
        // new Operator(">=", (a, b) => a.value >= b.value),
        // new Operator("<=", (a, b) => a.value <= b.value),
    ];

    // operation solver:

    function operationSolver(operation) {
        // pretty much the same parenthese parser as before, expect it is the first thing runned
        
        let parsedOperation = "";
        const operationLength = operation.length;
        
        const charsOnlyOperators = operators.map(a => a.chars[0]);
        let operatorsIndex = [];
        
        for (let i = 0; i < operationLength; i++) {
            
            if (operation[i] === "(") {
                let deepness = 0;
                let paretheseContent = "";
                
                for (let h = i; !(operation[h] === ")" && deepness === 0) && h < operationLength; h++) {
                    const char = operation[h];
                    
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
                
                // console.log("paretheseContent: "+ paretheseContent);
                
                parsedOperation += operationSolver(paretheseContent).value;
                
                // the +2 is for the two parentheses
                i += paretheseContent.length+2;
                
            }
            parsedOperation += operation[i] ?? "";
            
            if (charsOnlyOperators.includes(operation[i])) {
                operatorsIndex.push(charsOnlyOperators.indexOf(operation[i]));
            }
        }
        
        // I'm wondering if this is more optimised than
        // parsedOperation.split().foreach
        const parsedOperationLength = parsedOperation.length;
        
        const parsedOperators = operators.filter((a , i) => operatorsIndex.includes(i));
        const parsedCharsOnlyOperators = parsedOperators.map(a => a.chars);
        
        // console.log("parsedOperation: "+ parsedOperation);
        
        var a = "",
        b = "",
        c = "",
        d = "";
        
        parsedOperators.forEach(operator => {
            // c and d are the rest of the operation
            a = "", b = "", c = "", d = "";
            
            for (let i = 0; i < parsedOperationLength; i++) {
                const char = parsedOperation[i];
                
                if (char === operator.chars[0]) {
                    c = parsedOperation.slice(0, i-a.length);
                    
                    for (let h = i+1; !parsedCharsOnlyOperators.includes(parsedOperation[h]) && h < parsedOperationLength; h++) {
                        b += parsedOperation[h];
                        if (parsedCharsOnlyOperators.includes(parsedOperation[h+1])) {
                            d = parsedOperation.slice(h+1, parsedOperationLength);
                        }
                    }
                    /*console.log("a:"+a);
                    console.log("b:"+b);
                    console.log("c:"+c);
                    console.log("d:"+d);
                    used for debug purpose
                    */
                    if (c !== "" || d !== "") {
                        parsedOperation = operationSolver(c + operator.execute(getValue(a), getValue(b)) + d).value;
                        
                        // holly mushroom, seems like a terrible idea
                        // might cause infinite recursion
                        
                        // UPDATE: it does only when my code is bad, so it should be fine... right?
                        // could be enhanced by moving the cursor to the start of the operation instead, but may produce a infinite loop
                    }else {
                        parsedOperation = operator.execute(getValue(a), getValue(b));
                    }
                }else if (parsedCharsOnlyOperators.includes(char)) {
                    a = "";
                }else {
                    a += char;
                }
            }
        });
        
        return getValue(parsedOperation);
    }

    return operationSolver;
}