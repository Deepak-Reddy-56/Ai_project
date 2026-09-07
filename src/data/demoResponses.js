export const topicsData = [
  {
    id: "python-basics",
    title: "Python Basics",
    description: "Learn Python syntax, how to print, add comments, and basic data types.",
    icon: "Terminal",
    color: "#60a5fa", // blue
    analogy: "Like learning the alphabet and basic spelling before writing a full story.",
    summary: "Python is known for its clean, readable syntax that uses indentation instead of curly braces to define blocks of code.",
    concepts: [
      { name: "Printing", desc: "Using print() to output information to the screen." },
      { name: "Comments", desc: "Using # to leave notes in the code that the computer ignores." },
      { name: "Indentation", desc: "Using spaces/tabs to structure the code blocks (critical in Python)." }
    ],
    codeExample: `# This is a comment - Python ignores this
print("Hello, Code Companion!")

# Basic math operation
result = 5 + 10
print("The sum is:", result)`,
    tips: "Always make sure your indentation (spaces) is consistent, or Python will throw an IndentationError!"
  },
  {
    id: "variables",
    title: "Variables",
    description: "Understand variables as labeled storage boxes for different data types.",
    icon: "Box",
    color: "#34d399", // emerald
    analogy: "Like labeled boxes in a storage room. A box labeled 'shoes' contains shoes; you can swap the shoes inside but the label remains.",
    summary: "Variables are named containers used to store data values in computer memory so you can refer to them and modify them later.",
    concepts: [
      { name: "Declaration", desc: "Creating a variable and assigning it a name." },
      { name: "Assignment", desc: "Using the '=' sign to store a value inside the variable." },
      { name: "Data Types", desc: "Variables can store numbers (integers, floats), text (strings), or true/false (booleans)." }
    ],
    codeExample: `# Creating variables of different types
name = "Alex"          # String (text)
age = 19               # Integer (number)
gpa = 3.8              # Float (decimal)
is_student = True      # Boolean (true/false)

print(name, "is", age, "years old.")`,
    tips: "Pick descriptive variable names! Use 'student_age' instead of 'x' so your code is easy for others to read."
  },
  {
    id: "loops",
    title: "Loops",
    description: "Master repeating tasks using 'for' and 'while' loops without writing duplicate code.",
    icon: "Repeat",
    color: "#fbbf24", // amber
    analogy: "Like doing 10 jumping jacks. You count from 1 to 10, repeating the same exercise until you reach the target.",
    summary: "Loops allow you to run a block of code multiple times. A 'for' loop runs a specific number of times, while a 'while' loop runs as long as a condition is true.",
    concepts: [
      { name: "For Loops", desc: "Repeats a block of code for a set number of times or over items in a collection." },
      { name: "While Loops", desc: "Repeats as long as a certain condition is True. Watch out for infinite loops!" },
      { name: "Loop Counter", desc: "A variable that changes with each iteration to keep track of progress." }
    ],
    codeExample: `# For loop: repeating 3 times
print("Counting down:")
for i in range(3, 0, -1):
    print(i)
print("Blast off! 🚀")

# While loop: running until a condition is met
count = 1
while count <= 3:
    print("Loop iteration:", count)
    count = count + 1`,
    tips: "Always make sure a 'while' loop has a way to stop (the condition eventually becomes False), or your program will freeze!"
  },
  {
    id: "functions",
    title: "Functions",
    description: "Write reusable blocks of code that perform specific tasks when called.",
    icon: "Cpu",
    color: "#a78bfa", // violet
    analogy: "Like a recipe for baking chocolate chip cookies. You write it down once, and whenever you want cookies, you just call the recipe name.",
    summary: "Functions are reusable blocks of statements that only run when called. They can accept inputs (parameters) and return results (output).",
    concepts: [
      { name: "Defining", desc: "Creating a function using the 'def' keyword." },
      { name: "Parameters", desc: "Variables passed into the function as inputs." },
      { name: "Return Statement", desc: "Sending a value back to the place where the function was called." }
    ],
    codeExample: `# Defining a function with parameters
def greet_user(username, language):
    if language == "python":
        return "Welcome to Python, " + username + "! 🐍"
    else:
        return "Hello, " + username + "!"

# Calling the function
message = greet_user("Jamie", "python")
print(message)`,
    tips: "Keep your functions focused on doing ONE thing well. If a function is doing 5 different tasks, break it up into smaller functions."
  },
  {
    id: "arrays",
    title: "Arrays & Lists",
    description: "Store collections of items in a single, ordered variable for easy access.",
    icon: "ListOrdered",
    color: "#f87171", // red
    analogy: "Like an egg carton. Each slot can hold one item, and slots are numbered starting from zero (0, 1, 2...).",
    summary: "In Python, we use Lists (which act like arrays) to store multiple items in a single variable. Items are ordered, indexable, and can be modified.",
    concepts: [
      { name: "Indexing", desc: "Accessing items by their position, starting at index 0." },
      { name: "Appending", desc: "Adding new items to the end of the collection." },
      { name: "Length", desc: "Finding out how many items are in the list using len()." }
    ],
    codeExample: `# Creating a list of programming languages
languages = ["Python", "JavaScript", "C++"]

# Accessing elements (remember: index starts at 0!)
print("First item:", languages[0]) # Output: Python

# Adding a new language
languages.append("Java")
print("Full list:", languages)
print("Total count:", len(languages))`,
    tips: "Index Error is a very common beginner mistake! If a list has 3 items, the indices are 0, 1, and 2. Accessing index 3 will crash your code!"
  },
  {
    id: "oop",
    title: "Object-Oriented Programming",
    description: "Model real-world things using Classes (blueprints) and Objects (instances).",
    icon: "Layers",
    color: "#2dd4bf", // teal
    analogy: "An architect's blueprint is a Class. The actual houses built using that blueprint are Objects.",
    summary: "OOP is a programming model that organizes software design around data, or objects, rather than functions and logic. It uses classes as templates.",
    concepts: [
      { name: "Class", desc: "The blueprint or template for creating objects." },
      { name: "Object / Instance", desc: "The actual entity created from the class." },
      { name: "Attributes & Methods", desc: "Attributes are variables inside a class (data), and methods are functions inside a class (actions)." }
    ],
    codeExample: `class Dog:
    # The initializer (constructor)
    def __init__(self, name, breed):
        self.name = name     # Attribute
        self.breed = breed   # Attribute
    
    # A method (action)
    def bark(self):
        return self.name + " says Woof! 🐾"

# Creating objects
my_dog = Dog("Buddy", "Golden Retriever")
print(my_dog.bark())`,
    tips: "The word 'self' in Python represents the specific object you are currently creating or working with. It lets the object remember its own data!"
  },
  {
    id: "debugging",
    title: "Debugging",
    description: "Learn how to read error messages and fix bugs like a professional software engineer.",
    icon: "Bug",
    color: "#fb7185", // rose
    analogy: "Like a detective investigating a crime scene. You look at the clues (error messages) and trace the steps to find the culprit.",
    summary: "Debugging is the process of finding and resolving bugs (defects or problems) within a computer program that prevent it from running correctly.",
    concepts: [
      { name: "Syntax Errors", desc: "Mistakes in the grammar of the code (e.g., missing colons or quotes)." },
      { name: "Runtime Errors", desc: "Errors that happen while the program is running (e.g., dividing by zero)." },
      { name: "Logical Errors", desc: "Code runs without errors, but does not do what you expected." }
    ],
    codeExample: `# Syntax Error Example:
# if x = 5   <-- Error! Should be "==" and needs a colon ":"

# Logical Error Example:
def get_average(num1, num2):
    return num1 + num2 / 2  # Bug! PEMDAS means it does num2/2 first. Needs parentheses!
    # Correct: return (num1 + num2) / 2`,
    tips: "Read the very last line of Python error messages first. It usually tells you exactly what went wrong and what line it occurred on!"
  }
];

