import simpleGit from "simple-git";
import path from "path";
import fs from "fs";
import fsExtra from"fs-extra";

const REPO_URL = 'https://github.com/SharkFishDeveloper/Sloth.git';
const BRANCH_NAME = 'view-branches';

export async function initRepo() {
  const targetDir = process.cwd();

  // Check if the target directory is empty
  if (fs.readdirSync(targetDir).length > 0) {
    console.log('Target directory is not empty. Please choose an empty directory.');
    return;
  }

  try {
    const git = simpleGit();
    console.log(`Cloning repository from ${REPO_URL} into ${targetDir}...`);

    // Clone the repository into a temporary directory
    const tempDir = path.join(targetDir, 'temp-repo');
    await git.clone(REPO_URL, tempDir);

    // Navigate to the temporary directory
    const tempGit = simpleGit(tempDir);

    console.log(`Checking out branch ${BRANCH_NAME}...`);
    // Checkout the specific branch
    await tempGit.checkout(BRANCH_NAME);

    // Move contents to the target directory
    await fsExtra.copy(tempDir, targetDir);

    // Remove the temporary directory
    await fsExtra.remove(tempDir);

    console.log('Repository initialized successfully with branch:', BRANCH_NAME);
  } catch (err) {
    console.error('Error initializing repository:', err);
  }
}


initRepo();