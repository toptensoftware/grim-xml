// Worlds grimmest XML parser
export function parse(xml, options)
{
    options = options ?? {};
    if (!options.decode)
        options.decode = x => x;
    let elemStack = [ { children: [] } ];
    let t;
    let rxTag = /(?:<!--(.*?)-->)|(?:<(\/?)([^\s]+)(.*?)(\/?))>/g;
    let last = 0;
    while (t = rxTag.exec(xml))
    {
        // Get currently open element
        let top = elemStack[elemStack.length-1];

        if (t[1])
        {
            if (options.preserveComments)
            {
                if (!top.children)
                    top.children = [];
                top.children.push({
                    type: "#comment",
                    data: options.decode(t[1]),
                })
            }
        }
        else
        {
            let closing = t[2] == '/';
            let name = t[3];
            let attrs = t[4].trim();
            let selfClosing = t[5] == '/';

            // Handle non-white space text data
            if (t.index > last)
            {
                let text = xml.substring(last, t.index);
                if (!options.preserveWhiteSpace)
                    text = text.trim();
                if (text.length > 0)
                {
                    if (!top.children)
                        top.children = [];
                    top.children.push({
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

                if (!top.children)
                    top.children = [];
                top.children.push(elem);
                
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
    if (elemStack[0].children.length != 1)
        throw new Error("invalid XML: multiple root nodes");

    return elemStack[0].children[0];
}