export const chatResponses = {
  "hello": "Hello! I am your Friendly Code Companion. I am here to help you learn programming. What topic or language would you like to explore today?",
  "hi": "Hi there! Ready to write some awesome code? Ask me a coding question, or ask me to explain a concept like loops, variables, or arrays!",
  "loop": "A loop is a way to run the same lines of code over and over again.\\n\\nIn Python, a **for loop** goes through items in a list or range:\\n\`\`\`python\\nfor i in range(3):\\n    print('Hello!')\\n\`\`\`\\nThis prints 'Hello!' three times. What kind of loop are you trying to build?",
  "for loop": "A for loop is used to repeat a block of code a specific number of times or for each item in a collection (like a list).\\n\\nHere is a simple example in Python:\\n\`\`\`python\\n# This loop runs 5 times, printing 0 through 4\\nfor number in range(5):\\n    print(\\\"Iteration:\\\", number)\\n\`\`\`\\nLet me know if you would like me to convert this to JavaScript or explain how it works!",
  "while loop": "A while loop repeats code as long as a condition is **True**.\\n\\n\`\`\`python\\ncount = 0\\nwhile count < 3:\\n    print(\\\"Count is:\\\", count)\\n    count = count + 1\\n\`\`\`\\n⚠️ **Warning:** If you forget to update \`count\`, the condition \`count < 3\` will always be true, creating an **infinite loop** that crashes your program!",
  "variable": "A variable is like a labeled container that stores a value. \\n\\nIn Python, you create one just by writing its name and assigning a value:\\n\`\`\`python\\nscore = 100          # stores a number\\nuser_name = \\\"Sarah\\\"  # stores text (a string)\\n\`\`\`\\nYou can change the contents later:\\n\`\`\`python\\nscore = score + 10    # score is now 110\\n\`\`\`",
  "function": "A function is a block of reusable code. You define it once, and then you can run it ('call' it) whenever you need it.\\n\\n\`\`\`python\\ndef make_sandwich(type):\\n    return \\\"Here is your delicious \\\" + type + \\\" sandwich! 🥪\\\"\\n\\n# Call the function\\nprint(make_sandwich(\\\"turkey\\\"))\\n\`\`\`\\nThis saves you from typing the same logic repeatedly!",
  "array": "An array (called a **list** in Python) stores a list of items in order. \\n\\n\`\`\`python\\nfruits = [\\\"apple\\\", \\\"banana\\\", \\\"cherry\\\"]\\n\`\`\`\\nYou get items out using their position (index), starting at **0**:\\n- \`fruits[0]\` is 'apple'\\n- \`fruits[1]\` is 'banana'\\n- \`fruits[2]\` is 'cherry'\\n\\nYou can add items using \`.append()\`:\\n\`\`\`python\\nfruits.append(\\\"orange\\\")\\n\`\`\`",
  "list": "In Python, lists are used to store multiple items in a single variable. They are ordered, changeable, and allow duplicate values.\\n\\nExample:\\n\`\`\`python\\ncolors = [\\\"red\\\", \\\"green\\\", \\\"blue\\\"]\\nprint(colors[0]) # Output: red\\n\`\`\`\\nTo add an item, use \`colors.append(\\\"yellow\\\")\`. What list operation are you working on?",
  "oop": "OOP stands for **Object-Oriented Programming**. It is a way of writing code by modeling real-world things as 'Objects'.\\n\\n- **Class**: The blueprint (e.g., a plan for a Car class).\\n- **Object**: The actual item made from the blueprint (e.g., your specific red sedan object).\\n- **Attributes**: The characteristics (e.g., \`car.color = 'red'\`, \`car.speed = 60\`).\\n- **Methods**: The actions it can perform (e.g., \`car.drive()\`, \`car.brake()\`).",
  "debugging": "Debugging is finding and fixing errors ('bugs') in your code. Here is a 3-step beginner strategy:\\n1. **Read the error message**: Look at the last line first; it tells you what happened.\\n2. **Look at the line number**: The error tells you where it failed (though sometimes the real mistake is a line above, like a missing parenthesis!).\\n3. **Use print statements**: Print your variable values right before the crash to see what they actually contain.",
  "recursion": "Recursion is when a function calls **itself** to solve a smaller version of the same problem.\\n\\nEvery recursive function needs a **base case** (when to stop), or it will call itself forever and cause a crash!\\n\`\`\`python\\ndef countdown(n):\\n    if n <= 0:            # Base Case\\n        print(\\\"Blast off!\\\")\\n    else:\\n        print(n)\\n        countdown(n - 1)  # Recursive Call\\n\`\`\`",
  "error": "Are you getting an error message? Copy and paste it here, or describe what is happening! Common errors include:\\n- **SyntaxError**: Typo in the code structure (e.g., missing \`:\` or quotes).\\n- **NameError**: You used a variable name that doesn't exist yet.\\n- **TypeError**: You tried to combine incompatible types (e.g., adding text and numbers together like \`\\\"age: \\\" + 18\`).",
  "python": "Python is a fantastic language for beginners because it reads almost like English! It is widely used in web development, data science, and AI. Would you like a simple hello world example?",
  "javascript": "JavaScript is the language of the web! It runs in your browser and makes websites interactive. \\n\\nHere is a simple example:\\n\`\`\`javascript\\nlet score = 10;\\nif (score >= 10) {\\n  console.log(\\\"You win! 🏆\\\");\\n}\\n\`\`\`",
  "html": "HTML (HyperText Markup Language) is the backbone of web pages. It defines the structure and content.\\n\\nExample:\\n\`\`\`html\\n<h1>Welcome to my website</h1>\\n<p>This is a paragraph of text.</p>\\n<button>Click Me!</button>\\n\`\`\`\\nTo style it, we use CSS, and to make it interactive, we use JavaScript!",
  "css": "CSS (Cascading Style Sheets) is what we use to style web pages (colors, layouts, fonts, spacing).\\n\\nExample:\\n\`\`\`css\\nbody {\\n  background-color: #0f172a;\\n  color: #f1f5f9;\\n  font-family: 'Inter', sans-serif;\\n}\\nbutton {\\n  background: linear-gradient(135deg, #3b82f6, #8b5cf6);\\n  border-radius: 8px;\\n}\\n\`\`\`"
};

