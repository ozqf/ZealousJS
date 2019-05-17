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
    };
	this.VsPoint = (x, y) => {
		if (x < this.aabb.minX || x > this.aabb.maxX) { return false; }
		if (y < this.aabb.minY || y > this.aabb.maxY) { return false; }
		return true;
	};
    // attached external ref
	// ...I mean, it's javascript, so you can do it where you like but
	// here would be consistent.
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

    /*this.Insert = function(box) {
        let node = new BvhNode();
        node.aabb = Box2AABB(box);
        node.userData = box;
        this.nodes.push(node);
        if (root === null) {
            root = node;
            return;
        }
    }*/
}

function BvhCombineAABBs(a, b) {
    return {
        minX: Math.min(a.minX, b.minX),
        minY: Math.min(a.minY, b.minY),
        maxX: Math.max(a.maxX, b.maxX),
        maxY: Math.max(a.maxY, b.maxY)
    };
}
