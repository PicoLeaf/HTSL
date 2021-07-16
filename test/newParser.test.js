function evalHTSL(source) {
    const final = "";

    let i = 0;
    while (i < source.length) {
        if (source[i] === "<") {
            
            i++;

            let h = i;
            while (source[h] !== ">" && h < source.length) {
                h++;
            }
            console.log("baliseName: "+source.slice(i, h));
        }
        i++;
    }

    return "";
}

it('html parsing', () => {
    expect(evalHTSL("<h1></h1>")).toBe("<h1></h1>");
});

"<h1>beep</h1>"