export const codeExplainerResponses = {
  "for i in range(5):\n    print(i)": {
    explain: "This code is a **for loop** in Python. It does the following:\\n1. \`range(5)\` generates a sequence of numbers from \`0\` to \`4\` (5 numbers total).\\n2. The variable \`i\` takes the value of each number in that sequence, one by one.\\n3. \`print(i)\` outputs the current value of \`i\` to the screen on each iteration.\\n\\n**Result output:**\\n\`0\`\\n\`1\`\\n\`2\`\\n\`3\`\\n\`4\`",
    error: "This code is syntactically **correct** and will run perfectly. No bugs detected!\\n\\n💡 *Tip:* If you wanted to start printing from 1 instead of 0, you could write \`range(1, 6)\`.",
    simplify: "This code is already as simple and clean as it gets! It represents the standard, idiomatic way to loop 5 times in Python.",
    example: "Here is an example of using the loop to do something more realistic, like calculating a sum:\\n\`\`\`python\\ntotal = 0\\nfor i in range(1, 6):  # numbers 1 to 5\\n    total += i\\nprint(\\\"The sum of numbers 1 to 5 is:\\\", total)\\n# Output: 15\\n\`\`\`"
  },
  "def add(a, b)\nreturn a + b": {
    explain: "This code aims to define a function that adds two numbers together, but it has syntax errors.",
    error: "❌ **Syntax Errors Found!**\\n\\n1. **Missing Colon (\`:\`)**: In Python, when defining a function, you must put a colon at the end of the \`def\` line.\\n   - *Wrong:* \`def add(a, b)\`\\n   - *Right:* \`def add(a, b):\`\\n2. **Missing Indentation**: The body of the function (\`return a + b\`) must be indented (usually 4 spaces or 1 tab) so Python knows it belongs inside the function.\\n\\n**Corrected Code:**\\n\`\`\`python\\ndef add(a, b):\\n    return a + b\\n\`\`\`",
    simplify: "The logic is already minimal. Once the syntax errors are fixed, this is the simplest way to write an addition function.",
    example: "Here is how you define and use this function correctly:\\n\`\`\`python\\ndef add(a, b):\\n    return a + b\\n\\n# Call the function with inputs 5 and 7\\nresult = add(5, 7)\\nprint(\\\"Result is:\\\", result) # Output: 12\\n\`\`\`"
  },
  "x = \"10\"\ny = 5\nprint(x + y)": {
    explain: "This code tries to add a text string \`\"10\"\` to an integer number \`5\` and print the result.",
    error: "❌ **Runtime TypeError Found!**\\n\\nYou cannot add a string (\`str\`) and an integer (\`int\`) directly in Python.\\n- \`x\` is a string (text because of quotes \`\"10\"\`).\\n- \`y\` is a number (integer \`5\`).\\n\\nPython doesn't know if you want to perform math (\`10 + 5 = 15\`) or concatenate text (\`\"10\" + \"5\" = \"105\"\`).\\n\\n**How to Fix (Option A - Math):**\\nConvert the string to an integer using \`int()\`:\\n\`\`\`python\\nprint(int(x) + y) # Output: 15\\n\`\`\`\\n\\n**How to Fix (Option B - Text):**\\nConvert the integer to a string using \`str()\`:\\n\`\`\`python\\nprint(x + str(y)) # Output: 105\\n\`\`\`",
    simplify: "Instead of declaring \`x\` as a string and converting it, declare it directly as an integer:\\n\`\`\`python\\nx = 10\\ny = 5\\nprint(x + y)\\n\`\`\`",
    example: "Here is a clean demonstration showing both methods side-by-side:\\n\`\`\`python\\nnum_str = \\\"20\\\"\\nnum_val = 10\\n\\n# Math sum\\nmath_result = int(num_str) + num_val\\nprint(\\\"Math Sum:\\\", math_result) # Output: 30\\n\\n# Text concatenation\\ntext_result = num_str + str(num_val)\\nprint(\\\"Text Join:\\\", text_result) # Output: 2010\\n\`\`\`"
  }
};

