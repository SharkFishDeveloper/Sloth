# Sloth Command Documentation . Sloth is made by Shahzeb/SharkFishDeveloper 

##Sloth - A Global Version Control System

1.  Clone the Repository

    -   Clone the repository using: //only here you require Github. I
        was too lazy to try the other way around. git clone
        https://github.com/SharkFishDeveloper/Sloth.git

2.  Initialize Gitpulse

    -   Navigate into the Sloth directory:
    -   cd Sloth
    -   Initialize Gitpulse in the project with:
        npm run git init



### Note: All commands should be run inside the \"Sloth\" working directory. The folders to be controlled should be kept outside of Sloth. Do not edit the Sloth directory itself. {#note-all-commands-should-be-run-inside-the-sloth-working-directory.-the-folders-to-be-controlled-should-be-kept-outside-of-sloth.-do-not-edit-the-sloth-directory-itself. .unnumbered}

> **Initialization**:

Before running any commands, ensure that Gitpulse is initialized in your
project using the following command:

-   npm run git init

This will initialize Gitpulse and allow you to perform the below
operations.

# Show Commit History

Displays the commit history of your project.

a.  *Main branch:*

-   npm run git log main

This command shows the commit history for the main branch.

a.  *Current branch:*

-   npm run git log

This shows the commit history for the currently active branch.

a.  *Specific branch:*

-   npm run git log <branch-name>

Replace with the name of the branch to view its commit history.

# Commit and Staging

Handle committing changes and adding files to the staging area.

a.  *Add files to staging:*

-   npm run git add

Adds files to the staging area. The can be a specific file name or \".\"
to add all changes.

a.  *Commit the project:*

-   npm run git commit

Commits the current changes with a custom .

# Go Back to a Previous Commit

Revert the state of your project to a previous commit.

a.  *Main branch:*

-   npm run git migrate-main <commitId>

Migrates the main branch to the specified .

a.  *Current branch:*

-   npm run git migrate-branch <commitId>

Migrates the current branch to the specified .

# Branch Operations

Manage branches in the project.

a.  *Create a new branch:*

-   npm run git checkout <branchName>

Creates and checks out a new branch named .

a.  *Go to an already created branch:*

-   npm run git goto <branchName>

Switches to the specified and updates to its latest commit.

# Merge and View Branches

Work with branches by merging them or viewing their status.

a.  *Merge current branch with main:*

-   npm run git merge

You must be present on the branch which you want to merge with Main !!
Merges the current branch into main with a custom commit .

a.  *Show all branches:*

-   npm run git view

Displays all branches currently available in the project.

> **//To use further command you must be logged in on Sloth-hub :
> https://sloth-git-main-overlordzerokings-projects.vercel.app/**

# Repository Management

Create, push, and pull from remote repositories.

a.  *Create a new remote repository (origin):*

Initializes a new remote repository (e.g., on the internet).

-   npm run git create origin

    a.  *Push to the remote repository:*

To push a specific branch on the Sloth-hub : as a contributor

-   npm run git push-origin

    a.  *To directly push your code on Sloth-hub: as Admin*

-   npm run git push origin

    a.  *Pull the latest changes:*

-   npm run git pull origin

Pulls the latest changes from the remote repository.

# Pull Requests and Merging

Manage pull requests.

a.  *Merge a pull request: This can only be done by Admin of repository*

\- npm run git merge-pr

Merges the open pull request.

# Visual Representation of Branches

View branches diagrammatically.

b.  *Eagle view of all branches:*

\- npm run git eagle view

Displays a diagrammatic view of all branches.

Gives mermaid code which you can use on any online Mermaid code editor.
