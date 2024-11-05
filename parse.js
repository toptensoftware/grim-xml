// Worlds grimmest XML parser
export function parse(xml, options)
{
    options = options ?? {};
    if (!options.decode)
        options.decode = x => x;
    let document = { type: "#document", children: [] };
    let elemStack = [ document ];
    let t;
    let rxTag = /(?:<\?([^\s]+)(.*?)\?>)|(?:<!\[CDATA\[(.*?)\]\]>)|(?:<!--(.*?)-->)|(?:<(\/?)([^\s]+)(.*?)(\/?))>/g;
    let last = 0;
    while (t = rxTag.exec(xml))
    {
        // Get currently open element
        let top = elemStack[elemStack.length-1];

        if (t[1])
        {
            addChild({
                type: "#pi",
                name: t[1],
                data: t[2],
            });
        }
        else if (t[3])
        {
            addChild({
                type: "#cdata",
                data: t[3],
            });
        }
        else if (t[4])
        {
            if (options.preserveComments)
            {
                addChild({
                    type: "#comment",
                    data: options.decode(t[4]),
                });
            }
        }
        else
        {
            let closing = t[5] == '/';
            let name = t[6];
            let attrs = t[7].trim();
            let selfClosing = t[8] == '/';

            // Handle non-white space text data
            if (t.index > last)
            {
                let text = xml.substring(last, t.index);
                if (!options.preserveWhiteSpace)
                    text = text.trim();
                if (text.length > 0)
                {
                    addChild({
                        type: "#text",
                        data: options.decode(text),
                    });
                }
            }
            last = rxTag.lastIndex;

            // Closing tag
            if (closing)
            {
                if (attrs.trim().length > 0)
                    throw new Error("invalid XML: closing tag has attributes");
                let closed = elemStack.pop();
                if (!closed || closed.name != name)
                    throw new Error("invalid XML: closing tag didn't match");
            }
            else
            {
                // Create a new element
                let elem = { type: "#element", name };

                addChild(elem);
                
                // Add self to the stack of open element
                if (!selfClosing)
                    elemStack.push(elem);

                // Parse attributes
                for (let a of attrs.matchAll(/\s*([a-zA-Z-_]+)\s*=\s*"(.*?)"/g))
                {
                    if (!elem.attrs)
                        elem.attrs = {};
                    elem.attrs[a[1]] = options.decode(a[2]);
                }
            }
        }

        last = rxTag.lastIndex;
    }

    if (elemStack.length > 1)
        throw new Error("invalid XML: unclosed tags");
    let rootElements = document.children.filter(x => x.type == "#element");
    if (rootElements.length != 1)
        throw new Error("invalid XML: multiple root elements");

    return document;

    function addChild(child)
    {
        let top = elemStack[elemStack.length-1];
        if (!top.children)
            top.children = [];
        top.children.push(child);
    }
}
