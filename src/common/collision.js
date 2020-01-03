
function AABBVsAABB(a, b) {
    if ((a.minX <= b.maxX && a.minY <= b.maxY)
        &&
        (a.maxX >= b.minX && a.maxY >= b.minY))
    {
        return true;
    }
    return false;
}

function PointVsAABB(x, y, aabb) {
    this.VsPoint = (x, y) => {
		if (x < aabb.minX || x > aabb.maxX) { return false; }
		if (y < aabb.minY || y > aabb.maxY) { return false; }
		return true;
    };
}
