
class Node
{
    constructor(node)
    {
        this.#node = node;
    }

    #node;

    // Check node is a leaf node and return itself
    leaf()
    {
        if (this.#node.children?.length ?? 0 > 0)
            throw new Error("leaf node has unexpected children");
        return this;
    }

    // Find a single child node with specified name
    single(name)
    {
        let nodes = this.#node.children.filter(x => x.name === name);
        if (nodes.length != 1)
            throw new Error(`expected a single child node named '${name}'`);
        return new Node(nodes[0]);
    }

    // Get multiple named nodes
    multiple(name)
    {
        let nodes = this.#node.children.filter(x => x.name === name);
        return nodes.map(x => new Node(x));
    }

    // Get first with name, or exception
    first(name)
    {
        let nodes = this.#node.children.filter(x => x.name === name);
        if (nodes.length == 0)
            throw new Error(`no child node named '${name}'`);
        return nodes[0];
    }

    // Get last with name, or exception
    last(name)
    {
        let nodes = this.#node.children.filter(x => x.name === name);
        if (nodes.length == 0)
            throw new Error(`no child node named '${name}'`);
        return nodes[nodes.length-1];
    }

    // Get attributes
    get attrs()
    {
        return this.#node.attrs ?? {};
    }

    // Get children
    get children()
    {
        return this.#node.children ?? [];
    }

    // Get name
    get name()
    {
        return this.#node.name;
    }

    // Get type
    get type()
    {
        return this.#node.type;
    }

    // Gets the data of a text or comment node
    get data()
    {
        return this.#node.data;
    }

    // Gets the underlying node
    get node()
    {
        return this.#node;
    }

    attr(name, defValue)
    {
        let val = this.#node.attrs?.[name] ?? undefined;
        if (val === undefined)
        {
            if (defValue !== undefined)
                return defValue;
            throw new Error(`expected node to have attribute '${name}'`);
        }
        return val;
    }

    named(name)
    {
        if (this.#node.name != name)
            throw new Error(`expected node named '${name}' (not ${this.#node.name})`);
        return this;
    }
}

export function node(n)
{
    return new Node(n);
}