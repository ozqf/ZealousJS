function BvhNode() {
    // AABB Should be inflated for leaves
    // (actual, moving objects)
    // bounding box for branches
    this.aabb = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    // Left should always be occupied..?
    this.left = null;
    // If a right is present, this is a branch
    this.right = null;
    this.IsLeaf = function() {
        return (this.right === null);
    }
    // attached external ref
    this.userData = null;
}
// convert box draw obj to bvh aabb
function Box2AABB(box) {
    return {
        minX: box.pos.x - box.halfWidth,
        minY: box.pos.y - box.halfHeight,
        maxX: box.pos.x + box.halfWidth,
        maxY: box.pos.y + box.halfHeight
    };
}

function Bvh() {
    let root = null;

    // Purely for debugging!
    this.nodes = [];

    this.Insert = function(box) {
        let node = new BvhNode();
        node.aabb = Box2AABB(box);
        node.userData = box;
        this.nodes.push(node);
        if (root === null) {
            root = node;
            return;
        }
    }
}

function BvhCombineNodeAABBs(node, childA, childB) {
    node.minX = Math.min(childA.minX, childB.minX);
    node.minY = Math.min(childA.minY, childB.minY);
    node.maxX = Math.max(childA.maxX, childB.maxX);
    node.maxY = Math.max(childA.maxY, childB.maxY);
}
