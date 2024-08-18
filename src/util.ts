export interface BranchInterface {
    [branchName: string]: {
        [commitId: string]: {
            time: string;
            message: string;
        };
    };
}

export interface BranchKeyValueItems {
    [key: string]: string[];
}