////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////
function CopyAABB(original, copy) {
    copy.minX = original.minX;
    copy.minY = original.minY;
    copy.maxX = original.maxX;
    copy.maxY = original.maxY;
}

function CalcAABBVolume(aabb) {
    let volume = (aabb.maxX - aabb.minX) * (aabb.maxY - aabb.minY);
    return volume;
}

function OverlapAABBs(a, b) {
    if ((a.minX <= b.maxX && a.minY <= b.maxY)
        &&
        (a.maxX >= b.minX && a.maxY >= b.minY))
    {
        //console.log(`aabb overlap`);
        return true;
    }
    //console.log(`No aabb overlap`);
    return false;
}

// Lower score === better
function CompareAABBs(a, b) {
    //if (!OverlapAABBs(a, b)) { return Number.POSITIVE_INFINITY; }
    let combination = BvhCombineAABBs(a, b);
    return CalcAABBVolume(combination);
}

// converts a pos + halfSize obj
// to min/max extents
function Box2AABB(box) {
    return {
        minX: box.pos.x - box.halfWidth,
        minY: box.pos.y - box.halfHeight,
        maxX: box.pos.x + box.halfWidth,
        maxY: box.pos.y + box.halfHeight
    };
}

function BvhCombineAABBs(a, b) {
    return {
        minX: Math.min(a.minX, b.minX),
        minY: Math.min(a.minY, b.minY),
        maxX: Math.max(a.maxX, b.maxX),
        maxY: Math.max(a.maxY, b.maxY)
    };
}

////////////////////////////////////////////////////////////////////
// Tree Adjustment
////////////////////////////////////////////////////////////////////
function BvhInsert(bvh, queryNode, newNode) {
    if (queryNode.IsLeaf()) {
        // split into branch and append leaves
        // queryNode becomes a branch
        // append copy of queryNode + new node as leaves
        let sibling = new BvhNode(bvh, queryNode);
        sibling.userData = queryNode.userData;
        queryNode.userData = null;
        
        CopyAABB(queryNode.aabb, sibling.aabb);
        queryNode.aabb = BvhCombineAABBs(sibling.aabb, newNode.aabb);
        queryNode.aabb.minX -= bvh.padding;
        queryNode.aabb.minY -= bvh.padding;
        queryNode.aabb.maxX += bvh.padding;
        queryNode.aabb.maxY += bvh.padding;

        queryNode.left = sibling;
        queryNode.right = newNode;
        newNode.parent = queryNode;
        let newDepth = queryNode.depth + 1;
        queryNode.left.depth = newDepth;
        queryNode.right.depth = newDepth;
        if (bvh.depth < newDepth) { bvh.depth = newDepth;}
        return newNode;
    } else {
        // regardless of which child the shape is appended to we must
        // enlarge to include the new shape!
        queryNode.aabb = BvhCombineAABBs(queryNode.aabb, newNode.aabb);
        // test whether left or right would be better to continue down
        let scoreLeft = CompareAABBs(queryNode.left.aabb, newNode.aabb);
        let scoreRight = CompareAABBs(queryNode.right.aabb, newNode.aabb);
        if (scoreLeft < scoreRight) {
            return BvhInsert(bvh, queryNode.left, newNode);
        } else {
            return BvhInsert(bvh, queryNode.right, newNode);
        }
    }
}

function BvhRemove(bvh, node) {
    console.log(`Remove `)
    /*
    Only leaves can be removed atm!
    */
    if (!node.IsLeaf()) {
        console.log(`Cannot remove a branch node!`);
        return;
    }
    let parent = node.parent;
    if (parent === null) {
        console.log(`Removing root node`);
        // must be the root!
        bvh.root = null;
        bvh.nextNodeId = 0;
        bvh.depth = 0;
        return;
    }
    /*
    > Find sibling on parent of node
    > Convert parent to sibling, clear links
    */
    console.log(`Collapsing branch (parent ${node.parent.id})`);
	
    let sibling;
    // Find sibling
    if (parent.left === node) { sibling = parent.right; }
    else if (parent.right === node) { sibling = parent.left; }
    else { console.error(`Cannot delete node - corrupted parent ref`); return; }

	let grandParent = parent.parent;
    // Copy parent onto sibling, removing self and parent from the tree.
	// Swap grandparent's references to point to sibling, not parent
	if (grandParent !== null) {
		if (grandParent.left === parent) {
			grandParent.left = sibling;
		}
		if (grandParent.right === parent) {
			grandParent.right = sibling;
        }
        sibling.parent = grandParent;
    }
    else {
        // new root!
        sibling.parent = null;
        bvh.root = sibling;
    }
    
    
	// Rebuild bounding boxes
    if (!sibling.IsLeaf()) {
        sibling.aabb = BvhCombineAABBs(sibling.left.aabb, sibling.right.aabb);
    }
    
    let next = sibling.parent;
    while (next) {
        next.aabb = BvhCombineAABBs(next.left.aabb, next.right.aabb);
        next = next.parent;
    }
}

////////////////////////////////////////////////////////////////////
// Tree Traversal
////////////////////////////////////////////////////////////////////
function RecursivePointTest(x, y, node, callback) {
    //console.log(`Point test node ${node.id}`);
	if (!node.VsPoint(x, y)) { return; }
	if (!node.left || !node.right) { callback(node); return; }
	RecursivePointTest(x, y, node.left, callback);
	RecursivePointTest(x, y, node.right, callback);
}

function RecursiveWalk(node, callback) {
    callback(node);
    if (node.left) { RecursiveWalk(node.left, callback); }
    if (node.right) { RecursiveWalk(node.right, callback); }
}



////////////////////////////////////////////////////////////////////
// Classes
////////////////////////////////////////////////////////////////////
function BvhNode(bvh, parentNode) {
    this.parent = parentNode;
    this.id = ++bvh.nextNodeId;
    //console.log(`Created node ${this.id}`);
    // AABB Should be inflated for leaves
    // (actual, moving objects)
    // bounding box for branches
    this.depth = 0;
    this.aabb = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    // Left should always be occupied..?
    this.left = null;
    // If a right is present, this is a branch
    this.right = null;
    this.IsLeaf = function() {
        return (this.left === null && this.right === null);
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

function Bvh() {
    this.root = null;
    this.nextNodeId = 0;
    this.depth = 0;
    this.padding = 8;
    this.Clear = () => {
        this.root = null;
        this.nextNodeId = 0;
        this.depth = 0;
    };

    this.Insert = (node) => {
        if (this.root === null) {
            this.root = node;
            node.depth = 1;
            return this.root;
        }
        // Explore tree until a node to split is found
        return BvhInsert(this, this.root, node);
    };
}
