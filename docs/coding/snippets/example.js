var findTargetSumWays = function(nums, target) {
    return dp(nums, target, 0, nums.length-1);
};

const dp = (nums, target, curSum, index) => {

    if(index<0 && target==curSum) {
        return 1;
    }
    
    if(index<0) {
        return 0;
    }
    
    //这里选择列表就两种：+ nums[startIdx] 或者 - nums[startIdx]
    let negative = dp(nums, target, curSum-nums[index], index-1);
    let positive = dp(nums, target, curSum+nums[index], index-1);
    
    return positive+negative;

}