export interface BranchInterface {
    [branchName: string]: {
        [commitId: string]: {
            time: string;
            message: string;
        };
    };
}