// Logic helper to generate a smart mock response if the snippet is custom
export function getCustomAnalyzeResponse(code = '', language = 'python') {
  const cleanCode = code.trim();
  const lang = (language || 'python').toLowerCase();

  let hasIssue = false;
  let isUncertain = false;
  let issueText = '';
  let whyText = '';
  let fixText = '';

  if (cleanCode.includes("calculate_total") || cleanCode.includes("undefined_var")) {
    isUncertain = true;
    issueText = "Missing Context: 'calculate_total' and 'items' are not defined in this snippet.";
  } else if ((cleanCode.includes("def ") || cleanCode.includes("if ") || cleanCode.includes("for ") || cleanCode.includes("while ")) && !cleanCode.includes(":") && lang === 'python') {
    hasIssue = true;
    issueText = "Missing trailing colon (:) at the end of a block header.";
    whyText = "In Python, block declarations like 'if', 'for', 'while', and 'def' must end with a colon to define the start of an indented block.";
    fixText = cleanCode.split('\n').map(line => (line.trim().startsWith('def ') || line.trim().startsWith('if ') || line.trim().startsWith('for ') || line.trim().startsWith('while ')) && !line.includes(':') ? line + ':' : line).join('\n');
  } else if (cleanCode.includes("i + 1") && (cleanCode.includes("range(len(") || cleanCode.includes("[i + 1]"))) {
    hasIssue = true;
    issueText = "IndexError: list index out of range on the last loop iteration.";
    whyText = "The loop range runs up to len(items)-1. Accessing index i + 1 on the last turn pushes the index out of bounds.";
    fixText = cleanCode.replace("i + 1", "i");
  } else if ((lang === 'cpp' || lang === 'c++') && (cleanCode.includes("string") && cleanCode.includes("+") || cleanCode.endsWith("]"))) {
    hasIssue = true;
    issueText = cleanCode.endsWith("]")
      ? "Syntax & Type Error: Incorrect closing bracket ']' for main() function, and cannot perform '+' addition directly between int and std::string."
      : "Type Mismatch: cannot perform arithmetic addition between integer and std::string directly.";
    whyText = "C++ is strongly typed and does not automatically convert string objects to integers for mathematical operations. Function blocks must end with '}'.";
    fixText = `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    string y = "5";\n    cout << x << y;\n    return 0;\n}`;
  }

  if (isUncertain) {
    return {
      status: "uncertain",
      summary: `Code calls 'calculate_total(items)' which relies on external scope.`,
      issue: issueText,
      why: "The function definition for calculate_total and initialization of items were not provided in this snippet.",
      fix: `# Define items and function first:\ndef calculate_total(item_list):\n    return sum(item_list)\n\nitems = [10, 20, 30]\n${cleanCode}`,
      explanation: `Syntactically this snippet is valid, but running it directly will trigger a NameError unless calculate_total and items are defined elsewhere.`,
      followUp: "Provide the definition of calculate_total if you'd like me to analyze its internal logic!"
    };
  }

  if (hasIssue) {
    return {
      status: "issue",
      summary: `Code written in ${language.toUpperCase()} contains a potential issue based on structural inspection.`,
      issue: issueText,
      why: whyText,
      fix: fixText,
      explanation: `This snippet processes operations in ${language.toUpperCase()}. Review the suggested fix above to resolve the potential issue.`,
      followUp: "Would you like me to explain the underlying code structure in detail?"
    };
  }

  return {
    status: "correct",
    summary: `This ${language.toUpperCase()} code appears syntactically sound and logical.`,
    issue: "",
    why: "",
    fix: "",
    explanation: `Here is how this ${language.toUpperCase()} code works:\n\n1. **Initialization:** Defines variables and structure.\n2. **Execution:** Performs operations sequentially.\n3. **Output:** Displays or processes the expected values.`,
    followUp: "Try adding extra conditions or inputs to explore further!"
  };
}

