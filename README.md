# Sloth - A Version Control System
Made by Shahzeb

## Overview
Sloth is a version control system designed to manage your project's files and track changes over time. Similar to Git, Sloth allows you to maintain different versions of your code, branch out for new features, and commit changes with ease.

## Getting Started

### 1. Clone the Repository
Only in this you require git.
Clone the repository using:
git clone https://github.com/SharkFishDeveloper/Sloth.git

### 2. Initialize Gitpulse
Navigate into the Sloth directory:
cd Sloth

Initialize Gitpulse in the project with:
npm run git init

Note: All commands should be run inside the "Sloth" working directory. The folders to be controlled should be kept outside of Sloth. Do not edit the Sloth directory itself.

## Commands

### 1. Show Commit History
a) For the main branch:
npm run git log main

b) For the current branch:
npm run git log

c) For a specific branch:
npm run git log <branch>

### 2. Go Back to a Previous Commit
a) For the main branch:
npm run git migrate-main <commitId>

b) For the current branch:
npm run git migrate-branch <commitId>

### 3. Branch Operations
a) Create a new branch:
npm run git checkout <branch>

b) Go to an already created branch with the latest commit:
npm run git goto <branch>

### 4. Commit and Staging
a) Commit the project with a message:
npm run git commit <message>

b) Add files to the staging area:
npm run git add <action>
Action can be a specific file or " . "

### 5. Merge and View Branches
a) Merge current-branch with main:
npm run git merge <message>

b) Show all present branches:
npm run git view
