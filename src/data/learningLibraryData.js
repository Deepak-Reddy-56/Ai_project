/**
 * Learning Library Data — 7 Languages with Beginner-to-Intermediate Roadmaps
 */

export const LANGUAGES = [
  { id: 'python',     label: 'Python',     icon: 'Terminal',  color: '#3b82f6', tag: 'Beginner Friendly' },
  { id: 'c',          label: 'C',          icon: 'Cpu',       color: '#64748b', tag: 'System Fundamentals' },
  { id: 'cpp',        label: 'C++',        icon: 'Zap',       color: '#2563eb', tag: 'High Performance' },
  { id: 'java',       label: 'Java',       icon: 'Coffee',    color: '#ea580c', tag: 'Enterprise & OOP' },
  { id: 'javascript', label: 'JavaScript', icon: 'Code',      color: '#eab308', tag: 'Web Development' },
  { id: 'csharp',     label: 'C#',         icon: 'Layers',    color: '#9333ea', tag: 'Cross-Platform & Games' },
  { id: 'go',         label: 'Go',         icon: 'Box',       color: '#06b6d4', tag: 'Cloud & Systems' },
];

export const LEARNING_DATA = {
  python: [
    {
      id: 'python-1',
      title: 'Module 1 — Getting Started',
      description: 'Understand Python syntax, printing output, and writing your first program.',
      summary: 'Python is known for its clean, readable syntax that relies on indentation instead of curly braces to define blocks of code.',
      why: 'Python is widely used in data science, artificial intelligence, web backends, and scripting because code can be written quickly and read like natural English.',
      analogy: 'Like learning the alphabet and simple spelling before writing full sentences.',
      concepts: [
        { name: 'print() Function', desc: 'Outputs text or numbers directly to the console screen.' },
        { name: 'Comments (#)', desc: 'Lines starting with # are ignored by Python and serve as notes for programmers.' },
        { name: 'Indentation', desc: 'Spaces at the start of code lines define which statements belong to a block.' }
      ],
      codeExample: `# Print a friendly message to the screen
print("Welcome to Python with Code Companion!")

# Basic math calculations
sum_value = 10 + 25
print("Result of addition:", sum_value)`,
      tips: 'Always use 4 consistent spaces for indentation. Mixing tabs and spaces will trigger IndentationError!'
    },
    {
      id: 'python-2',
      title: 'Module 2 — Variables & Data Types',
      description: 'Store and manipulate text, integers, decimals, and booleans.',
      summary: 'Variables act as labeled storage containers in memory. Python automatically detects the type of data stored inside a variable.',
      why: 'Programs must store data—such as user names, prices, or scores—to process and transform information.',
      analogy: 'Like labeled storage boxes in a room. A box labeled "age" holds a number, while "name" holds text.',
      concepts: [
        { name: 'Strings (str)', desc: 'Text enclosed in quotes, e.g. "Hello".' },
        { name: 'Integers (int)', desc: 'Whole numbers positive or negative, e.g. 42.' },
        { name: 'Floats (float)', desc: 'Numbers containing decimal points, e.g. 3.14.' },
        { name: 'Booleans (bool)', desc: 'Logical values representing True or False.' }
      ],
      codeExample: `name = "Alex"          # String
age = 20               # Integer
gpa = 3.85             # Float
is_enrolled = True     # Boolean

print(f"Student {name} is {age} years old with a GPA of {gpa}.")`,
      tips: 'Use snake_case for Python variable names (e.g., student_score) to follow standard PEP 8 conventions.'
    },
    {
      id: 'python-3',
      title: 'Module 3 — Operators & Expressions',
      description: 'Perform arithmetic, make comparisons, and combine logical conditions.',
      summary: 'Operators allow you to combine variables and values to produce new results through math or logic checks.',
      why: 'Every program decision relies on evaluating expressions (e.g. checking if a balance is greater than 0).',
      analogy: 'Like using a calculator and logic rules to evaluate whether an expense fits inside a budget.',
      concepts: [
        { name: 'Arithmetic Operators', desc: '+, -, *, /, // (floor div), % (modulo), ** (exponent)' },
        { name: 'Comparison Operators', desc: '==, !=, >, <, >=, <= evaluate to True or False' },
        { name: 'Logical Operators', desc: 'and (both true), or (either true), not (inverts boolean)' }
      ],
      codeExample: `score = 85
passing_grade = 70
has_perfect_attendance = True

# Logical evaluation
is_eligible_for_honors = (score >= passing_grade) and has_perfect_attendance
print("Eligible for Honors:", is_eligible_for_honors)`,
      tips: 'Remember that single = is for assignment, while double == is for testing equality!'
    },
    {
      id: 'python-4',
      title: 'Module 4 — Input & Output',
      description: 'Accept user inputs from the console and format outputs cleanly.',
      summary: 'The input() function pauses execution and waits for input from the keyboard, returning the value as a string.',
      why: 'Interactive programs must accept data from users to customize behavior.',
      analogy: 'Like filling out a form where the system reads your written response.',
      concepts: [
        { name: 'input() Function', desc: 'Reads input typed by the user.' },
        { name: 'Type Casting', desc: 'Converting strings to int() or float() for calculations.' },
        { name: 'f-Strings', desc: 'Formatting text dynamically using f"Value: {val}".' }
      ],
      codeExample: `# Accept input and cast to integer
user_age = int(input("Enter your age: "))
years_left = 65 - user_age

print(f"You have approximately {years_left} years until retirement.")`,
      tips: 'Always cast input() to int() or float() if you plan to perform mathematical operations on it!'
    },
    {
      id: 'python-5',
      title: 'Module 5 — Conditional Logic',
      description: 'Control the flow of execution using if, elif, and else statements.',
      summary: 'Conditionals evaluate boolean expressions to determine which branch of code to execute.',
      why: 'Programs need decision-making capabilities to handle different scenarios and user choices.',
      analogy: 'Like a traffic light: if green go, elif yellow slow down, else stop.',
      concepts: [
        { name: 'if Statement', desc: 'Executes a block if the condition is True.' },
        { name: 'elif Statement', desc: 'Checks an alternative condition if preceding conditions were False.' },
        { name: 'else Statement', desc: 'Fallback block executed when all previous conditions fail.' }
      ],
      codeExample: `temperature = 28

if temperature > 30:
    print("It's hot outside!")
elif temperature >= 20:
    print("Pleasant weather!")
else:
    print("It's cold outside!")`,
      tips: 'Check the order of your conditions! Put specific checks before general ones.'
    },
    {
      id: 'python-6',
      title: 'Module 6 — Loops & Iteration',
      description: 'Repeat actions efficiently using for and while loops.',
      summary: 'Loops allow code blocks to execute repeatedly across collections or while conditions remain true.',
      why: 'Automation relies on loops to process thousands of data items without duplicating code.',
      analogy: 'Like running laps around a track until a target count is completed.',
      concepts: [
        { name: 'for Loop', desc: 'Iterates through sequences (range, list, string).' },
        { name: 'while Loop', desc: 'Repeats as long as a specified condition stays True.' },
        { name: 'break & continue', desc: 'break exits the loop immediately; continue skips to the next iteration.' }
      ],
      codeExample: `# For loop with range
print("Countdown:")
for count in range(3, 0, -1):
    print(count)
print("Blast off! 🚀")`,
      tips: 'Ensure while loops have an update step so the condition eventually becomes False, preventing infinite loops!'
    },
    {
      id: 'python-7',
      title: 'Module 7 — Functions',
      description: 'Write reusable blocks of code that take parameters and return values.',
      summary: 'Functions group statements together under a name, allowing modular code reuse across an application.',
      why: 'Functions break large programs into manageable, testable, and reusable pieces.',
      analogy: 'Like a kitchen appliance: you provide raw ingredients (inputs), push start, and get prepared food (output).',
      concepts: [
        { name: 'def Keyword', desc: 'Defines a new function signature.' },
        { name: 'Parameters', desc: 'Input variables passed into the function.' },
        { name: 'return Statement', desc: 'Sends the resulting output back to the caller.' }
      ],
      codeExample: `def calculate_area(length, width):
    """Calculates the rectangle area."""
    return length * width

room_area = calculate_area(12, 15)
print(f"Total room area: {room_area} sq ft")`,
      tips: 'Functions should focus on doing one task well. If a function does 5 things, split it up!'
    },
    {
      id: 'python-8',
      title: 'Module 8 — Data Structures (Lists & Dicts)',
      description: 'Organize collections of data using ordered lists and key-value dictionaries.',
      summary: 'Lists store sequences of items by index, while Dictionaries map unique keys to values.',
      why: 'Real-world data like student rosters, product catalogs, and settings require structured collections.',
      analogy: 'A list is like a numbered playlist; a dictionary is like a contact list mapping names to phone numbers.',
      concepts: [
        { name: 'Lists', desc: 'Ordered, mutable collections: items = ["apple", "banana"]' },
        { name: 'Dictionaries', desc: 'Key-value maps: student = {"name": "Sara", "grade": "A"}' },
        { name: 'Methods', desc: '.append(), .pop(), .get(), and len() for manipulation.' }
      ],
      codeExample: `# List operations
fruits = ["apple", "banana"]
fruits.append("cherry")

# Dictionary operations
user_profile = {"username": "coder123", "score": 95}
print(f"User {user_profile['username']} scored {user_profile['score']} points.")`,
      tips: 'Remember Python index numbers start at 0! For a list of length 3, valid indices are 0, 1, and 2.'
    },
    {
      id: 'python-9',
      title: 'Module 9 — Object-Oriented Programming',
      description: 'Model real-world items using classes and objects.',
      summary: 'Classes act as blueprints, while Objects are concrete instances containing data attributes and behavioral methods.',
      why: 'OOP simplifies software architecture by encapsulating state and actions together.',
      analogy: 'Architectural blueprints are Classes; actual houses built from them are Objects.',
      concepts: [
        { name: 'Class & Object', desc: 'class defines structure; instance creates an object.' },
        { name: '__init__ Constructor', desc: 'Special method invoked automatically when an object is created.' },
        { name: 'self Parameter', desc: 'Refers to the specific instance being operated on.' }
      ],
      codeExample: `class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed
        
    def bark(self):
        return f"{self.name} says Woof!"

my_dog = Dog("Buddy", "Golden Retriever")
print(my_dog.bark())`,
      tips: 'Always pass self as the first parameter to instance methods in Python classes.'
    },
    {
      id: 'python-10',
      title: 'Module 10 — Error Handling & Debugging',
      description: 'Handle runtime exceptions gracefully with try-except blocks.',
      summary: 'Exception handling prevents programs from crashing when unexpected errors occur at runtime.',
      why: 'Production applications must degrade gracefully when encountering missing files, bad user inputs, or network drops.',
      analogy: 'Like wearing a safety net while walking a tightrope.',
      concepts: [
        { name: 'try Block', desc: 'Contains code that might raise an exception.' },
        { name: 'except Block', desc: 'Catches and handles specified errors safely.' },
        { name: 'finally Block', desc: 'Runs cleanup code regardless of success or failure.' }
      ],
      codeExample: `try:
    dividend = 10
    divisor = 0
    result = dividend / divisor
except ZeroDivisionError:
    print("Cannot divide by zero! Please check your input.")`,
      tips: 'Catch specific errors (e.g. ValueError, FileNotFoundError) rather than using a bare except statement.'
    }
  ],

  c: [
    {
      id: 'c-1',
      title: 'Module 1 — Getting Started with C',
      description: 'Understand low-level program structure, main(), and compilation.',
      summary: 'C is a compiled procedural language that provides direct access to system memory and hardware features.',
      why: 'C forms the foundation of operating systems (Linux, Windows kernel), embedded systems, and database engines.',
      analogy: 'Like learning manual vehicle transmission to understand how the engine directly drives the wheels.',
      concepts: [
        { name: '#include <stdio.h>', desc: 'Header file including standard input/output library functions.' },
        { name: 'int main()', desc: 'Mandatory entry point function of every C program.' },
        { name: 'Compiler (gcc)', desc: 'Translates human-readable C source code into machine code binaries.' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    // Print formatted text to standard output
    printf("Hello, World from C!\\n");
    return 0;
}`,
      tips: 'Every executable statement in C must end with a semicolon (;).'
    },
    {
      id: 'c-2',
      title: 'Module 2 — Variables & Primitive Types',
      description: 'Declare variables with strict types like int, float, double, and char.',
      summary: 'C requires explicit variable declaration specifying data types before variables can be used.',
      why: 'Explicit types allow compilers to optimize memory usage and generate fast machine instructions.',
      analogy: 'Like reserving specific container sizes in a warehouse before storing items.',
      concepts: [
        { name: 'int & float', desc: 'int stores whole integers; float/double store decimal numbers.' },
        { name: 'char', desc: 'Stores a single character byte enclosed in single quotes.' },
        { name: 'Format Specifiers', desc: '%d for integer, %f for float, %c for char, %s for string.' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    int count = 10;
    double price = 19.99;
    char grade = 'A';

    printf("Count: %d, Price: %.2f, Grade: %c\\n", count, price, grade);
    return 0;
}`,
      tips: 'Always initialize variables before reading them! Uninitialized C variables contain random junk memory.'
    },
    {
      id: 'c-3',
      title: 'Module 3 — Operators & Expressions',
      description: 'Work with arithmetic, logical, and increment/decrement operators.',
      summary: 'C offers efficient operators including fast increment (++), integer division, and bitwise math.',
      why: 'System software relies on fast arithmetic and memory manipulations.',
      analogy: 'Basic arithmetic combined with fast counter tick marks.',
      concepts: [
        { name: 'Arithmetic & Modulo', desc: '+, -, *, /, and % (remainder of integer division).' },
        { name: 'Increment / Decrement', desc: 'x++ increments value after evaluation; ++x increments before.' },
        { name: 'Logical Operators', desc: '&& (AND), || (OR), ! (NOT).' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    int score = 85;
    int is_passed = (score >= 50) && (score <= 100);

    printf("Pass status: %d\\n", is_passed); // Outputs 1 (true) or 0 (false)
    return 0;
}`,
      tips: 'Integer division in C truncates decimals! 5 / 2 equals 2, not 2.5.'
    },
    {
      id: 'c-4',
      title: 'Module 4 — Input & Output with scanf & printf',
      description: 'Read user inputs securely using scanf and format printed output.',
      summary: 'printf outputs formatted strings to console; scanf reads user inputs into memory addresses.',
      why: 'Command-line tools depend on formatted input and output buffers.',
      analogy: 'Scanning a barcode into a specific physical shelf slot.',
      concepts: [
        { name: 'scanf()', desc: 'Reads user input from stdin into memory using address-of operator (&).' },
        { name: '& Operator', desc: 'Passes the memory address of the target variable to scanf.' },
        { name: 'Escape Sequences', desc: '\\n for newline, \\t for tab.' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age);
    
    printf("Next year you will be %d years old.\\n", age + 1);
    return 0;
}`,
      tips: 'Don\'t forget the & sign before non-array variables in scanf()!'
    },
    {
      id: 'c-5',
      title: 'Module 5 — Control Flow (if, switch)',
      description: 'Branch execution using conditional statements and switch cases.',
      summary: 'Conditionals branch program execution based on relational checks or integer matching.',
      why: 'Enables programs to respond to differing user choices and system conditions.',
      analogy: 'Railroad switches directing a train onto different tracks.',
      concepts: [
        { name: 'if / else if / else', desc: 'Evaluates expressions sequentially until one is non-zero (true).' },
        { name: 'switch Case', desc: 'Fast decision tree based on matching discrete integer values.' },
        { name: 'break Statement', desc: 'Prevents fall-through in switch blocks.' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    int option = 2;

    switch(option) {
        case 1: printf("Selected Option 1\\n"); break;
        case 2: printf("Selected Option 2\\n"); break;
        default: printf("Invalid option\\n");
    }
    return 0;
}`,
      tips: 'Always include break; at the end of switch cases unless intentional fall-through is required.'
    },
    {
      id: 'c-6',
      title: 'Module 6 — Loops (for, while, do-while)',
      description: 'Master repetition constructs in C.',
      summary: 'Loops repeat code blocks until counter or evaluation conditions are satisfied.',
      why: 'Processing arrays, buffers, and system hardware status requires iteration.',
      analogy: 'A conveyor belt repeating assembly operations.',
      concepts: [
        { name: 'for Loop', desc: 'Header contains initialization, condition, and increment.' },
        { name: 'while Loop', desc: 'Tests condition before executing the loop body.' },
        { name: 'do-while Loop', desc: 'Guarantees the loop body runs at least once before checking condition.' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        printf("Iteration %d\\n", i);
    }
    return 0;
}`,
      tips: 'Declare loop index variables inside the for loop header (int i = 0) in C99 standard mode.'
    },
    {
      id: 'c-7',
      title: 'Module 7 — Functions & Prototypes',
      description: 'Modularize C programs with reusable function definitions.',
      summary: 'Functions encapsulate reusable code logic, accepting parameters by value and returning typed results.',
      why: 'Keeps main() concise and breaks programs into clean, testable sub-routines.',
      analogy: 'Using dedicated tools from a workbench to complete a sub-task.',
      concepts: [
        { name: 'Function Prototype', desc: 'Declares function signature before main() so the compiler recognizes it.' },
        { name: 'Return Type', desc: 'Specifies the data type returned (int, void, double, etc.).' },
        { name: 'Call-by-Value', desc: 'Arguments are passed as copies to the function.' }
      ],
      codeExample: `#include <stdio.h>

// Function prototype
int add_numbers(int a, int b);

int main() {
    int result = add_numbers(15, 25);
    printf("Sum: %d\\n", result);
    return 0;
}

int add_numbers(int a, int b) {
    return a + b;
}`,
      tips: 'If a function does not return any value, use void as its return type.'
    },
    {
      id: 'c-8',
      title: 'Module 8 — Arrays & Strings',
      description: 'Work with contiguous memory collections and null-terminated strings.',
      summary: 'Arrays store fixed-size contiguous elements; strings are char arrays ending with null terminator \'\\0\'.',
      why: 'Manipulating text and buffers relies heavily on arrays.',
      analogy: 'A row of locked mailboxes of uniform size.',
      concepts: [
        { name: 'Array Indexing', desc: 'Elements accessed from 0 to size-1.' },
        { name: 'Null Terminator (\\0)', desc: 'Marks the end of a character string.' },
        { name: '<string.h>', desc: 'Provides functions like strlen(), strcpy(), and strcmp().' }
      ],
      codeExample: `#include <stdio.h>
#include <string.h>

int main() {
    char greeting[] = "Hello";
    printf("String: %s, Length: %lu\\n", greeting, strlen(greeting));
    return 0;
}`,
      tips: 'Always leave room for the \'\\0\' character when sizing char arrays for text!'
    },
    {
      id: 'c-9',
      title: 'Module 9 — Pointers & Memory Basics',
      description: 'Understand memory addresses, pointer syntax, and direct reference.',
      summary: 'A pointer is a variable that stores the memory address of another variable.',
      why: 'Pointers enable dynamic memory allocation, efficient array operations, and reference mutation.',
      analogy: 'A piece of paper holding a home street address rather than the house itself.',
      concepts: [
        { name: '& (Address-of)', desc: 'Obtains the memory address of a variable.' },
        { name: '* (Dereference)', desc: 'Accesses or modifies value stored at the target memory address.' },
        { name: 'NULL Pointer', desc: 'Points to address 0 to signify uninitialized or invalid pointer.' }
      ],
      codeExample: `#include <stdio.h>

int main() {
    int val = 42;
    int *ptr = &val; // Pointer holds address of val

    printf("Value: %d\\n", val);
    printf("Address: %p\\n", (void*)ptr);
    printf("Dereferenced value: %d\\n", *ptr);

    *ptr = 99; // Modify val directly through pointer
    printf("Updated value: %d\\n", val);
    return 0;
}`,
      tips: 'Always verify pointers are not NULL before dereferencing to prevent Segmentation Fault crashes!'
    },
    {
      id: 'c-10',
      title: 'Module 10 — Structs & Custom Types',
      description: 'Group related variables under custom user-defined data structures.',
      summary: 'struct allows combining multiple variables of different types into a single composite type.',
      why: 'Essential for modeling entities like students, points, or network packets.',
      analogy: 'An ID card containing name, ID number, and photo on a single card.',
      concepts: [
        { name: 'struct Keyword', desc: 'Defines composite data structure.' },
        { name: 'Dot Operator (.)', desc: 'Accesses members of a struct instance.' },
        { name: 'typedef', desc: 'Creates cleaner type aliases for structs.' }
      ],
      codeExample: `#include <stdio.h>

typedef struct {
    int id;
    float gpa;
} Student;

int main() {
    Student s1;
    s1.id = 101;
    s1.gpa = 3.9;

    printf("Student #%d has GPA: %.1f\\n", s1.id, s1.gpa);
    return 0;
}`,
      tips: 'Use typedef struct to avoid writing struct Student everywhere in your code.'
    }
  ],

  cpp: [
    {
      id: 'cpp-1',
      title: 'Module 1 — Getting Started with C++',
      description: 'Understand C++ setup, std::cout, iostream, and namespaces.',
      summary: 'C++ expands on C by introducing object-oriented programming, standard templates, and stronger type safety.',
      why: 'Used in game development (Unreal Engine), high-frequency trading, graphics engines, and browser backends.',
      analogy: 'Upgrading a manual sports car with high-performance automated tuning systems.',
      concepts: [
        { name: '#include <iostream>', desc: 'Includes standard input/output stream objects.' },
        { name: 'std::cout & <<', desc: 'Stream output operator for printing data.' },
        { name: 'using namespace std;', desc: 'Avoids prefixing std:: before standard identifiers.' }
      ],
      codeExample: `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to C++ with Code Companion!" << endl;
    return 0;
}`,
      tips: 'endl inserts a newline and flushes the output buffer immediately.'
    },
    {
      id: 'cpp-2',
      title: 'Module 2 — Variables & Primitive Types',
      description: 'Work with int, double, char, bool, and std::string.',
      summary: 'C++ provides built-in primitive types as well as the standard std::string class for rich text handling.',
      why: 'Offers high performance with memory control alongside modern object representations.',
      analogy: 'Precision tools engineered to exact dynamic sizing.',
      concepts: [
        { name: 'std::string', desc: 'Dynamic text class supporting concatenation and search.' },
        { name: 'auto Keyword', desc: 'Automatic type deduction by the compiler.' },
        { name: 'const Keyword', desc: 'Declares read-only immutable variables.' }
      ],
      codeExample: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string player_name = "Hero";
    int health = 100;
    const double speed = 5.5;

    cout << player_name << " has " << health << " HP." << endl;
    return 0;
}`,
      tips: 'Use std::string instead of raw C-style char arrays for safer text operations!'
    },
    {
      id: 'cpp-3',
      title: 'Module 3 — Control Flow & Logic',
      description: 'Master branch logic using if, else, and ternary expressions.',
      summary: 'Conditionals direct program flow based on relational logic or state flags.',
      why: 'Real-time applications make rapid decisions based on sensor or game inputs.',
      analogy: 'A high-speed decision checkpoint.',
      concepts: [
        { name: 'if / else', desc: 'Standard logic branching.' },
        { name: 'Ternary Operator (?:)', desc: 'Compact single-line conditional check.' },
        { name: 'Logical Operators', desc: '&&, ||, and ! for compound conditions.' }
      ],
      codeExample: `#include <iostream>
using namespace std;

int main() {
    int score = 88;
    string result = (score >= 60) ? "Passed" : "Failed";
    cout << "Result: " << result << endl;
    return 0;
}`,
      tips: 'Keep ternary expressions simple. Avoid nesting ternary operators.'
    },
    {
      id: 'cpp-4',
      title: 'Module 4 — Loops & Range-Based Iteration',
      description: 'Use traditional loops and modern range-based for loops.',
      summary: 'C++ offers traditional index loops as well as clean range-based for loops over collections.',
      why: 'Simplifies traversing standard containers without indexing errors.',
      analogy: 'Inspecting elements along a row cleanly one by one.',
      concepts: [
        { name: 'Range-Based for Loop', desc: 'for (auto item : container) iterates over every element.' },
        { name: 'while & do-while', desc: 'Condition-driven loop constructs.' },
        { name: 'break & continue', desc: 'Flow interruption within loop bodies.' }
      ],
      codeExample: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {90, 85, 92};
    for (int s : scores) {
        cout << "Score: " << s << endl;
    }
    return 0;
}`,
      tips: 'Use for (const auto& item : container) to iterate without making unnecessary element copies!'
    },
    {
      id: 'cpp-5',
      title: 'Module 5 — Functions & References (&)',
      description: 'Pass parameters by value or reference for speed and mutation.',
      summary: 'Passing by reference (&) allows functions to mutate original variables without making costly data copies.',
      why: 'Avoids copying large objects like vectors or matrices during function calls.',
      analogy: 'Sharing a live document link rather than printing a new paper copy.',
      concepts: [
        { name: 'Pass-by-Value', desc: 'Default behavior; function receives a copy.' },
        { name: 'Pass-by-Reference (&)', desc: 'Function operates directly on caller\'s variable.' },
        { name: 'Default Arguments', desc: 'Provides fallback values for omitted arguments.' }
      ],
      codeExample: `#include <iostream>
using namespace std;

void double_value(int &num) {
    num *= 2; // Mutates original argument
}

int main() {
    int val = 10;
    double_value(val);
    cout << "Doubled value: " << val << endl; // Prints 20
    return 0;
}`,
      tips: 'Use const references (const string &s) when passing large objects that should not be modified.'
    },
    {
      id: 'cpp-6',
      title: 'Module 6 — Dynamic Arrays with std::vector',
      description: 'Use the Standard Template Library (STL) vector container.',
      summary: 'std::vector is a dynamic array that resizes automatically when elements are added or removed.',
      why: 'Replaces risky manual dynamic memory allocation (new/delete) with safe automatic management.',
      analogy: 'An expandable accordion folder that grows as you add documents.',
      concepts: [
        { name: '.push_back()', desc: 'Appends a new element to the end of the vector.' },
        { name: '.size()', desc: 'Returns current element count.' },
        { name: '.pop_back()', desc: 'Removes the last element.' }
      ],
      codeExample: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<string> items;
    items.push_back("Sword");
    items.push_back("Shield");

    cout << "Inventory size: " << items.size() << endl;
    cout << "First item: " << items[0] << endl;
    return 0;
}`,
      tips: 'Prefer std::vector over raw C-style arrays for almost all dynamic collection needs in C++!'
    },
    {
      id: 'cpp-7',
      title: 'Module 7 — Pointers & Memory Management',
      description: 'Understand raw pointers, references, and memory allocation.',
      summary: 'Pointers store memory addresses, giving full control over system memory layout.',
      why: 'Required for low-level performance tuning, custom data structures, and native library bindings.',
      analogy: 'Direct physical coordinates pointing to a specific location in space.',
      concepts: [
        { name: '* Pointer', desc: 'Holds memory address of target type.' },
        { name: 'nullptr', desc: 'Modern null pointer keyword in C++11.' },
        { name: 'new / delete', desc: 'Allocates and frees heap memory manually.' }
      ],
      codeExample: `#include <iostream>
using namespace std;

int main() {
    int *ptr = new int(100); // Heap allocation
    cout << "Heap Value: " << *ptr << endl;

    delete ptr;    // Deallocate heap memory
    ptr = nullptr; // Clear dangling pointer
    return 0;
}`,
      tips: 'Always pair every new with a delete, or use modern smart pointers (std::unique_ptr)!'
    },
    {
      id: 'cpp-8',
      title: 'Module 8 — Classes & Encapsulation',
      description: 'Build custom object-oriented classes with public and private access modifiers.',
      summary: 'Classes encapsulate private data fields behind public member methods.',
      why: 'Protects internal state from invalid modifications and exposes clean interfaces.',
      analogy: 'A bank ATM: you interact with public buttons, but private cash vaults remain protected inside.',
      concepts: [
        { name: 'private / public', desc: 'Access specifiers controlling visibility.' },
        { name: 'Constructor', desc: 'Special member function initializing class objects.' },
        { name: 'Member Functions', desc: 'Methods operating on object instance data.' }
      ],
      codeExample: `#include <iostream>
#include <string>
using namespace std;

class BankAccount {
private:
    double balance;
public:
    BankAccount(double initial_balance) {
        balance = initial_balance;
    }
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
    double get_balance() const { return balance; }
};

int main() {
    BankAccount acc(500.0);
    acc.deposit(150.0);
    cout << "Balance: $" << acc.get_balance() << endl;
    return 0;
}`,
      tips: 'Mark getter methods as const if they do not modify any class member variables!'
    },
    {
      id: 'cpp-9',
      title: 'Module 9 — Inheritance & Polymorphism',
      description: 'Derive sub-classes and use virtual functions for dynamic dispatch.',
      summary: 'Inheritance reuses base class properties; polymorphism allows derived classes to override methods.',
      why: 'Allows uniform handling of different object types through base class interfaces.',
      analogy: 'Shape is a base concept; Circle and Rectangle inherit from Shape but calculate area differently.',
      concepts: [
        { name: 'Base & Derived Class', desc: 'class Child : public Parent inherits properties.' },
        { name: 'virtual Keyword', desc: 'Enables dynamic polymorphism through base pointers.' },
        { name: 'Override', desc: 'Explicitly overrides base class virtual method.' }
      ],
      codeExample: `#include <iostream>
using namespace std;

class Animal {
public:
    virtual void make_sound() const { cout << "Generic sound" << endl; }
};

class Dog : public Animal {
public:
    void make_sound() const override { cout << "Woof! Woof!" << endl; }
};

int main() {
    Animal *a = new Dog();
    a->make_sound(); // Outputs Woof! Woof!
    delete a;
    return 0;
}`,
      tips: 'Make base class destructors virtual whenever using polymorphism to prevent memory leaks!'
    },
    {
      id: 'cpp-10',
      title: 'Module 10 — Exception Handling',
      description: 'Catch runtime exceptions cleanly using try, catch, and std::exception.',
      summary: 'Exceptions throw error objects up the stack until caught by a matching catch block.',
      why: 'Ensures robustness when handling file IO, network connections, or memory failures.',
      analogy: 'An emergency brake stopping system failure gracefully.',
      concepts: [
        { name: 'throw', desc: 'Raises an exception object.' },
        { name: 'try / catch', desc: 'Surrounds risky operations and handles exceptions.' },
        { name: 'std::runtime_error', desc: 'Standard exception class carrying explanatory string message.' }
      ],
      codeExample: `#include <iostream>
#include <stdexcept>
using namespace std;

double divide(double a, double b) {
    if (b == 0) throw runtime_error("Division by zero!");
    return a / b;
}

int main() {
    try {
        cout << divide(10, 0) << endl;
    } catch (const exception &e) {
        cout << "Error caught: " << e.what() << endl;
    }
    return 0;
}`,
      tips: 'Catch exceptions by const reference (const std::exception &e) to prevent object slicing!'
    }
  ],

  java: [
    {
      id: 'java-1',
      title: 'Module 1 — Getting Started with Java',
      description: 'Understand JVM, class-based structure, and main method execution.',
      summary: 'Java is a compiled, strongly-typed, object-oriented language that compiles into bytecode executed by the JVM.',
      why: 'Powers enterprise backends, Android applications, and large-scale financial platforms.',
      analogy: 'Writing a universal blueprint that runs anywhere a Java runtime engine is installed.',
      concepts: [
        { name: 'JVM (Java Virtual Machine)', desc: 'Executes compiled Java bytecode cross-platform.' },
        { name: 'public class Main', desc: 'File name must match the public class name exactly.' },
        { name: 'public static void main()', desc: 'Standard entry point signature for Java applications.' }
      ],
      codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World from Java!");
    }
}`,
      tips: 'Java is strictly case-sensitive! Main and main are different identifiers.'
    },
    {
      id: 'java-2',
      title: 'Module 2 — Variables & Primitive Types',
      description: 'Master int, double, boolean, char, and String in Java.',
      summary: 'Java enforces strong static typing with 8 primitive types alongside reference objects like String.',
      why: 'Prevents type confusion bugs at compile time.',
      analogy: 'Strictly specified dimensions for parts in a manufacturing plant.',
      concepts: [
        { name: 'Primitives', desc: 'int, long, double, float, boolean, char, byte, short.' },
        { name: 'String Class', desc: 'Immutable text representation object.' },
        { name: 'Final Constants', desc: 'final keyword makes variables immutable.' }
      ],
      codeExample: `public class Main {
    public static void main(String[] args) {
        int age = 22;
        double gpa = 3.9;
        boolean isGraduated = true;
        String name = "Sophia";

        System.out.println(name + " has GPA " + gpa);
    }
}`,
      tips: 'Always compare String content using .equals() rather than == operator!'
    },
    {
      id: 'java-3',
      title: 'Module 3 — Operators & Conditionals',
      description: 'Evaluate expressions and control logic with if, else, and switch.',
      summary: 'Java conditionals execute branches based on boolean checks or switch expression matches.',
      why: 'Enables application decision logic.',
      analogy: 'Sorting mail into destination bins according to address labels.',
      concepts: [
        { name: 'if / else if / else', desc: 'Standard boolean branching.' },
        { name: 'Switch Statements', desc: 'Multi-way branch matching discrete primitives or Strings.' },
        { name: 'Logical Operators', desc: '&& (short-circuit AND), || (short-circuit OR).' }
      ],
      codeExample: `public class Main {
    public static void main(String[] args) {
        int score = 85;
        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else {
            System.out.println("Grade: C");
        }
    }
}`,
      tips: 'In Java, if conditions MUST evaluate to a boolean expression (True/False). Numbers cannot be used directly as conditions!'
    },
    {
      id: 'java-4',
      title: 'Module 4 — Loops (for, while, for-each)',
      description: 'Master standard loops and enhanced for-each iteration.',
      summary: 'Loops repeat statements until terminating criteria are satisfied.',
      why: 'Crucial for iterating collections and processing records.',
      analogy: 'Scanning items through a checkout scanner item by item.',
      concepts: [
        { name: 'Enhanced for-each', desc: 'for (Type item : collection) cleanly traverses items.' },
        { name: 'while Loop', desc: 'Repeats while boolean test remains true.' },
        { name: 'break / continue', desc: 'Controls loop execution flow.' }
      ],
      codeExample: `public class Main {
    public static void main(String[] args) {
        String[] languages = {"Java", "Python", "C++"};
        for (String lang : languages) {
            System.out.println("Language: " + lang);
        }
    }
}`,
      tips: 'Use enhanced for-each loops whenever you don\'t need array index numbers!'
    },
    {
      id: 'java-5',
      title: 'Module 5 — Methods & Modular Design',
      description: 'Create reusable methods with parameters and return types.',
      summary: 'Methods encapsulate reusable logic within classes.',
      why: 'Promotes DRY (Don\'t Repeat Yourself) clean code architecture.',
      analogy: 'Sending a job request to a specialist worker and getting a report back.',
      concepts: [
        { name: 'Method Signature', desc: 'Return type, method name, and parameter list.' },
        { name: 'static Methods', desc: 'Belong to class itself without requiring instance creation.' },
        { name: 'Method Overloading', desc: 'Multiple methods sharing the same name with different parameter lists.' }
      ],
      codeExample: `public class Main {
    public static int multiply(int a, int b) {
        return a * b;
    }

    public static void main(String[] args) {
        int result = multiply(6, 7);
        System.out.println("Product: " + result);
    }
}`,
      tips: 'Make helper utility methods static when they do not rely on instance variable state.'
    },
    {
      id: 'java-6',
      title: 'Module 6 — Dynamic Collections with ArrayList',
      description: 'Use java.util.ArrayList for dynamic resizable lists.',
      summary: 'ArrayList provides resizable array storage supporting generic type safety.',
      why: 'Arrays in Java have fixed size; ArrayList dynamically resizes as data grows.',
      analogy: 'An expandable binder where you can insert or remove pages anytime.',
      concepts: [
        { name: 'ArrayList<T>', desc: 'Generic collection class holding objects.' },
        { name: '.add() & .get()', desc: 'Methods for appending and accessing elements.' },
        { name: '.size()', desc: 'Returns number of stored elements.' }
      ],
      codeExample: `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> cities = new ArrayList<>();
        cities.add("New York");
        cities.add("Tokyo");

        System.out.println("First City: " + cities.get(0));
        System.out.println("Total Cities: " + cities.size());
    }
}`,
      tips: 'Use wrapper classes (Integer, Double) instead of primitive types inside ArrayList generics!'
    },
    {
      id: 'java-7',
      title: 'Module 7 — Classes & Objects',
      description: 'Construct object-oriented models using classes, fields, and constructors.',
      summary: 'Classes act as blueprints defining instance state (fields) and behaviors (methods).',
      why: 'OOP encapsulates application concepts into cohesive domain models.',
      analogy: 'A vehicle registration record template versus an actual registered vehicle.',
      concepts: [
        { name: 'Constructors', desc: 'Special initialization method named after the class.' },
        { name: 'this Keyword', desc: 'Refers to current object instance.' },
        { name: 'Instance Fields', desc: 'Variables holding state unique to each instance.' }
      ],
      codeExample: `class Student {
    private String name;
    private int id;

    public Student(String name, int id) {
        this.name = name;
        this.id = id;
    }

    public void display() {
        System.out.println("Student: " + name + " (ID: " + id + ")");
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student("Marcus", 402);
        s.display();
    }
}`,
      tips: 'Always make instance fields private and expose public getters/setters!'
    },
    {
      id: 'java-8',
      title: 'Module 8 — Inheritance & Interfaces',
      description: 'Extend base classes and implement contract interfaces.',
      summary: 'Inheritance (extends) passes down behavior; Interfaces (implements) define behavioral contracts.',
      why: 'Enables flexible software design patterns and loose coupling.',
      analogy: 'An interface is like an electrical socket specification; any plug implementing it will work.',
      concepts: [
        { name: 'extends Keyword', desc: 'Single inheritance mechanism in Java.' },
        { name: 'implements Keyword', desc: 'Implements abstract interface contracts.' },
        { name: '@Override', desc: 'Annotation verifying base method override.' }
      ],
      codeExample: `interface Playable {
    void play();
}

class Guitar implements Playable {
    @Override
    public void play() {
        System.out.println("Strumming guitar chords! 🎸");
    }
}

public class Main {
    public static void main(String[] args) {
        Playable p = new Guitar();
        p.play();
    }
}`,
      tips: 'Java allows single class inheritance but multiple interface implementation!'
    },
    {
      id: 'java-9',
      title: 'Module 9 — Exception Handling (try-catch)',
      description: 'Handle runtime errors cleanly using try, catch, and finally blocks.',
      summary: 'Exceptions catch runtime disruptions, allowing applications to recover gracefully.',
      why: 'Prevents enterprise server applications from shutting down due to bad requests.',
      analogy: 'An automatic circuit breaker interrupting power surges to protect electronics.',
      concepts: [
        { name: 'try-catch', desc: 'Encloses risky code and provides error handling.' },
        { name: 'finally', desc: 'Block that executes unconditionally for resource cleanup.' },
        { name: 'Checked vs Unchecked', desc: 'Checked exceptions must be caught or declared.' }
      ],
      codeExample: `public class Main {
    public static void main(String[] args) {
        try {
            int[] nums = {1, 2, 3};
            System.out.println(nums[5]); // Out of bounds
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Error: Invalid array index accessed!");
        } finally {
            System.out.println("Cleanup completed.");
        }
    }
}`,
      tips: 'Always close open streams or database connections in a finally block or try-with-resources statement!'
    }
  ],

  javascript: [
    {
      id: 'js-1',
      title: 'Module 1 — Getting Started with JavaScript',
      description: 'Understand JS execution in web browsers, Node.js, and console logging.',
      summary: 'JavaScript is a dynamic, multi-paradigm programming language that powers interactive web interfaces and servers.',
      why: 'Essential language for front-end web development, full-stack Node.js development, and web APIs.',
      analogy: 'Adding nervous system responsiveness and interactivity to a web page structure.',
      concepts: [
        { name: 'console.log()', desc: 'Outputs messages directly to developer console.' },
        { name: 'Browser vs Node.js', desc: 'Browsers provide DOM APIs; Node.js provides OS/server APIs.' },
        { name: 'Dynamic Typing', desc: 'Variables hold values without static type enforcement.' }
      ],
      codeExample: `// Print output to console
console.log("Hello from JavaScript!");

// Dynamic variable mutation
let score = 100;
score = "One Hundred"; // Valid in JS
console.log("Score:", score);`,
      tips: 'Use modern ES6+ features and avoid legacy var keyword!'
    },
    {
      id: 'js-2',
      title: 'Module 2 — Variables (let, const)',
      description: 'Master block-scoped variable declarations using let and const.',
      summary: 'const declares immutable references, while let declares re-assignable block-scoped variables.',
      why: 'Prevents scope leakage and unintended global variable bugs.',
      analogy: 'const is a permanent label; let is a whiteboard marker you can erase.',
      concepts: [
        { name: 'const', desc: 'Block-scoped constant reference; value binding cannot be reassigned.' },
        { name: 'let', desc: 'Block-scoped reassignable variable.' },
        { name: 'Template Literals', desc: 'Backtick strings \`Value: ${val}\` for embedded expressions.' }
      ],
      codeExample: `const maxItems = 5;
let currentItems = 2;

currentItems += 1; // Allowed
console.log(\`Items: \${currentItems} of \${maxItems}\`);`,
      tips: 'Default to using const for all variables unless you know you will reassign their value later!'
    },
    {
      id: 'js-3',
      title: 'Module 3 — Conditionals & Strict Equality',
      description: 'Compare values accurately using strict equality (===) and branching.',
      summary: 'Strict equality (===) checks both value and type without coercion, avoiding bug-prone loose equality (==).',
      why: 'Ensures predictable comparison logic across numbers, strings, and booleans.',
      analogy: 'Checking both fingerprint and ID card rather than just glance similarity.',
      concepts: [
        { name: 'Strict Equality (===)', desc: 'Checks equality without type coercion.' },
        { name: 'Loose Equality (==)', desc: 'Coerces types before comparing (avoid!).' },
        { name: 'Truthy & Falsy', desc: '0, "", null, undefined, NaN evaluate as false in boolean checks.' }
      ],
      codeExample: `const inputScore = "100";
const targetScore = 100;

console.log(inputScore == targetScore);  // true (type coerced)
console.log(inputScore === targetScore); // false (strict type check)`,
      tips: 'Always use === and !== to avoid unexpected type coercion surprises!'
    },
    {
      id: 'js-4',
      title: 'Module 4 — Loops & Array Higher-Order Methods',
      description: 'Iterate over data using loops, .forEach(), and .map().',
      summary: 'Modern JS relies heavily on functional array methods like map and filter alongside traditional loops.',
      why: 'Clean functional transformations keep code concise and readable.',
      analogy: 'Passing items down an automated processing pipeline.',
      concepts: [
        { name: 'for...of Loop', desc: 'Iterates directly over iterable values.' },
        { name: '.forEach()', desc: 'Executes callback for every array item.' },
        { name: '.map()', desc: 'Transforms array elements into a new transformed array.' }
      ],
      codeExample: `const prices = [10, 20, 30];
const pricesWithTax = prices.map(price => price * 1.1);

console.log("Original:", prices);
console.log("With Tax:", pricesWithTax);`,
      tips: '.map() returns a brand-new array without mutating the original input array!'
    },
    {
      id: 'js-5',
      title: 'Module 5 — Functions & Arrow Syntax (=>)',
      description: 'Declare reusable functions using standard declarations and concise arrow functions.',
      summary: 'Arrow functions (=>) provide compact syntax for anonymous callbacks and function expressions.',
      why: 'Arrow functions simplify callback heavy web code.',
      analogy: 'A quick formula shortcut.',
      concepts: [
        { name: 'Function Declaration', desc: 'Hoisted function statement: function greet() {}' },
        { name: 'Arrow Function', desc: 'Concise syntax: const greet = () => {}' },
        { name: 'Default Parameters', desc: 'Fallback parameter values if arguments are missing.' }
      ],
      codeExample: `// Arrow function with default parameter
const calculateTotal = (subtotal, taxRate = 0.05) => {
    return subtotal + (subtotal * taxRate);
};

console.log("Total:", calculateTotal(100));`,
      tips: 'If an arrow function has a single expression body, you can omit curly braces and return keyword!'
    },
    {
      id: 'js-6',
      title: 'Module 6 — Objects & Destructuring',
      description: 'Represent key-value data with object literals and unpack properties cleanly.',
      summary: 'Objects store key-value pairs; destructuring allows extracting properties directly into variables.',
      why: 'Used extensively when working with JSON data from APIs.',
      analogy: 'Unpacking specific items out of a delivery package directly into your hands.',
      concepts: [
        { name: 'Object Literals', desc: 'Key-value maps: { name: "Alex", role: "Dev" }' },
        { name: 'Object Destructuring', desc: 'const { name, role } = userProfile' },
        { name: 'Spread Operator (...)', desc: 'Clones or merges objects and arrays cleanly.' }
      ],
      codeExample: `const user = { username: "coder_99", level: "Intermediate", rank: 5 };

// Destructuring extraction
const { username, level } = user;
console.log(\`User \${username} is at \${level} level.\`);`,
      tips: 'Use the spread operator ({ ...user, rank: 6 }) to create updated object copies immutably!'
    },
    {
      id: 'js-7',
      title: 'Module 7 — DOM Manipulation Basics',
      description: 'Interact with HTML page elements dynamically in web browsers.',
      summary: 'The Document Object Model (DOM) represents web page elements as editable JavaScript objects.',
      why: 'Powers interactive web apps that update text, styles, and elements without reloading.',
      analogy: 'Manipulating puppets on stage using background control strings.',
      concepts: [
        { name: 'document.querySelector()', desc: 'Finds HTML elements matching CSS selectors.' },
        { name: 'addEventListener()', desc: 'Attaches click, input, or keyboard event handlers.' },
        { name: 'textContent & innerHTML', desc: 'Updates text content inside DOM nodes.' }
      ],
      codeExample: `// Select button element and attach click handler
const button = document.querySelector('#btn-submit');
if (button) {
    button.addEventListener('click', () => {
        console.log("Button clicked!");
    });
}`,
      tips: 'Always check if querySelector returned a valid element before trying to access its properties!'
    },
    {
      id: 'js-8',
      title: 'Module 8 — Asynchronous JS & Promises',
      description: 'Understand async/await and non-blocking asynchronous operations.',
      summary: 'Asynchronous JavaScript executes network fetches and delays without freezing the browser user interface.',
      why: 'Web apps fetch data from backend servers asynchronously while users continue interacting.',
      analogy: 'Ordering food at a counter, getting a buzzer (Promise), and picking up your food when it buzzes.',
      concepts: [
        { name: 'Promises', desc: 'Objects representing future completion or failure of async tasks.' },
        { name: 'async / await', desc: 'Syntactic sugar for writing async code sequentially.' },
        { name: 'fetch() API', desc: 'Browser API for making HTTP requests.' }
      ],
      codeExample: `async function loadData() {
    try {
        console.log("Fetching user profile...");
        // Simulated async delay
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("Data loaded successfully!");
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

loadData();`,
      tips: 'Always wrap await calls inside try...catch blocks to handle potential network request failures!'
    }
  ],

  csharp: [
    {
      id: 'cs-1',
      title: 'Module 1 — Getting Started with C#',
      description: 'Understand .NET framework, Program.cs, and console applications.',
      summary: 'C# is a modern, object-oriented, cross-platform language developed by Microsoft for .NET runtime applications.',
      why: 'Powers enterprise backends, Unity 3D game engine development, and cross-platform desktop applications.',
      analogy: 'A precision engineered framework backed by comprehensive toolsets.',
      concepts: [
        { name: 'Console.WriteLine()', desc: 'Prints formatted text to standard output.' },
        { name: '.NET Runtime', desc: 'Executes C# intermediate language bytecode.' },
        { name: 'Top-Level Statements', desc: 'Modern C# syntax allowing concise script-like main execution.' }
      ],
      codeExample: `using System;

Console.WriteLine("Hello, World from C#!");
int currentYear = 2026;
Console.WriteLine($"Current Year: {currentYear}");`,
      tips: 'Modern C# supports top-level statements, reducing boilerplate class setups in quick scripts!'
    },
    {
      id: 'cs-2',
      title: 'Module 2 — Variables & Data Types',
      description: 'Work with strong primitive types and implicitly typed var variables.',
      summary: 'C# offers explicit static typing alongside var implicit type inference.',
      why: 'Provides high performance with strong static type safety at compile time.',
      analogy: 'Strictly specified dimensions for parts in a manufacturing plant.',
      concepts: [
        { name: 'Primitives', desc: 'int, double, float, bool, char, decimal.' },
        { name: 'var Keyword', desc: 'Compiler infers type from right-side assignment.' },
        { name: 'String Interpolation', desc: '$"Value: {val}" for clean string formatting.' }
      ],
      codeExample: `int items = 10;
double pricePerItem = 15.50;
var totalCost = items * pricePerItem;

Console.WriteLine($"Total Order Cost: \${totalCost}");`,
      tips: 'Use decimal type instead of double when dealing with currency calculations to avoid floating point rounding errors!'
    },
    {
      id: 'cs-3',
      title: 'Module 3 — Control Flow & Switch Expressions',
      description: 'Branch execution logic using conditionals and modern switch expressions.',
      summary: 'C# provides traditional if/else branches and clean pattern-matching switch expressions.',
      why: 'Simplifies complex state conditional branching.',
      analogy: 'Sorting incoming requests into specialized fulfillment paths.',
      concepts: [
        { name: 'if / else', desc: 'Standard relational branching.' },
        { name: 'Switch Expression', desc: 'Compact pattern matching returning values: val switch { 1 => "One", _ => "Other" }' },
        { name: 'Logical Operators', desc: '&&, ||, and ! for boolean expressions.' }
      ],
      codeExample: `int status_code = 200;

string statusMessage = status_code switch
{
    200 => "OK - Request Successful",
    404 => "Not Found",
    500 => "Server Error",
    _   => "Unknown Status"
};

Console.WriteLine($"Status: {statusMessage}");`,
      tips: 'The underscore _ in switch expressions acts as the default fallback case!'
    },
    {
      id: 'cs-4',
      title: 'Module 4 — Loops & Collections Iteration',
      description: 'Iterate over lists and arrays using for and foreach loops.',
      summary: 'foreach loops provide clean iteration over standard collection types.',
      why: 'Simplifies processing sequential data sets.',
      analogy: 'Scanning items through a checkout scanner item by item.',
      concepts: [
        { name: 'foreach Loop', desc: 'foreach (var item in collection) traverses element values.' },
        { name: 'for Loop', desc: 'Traditional counter-driven loop.' },
        { name: 'break / continue', desc: 'Loop flow control statement.' }
      ],
      codeExample: `string[] fruits = { "Apple", "Banana", "Cherry" };

foreach (var fruit in fruits)
{
    Console.WriteLine($"Fruit item: {fruit}");
}`,
      tips: 'Use foreach loops whenever array or collection indexing is not explicitly required!'
    },
    {
      id: 'cs-5',
      title: 'Module 5 — Methods & Parameters',
      description: 'Construct reusable methods with return values and default parameters.',
      summary: 'Methods modularize program actions, supporting static invocation and parameter defaults.',
      why: 'Enforces clean code structure and reuse across classes.',
      analogy: 'Sending a job request to a specialist worker and getting a report back.',
      concepts: [
        { name: 'Method Signature', desc: 'Return type, method name, parameter list.' },
        { name: 'Expression-Bodied Method', desc: 'int Add(int a, int b) => a + b;' },
        { name: 'Optional Parameters', desc: 'Parameters with assigned default values.' }
      ],
      codeExample: `static double CalculateDiscount(double price, double discountRate = 0.1)
{
    return price * (1.0 - discountRate);
}

double finalPrice = CalculateDiscount(100.0);
Console.WriteLine($"Discounted Price: \${finalPrice}");`,
      tips: 'Use expression-bodied member syntax (=>) for single-line methods!'
    },
    {
      id: 'cs-6',
      title: 'Module 6 — Dynamic Collections (List<T>)',
      description: 'Use Generic List<T> collections for dynamic data sets.',
      summary: 'List<T> from System.Collections.Generic provides dynamic auto-resizing array storage.',
      why: 'Arrays in C# are fixed size; List<T> grows as data is added dynamically.',
      analogy: 'An expandable binder where you can insert or remove pages anytime.',
      concepts: [
        { name: 'List<T>', desc: 'Generic dynamic array collection.' },
        { name: '.Add() & .Remove()', desc: 'Methods for appending and deleting items.' },
        { name: '.Count', desc: 'Property returning total stored element count.' }
      ],
      codeExample: `using System.Collections.Generic;

List<string> players = new List<string> { "Alice", "Bob" };
players.Add("Charlie");

Console.WriteLine($"Player Count: {players.Count}");
Console.WriteLine($"First Player: {players[0]}");`,
      tips: 'Use List<T> over raw arrays when the final number of elements is not known in advance!'
    },
    {
      id: 'cs-7',
      title: 'Module 7 — Classes & Auto-Properties',
      description: 'Build custom OOP objects with auto-implemented properties { get; set; }.',
      summary: 'Auto-properties { get; set; } encapsulate field backing stores cleanly in C#.',
      why: 'Provides clean access control without requiring verbose manual getter/setter methods.',
      analogy: 'Smart controls with built-in validation checks.',
      concepts: [
        { name: 'Auto-Properties', desc: 'public string Name { get; set; }' },
        { name: 'Constructors', desc: 'Special initialization method named after class.' },
        { name: 'Read-only Properties', desc: 'public int Id { get; }' }
      ],
      codeExample: `class Product
{
    public int Id { get; }
    public string Name { get; set; }

    public Product(int id, string name)
    {
        Id = id;
        Name = name;
    }
}

var p = new Product(101, "Gaming Mouse");
Console.WriteLine($"Product: {p.Name} (ID: {p.Id})");`,
      tips: 'Use get; init; properties for immutable object property initialization!'
    },
    {
      id: 'cs-8',
      title: 'Module 8 — Interfaces & Polymorphism',
      description: 'Define behavioral contracts using interfaces and class implementations.',
      summary: 'Interfaces (IInterfaceName) enforce method implementation contracts across classes.',
      why: 'Decouples implementation logic and facilitates unit testing.',
      analogy: 'An electrical outlet standard that accepts any compatible device plug.',
      concepts: [
        { name: 'interface Keyword', desc: 'Defines abstract contract without state fields.' },
        { name: 'Implementation', desc: 'class Service : IService implements contract.' },
        { name: 'Polymorphism', desc: 'Treating objects through their interface references.' }
      ],
      codeExample: `interface ILogger
{
    void Log(string message);
}

class ConsoleLogger : ILogger
{
    public void Log(string message) => Console.WriteLine($"[LOG]: {message}");
}

ILogger logger = new ConsoleLogger();
logger.Log("Application initialized.");`,
      tips: 'Prefix interface names with capital "I" (e.g. ILogger, IRepository) in C#!'
    }
  ],

  go: [
    {
      id: 'go-1',
      title: 'Module 1 — Getting Started with Go',
      description: 'Understand package main, func main, and running Go programs.',
      summary: 'Go (Golang) is an open-source compiled language designed by Google for simplicity, concurrency, and high performance.',
      why: 'Powers cloud-native infrastructure including Docker, Kubernetes, Terraform, and high-concurrency microservices.',
      analogy: 'A lightweight streamlined sports car stripped of unnecessary clutter for raw execution efficiency.',
      concepts: [
        { name: 'package main', desc: 'Declares executable program package.' },
        { name: 'func main()', desc: 'Mandatory entry point function.' },
        { name: 'fmt.Println()', desc: 'Standard formatted output function from fmt package.' }
      ],
      codeExample: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World from Go! 🐹")
}`,
      tips: 'Go automatically formats your code using "go fmt". Unused imports will cause compile errors!'
    },
    {
      id: 'go-2',
      title: 'Module 2 — Variables & Short Declaration (:=)',
      description: 'Master explicit variable declaration and short variable assignment.',
      summary: 'Go is statically typed. Short declaration (:=) infers types automatically inside function bodies.',
      why: 'Combines type safety with clean, readable variable declaration syntax.',
      analogy: 'Smart storage slots that adapt to the item placed inside them.',
      concepts: [
        { name: 'Short Declaration (:=)', desc: 'Declares and initializes variables in one step inside functions.' },
        { name: 'var Keyword', desc: 'Explicit declaration keyword; useful for zero-value initialization.' },
        { name: 'Zero Values', desc: 'Variables initialized without values receive default zero values (0, "", false, nil).' }
      ],
      codeExample: `package main

import "fmt"

func main() {
    // Short variable declaration
    user := "Alex"
    score := 95
    isOnline := true

    fmt.Printf("User %s has score %d (Online: %t)\\n", user, score, isOnline)
}`,
      tips: 'Short declaration operator (:=) can only be used INSIDE functions, not at global package level!'
    },
    {
      id: 'go-3',
      title: 'Module 3 — Conditionals & Switch',
      description: 'Evaluate logic using if statements with init statements and switch cases.',
      summary: 'Go conditionals allow declaring temporary variables directly within if headers.',
      why: 'Limits variable scope to the conditional block where it is needed.',
      analogy: 'A quick inspection station with dedicated temporary workspace.',
      concepts: [
        { name: 'If with Init', desc: 'if val := getVal(); val > 10 {}' },
        { name: 'Switch Statement', desc: 'Clean case matching without requiring explicit break statements.' },
        { name: 'No Parentheses', desc: 'Go conditional checks omit parentheses around conditions.' }
      ],
      codeExample: `package main

import "fmt"

func main() {
    score := 85

    if score >= 90 {
        fmt.Println("Grade: A")
    } else if score >= 80 {
        fmt.Println("Grade: B")
    } else {
        fmt.Println("Grade: C")
    }
}`,
      tips: 'In Go, switch cases do NOT fall through automatically. No break statements are needed!'
    },
    {
      id: 'go-4',
      title: 'Module 4 — Loops (Go\'s Single Loop: for)',
      description: 'Master Go\'s versatile for loop keyword.',
      summary: 'Go features only ONE loop keyword: for. It handles traditional loops, while loops, and range iterations.',
      why: 'Eliminates redundant keywords while maintaining full loop flexibility.',
      analogy: 'A single multi-purpose tool that adjusts to perform all looping tasks.',
      concepts: [
        { name: 'Standard for', desc: 'for i := 0; i < 5; i++ {}' },
        { name: 'While-style for', desc: 'for condition {}' },
        { name: 'Infinite for', desc: 'for {} repeats indefinitely until break statement.' }
      ],
      codeExample: `package main

import "fmt"

func main() {
    // Traditional counter loop
    for i := 1; i <= 3; i++ {
        fmt.Println("Count:", i)
    }

    // While-style loop
    n := 3
    for n > 0 {
        fmt.Println("Countdown:", n)
        n--
    }
}`,
      tips: 'To loop over slices or maps, use for index, value := range collection!'
    },
    {
      id: 'go-5',
      title: 'Module 5 — Functions & Multiple Returns',
      description: 'Write modular functions that return multiple values.',
      summary: 'Go functions support returning multiple values, commonly used to return a result alongside an error.',
      why: 'Enables clean error propagation without raising heavy runtime exceptions.',
      analogy: 'A package handler delivering both your ordered item and a receipt slip.',
      concepts: [
        { name: 'Multiple Return Values', desc: 'func divide(a, b float64) (float64, error)' },
        { name: 'Blank Identifier (_)', desc: 'Discards unwanted returned values.' },
        { name: 'Named Returns', desc: 'Pre-named return variables in function signatures.' }
      ],
      codeExample: `package main

import (
    "errors"
    "fmt"
)

func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Result:", result)
}`,
      tips: 'Use the blank identifier _ if you want to ignore one of the returned values!'
    },
    {
      id: 'go-6',
      title: 'Module 6 — Slices & Maps',
      description: 'Work with dynamic slices and key-value maps.',
      summary: 'Slices are dynamically sized views over underlying arrays; Maps store key-value associations.',
      why: 'Slices and Maps are the primary workhorse data structures in Go.',
      analogy: 'A flexible window viewing an expandable ribbon of memory.',
      concepts: [
        { name: 'Slices', desc: 'Dynamic array abstractions: numbers := []int{10, 20}' },
        { name: 'append()', desc: 'Appends elements to slice, growing memory as needed.' },
        { name: 'Maps', desc: 'Key-value maps created with make(map[string]int).' }
      ],
      codeExample: `package main

import "fmt"

func main() {
    // Slice operations
    cities := []string{"Tokyo", "Paris"}
    cities = append(cities, "London")

    // Map operations
    scores := map[string]int{"Alice": 95, "Bob": 88}

    fmt.Println("Cities:", cities)
    fmt.Println("Alice's Score:", scores["Alice"])
}`,
      tips: 'When looking up map values, use the 2-value lookup val, ok := map[key] to check if a key exists!'
    },
    {
      id: 'go-7',
      title: 'Module 7 — Structs & Receiver Methods',
      description: 'Model custom data types and attach methods using receivers.',
      summary: 'Go does not have traditional class inheritance. Instead, it uses Structs and Receiver Methods.',
      why: 'Provides clean object composition without complex OOP class hierarchies.',
      analogy: 'Attaching custom operating controls directly onto a specific physical tool.',
      concepts: [
        { name: 'struct Type', desc: 'type User struct { Name string; Age int }' },
        { name: 'Value Receiver', desc: 'func (u User) Display() {} operates on a copy.' },
        { name: 'Pointer Receiver', desc: 'func (u *User) SetAge(a int) {} mutates original struct.' }
      ],
      codeExample: `package main

import "fmt"

type Circle struct {
    Radius float64
}

// Method attached to Circle struct
func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func main() {
    c := Circle{Radius: 5.0}
    fmt.Printf("Circle Area: %.2f\\n", c.Area())
}`,
      tips: 'Use pointer receivers (*StructName) when your method needs to modify the struct\'s fields!'
    },
    {
      id: 'go-8',
      title: 'Module 8 — Explicit Error Handling',
      description: 'Master Go\'s idiomatic error handling pattern with error return values.',
      summary: 'Go treats errors as regular values of type error rather than throwing uncaught exceptions.',
      why: 'Forces developers to handle potential failure points explicitly, making code highly reliable.',
      analogy: 'Checking the green/red status light after every step before proceeding.',
      concepts: [
        { name: 'error Interface', desc: 'Built-in interface representing error conditions.' },
        { name: 'if err != nil', desc: 'Standard Go pattern for checking operation success.' },
        { name: 'fmt.Errorf()', desc: 'Formats custom wrapped error messages.' }
      ],
      codeExample: `package main

import (
    "fmt"
    "os"
)

func main() {
    file, err := os.Open("non_existent_file.txt")
    if err != nil {
        fmt.Println("Failed to open file:", err)
        return
    }
    defer file.Close()
}`,
      tips: 'Embrace "if err != nil"! It is the cornerstone of writing reliable software in Go.'
    }
  ]
};
