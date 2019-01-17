/**
 *
 * Example repl service
 *
 */
// READ EVAL PRINT LOOP

const repl = require("repl");

// Start the REPL
repl.start({
    prompt: ">",
    eval: function(str) {
        // Evaluation function for incoming inputs
        console.log("Evaluating ", str);
        // If the user said 'fizz', say 'buzz' back to them
        if (str.indexOf("hi") > -1) {
            console.log("hello!");
        } else {
            console.log("Type hi)");
        }
    }
});
