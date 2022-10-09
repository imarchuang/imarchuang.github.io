#
# @lc app=leetcode id=543 lang=python3
#
# [543] Diameter of Binary Tree
#

# @lc code=start
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    max_diameter = 0
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        def maxDepth(node):
            if not node:
                return 0
            leftDepth = maxDepth(node.left)
            rightDepth = maxDepth(node.right)
            self.max_diameter = max(self.max_diameter, leftDepth+rightDepth)
            return max(leftDepth, rightDepth)+1

        maxDepth(root)
        return self.max_diameter
        
# @lc code=end

