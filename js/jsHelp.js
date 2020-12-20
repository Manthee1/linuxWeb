
function help() {
    var helpPage = `
===============\n
Array Methods||\n
===============\n
\n
concat() — Join several arrays into one\n
indexOf() — Returns the primitive value of the specified object\n
join() — Combine elements of an array into a single string and return\n
the string\n
lastIndexOf() — Gives the last position at which a given element\n
appears in an array\n
pop() — Removes the last element of an array\n
push() — Add a new element at the end\n
reverse() — Sort elements in descending order\n
shift() — Remove the first element of an array\n
slice() — Pulls a copy of a portion of an array into a new array\n
sort() — Sorts elements alphabetically\n
splice() — Adds elements in a specified way and position\n
toString() — Converts elements to strings\n
unshift() — Adds a new element to the beginning\n
valueOf() — Returns the first position at which a given element\n
appears in an array\n
\n
===========\n
OPERATORS||\n
===========\n
\n
-------------------------------------------\n
Basic Operators\n
-------------------------------------------\n
+ — Addition\n
- — Subtraction\n
* — Multiplication\n
/ — Division\n
(...) — Grouping operator, operations within brackets are executed\n
earlier than those outside\n
% — Modulus (remainder )\n
++ — Increment numbers\n
-- — Decrement numbers\n
Comparison Operators\n
== — Equal to\n
=== — Equal value and equal type\n
!= — Not equal\n
!== — Not equal value or not equal type\n
> — Greater than\n
< — Less than\n
>= — Greater than or equal to\n
<= — Less than or equal to\n
? — Ternary operator\n
\n
-------------------------------------------\n
Logical Operators\n
-------------------------------------------\n
document.write() — Write directly to the HTML document\n
prompt() — Creates an dialogue for user input\n
Global Functions\n
decodeURI() — Decodes a Uniform Resource Identifier (URI) created\n
by encodeURI or similar\n
decodeURIComponent() — Decodes a URI component\n
encodeURI() — Encodes a URI into UTF-8\n
encodeURIComponent() — Same but for URI components\n
eval() — Evaluates JavaScript code represented as a string\n
isFinite() — Determines whether a passed value is a finite number\n
isNaN() — Determines whether a value is NaN or not\n
Number() — Returns a number converted from its argument\n
parseFloat() — Parses an argument and returns a floating point number\n
parseInt() — Parses its argument and returns an integer\n
JAVASCRIPT LOOPS\n
for (before loop; condition for loop; execute after loop) {\n
 // what to do during the loop\n
}\n
for — The most common way to create a loop in JavaScript\n
while — Sets up conditions under which aloop executes\n
do while — Similar to the while loop, however, it executes at least\n
once and performs a check at the end to see if the condition is met\n
to execute again\n
break — Used to stop and exit the cycle at certain conditions\n
continue — Skip parts of the cycle if certain conditions are met\n
\n
-------------------------------------------\n
IF - ELSE STATEMENTS\n
-------------------------------------------\n
if (condition) {\n
 // what to do if condition is met\n
} else {\n
 // what to do if condition is not met\n
}\n
\n
=========\n
STRINGS||\n
=========\n
var person = \\John Doe\\;\n
Escape Characters\n
' — Single quote\n
\\ — Double quote\n
\\\\ — Backslash\n
\\\\b — Backspace\n
\\\\f — Form feed\n
\\\n — New line\n
\\\\r — Carriage return\n
\\\\t — Horizontal tabulator\n
\\\\v — Vertical tabulator\n
\n
-------------------------------------------\n
String Methods\n
-------------------------------------------\n
charAt() — Returns a character at a specified position inside a\n
string\n
charCodeAt() — Gives you the unicode of character at that position\n
concat() — Concatenates (joins) two or more strings into one\n
fromCharCode() — Returns a string created from the specified sequence\n
of UTF-16 code units\n
indexOf() — Provides the position of the first occurrence of a\n
specified text within a string\n
lastIndexOf() — Same as indexOf() but with the last occurrence,\n
searching backwards\n
match() — Retrieves the matches of a string against a search pattern\n
replace() — Find and replace specified text in a string\n
search() — Executes a search for a matching text and returns its\n
position\n
slice() — Extracts a section of a string and returns it as a new\n
string\n
split() — Splits a string object into an array of strings at a\n
specified position\n
substr() — Similar to slice() but extracts a substring depended on a\n
specified number of characters\n
substring() — Also similar to slice() but can’t accept negative\n
indices\n
toLowerCase() — Convert strings to lower case\n
toUpperCase() — Convert strings to upper case\n
valueOf() — Returns the primitive value (that has no properties or\n
methods) of a string object\n
\n
===========================\n
REGULAR EXPRESSION SYNTAX||\n
===========================\n
\n
-------------------------------------------\n
Pattern Modifiers\n
-------------------------------------------\n
e — Evaluate replacement\n
i — Perform case-insensitive matching\n
g — Perform global matching\n
m — Perform multiple line matching\n
s — Treat strings as single line\n
x — Allow comments and whitespace in pattern\n
U — Ungreedy pattern\n
Brackets\n
[abc] — Find any of the characters between the brackets\n
[^abc] — Find any character not in the brackets\n
[0-9] — Used to find any digit from 0 to 9\n
[A-z] — Find any character from uppercase A to lowercase z\n
(a|b|c) — Find any of the alternatives separated with |\n
-------------------------------------------\n
Metacharacters\n
-------------------------------------------\n
. — Find a single character, except newline or line terminator\n
\\\\w — Word character\n
\\\\W — Non-word character\n
\\\\d — A digit\n
\\\\D — A non-digit character\n
\\\\s — Whitespace character\n
\\\\S — Non-whitespace character\n
\\\\b — Find a match at the beginning/end of a word\n
\\\\B — A match not at the beginning/end of a word\n
\\\\0 — NUL character\n
\\\n — A new line character\n
\\\\f — Form feed character\n
\\\\r — Carriage return character\n
\\\\t — Tab character\n
\\\\v — Vertical tab character\n
\\\\xxx — The character specified by an octal number xxx\n
\\\\xdd — Character specified by a hexadecimal number dd\n
\\\\uxxxx — The Unicode character specified by a hexadecimal number xxxx\n
\n
-------------------------------------------\n
Quantifiers\n
-------------------------------------------\n
n+ — Matches any string that contains at least one n\n
n* — Any string that contains zero or more occurrences of n\n
n? — A string that contains zero or one occurrences of n\n
n{X} — String that contains a sequence of X n’s\n
n{X,Y} — Strings that contains a sequence of X to Y n’s\n
n{X,} — Matches any string that contains a sequence of at least X n’s\n
n$ — Any string with n at the end of it\n
^n — String with n at the beginning of it\n
?=n — Any string that is followed by a specific string n\n
?!n — String that is not followed by a specific string n\n
\n
==================\n
NUMBERS AND MATH||\n
==================\n
\n
-------------------------------------------\n
Number Properties\n
-------------------------------------------\n
MAX_VALUE — The maximum numeric value representable in JavaScript\n
MIN_VALUE — Smallest positive numeric value representable in\n
JavaScript\n
NaN — The “Not-a-Number” value\n
NEGATIVE_INFINITY — The negative Infinity value\n
POSITIVE_INFINITY — Positive Infinity value\n
\n
-------------------------------------------\n
Number Methods\n
-------------------------------------------\n
toExponential() — Returns a string with a rounded number written as\n
exponential notation\n
toFixed() — Returns the string of a number with a specified number of\n
decimals\n
toPrecision() — String of a number written with a specified length\n
toString() — Returns a number as a string\n
valueOf() — Returns a number as a number\n
\n
-------------------------------------------\n
Math Properties\n
-------------------------------------------\n
E — Euler’s number\n
LN2 — The natural logarithm of 2\n
LN10 — Natural logarithm of 10\n
LOG2E — Base 2 logarithm of E\n
LOG10E — Base 10 logarithm of E\n
PI — The number PI\n
SQRT1_2 — Square root of 1/2\n
SQRT2 — The square root of 2\n
\n
-------------------------------------------\n
Math Methods\n
-------------------------------------------\n
abs(x) — Returns the absolute (positive) value of x\n
acos(x) — The arccosine of x, in radians\n
asin(x) — Arcsine of x, in radians\n
atan(x) — The arctangent of x as a numeric value\n
atan2(y,x) — Arctangent of the quotient of its arguments\n
ceil(x) — Value of x rounded up to its nearest integer\n
cos(x) — The cosine of x (x is in radians)\n
exp(x) — Value of Ex\n
floor(x) — The value of x rounded down to its nearest integer\n
log(x) — The natural logarithm (base E) of x\n
max(x,y,z,...,n) — Returns the number with the highest value\n
min(x,y,z,...,n) — Same for the number with the lowest value\n
pow(x,y) — X to the power of y\n
random() — Returns a random number between 0 and 1\n
round(x) — The value of x rounded to its nearest integer\n
sin(x) — The sine of x (x is in radians)\n
sqrt(x) — Square root of x\n
tan(x) — The tangent of an angle\n
\n
==================================\n
DEALING WITH DATES IN JAVASCRIPT||\n
==================================\n
\n
-------------------------------------------\n
Setting Dates\n
-------------------------------------------\n
Date() — Creates a new date object with the current date and time\n
Date(2017, 5, 21, 3, 23, 10, 0) — Create a custom date object. The\n
numbers represent year, month, day, hour, minutes, seconds,\n
milliseconds. You can omit anything you want except for year and\n
month.\n
Date(\\2017-06-23\\) — Date declaration as a string\n
Pulling Date and Time Values\n
getDate() — Get the day of the month as a number (1-31)\n
getDay() — The weekday as a number (0-6)\n
getFullYear() — Year as a four digit number (yyyy)\n
getHours() — Get the hour (0-23)\n
getMilliseconds() — The millisecond (0-999)\n
getMinutes() — Get the minute (0-59)\n
getMonth() — Month as a number (0-11)\n
getSeconds() — Get the second (0-59)\n
getTime() — Get the milliseconds since January 1, 1970\n
getUTCDate() — The day (date) of the month in the specified date\n
according to universal time (also available for day, month, fullyear,\n
hours, minutes etc.)\n
parse — Parses a string representation of a date, and returns the\n
number of milliseconds since January 1, 1970\n
\n
-------------------------------------------\n
Set Part of a Date\n
-------------------------------------------\n
setDate() — Set the day as a number (1-31)\n
setFullYear() — Sets the year (optionally month and day)\n
setHours() — Set the hour (0-23)\n
setMilliseconds() — Set milliseconds (0-999)\n
setMinutes() — Sets the minutes (0-59)\n
setMonth() — Set the month (0-11)\n
setSeconds() — Sets the seconds (0-59)\n
setTime() — Set the time (milliseconds since January 1, 1970)\n
setUTCDate() — Sets the day of the month for a specified date\n
according to universal time (also available for day, month, fullyear,\n
hours, minutes etc.)\n
\n
==========\n
DOM MODE||\n
==========\n
\n
-------------------------------------------\n
Node Properties\n
-------------------------------------------\n
attributes — Returns a live collection of all attributes registered\n
to and element\n
baseURI — Provides the absolute base URL of an HTML element\n
childNodes — Gives a collection of an element’s child nodes\n
firstChild — Returns the first child node of an element\n
lastChild — The last child node of an element\n
nextSibling — Gives you the next node at the same node tree level\n
nodeName — Returns the name of a node\n
nodeType — Returns the type of a node\n
nodeValue — Sets or returns the value of a node\n
ownerDocument — The top-level document object for this node\n
parentNode — Returns the parent node of an element\n
previousSibling — Returns the node immediately preceding the current\n
one\n
textContent — Sets or returns the textual content of a node and its\n
descendants\n
\n
-------------------------------------------\n
Node Methods\n
-------------------------------------------\n
appendChild() — Adds a new child node to an element as the last child\n
node\n
cloneNode() — Clones an HTML element\n
compareDocumentPosition() — Compares the document position of two\n
elements\n
getFeature() — Returns an object which implements the APIs of a\n
specified feature\n
hasAttributes() — Returns true if an element has any attributes,\n
otherwise false\n
hasChildNodes() — Returns true if an element has any child nodes,\n
otherwise false\n
insertBefore() — Inserts a new child node before a specified,\n
existing child node\n
isDefaultNamespace() — Returns true if a specified namespaceURI is\n
the default, otherwise false\n
isEqualNode() — Checks if two elements are equal\n
isSameNode() — Checks if two elements are the same node\n
isSupported() — Returns true if a specified feature is supported on\n
the element\n
lookupNamespaceURI() — Returns the namespaceURI associated with a\n
given node\n
lookupPrefix() — Returns a DOMString containing the prefix for a\n
given namespaceURI, if present\n
normalize() — Joins adjacent text nodes and removes empty text nodes\n
in an element\n
removeChild() — Remov\n
setAttributeNodeNS() — Adds a new namespaced attribute node to an\n
element\n
\n
===============================\n
WORKING WITH THE USER BROWSER||\n
===============================\n
\n
-------------------------------------------\n
Window Properties\n
-------------------------------------------\n
closed — Checks whether a window has been closed or not and returns\n
true or false\n
defaultStatus — Sets or returns the default text in the statusbar of\n
a window\n
document — Returns the document object for the window\n
frames — Returns all <iframe> elements in the current window\n
history — Provides the History object for the window\n
innerHeight — The inner height of a window’s content area\n
innerWidth — The inner width of the content area\n
length — Find out the number of <iframe> elements in the window\n
location — Returns the location object for the window\n
name — Sets or returns the name of a window\n
navigator — Returns the Navigator object for the window\n
opener — Returns a reference to the window that created the window\n
outerHeight — The outer height of a window, including toolbars/\n
scrollbars\n
outerWidth — The outer width of a window, including toolbars/\n
scrollbars\n
pageXOffset — Number of pixels the current document has been scrolled\n
horizontally\n
pageYOffset — Number of pixels the document has been scrolled\n
vertically\n
parent — The parent window of the current window\n
screen — Returns the Screen object for the window\n
screenLeft — The horizontal coordinate of the window (relative to\n
screen)\n
screenTop — The vertical coordinate of the window\n
screenX — Same as screenLeft but needed for some browsers\n
screenY — Same as screenTop but needed for some browsers\n
self — Returns the current window\n
status — Sets or returns the text in the statusbar of a window\n
top — Returns the topmost browser window\n
\n
-------------------------------------------\n
Window Methods\n
-------------------------------------------\n
alert() — Displays an alert box with a message and an OK button\n
blur() — Removes focus from the current window\n
clearInterval() — Clears a timer set with setInterval()\n
clearTimeout() — Clears a timer set with setTimeout()\n
close() — Closes the current window\n
confirm() — Displays a dialogue box with a message and\n
an OK and Cancelbutton\n
focus() — Sets focus to the current window\n
moveBy() — Moves a window relative to its current position\n
moveTo() — Moves a window to a specified position\n
open() — Opens a new browser window\n
print() — Prints the content of the current window\n
prompt() — Displays a dialogue box that prompts the visitor for input\n
resizeBy() — Resizes the window by the specified number of pixels\n
resizeTo() — Resizes the window to a specified width and height\n
scrollBy() — Scrolls the document by a specified number of pixels\n
scrollTo() — Scrolls the document to specified coordinates\n
setInterval() — Calls a function or evaluates an expression at\n
specified intervals\n
setTimeout() — Calls a function or evaluates an expression after a\n
specified interval\n
stop() — Stops the window from loading\n
Screen Properties\n
availHeight — Returns the height of the screen (excluding the Windows\n
Taskbar)\n
availWidth — Returns the width of the screen (excluding the Windows\n
Taskbar)\n
colorDepth — Returns the bit depth of the color palette for\n
displaying images\n
height — The total height of the screen\n
pixelDepth — The color resolution of the screen in bits per pixel\n
width — The total width of the screen\n
\n
===================\n
JAVASCRIPT EVENTS||\n
===================\n
\n
-------------------------------------------\n
Mouse\n
-------------------------------------------\n
onclick — The event occurs when the user clicks on an element\n
oncontextmenu — User right-clicks on an element to open a context\n
menu\n
ondblclick — The user double-clicks on an element\n
onmousedown — User presses a mouse button over an element\n
onmouseenter — The pointer moves onto an element\n
onmouseleave — Pointer moves out of an element\n
onmousemove — The pointer is moving while it is over an element\n
onmouseover — When the pointer is moved onto an element or one of its\n
children\n
onmouseout — User moves the mouse pointer out of an element or one of\n
its children\n
onmouseup — The user releases a mouse button while over an element\n
-------------------------------------------\n
Keyboard\n
-------------------------------------------\n
onkeydown — When the user is pressing a key down\n
onkeypress — The moment the user starts pressing a key\n
onkeyup — The user releases a key\n
\n
-------------------------------------------\n
Frame\n
-------------------------------------------\n
onabort — The loading of a media is aborted\n
onbeforeunload — Event occurs before the document is about to be\n
unloaded\n
onerror — An error occurs while loading an external file\n
onhashchange — There have been changes to the anchor part of a URL\n
onload — When an object has loaded\n
onpagehide — The user navigates away from a webpage\n
onpageshow — When the user navigates to a webpage\n
onresize — The document view is resized\n
onscroll — An element’s scrollbar is being scrolled\n
onunload — Event occurs when a page has unloaded\n
\n
-------------------------------------------\n
Form\n
-------------------------------------------\n
onblur — When an element loses focus\n
onchange — The content of a form element changes\n
(for <input>, <select>and <textarea>)\n
onfocus — An element gets focus\n
onfocusin — When an element is about to get focus\n
onfocusout — The element is about to lose focus\n
oninput — User input on an element\n
oninvalid — An element is invalid\n
onreset — A form is reset\n
onsearch — The user writes something in a search field\n
(for <input=\\search\\>)\n
onselect — The user selects some text (for <input> and <textarea>)\n
onsubmit — A form is submitted\n
\n
-------------------------------------------\n
Drag\n
-------------------------------------------\n
ondrag — An element is dragged\n
ondragend — The user has finished dragging the element\n
ondragenter — The dragged element enters a drop target\n
ondragleave — A dragged element leaves the drop target\n
ondragover — The dragged element is on top of the drop target\n
ondragstart — User starts to drag an element\n
ondrop — Dragged element is dropped on the drop target\n
Clipboard\n
oncopy — User copies the content of an element\n
oncut — The user cuts an element’s content\n
onpaste — A user pastes content in an element\n
\n
-------------------------------------------\n
Media\n
-------------------------------------------\n
onabort — Media loading is aborted\n
oncanplay — The browser can start playing media (e.g. a file has\n
buffered enough)\n
oncanplaythrough — When browser can play through media without\n
stopping\n
ondurationchange — The duration of the media changes\n
onended — The media has reach its end\n
onerror — Happens when an error occurs while loading an external file\n
onloadeddata — Media data is loaded\n
onloadedmetadata — Meta data (like dimensions and duration) are\n
loaded\n
onloadstart — Browser starts looking for specified media\n
onpause — Media is paused either by the user or automatically\n
onplay — The media has been started or is no longer paused\n
onplaying — Media is playing after having been paused or stopped for\n
buffering\n
onprogress — Browser is in the process of downloading the media\n
onratechange — The playing speed of the media changes\n
onseeked — User is finished moving/skipping to a new position in the\n
media\n
onseeking — The user starts moving/skipping\n
onstalled — The browser is trying to load the media but it is not\n
available\n
onsuspend — Browser is intentionally not loading media\n
ontimeupdate — The playing position has changed (e.g. because of fast\n
forward)\n
onvolumechange — Media volume has changed (including mute)\n
onwaiting — Media paused but expected to resume (for example,\n
buffering)\n
Animation\n
animationend — A CSS animation is complete\n
animationiteration — CSS animation is repeated\n
animationstart — CSS animation has started\n
\n
-------------------------------------------\n
Other\n
-------------------------------------------\n
transitionend — Fired when a CSS transition has completed\n
onmessage — A message is received through the event source\n
onoffline — Browser starts to work offline\n
ononline — The browser starts to work online\n
onpopstate — When the window’s history changes\n
onshow — A <menu> element is shown as a context menu\n
onstorage — A Web Storage area is updated\n
ontoggle — The user opens or closes the <details> element\n
onwheel — Mouse wheel rolls up or down over an element\n
ontouchcancel — Screen touch is interrupted\n
ontouchend — User finger is removed from a touch screen\n
ontouchmove — A finger is dragged across the screen\n
ontouchstart — Finger is placed on touch screen\n
\n
-------------------------------------------\n
Errors\n
-------------------------------------------\n
try — Lets you define a block of code to test for errors\n
catch — Set up a block of code to execute in case of an error\n
throw — Create custom error messages instead of the standard\n
JavaScript errors\n
finally — Lets you execute code, after try and catch, regardless of\n
the result\n
Error Name Values\n
name — Sets or returns the error name\n
message — Sets or returns an error message in string from\n
EvalError — An error has occurred in the eval() function\n
RangeError — A number is “out of range”\n
ReferenceError — An illegal reference has occurred\n
SyntaxError — A syntax error has occurred\n
TypeError — A type error has occurred\n
URIError — An encodeURI() error has occurred\n`
    return helpPage
}