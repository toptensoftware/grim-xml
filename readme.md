# grim-xml

A grim, but handy, XML parser.

This is a terrible XML parser and you shouldn't use it:

* No support for namespaces
* No support for DTD's or parameter entity references
* No unit tests
* Spec, schmeck, we didn't bother to read the spec
* The entire parser is about 100 lines of code, pretty sure I forget something.

But, if your use case is simple and well known, grim-xml is small, easy to use 
and if you cross your fingers, hold your mouth right and it's not too windy outside,
it might just get the job done.

## Rationale

Every other JavaScript XML parser I looked at was either overly complicated
for my simple use case, or didn't preserve child node order, or didn't have
an easy way to reliably query it, or was too large, or had confusing documentation
or was too interested in trying to automatically convert to JSON and back.



## Install

Just don't. Go look for another parser.

```
npm install --save toptensoftware/grim-xml
```



## Parsing

Parse XML string

```js
import { parse } from "@toptensoftware/grim-xml";

let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<fruits>
    Text
    <element apples="red" pears="yellow"/>
    <!-- comment -->
    <![CDATA[ some cdata data ]]>
    More Text
</fruits>`

let js = parse(xml, { preserveComments: true });
```



Results in a JavaScript object, which may or may not be correct but should
look like this:

```js
{
    "type": "#document",
    "children": [
        {
            "type": "#pi",
            "name": "xml",
            "data": " version=\"1.0\" encoding=\"UTF-8\" "
        },
        {
            "type": "#element",
            "name": "fruits",
            "children": [
                {
                    "type": "#text",
                    "data": "Text"
                },
                {
                    "type": "#element",
                    "name": "element",
                    "attrs": {
                        "apples": "red",
                        "pears": "yellow"
                    }
                },
                {
                    "type": "#comment",
                    "data": " comment "
                },
                {
                    "type": "#cdata",
                    "data": " some cdata data "
                },
                {
                    "type": "#text",
                    "data": "More Text"
                }
            ]
        }
    ]
}
```



## Parse Options

The `parse` function takes an optional `options` object as a second
parameter with the following settings:

* `preserveComments` - keep XML comment elements
* `preserveWhiteSpace` - keeps white space between elements (not inside tags)
* `decode(text)` - a callback to decode entities



## Entity Support

Out of the box, grim-xml doesn't support decoding entities like `&amp;`, `&gt;` etc...

If you need this (and you do) you should provide a decode function to `parse`.  `decode()`
will be called to decode:

* comments
* text
* attribute values

To use the [`entities`](https://www.npmjs.com/package/entities) package:

```
npm install --save entities;
```

```js
import { parse } from "@toptensoftware/grim-xml";
import { decodeXML } from "entities";

let obj = parse(xml, { decode: decodeXML });
```


## Querying

Because navigating a structure like that returned by grim-xml can be tedious
grim-xml includes a wrapper to help.

```js
import { node } from "@toptensoftware/grim-xml";

let n = node(parse("<myxml> ... </myxml"));

```

The value returned from `node()` is an object with the following methods and properties:

* `node` - the original node object passed to the `node()` function.
* `type` - the type of node (`"#element"`, `"#comment"` or `"#text"`).
* `name` - the name of the element (`undefined` if not an element).
* `data` - the text data of a comment or text node (`undefined` if not a comment or text).
* `documentElement` - the one and only child element of this node, otherwise throws.
* `leaf()` - throws an exception if the node has children, otherwise returns itself.
* `single(name)` - gets a single child element named `name` and returns it wrapped in a node.
Throws if not exactly one match.  Doesn't throw if multiple children, but only a single match.
* `multiple(name)` - gets all child elements with name `name`.  Returns array of zero or more.
* `first(name)` - gets the first child element with name `name`. Throws if none.
* `last(name)` - gets the first child element with name `name`. Throws if none.
* `attrs` - gets all the attributes of this element, always returning an object even if no attributes.
* `children` - gets all the children of this element, always returning an array even if no children.
* `attr(name[, defValue])` - gets an attribute and returning its value, or a default value.  Throws if 
attribute doesn't exist and `defValue` not supplied.
* `named(name)` - checks the node is named `name`, returning self.  Throws if name doesn't match.

For example, you want to query the following SVG file:

```xml
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
   <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM160-160v-200h80v120h480v-120h80v200H160Z"/>
</svg>
```

you could do this:

```js
// parse svg text
let svgDom = parse(svg);

// Get the root node and check it's of type "svg"
let n = node(svgDom).named('svg');
let n = node(js).documentElement.named('svg');

// Get some expected attributes 
console.log(`width: ${n.attr('width')} height: ${n.attr('height')}`);
console.log(`viewbox: ${n.attr('viewBox')}`);

// Get the "d" attribute if the "path" element 
console.log(`data: ${n.single('path').leaf().attr('d')}`);
```

Note the above will throw an exception if:

* The root element isn't `<svg>`
* any of the requested attributes are missing
* there isn't a single `<path>` child element 
* the `<path>` element has any children

It won't throw if:

* There are extra attributes anywhere
* There are extra sibling elements to `<path>` with different type or name


## Formatting back into XML

Nope, Sorry, Eso no es bueno...  this project's already bad enough.