export function getCustomExplainerResponse(code, action) {
  const cleanCode = code.trim();
  
  // Check if we have a direct match first
  if (codeExplainerResponses[cleanCode]) {
    return codeExplainerResponses[cleanCode][action];
  }
  
  // Otherwise, run simple heuristic analysis based on code content
  let hasMissingColon = false;
  let hasTypeError = false;
  let hasPrint = false;
  let hasLoop = false;
  let hasFunction = false;
  let hasList = false;
  
  if ((cleanCode.includes("def ") || cleanCode.includes("if ") || cleanCode.includes("for ") || cleanCode.includes("while ")) && !cleanCode.includes(":")) {
    hasMissingColon = true;
  }
  if (cleanCode.includes("+ \"") && (cleanCode.includes(" = [0-9]+") || cleanCode.match(/=\s*\d+($|\s)/))) {
    // Looks like someone is adding string and number
    hasTypeError = true;
  }
  if (cleanCode.includes("print")) {
    hasPrint = true;
  }
  if (cleanCode.includes("for ") || cleanCode.includes("while ")) {
    hasLoop = true;
  }
  if (cleanCode.includes("def ") || cleanCode.includes("function ")) {
    hasFunction = true;
  }
  if (cleanCode.includes("[") && cleanCode.includes("]")) {
    hasList = true;
  }

  switch(action) {
    case "explain":
      let explanation = `Here is an analysis of your custom code snippet:\n\n`;
      if (hasFunction) {
        explanation += `* **Function structure:** You are defining a function to group reusable actions.\n`;
      }
      if (hasLoop) {
        explanation += `* **Loop mechanism:** This code contains a loop, which will repeat code blocks.\n`;
      }
      if (hasList) {
        explanation += `* **Collections:** It uses a list/array syntax \`[]\` to store multiple items.\n`;
      }
      if (hasPrint) {
        explanation += `* **Output operations:** It calls print/console functions to output results to the screen.\n`;
      }
      if (!hasFunction && !hasLoop && !hasList && !hasPrint) {
        explanation += `* **Basic logic:** This represents a simple linear block of code, executing operations sequentially.\n`;
      }
      explanation += `\n💡 *Summary:* This code performs basic assignments or calculations. Let's see if there are any errors or if we can make it cleaner!`;
      return explanation;

    case "error":
      if (hasMissingColon) {
        return `❌ **Potential Syntax Error Detected!**\n\nIt looks like you have a control statement (\`def\`, \`if\`, \`for\`, or \`while\`) but are **missing the trailing colon (\`:\`)**. In Python, this will trigger a \`SyntaxError: expected ':'\`.\n\n**Fix:** Add a colon to the end of the declaration line, and verify that the subsequent lines are indented properly!`;
      }
      if (hasTypeError) {
        return `❌ **Potential TypeError Detected!**\n\nIt looks like you might be combining text strings and numbers together using the \`+\` operator. Python does not automatically convert numbers to text.\n\n**Fix:** Wrap the numbers in \`str()\` or convert text to numbers using \`int()\` before combining them.`;
      }
      return `✅ **Code Structure Check Passed!**\n\nNo glaring syntax errors were detected in your code template. However, make sure that:\n1. All parentheses and quotes are properly closed.\n2. Indentation is consistent (either 4 spaces or tabs, do not mix them!).\n3. Variables are declared before they are used.`;

    case "simplify":
      if (cleanCode.includes("x = x + 1") || cleanCode.includes("count = count + 1")) {
        return `💡 **Refactoring Tip:**\n\nYou can simplify incrementing statements like \`x = x + 1\` by using shorthand operators:\n\`\`\`python\nx += 1\n\`\`\``;
      }
      if (cleanCode.includes("else:\n    pass") || cleanCode.includes("else: pass")) {
        return `💡 **Refactoring Tip:**\n\nAn \`else\` block containing only \`pass\` does nothing. You can safely remove it to make your code shorter and cleaner.`;
      }
      return `✨ **Optimization Status:**\n\nYour code looks relatively clean! To keep it simple:\n- Keep variable names descriptive but brief.\n- Avoid nesting loops and conditionals too deeply (more than 2 levels makes it hard to read).\n- Use comments to explain *why* code does something, rather than *what* it does.`;

    case "example":
      if (hasLoop) {
        return `Here is a clean, standard loop example in Python:\n\`\`\`python\n# Loops 3 times and prints a message\nfor i in range(1, 4):\n    print("Step", i, "- keep coding! 💻")\n\`\`\``;
      }
      if (hasFunction) {
        return `Here is a standard function example with inputs and output:\n\`\`\`python\ndef square_number(num):\n    return num * num\n\nresult = square_number(6)\nprint("6 squared is:", result) # Output: 36\n\`\`\``;
      }
      return `Here is a simple example showing variables, operations, and conditions in action:\n\`\`\`python\nscore = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C"\n\nprint("Score:", score, "-> Grade:", grade)\n\`\`\``;
  }
}
