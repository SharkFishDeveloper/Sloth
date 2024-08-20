
import { Command } from "commander";
import path from "path";
import fs from "fs";
import crypto from "crypto"
import * as dirCompare from "dir-compare"
import clc from "cli-color"
import fsExtra, { copySync } from 'fs-extra';
import klaw from "klaw"
import zlib from "zlib";
import { BranchInterface ,BranchKeyValueItems} from "./util";
import {Push} from "./functions/sendFile";
import { initOriginMethod } from "./functions/initOrigin";
import { pushOriginOwner } from "./functions/pushOrigin";
import { mergePullRequest } from "./functions/mergePr/mergepr";
import { pullOriginRequest } from "./functions/pullOrigin/pullOrigin";
import { generateMermaidCode } from "./functions/mermaidCode/mermaid";
// import linereader from "line-reader"
var configPath = path.join(process.cwd(), "/.gitpulse/config.json");

class Gitpulse {
  rootpath = '';
  gitpath = '';
  objPath = "";
  stagingPath = "";
  commitsPath = "";
  configPath = "";
  head = "";
  currentHead = ""
  cwd = "";
  branchesPath = "";
  currentBranchName = "";
  mainCommitsIdOnly = "";
  initiaStartingTime = "";
  branchingObjectsPath = "";
  branchesHistorykeymap = "";


  constructor() {
    this.rootpath = path.join(process.cwd());
    this.gitpath = path.join(this.rootpath, ".gitpulse");
    this.objPath = path.join(this.gitpath, "obj");
    this.stagingPath = path.join(this.gitpath, "staging");
    this.commitsPath = path.join(this.gitpath, "commits.txt");
    this.head = path.join(this.gitpath, "HEAD.txt");
    this.currentHead = path.join(this.gitpath, "CURRENT.txt");
    this.branchesPath = path.join(this.gitpath, "BRANCHES.json");
    this.currentBranchName = path.join(this.gitpath, "CURRENTBRANCH.txt");
    this.mainCommitsIdOnly = path.join(this.gitpath, "MAIN_COMMITS.txt");
    this.initiaStartingTime = path.join(this.gitpath, "INITIAL_TIME.txt");
    this.branchingObjectsPath = path.join(this.gitpath, "Branch_modifications");
    this.branchesHistorykeymap = path.join(this.gitpath, "Branch_Key_Value.json");


    if (!fs.existsSync(path.join(this.gitpath))) {
      console.log("No git directory exists");
    }
    this.cwd = path.join(process.cwd(), "../");
    this.init();
  }

  async init() {
    const gitExists = fs.existsSync(this.gitpath);
    if (!gitExists) {
      try {
        fs.mkdir(this.gitpath, { recursive: true }, (err) => {
          console.log(err);
        });
        fs.mkdir(path.join(this.gitpath, "cmpA"), { recursive: true }, (err) => {
          // console.log(err);
        });
        fs.mkdir(path.join(this.gitpath, "Branch_modifications"), { recursive: true }, (err) => {
          // console.log(err);
        });
        fs.writeFileSync(this.commitsPath, "");
        fs.writeFileSync(this.head, "");
        fs.writeFileSync(this.currentHead, "");
        fs.writeFileSync(this.branchesPath, "");
        fs.writeFileSync(this.currentBranchName, "main");
        fs.writeFileSync(this.mainCommitsIdOnly, "");
        fs.writeFileSync(this.branchesHistorykeymap, "");
        fs.mkdir(this.stagingPath, { recursive: true }, (err) => {
          // console.log(err);
        });
        fs.mkdir(path.join(this.objPath, "init"), { recursive: true }, (err) => {
          // console.log(err);
        });

        fs.mkdir(`${this.objPath}/init`, { recursive: true }, (err) => {
          // console.log(err);
        });
        console.log(clc.greenBright("Ininitialized empty .gitpulse successfully"));
      } catch (error) {
        // console.log(error);
      }
    } else {
      // console.log(clc.bgGreenBright(clc.black("Already ininitialized .gitpulse")));
      // setInterval(() => this.deleteWasteFilesInStaging(), 15000);
      // console.log(".gitpulse aleady exists");
    }
  }

  static loadFromConfig(): Gitpulse | null {
    if (fs.existsSync(configPath)) {
      return new Gitpulse();
    }
    return null;
  }

  saveToConfig() {
    const config = {
      fileName: process.cwd(),
    };
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
  }

  filesDirectory(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const directories: string[] = [];
      // console.log(path.join(this.cwd))
      klaw(path.join(this.cwd))
        .on('data', (item) => {
          // console.log(">>>>",item)
          if (item.path.includes("sloth") || item.path.includes("Sloth")|| item.path.includes(".git")) {
          }

          else if (item.stats.isDirectory()) {
            fs.readdir(item.path, (err, files) => {
              if (files.length === 0) {
                directories.push(item.path);
              }
            })
          } else if (item.stats.isFile()) {
            directories.push(item.path);
          }
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          // console.log(directories);
          resolve(directories);
        });

    });
  }

  stagedDirectoryFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const directories: string[] = [];
      klaw(path.join(this.stagingPath))
        .on('data', (item) => {

          if (item.stats.isDirectory()) {
            //! fine is it {recursive}?
            fs.readdir(item.path, { recursive: true }, (err, files) => {
              // console.log("DIRECTOR", item.path, files);
              if (files.length === 0) {
                directories.push(item.path);
              }
            })
          } else if (item.stats.isFile()) {
            directories.push(item.path);
          }
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          // console.log(directories);
          resolve(directories);
        });

    });
  }


  async filesDirectoryToStageEverything(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const files = fs.readdir(this.cwd, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          reject(err);
        }
        const filteredFiles = files.filter(file => {
          const fileName = file as string;
          return !fileName.startsWith('sloth') &&
          !fileName.startsWith('Sloth') &&
            !fileName.includes('.git') &&
            !fileName.includes('.gitpulse') &&
            !fileName.includes('node_modules') &&
            !fileName.includes('package')
          // &&
          // !fileName.startsWith('tsconfig') &&
          // !fileName.startsWith('src') &&
          // !fileName.startsWith('dist');
        })
        resolve(filteredFiles);
      });
    });
  }

  async checkUpdates() {
    //! very inefficient
    let filesDirectory = await this.filesDirectory();
    // console.log("FILES in DIRECTORY : ",filesDirectory);
    filesDirectory = filesDirectory.map((file) => {
      return file.substring(this.cwd.length);
    })
    //! ERROR
    const untrackedFiles: string[] | null = [];
    const modifiedFiles: string[] | null = [];
    filesDirectory?.map((file => {
      const stagingfilePath = path.join(this.stagingPath, file);
      if(!file.includes("node_mod")){
      const dirfilePath = path.join(this.cwd, file);
      if (fs.existsSync(stagingfilePath)) {
        try {
          const contentFileDir = fs.readFileSync(stagingfilePath, "utf-8");
          const contentFileStaging = fs.readFileSync(dirfilePath, "utf-8");
          if (contentFileDir !== contentFileStaging) {
            modifiedFiles.push(file);
          }
        } catch (error) {

        }
      }
      else {
        untrackedFiles.push(file);
      }
    }
    }))

    if (untrackedFiles.length > 0) {
      console.log(clc.whiteBright("Use git add . or git add <file> to add to staging area"));
    }
    untrackedFiles.forEach((file) => {
      console.log(clc.red(`Untracked file -> ${file}`));
    });
    modifiedFiles.forEach((file) => {
      console.log(clc.yellow(`Modified file -> ${file.replace(/\\/g, "/")}`));
    });
    if (untrackedFiles.length === 0 && modifiedFiles.length === 0) {
      console.log(clc.greenBright("Everything is up to date"));
    }

  }


  async status() {
    await this.checkUpdates();
  }

  async add(file: string) {
    if (file === ".") {
      await fsExtra.emptyDir(this.stagingPath);

      const filesDir = await this.filesDirectoryToStageEverything();
      const pathnew = this.cwd;
      filesDir.forEach(async (files) => {
        await this.copyDirectory(path.join(pathnew, files), path.join(this.stagingPath, files))
          .then(() => console.log(''))
          .catch(err => console.error(''));
      })
      console.log(clc.green("Added all the files to staging area"));
      console.log(clc.greenBright("Everything is staged"))
    } else {
      var filePath = path.join(this.cwd, file);
      // console.log(filePath);
      const stats = fs.existsSync(filePath);
      //fs.existsSync(filePath) ? fs.statSync(file) : null;
      if (!stats) {
        return console.log(clc.magentaBright(`${file} does not exist in ${filePath}`));
      } else {
        // console.log("EXists",filePath,path.join(this.stagingPath))
      }
      this.copyDirectory(filePath, path.join(this.stagingPath, file));

      console.log(clc.green(`Added ${file} to staging area`));
    }
  }



  async readDirectory(directoryPath: string, file: string, pathData: string) {
    try {
      const items = fs.readdirSync(directoryPath, { withFileTypes: true });

      for (const item of items) {
        // console.log("-->",directoryPath,file,item.name,pathData);
        var fullPath = path.join(directoryPath, item.name);
        fullPath = fullPath.replace(/\\/g, '/');
        const index = fullPath.indexOf(file);

        if (item.isDirectory()) {
          // console.log("D")

          await this.readDirectory(fullPath, file, pathData);

        } else if (item.isFile()) {
          // console.log("F")

          const content = fs.readFileSync(fullPath, "utf-8");
          const pathindex = fullPath.slice(index);
          // console.log(`Path:${fullPath.slice(index)}`);
          // console.log(`File: ${fullPath}`);
          // console.log(`Content: ${content}`);
          var firstPath = "";
          if (!fs.existsSync(path.join(this.stagingPath, pathindex))) {
            console.log("Does not Ex")
            const lindex = pathindex.lastIndexOf("/");
            const firstPart = pathindex.slice(0, lindex);
            const filename = pathindex.slice(lindex);
            // console.log("First part", firstPart)
            firstPath = pathData === "staging" ? path.join(this.stagingPath, firstPart) : pathData
            // console.log("FIRST PATH", firstPath);
            // console.log("Does not exts in OBJ",firstPart,lindex,filename);
            // try {
            //   fs.mkdirSync(firstPath, { recursive: true });
            // } catch (error) {
            //   console.log("ERROR ####",error)
            // }
            // console.log("Content",content);
            try {
              fs.writeFileSync(path.join(firstPath, filename), content);
            } catch (error) {
              console.log("Already added to stage area");
            }
          } else {
            // console.log("Exists")
            // console.log("FIRST PATH", firstPath);
            const lindex = pathindex.lastIndexOf("/");
            const firstPart = pathindex.slice(0, lindex);
            const filename = pathindex.slice(lindex);
            const firstPathQ = pathData === "staging" ? path.join(this.stagingPath, firstPart) : pathData
            // console.log("staging data", firstPathQ);
            try {
              fs.writeFileSync(path.join(firstPathQ, filename), content);
            } catch (error) {
              console.log("->>>>>>", error)
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory: ${error}`);
    }
  }




  async commit(message: string) {
    const currentBranchName = fs.readFileSync(this.currentBranchName, "utf-8");
    const currentHead = fs.readFileSync(this.currentHead,"utf-8")
    const mainCommitIds = fs.readFileSync(this.mainCommitsIdOnly,"utf-8");
    let mainCommitIdsArray = mainCommitIds.split("\n").filter(line=>line!=="");
    const jsonData = fs.readFileSync(this.branchesPath,"utf-8")
    const parsedData:BranchInterface =jsonData? JSON.parse(jsonData):"";
    const data = parsedData[currentBranchName];
    const keys =data? Object.keys(data):[];
    const lastKey  = keys.pop();
    if(lastKey && currentHead && lastKey !== currentHead){
       return console.log(clc.redBright(`Please make a new branch to commit`));
    }
    mainCommitIdsArray.reverse();
    if (data && currentBranchName !== "main") {
      await this.branchCommits(message);
      return;
    }
    else if(mainCommitIdsArray.length !==1 && mainCommitIdsArray[mainCommitIdsArray.length-1] === currentHead ){
      return console.log(clc.redBright(`Please make a new branch to commit`));
    }
    console.log("Commit Message : ", message);
    const commitDataPath: string = fs.readFileSync(this.commitsPath, "utf-8");
    // const commitDataMAIN: string = fs.readFileSync(this.mainCommitsIdOnly, "utf-8");
    const lines = commitDataPath.split('\n').filter(line => line !== '');
    const pathStage: string[] | null = [];
    const stagedFiles: string[] | null = [];

    if (lines.length === 0) {
      console.log(commitDataPath)
      try {
        const files: string[] = await new Promise((resolve, reject) => {
          fs.readdir(this.stagingPath, (err, files) => {
            if (err) {
              reject(err);
            } else {
              resolve(files);
            }
          });
        });
        stagedFiles.push(...files);
        fs.writeFileSync(this.initiaStartingTime, `${new Date()}\n${message}`)
      } catch (err) {
        // console.error("Error reading staging directory:", err);
      }
      // console.log("stagedFiles",stagedFiles)
      //@ts-ignore
      stagedFiles.forEach(async (file) => {
        // const a = pathStage.push(path.join(this.stagingPath, file));
        // const path1 = (path.join(this.cwd, "Git-pulse/.gitpulse", "staging"));
        await this.copyDirectory(this.stagingPath, path.join(this.objPath, "init"))
          .then(() => console.log(''))
          .catch(err => console.error('Error during copy operation:', err));
      })
      fs.writeFileSync(this.commitsPath, `\n${message}:init:${new Date()}`);
      fs.writeFileSync(this.mainCommitsIdOnly, `init`);
      fs.writeFileSync(this.head, "init");
      fs.writeFileSync(this.currentHead, "init");
    }

    //START FROM HERE
    else if (lines.length == 1) {
      const randomBytes = crypto.randomBytes(20);
      const newCommitId = randomBytes.toString('hex');
      const newCommitIdpath = path.join(this.objPath, newCommitId);
      fs.mkdirSync(newCommitIdpath);
      fs.mkdirSync(path.join(newCommitIdpath, "mdf"));
      fs.writeFileSync(path.join(newCommitIdpath, "ad.txt"), "");
      fs.writeFileSync(path.join(newCommitIdpath, "rm.txt"), "");

      try {
        const result = await dirCompare.compare(this.stagingPath, path.join(this.objPath, "init"), { compareContent: true });
        var modifiedFiles: string[] | null = [];
        const addedFiles: string[] | null = [];
        const deletedFiles: string[] | null = [];



        result.diffSet?.forEach((diff, index) => {

          if (diff.state === "left") {
            const isFile = (path: string) => /.+\.[a-zA-Z0-9]+$/.test(path);
            let diffpath1 = diff.path1 as string;
            // console.log("File PATH TO ADD FOCUS ON THIS ->", path.join(diffpath1, diff.name1 as string));
            let initialName = path.join(diffpath1, diff.name1 as string)
            if (isFile(initialName)) {
              // console.log(`$/{path} is a file`);
              const fileData = fs.readFileSync(initialName, "utf-8");
              if (fileData !== null) {
                let a = path.join(this.cwd, diffpath1.split("staging")[1]);
                //a is final path
                //diff path1 is staging file path
                const data = `${path.join(a, diff.name1 as string)}\n${fileData}`;
                modifiedFiles?.push(path.join(a, diff.name1 as string));
                addedFiles?.push(path.join(a, diff.name1 as string));
                zlib.gzip(data, (err, compressedData) => {
                  if (err) {
                    console.error('Error compressing data:', err);
                    return;
                  }
                  const filePath = path.join(newCommitIdpath, "mdf", `${index}.txt.gz`);

                  fs.writeFile(filePath, compressedData, (err) => {
                    if (err) {
                      // console.error('Error writing compressed data to file:', err);
                    } else {
                      // console.log('Compressed data successfully written to', filePath);
                    }
                  });
                  fs.appendFileSync(path.join(newCommitIdpath, "ad.txt"), `\n${path.join(a, diff.name1 as string)}`);
                });
              } else if (fileData === null) {
                let a = path.join(this.cwd, diffpath1.split("staging")[1]);
                addedFiles?.push(path.join(a, diff.name1 as string));
                fs.appendFileSync(path.join(newCommitIdpath, "ad.txt"), `\n${path.join(a, diff.name1 as string)}`);
              }
            } else {
              // console.log(`${path} is a directory`);
              let a = path.join(this.cwd, diffpath1.split("staging")[1]);
              addedFiles?.push(path.join(a, diff.name1 as string));
              fs.appendFileSync(path.join(newCommitIdpath, "ad.txt"), `\n${path.join(a, diff.name1 as string)}`);

            }
          }

          else if (diff.state === "distinct") {
            let diffpath1 = diff.path1 as string;
            let a = path.join(this.cwd, diffpath1.split("staging")[1]);
            try {
              const pathStaging = path.join(diff.path1 as string, diff.name1 as string);
              const pathObj = path.join(diff.path2 as string, diff.name2 as string)
              const data1 = fs.readFileSync(pathStaging, "utf-8")
              const data2 = fs.readFileSync(pathObj, "utf-8")
              const readingStg = fs.readFileSync(path.join(diffpath1, diff.name1 as string), "utf-8")
              const data = `${path.join(a, diff.name1 as string)}\n${readingStg}`;
              //! is it right ???
              zlib.gzip(data, (err, compressedData) => {
                if (err) {
                  console.error('Error compressing data:', err);
                  return;
                }
                const filePath = path.join(newCommitIdpath, "mdf", `${index}.txt.gz`);
                fs.writeFile(filePath, compressedData, (err) => {
                  if (err) {
                    // console.error('Error writing compressed data to file:', err);
                  } else {
                    // console.log('Compressed data successfully written to', filePath);
                  }
                });
              });
            } catch (error) {
              // console.log(error)
            }
            //! or use simple text copy,paste
            modifiedFiles?.push(path.join(a, diff.name1 as string));
            // console.log("Modified content", path.join(diff.path1 as string, diff.name1 as string));
          }

          else if (diff.state === "right") {
            let diffpath2 = diff.path2 as string;
            let a = path.join(this.cwd, diffpath2.split("init")[1]);
            fs.appendFileSync(path.join(newCommitIdpath, "rm.txt"), `\n${path.join(a, diff.name2 as string)}`);
            deletedFiles?.push(path.join(a, diff.name2 as string));
            // console.log("Deleted files",path.join(diff.path2 as string,diff.name2 as string)); 
          }


        });
        // console.log("M", modifiedFiles);
        // console.log("A", addedFiles);
        // console.log("D", deletedFiles);
      } catch (error) {
        // console.error("Error comparing directories:", error);
      }
      fs.appendFileSync(this.commitsPath, `\n${message}:${newCommitId}:${new Date()}`);
      fs.appendFileSync(this.mainCommitsIdOnly, `\n${newCommitId}`);
      fs.writeFileSync(this.head, newCommitId);
      fs.writeFileSync(this.currentHead, newCommitId);
    }


    
    else if (lines.length >= 2) {
      fs.mkdir(path.join(this.gitpath, "diff"), { recursive: true }, (err) => {
        console.log(err);
      });
      // console.log("I am working");
      await this.copyDirectory(path.join(this.objPath, "init"), path.join(this.gitpath, "diff"));
      const arr = lines;
      arr.shift();
      let reverseCommitsId = arr;
      // reverseCommitsId.pop(); 
      reverseCommitsId.forEach((id) => {
        const startI = id.indexOf(":") + 1;
        const endI = 40 + id.indexOf(":") + 1;
        id = id.substring(startI, endI);


        const addFilePath = path.join(this.objPath, id, "ad.txt");
        let addedFiles = fs.readFileSync(addFilePath, "utf-8");
        const addedFilesArray = addedFiles.split("\n").filter(line => line !== '');

        const deleteFilePath = path.join(this.objPath, id, "rm.txt");
        let deletedFiles = fs.readFileSync(deleteFilePath, "utf-8");

        addedFilesArray.forEach((file) => {
          const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
          let basename = path.join(process.cwd(),path.basename(file));
          const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
          // console.log("IMPORTANT => ",addedFile,path.basename(process.cwd(),"../"));
          basename = path.join(process.cwd(),"../",a)
          // console.log("FILENAME TO ADD IN COMMIT MAIN -> ",a)
          // const fileName = file.substring(this.cwd.length);
          const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
          try {
            if (!fileExtensionRegex.test(basename)) {
              fs.mkdirSync(path.join(this.gitpath, "diff", a))
            } else {
              fs.writeFileSync(path.join(this.gitpath, "diff", a), "")
            }
          } catch (error) {

          }
        })

        var filesCount;
        const mdfPath = path.join(this.objPath, id, "mdf");
        fs.readdir(mdfPath, (err, files) => {
          if (!files || files.length === 0) {
            filesCount = 0;
            //&& addedFilesArray.length===0 && deletedFilesArray.length===0
            return;
          }
          files.forEach((file) => {
            const pathC = path.join(mdfPath, file);
            const compressedData = fs.readFileSync(pathC);
            // const apth = `${path.join(a, diff.name1 as string)}\n${readingStg}`
            //!`${path.join(a, diff.name1 as string)}\n${readingStg}`
            const decompressedData = zlib.gunzipSync(compressedData);
            const content = decompressedData.toString('utf8');
            const newlineIndex = content.indexOf('\n');
            if (newlineIndex === -1) {
            }
            const firstLine = content.substring(0, newlineIndex);
            const remainingContent = content.substring(newlineIndex + 1);
            // const filePath = firstLine.substring(this.cwd.length);
            const index = firstLine.indexOf(path.basename(path.join(process.cwd(),"../")));
            let basename = path.join(process.cwd(),path.basename(file));
            const a = firstLine.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
            // basename = path.join(process.cwd(),"../",a)
            // console.log("FILENAME TO MODIFY IN COMMIT MAIN -> ",a,basename,index);
            fs.writeFileSync(path.join(this.gitpath, "diff", a), remainingContent);
          })

        })

        const deletedFilesArray = deletedFiles.split("\n").filter(line => line !== '');

        deletedFilesArray.forEach((file) => {
          
          const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
          let basename = path.join(process.cwd(),path.basename(file));
          const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
          // console.log("IMPORTANT => ",addedFile,path.basename(process.cwd(),"../"));
          basename = path.join(process.cwd(),"../",a)
          // console.log("FILENAME TO DELETE IN COMMIT MAIN -> ",basename)
          const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
          if (!fileExtensionRegex.test(basename)) {
            // console.log("DEL dir", basename)
            fs.promises.rm(path.join(this.gitpath, "diff", a), { recursive: true, force: true })
          } else {
            // console.log("DEL file", basename);
            fs.unlinkSync(path.join(this.gitpath, "diff", a))
          }
        })
        
        if (filesCount === 0 && addedFilesArray.length === 0 && deletedFilesArray.length === 0) {
          return console.log(clc.greenBright("Nothing to commit,working tree clean"));
        }
      })
      const randomBytes = crypto.randomBytes(20);
      const newCommitId = randomBytes.toString('hex');

      const newCommitIdpath = path.join(this.objPath, newCommitId);

      fs.mkdirSync(newCommitIdpath);
      fs.mkdirSync(path.join(newCommitIdpath, "mdf"));
      fs.writeFileSync(path.join(newCommitIdpath, "ad.txt"), "");
      fs.writeFileSync(path.join(newCommitIdpath, "rm.txt"), "");
      await this.commpare2directoriesDiff(path.join(this.stagingPath, "/"), path.join(this.gitpath, "diff", "/"), newCommitId, message);
      fs.writeFileSync(this.head, newCommitId);
      fs.writeFileSync(this.currentHead, newCommitId);
      fsExtra.remove(path.join(this.gitpath, "diff"));

    }
  }

  //TODO : Already have added,deleted and Modified arrays for both 1 commit and multiple commits , write this data to a json file for that objID 



  async commpare2directoriesDiff(sourceDir: string, outDir: string, newCommitId: string, message: string) {
    const modifiedFiles: string[] | null = [];
    const addedFiles: string[] | null = [];
    const deletedFiles: string[] | null = [];
    try {



      const difference = await dirCompare.compare(sourceDir, outDir, { compareContent: true })
      const objpath = path.join(this.objPath, newCommitId);
      // console.log("SRC",sourceDir,"ROOT",outDir,"===>",objpath);

      difference.diffSet?.forEach((diff, index) => {

        if (diff.state === "left" && diff.path1 && diff.name1) {
          let diffpath1 = diff.path1 as string;
          let a = "";
          if(diffpath1.includes("stagin")){
             a = path.join(this.cwd, diffpath1.split("staging")[1]);
          }else if(diffpath1.includes("cmpA")){
            a = path.join(this.cwd, diffpath1.split("cmpA")[1]);
          }
          //! maybe error is here
          // console.log("ADDING PATH",a);
          const isFile = (path: string) => /.+\.[a-zA-Z0-9]+$/.test(path);

          // console.log("DIFFPATH1", diffpath1);
          let initialName = path.join(diffpath1, diff.name1 as string)
          if (isFile(initialName)) {
            // console.log("IT is a file", initialName);
            const initialdata = fs.readFileSync(initialName, "utf-8");
            const data = `${path.join(a, diff.name1 as string)}\n${initialdata}`;
            zlib.gzip(data, (err, compressedData) => {
              if (err) {
                console.error('Error compressing data:', err);
                return;
              }
              const filePath = path.join(objpath, "mdf", `${index}.txt.gz`);
              fs.writeFile(filePath, compressedData, (err) => {
                if (err) {
                  // console.error('Error writing compressed data to file:', err);
                } else {
                  // console.log('Compressed data successfully written to', filePath,"DATA->",data);

                }
              });
            });
            if(diffpath1.includes("staging")){
              diffpath1 = diffpath1.substring(this.stagingPath.length);
            }else if(diffpath1.includes("cmpA")){
              diffpath1 = diffpath1.substring(path.join(this.gitpath,"cmpA").length);
            }
            const pushedFile = path.join(this.cwd, diffpath1, diff.name1);
            addedFiles.push(pushedFile)
            fs.appendFileSync(path.join(objpath, "ad.txt"), `\n${pushedFile}`)

          } else {
            if(diffpath1.includes("staging")){
              diffpath1 = diffpath1.substring(this.stagingPath.length);
            }else if(diffpath1.includes("cmpA")){
              diffpath1 = diffpath1.substring(path.join(this.gitpath,"cmpA").length);
            }
            // diffpath1 = diffpath1.substring(this.stagingPath.length);
            const pushedFile = path.join(this.cwd, diffpath1, diff.name1);
            addedFiles.push(pushedFile)
            fs.appendFileSync(path.join(objpath, "ad.txt"), `\n${pushedFile}`)
          }

        }
        else if (diff.state === "distinct" && diff.path1 && diff.name1) {
          // let diffpath1 = diff.path1 as string;
          // let a = "";
          // if(diffpath1.includes("stagin")){
          //    a = path.join(this.cwd, diffpath1.split("staging")[1]);
          // }else if(diffpath1.includes("cmpA")){
          //   a = path.join(this.cwd, diffpath1.split("cmpA")[1]);
          // }
          let diffpath1 = diff.path1;
          let a = "";
          if(diffpath1.includes("staging")){
            diffpath1 = diffpath1.substring(this.stagingPath.length);
          }else if(diffpath1.includes("cmpA")){
            diffpath1 = diffpath1.substring(path.join(this.gitpath,"cmpA").length);
          }
          // diffpath1 = diffpath1.substring(this.stagingPath.length);
          modifiedFiles.push(path.join(this.cwd, diffpath1, diff.name1));
          const stagedPathtoread = path.join(this.stagingPath, diffpath1, diff.name1);
          let data = fs.readFileSync(stagedPathtoread, "utf-8");
          let apth = stagedPathtoread.substring(this.stagingPath.length)
          apth = path.join(this.cwd, apth)
          data = `${apth}\n${data}`
          zlib.gzip(data, (err, compressedData) => {
            if (err) {
              console.error('Error compressing data:', err);
              return;
            }
            const filePath = path.join(objpath, "mdf", `${index}.txt.gz`);
            fs.writeFile(filePath, compressedData, (err) => {
              if (err) {
                // console.error('Error writing compressed data to file:', err);
              } else {
                // console.log('Compressed data successfully written to', filePath);
              }
            });
          });


        }

        else if (diff.state === "right" && diff.path2 && diff.name2) {
          let diffpath2 = diff.path2;
          let newP = path.join(this.gitpath, "diff");
          diffpath2 = diffpath2.substring(newP.length);
          const pushedFile = path.join(this.cwd, diffpath2, diff.name2)
          deletedFiles.push(pushedFile)
          fs.appendFileSync(path.join(objpath, "rm.txt"), `\n${pushedFile}`)
        }
      })
      if (modifiedFiles.length === 0 && addedFiles.length === 0 && deletedFiles.length === 0) {
        const newCommitIdpath = path.join(this.objPath, newCommitId);
        fsExtra.remove(newCommitIdpath);
        return console.log(clc.green("Working tree clean, nothing to commit"))
      }
      fs.appendFileSync(this.commitsPath, `\n${message}:${newCommitId}:${new Date()}`);
      fs.appendFileSync(this.mainCommitsIdOnly, `\n${newCommitId}`);
      // console.log("MODIFIED FILES",modifiedFiles);
      // console.log("ADDED FILES",addedFiles);
      // console.log("DELETED FILES",deletedFiles);
    } catch (error) {
      const newCommitIdpath = path.join(this.objPath, newCommitId);
      fsExtra.remove(newCommitIdpath)
      // console.log("Derror", error);
    }
  }


  log(branch: string) {

    let currentBranch = fs.readFileSync(this.currentBranchName, "utf-8").trim();
     if(branch === "" && currentBranch==="main"){
      return console.log(clc.red(`Please write -> npm run git log main `))
     }
     else if (branch === "main") {
      let currentHead = fs.readFileSync(this.currentHead, "utf-8").trim();
      let data = fs.readFileSync(this.commitsPath, "utf-8");
      let show = data.split("\n").filter(line =>line !== "" && line !== "\r").reverse();
      console.log(clc.bgWhite(clc.black(`Commit logs for ${clc.red("Tree")}/${clc.green(`${branch}`)}`)));
      show.forEach((data) => {
        const m = data.split(":");
        if(m===undefined)return;
        const gmtIndex = m[4]?.indexOf("GMT+");
        const time = m[2] + ":" + m[3] + ":" + m[4]?.substring(0, gmtIndex);
        console.log(
          `${clc.yellow("message ->")} ${m[0]}\t` +
          `${clc.whiteBright("ID ->")} ${m[1]} ` +
          `${m[1] === currentHead ? clc.green("<- CURRENT-HEAD") : ''}\n` +
          `${clc.yellow("Commited on ->")} ${time}`
        );
      })
      console.log(clc.bgWhite(clc.black(`<- END ->`)));
    } else {
      const currenthead = fs.readFileSync(this.currentHead, "utf-8");
      if (!branch) {
        const currentBranchName = fs.readFileSync(this.currentBranchName, "utf-8");
        const log = fs.readFileSync(this.branchesPath, "utf-8");
        const parsedDta: BranchInterface =log? JSON.parse(log):{};
        if (!parsedDta[currentBranchName]) {
          return console.log(clc.red(`Branch ${currentBranchName} does not exist !!`));
        }
        const data = parsedDta[currentBranchName];
        console.log("LOG FOR BRANCH->", currentBranchName);
        const keys = Object.keys(data).reverse();
        for (const key of keys) {
          if (key === currenthead) {
            console.log(clc.cyan.bold(`Commit: ${key}`, `<-${clc.yellowBright("Current Head")}`));
          }
          else {
            console.log(clc.cyan.bold(`Commit: ${key}`));
          }
          console.log(clc.green(`  Time: ${data[key].time}`));
          console.log(clc.yellow(`  Message: ${data[key].message}`));
          console.log('\n');
        }
      }
      else {
        const log = fs.readFileSync(this.branchesPath, "utf-8");
        const parsedDta: BranchInterface =log? JSON.parse(log):{};
        if (!parsedDta[branch]) {
          return console.log(clc.red(`Branch ${branch} does not exist !!`));
        }
        const data = parsedDta[branch];
        const keys = Object.keys(data).reverse();
        for (const key of keys) {
          if (key === currenthead) {
            console.log(clc.cyan.bold(`Commit: ${key}`, `<-${clc.yellowBright("Current Head")}`));
          }
          else {
            console.log(clc.cyan.bold(`Commit: ${key}`));
          }
          console.log(clc.green(`  Time: ${data[key].time}`));
          console.log(clc.yellow(`  Message: ${data[key].message}`));
          console.log('\n');
        }
      }
    }
  }




  async migrateToCommitInMain(commitId: string, srcDest: string, branch: string) {
    const commitsMain = fs.readFileSync(this.mainCommitsIdOnly,"utf-8");
    const commitMainArray = commitsMain.split("\n").filter(line=>line!=="");
    var bool=false;
    commitMainArray.forEach((line)=>{
      if(line===commitId){
        bool = true;
      }
    })
    if(bool===false){
      return console.log(clc.red(`Commit ${commitId} is not present`));
    }
    const current = fs.readFileSync(this.currentHead, "utf-8");
    if (current === commitId && !srcDest.includes("cmpA") && branch !== "b") {
      return console.log(clc.greenBright(`You are already on ${commitId}`));
    }
    const migPath = srcDest;
    const dfiles = await this.extractTopLevelDirectories();
    // console.log("D", dfiles)
    try {
      if (!srcDest.includes("cmpA")) {
        // console.log("REMOVING DIRECTORUES");
        dfiles.forEach(async (del) => {
          // console.log("==>",del);
          await fsExtra.removeSync(del);
        })
      } else {
        // console.log("Emptying cmpA");
        fsExtra.mkdirSync(srcDest);
      }
      // console.log("MIGPATH",path.join(this.objPath, "init"),"->",migPath)
      await this.copyDirectory(path.join(this.objPath, "init"), migPath);
    } catch (error) {
      // console.log("ERROR", error);
    }
    if (commitId === "init") {
      fs.writeFileSync(this.currentHead, commitId);
      return;
    }
    const commitDataPath: string = fs.readFileSync(this.commitsPath, "utf-8");
    const lines = commitDataPath.split('\n').filter(line => line !== '');
    lines.shift();

    var Index = 5000000;
    for (const [index, id] of lines.entries()) {
      if (index > Index) {
        fs.writeFileSync(this.currentHead, commitId);
        break;
      }
      const finalId = id.indexOf(":");
      const lastid = id.substring(finalId + 1, finalId + 41);
      if (lastid === commitId) {
        Index = index;
        // console.log(`Commit ID ${lastid} found at line ${index + 1}`);
      }
      // console.log("ID", lastid)
      const idc = lastid
      const addFilePath = path.join(this.objPath, idc, "ad.txt");
      // console.log("ADDED FILE PATH", addFilePath);
      let addedFiles = fs.readFileSync(addFilePath, "utf-8");
      const addedFilesArray = addedFiles.split("\n").filter(line => line !== '');
      addedFilesArray.forEach(async(file) => {
        const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
        let basename = path.join(process.cwd(),path.basename(file));
        const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);


        if(!srcDest.includes("cmpA")){
          basename = path.join(process.cwd(),"../",a)
        }else if(srcDest.includes("cmpA")){
          basename = path.join(this.gitpath,"cmpA",a)
        }


        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
        // console.log("File to add ->", basename);
        try {
          if (!fileExtensionRegex.test(basename)) {
            // console.log("DIRECTORY->",basename)
            await fsExtra.mkdir(basename)
          } else {
            // console.log("FILENAME->",basename)
            await fs.writeFileSync(basename, "")
          }
        } catch (error) {

        }
      })
      // return;

      const mdfPath = path.join(this.objPath, idc, "mdf");
      fs.readdir(mdfPath, (err, files) => {
        if (!files || files.length === 0) {
          return;
        }
        files.forEach((file) => {
          const pathC = path.join(mdfPath, file);
          // console.log("PATHC", pathC);
          const compressedData = fs.readFileSync(pathC);
          const decompressedData = zlib.gunzipSync(compressedData);
          const content = decompressedData.toString('utf8');
          // console.log("MOD content =>", content, "\n");
          const newlineIndex = content.indexOf('\n');
          if (newlineIndex === -1) {
          }
          if (srcDest.includes("cmpA")) {
            const firstLine = content.substring(0, newlineIndex);
            const remainingContent = content.substring(newlineIndex + 1);
            // const filePath = firstLine.substring(this.cwd.length);

            const index = firstLine.indexOf(path.basename(path.join(process.cwd(),"../")));
            let basename = path.join(process.cwd(),path.basename(firstLine));
            const a = firstLine.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
            basename = path.join(this.gitpath, "cmpA",a)
            // const firstLine = content.substring(0, newlineIndex);
            // const remainingContent = content.substring(newlineIndex + 1);
            // let filePath = firstLine.substring(this.cwd.length);
            // filePath = path.join(this.gitpath, "cmpA", filePath);
            // console.log("FILEPATH->", basename);
            fs.writeFileSync(basename, remainingContent);
          }
          else {
            const firstLine = content.substring(0, newlineIndex);
            const remainingContent = content.substring(newlineIndex + 1);
            const filePath = firstLine.substring(this.cwd.length);

            const index = firstLine.indexOf(path.basename(path.join(process.cwd(),"../")));
            let basename = path.join(process.cwd(),path.basename(firstLine));
            const a = firstLine.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
            basename = path.join(process.cwd(),"../",a)
            // console.log(content, "firstLine", firstLine, "filePath", a);
            fs.writeFileSync(basename, remainingContent);
          }
        })

      })

      const deleteFilePath = path.join(this.objPath, idc, "rm.txt");
      let deletedFiles = fs.readFileSync(deleteFilePath, "utf-8");
      const deletedFilesArray = deletedFiles.split("\n").filter(line => line !== '');

      deletedFilesArray.forEach((file) => {
        const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
        let basename = path.join(process.cwd(),path.basename(file));
        const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
        basename = path.join(process.cwd(),"../",a)
        // console.log("ATTENTION HERE _ >>>>", basename);

        // const fileName = file.substring(this.cwd.length);
        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
        if (!fileExtensionRegex.test(basename)) {
          // console.log("DEL dir", basename)
          fsExtra.remove(basename);
        } else {
          // console.log("DEL file", basename);
          fsExtra.remove(basename)
        }
      })


    }

    fs.writeFileSync(this.currentHead, commitId);
  }


  async extractTopLevelDirectories(): Promise<string[]> {
    return new Promise(resolve => {
      const read = fs.readdir(this.cwd, (err, files) => {
        if (err) {
          // console.log(err);
        }
        const filesR = files;
        const fullPaths = files
          .filter(file => !file.includes("sloth")&& !file.includes("Sloth") && !file.includes(".git"))
          .map(file => path.join(this.cwd, file));
        return resolve(fullPaths);
      })
    })
  }

  async copyDirectory(sourceDir: string, destDir: string): Promise<void> {
    try {
      await fsExtra.copy(sourceDir, destDir, {
        overwrite: true, // Overwrites the content if it already exists
        errorOnExist: false // Don't throw an error if the destination exists
      });
      // console.log(`Copied from ${sourceDir} to ${destDir}`);
    } catch (error) {
      // console.error(`Error copying directory: ${error}`);
    }
  }

  async deleteCommitFromMain(commitid: string) {
    const commits = fs.readFileSync(this.commitsPath, "utf-8");
    const commitArray = commits.split("\n").filter(line => line !== "")
    // const reverseCommitArray = commitArray.reverse();
    // commitArray.pop();
    // console.log("commits", commits);
    var commitDelete: string[] | null = [];
    var commitDeleteFilesReverse: string[] | null = [];
    for (let i = 0; i < commitArray.length; i++) {
      const id = commitArray[i];
      const lindex = id.indexOf(":");
      const idCorrected = id.substring(lindex + 1, lindex + 41);

      if (idCorrected === commitid) {
        // console.log("We meet", commitid, ">>", idCorrected, "INDEX", i + 1);
        break;
      } else {
        try {
          commitDeleteFilesReverse.push(path.join(commitArray[commitArray.length - i + 1]));
          // console.log("RMEOVE->",(path.join(commitArray[commitArray.length - i])));
          commitDelete.push(commitArray[i]);
          // fsExtra.remove(path.join(this.objPath,));
        } catch (error) {

        }
      }
      // console.log("DELETE FILES->", commitDeleteFilesReverse);
    }
    const commitsText = commitDelete.join('\n');
    try {
      // fs.writeFileSync(this.commitsPath,commitsText);
    } catch (error) {

    }
  }


  async checkout(branchName: string) {
    // let timeNmessage = fs.readFileSync(this.initiaStartingTime,"utf-8");
    // const timeDataInitially =  timeNmessage.split("\n").filter(line=>line!=="")
    const currentBranchName = fs.readFileSync(this.currentBranchName, "utf-8");
    let mainCommitIds = fs.readFileSync(this.mainCommitsIdOnly, "utf-8");
    const mainIds = mainCommitIds.split("\n").filter(line => line !== "");
    const currentHead = fs.readFileSync(this.currentHead, "utf-8").trim()
    if (currentBranchName !== "main") {
      await this.handleBranchToBranchCheckout(currentBranchName, branchName);
      return;
    }
    if (currentBranchName === branchName) {
      return console.log(clc.blueBright(`You are already on ${branchName}`));
    } else if (mainIds.length === 0 || mainIds[0] === "") {
      return console.log(clc.redBright("You need to commit initially "));
    }
    else {
      let branchcommitsHistory = fs.readFileSync(this.branchesPath, "utf-8");
      let parsedJSONdata: BranchInterface = {};
      try {
        if (parsedJSONdata !== null) {
          parsedJSONdata = JSON.parse(branchcommitsHistory);
        }
        // console.log("mainIds----------")
      } catch (err) {
        //! log error here
        // console.error('Error parsing JSON:', err);
        // return;
      }
      if (parsedJSONdata !== null && parsedJSONdata[branchName]) {
        return console.log(clc.yellow("A branch with this name is already present"));
      }
      const commitMessageMain = fs.readFileSync(this.commitsPath, "utf-8");
      const commitMessageMainArrays = commitMessageMain.split("\n").filter(line => line !== "");
      let commitMessage: string[] = [];
      const result: BranchInterface = {
        [`${branchName}`]: {}
      };

      for (let i = 0; i < commitMessageMainArrays.length; i++) {
        const id = commitMessageMainArrays[i];
        const message = id.split(":");
        const commitId = message[1]; // Extracting the commit ID
        const commitMessage = message[0]; // Extracting the commit message
        if (currentHead !== commitId) {
          result[branchName][commitId] = {
            time: message[2] + ":" + message[3],
            message: commitMessage
          };
        } else if (currentHead === commitId) {
          result[branchName][commitId] = {
            time: message[2] + ":" + message[3],
            message: "MAIN" + commitMessage
          };
          break;
        }


        // console.log("C", currentHead, "COMMIDTD", commitId);
      }
      // console.log("result->", result);
      // console.log("MESSAGE MAIN COMMITS", commitMessage);
      if (parsedJSONdata === null) {
        fs.writeFileSync(this.branchesPath, JSON.stringify(result, null, 2), 'utf-8');
      } else {
        const a = { ...parsedJSONdata, ...result }
        fs.writeFileSync(this.branchesPath, JSON.stringify(a, null, 2), 'utf-8');
      }
      if (currentBranchName === "main") {
        this.checkoutToMain(currentHead, path.join(this.gitpath, "cmpA"));
      }
      fs.writeFileSync(this.currentBranchName, `${branchName}`)
      const currentBranchNameOnly = fs.readFileSync(this.currentBranchName,"utf-8");
      // Read current items from the JSON file
      const data = fs.readFileSync(this.branchesHistorykeymap, 'utf8');
      const items: BranchKeyValueItems = data ? JSON.parse(data) : {};

      const writeData = { ...items };

      // Ensure the current branch key exists and is an array
      if (!writeData[currentBranchName]) {
        writeData[currentBranchName] = [branchName];
      }
      
      // Add the new branch name to the array for the current branch key
      if (!writeData[currentBranchName].includes(branchName)) {
        writeData[currentBranchName].push(branchName);
      }
      
      // Write updated items back to the JSON file
      fs.writeFileSync(this.branchesHistorykeymap, JSON.stringify(writeData, null, 2), 'utf8');

      return console.log(clc.blueBright(`Switched fro main -> ${branchName}`));
    }

  }

  async handleBranchToBranchCheckout(currentBranchName: string, branchName: string) {
    const jsonData = fs.readFileSync(this.branchesPath, "utf-8");
    const parsedJson: BranchInterface =jsonData?  JSON.parse(jsonData):null;
    const branchCommits = parsedJson[currentBranchName];
    parsedJson[branchName] = branchCommits;
    fs.writeFileSync(this.branchesPath, JSON.stringify(parsedJson, null, 0))
    fs.writeFileSync(this.currentBranchName, branchName);
    const data = fs.readFileSync(this.branchesHistorykeymap, 'utf8');
    const items: BranchKeyValueItems = data ? JSON.parse(data) : {};

    // Update items with the new branch name
    const writeData = { ...items };

    // Ensure the current branch key exists and is an array
    if (!writeData[currentBranchName]) {
      writeData[currentBranchName] = [branchName];
    }
    
    // Add the new branch name to the array for the current branch key
    if (!writeData[currentBranchName].includes(branchName)) {
      writeData[currentBranchName].push(branchName);
    }
    
    // Write updated items back to the JSON file
    fs.writeFileSync(this.branchesHistorykeymap, JSON.stringify(writeData, null, 2), 'utf8');
    console.log(clc.cyanBright(`Switched from ${currentBranchName} -> ${branchName}`));
  }
  





  async branchCommits(message: string) {
    const distPath = path.join(this.gitpath, "cmpA");//only change these names
    const srcPath = path.join(this.stagingPath, "/");//only change these names
    const randomBytes = crypto.randomBytes(20);
    const newCommitId = randomBytes.toString('hex');//create 40 digit hash 
    const difference = await dirCompare.compare(srcPath, distPath, { compareContent: true });

    const addedFiles: string[] | null = [];
    const modifiedFiles: string[] | null = [];
    const deletedFiles: string[] | null = [];

    const objpath = path.join(this.branchingObjectsPath, newCommitId);
    fs.mkdirSync(objpath);
    fs.mkdirSync(path.join(objpath, "mdf"));
    fs.writeFileSync(path.join(objpath, "rm.txt"), "");
    fs.writeFileSync(path.join(objpath, "ad.txt"), "");


    difference.diffSet?.forEach((diff, index) => {
      if (diff.state === "left" && diff.path1 && diff.name1) {
        // console.log("DIFF", diff.path1, diff.name1);
        const stagingPath = path.join(diff.path1, diff.name1);
        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
        if (!fileExtensionRegex.test(stagingPath)) {
          let a = diff.path1.substring(this.stagingPath.length);
          fs.appendFileSync(path.join(objpath, "ad.txt"), `\n${path.join(this.cwd, a, diff.name1 as string)}`);
          addedFiles.push(path.join(this.cwd, a, diff.name1 as string));
        } else {
          const pathToReadData = fs.readFileSync(stagingPath, "utf-8");
          let a = diff.path1.substring(this.stagingPath.length);
          const data = `${path.join(a, diff.name1 as string)}\n${pathToReadData}`;
          if (pathToReadData !== "") {
            zlib.gzip(data, (err, compressedData) => {
              if (err) {
                console.error('Error compressing data:', err);
                return;
              }
              const filePath = path.join(objpath, "mdf", `${index}.txt.gz`);
              fs.writeFile(filePath, compressedData, (err) => {
                if (err) {
                  // console.error('Error writing compressed data to file:', err);
                } else {
                  // console.log('Compressed data successfully written to', filePath);

                }
              });
              
            });
            // console.log("added files -> ", `\n${path.join(this.cwd, a, diff.name1 as string)}`)
              fs.appendFileSync(path.join(objpath, "ad.txt"), `\n${path.join(this.cwd, a, diff.name1 as string)}`);
              addedFiles.push(path.join(this.cwd, a, diff.name1 as string));
          }
          else {
            fs.appendFileSync(path.join(objpath, "ad.txt"), `\n${path.join(this.cwd, a, diff.name1 as string)}`);
            addedFiles.push(path.join(this.cwd, a, diff.name1 as string));
            // console.log("ADDEd files -> ", `\n${path.join(this.cwd, a, diff.name1 as string)}`)
          }
        }
      }
      else if (diff.state === "distinct" && diff.path1 && diff.name1) {
        const stagingPath = path.join(diff.path1, diff.name1);
        const pathToReadData = fs.readFileSync(stagingPath, "utf-8");
        let a = diff.path1.substring(this.stagingPath.length);
        const data = `${path.join(a, diff.name1 as string)}\n${pathToReadData}`;
        zlib.gzip(data, (err, compressedData) => {
          if (err) {
            console.error('Error compressing data:', err);
            return;
          }
          const filePath = path.join(objpath, "mdf", `${index}.txt.gz`);
          fs.writeFile(filePath, compressedData, (err) => {
            if (err) {
              // console.error('Error writing compressed data to file:', err);
            } else {
              // console.log('Compressed data successfully written to', filePath);

            }
          });
          // console.log("Mod files -> ", `\n${path.join(this.cwd, a, diff.name1 as string)}`)
        });
        modifiedFiles.push(path.join(this.cwd, a, diff.name1 as string));
      }
      else if (diff.state === "right" && diff.path2 && diff.name2) {
        let diffpath2 = diff.path2;
        let a = path.join(this.gitpath, "cmpA");
        diffpath2 = diffpath2.substring(a.length);
        const pushedFile = path.join(this.cwd, diffpath2, diff.name2)
        const finalPath = path.join(diffpath2, diff.name2);
        deletedFiles.push(pushedFile)
        // console.log("DEL", finalPath)
        fs.appendFileSync(path.join(objpath, "rm.txt"), `\n${path.join(this.cwd, finalPath)}`)
        deletedFiles.push(path.join(this.cwd, finalPath));
      }
    })
    if (modifiedFiles.length === 0 && addedFiles.length === 0 && deletedFiles.length === 0) {
      try {
        // console.log(addedFiles,modifiedFiles,deletedFiles);
        fsExtra.removeSync(objpath);
        return console.log(clc.green("Nothing to commit, working tree clean"));
      } catch (error) {
        // console.log(error);
      }
    } else {
      try {
        // console.log("Listen");
        const jsonBranchData = fs.readFileSync(this.branchesPath, "utf-8");
        const branchName = fs.readFileSync(this.currentBranchName, "utf-8");
        let parsedJson: BranchInterface = JSON.parse(jsonBranchData);
        parsedJson[branchName][newCommitId] = {
          time: Date().toString(),
          message: message
        };
        // console.log(parsedJson);
        fs.writeFileSync(this.branchesPath, JSON.stringify(parsedJson, null, 2), "utf-8");
        fsExtra.emptydirSync(distPath)
        fs.writeFileSync(this.currentHead, newCommitId)
        await this.copyDirectory(srcPath, distPath)
        return console.log(clc.greenBright(`-- Commited --`))
      } catch (error) {
        // console.log("->", error);
      }
    }
  }



  async checkoutToMain(commitId: string, pathName: string) {
    fsExtra.removeSync(pathName);
    this.migrateToCommitInMain(commitId, pathName, "n")
  }

  async goto(branchName: string) {
    const currentBranchName = fs.readFileSync(this.currentBranchName, "utf-8");
    if (currentBranchName === branchName) {
      return console.log(clc.green("You are already present on that branch"));
    } else if (branchName === "main") {
      const mainCommitIds = fs.readFileSync(this.mainCommitsIdOnly, "utf-8");
      const mainCommitIdsArray = mainCommitIds.split("\n").filter(line => line !== "");
      const lastMainId = mainCommitIdsArray[mainCommitIdsArray.length - 1];
      if (lastMainId === "") { return console.log(clc.red("There are no commits in main branch")) }
      // console.log("lastMainId",lastMainId);
      const a = path.join(process.cwd(), "../");
      await this.migrateToCommitInMain(lastMainId, a, "b");
      
      await this?.add(".");
      fs.writeFileSync(this.currentBranchName, branchName);
      console.log(clc.green(`You are on ${branchName}`));
    }
    else if (branchName !== "main") {
      const jsonData = fs.readFileSync(this.branchesPath, "utf-8");
      const parsedData: BranchInterface = JSON.parse(jsonData);
      const commits = parsedData[branchName];
      if (!commits) {
        { return console.log(clc.red(`There are no commits for ${branchName} branch`)) }
      }
      var migrateCommitIdMain = "";
      for (const commitId in commits) {
        if (commits.hasOwnProperty(commitId)) {
          const commit = commits[commitId];
          if (commit.message.includes("MAIN")) {
            migrateCommitIdMain = commitId;
            break;
          }
        }
      }
      if (migrateCommitIdMain === "") {
        return console.log(clc.redBright("Some issue is there"));
      }
      const a = path.join(process.cwd(), "../");
      await this.migrateToCommitInMain(migrateCommitIdMain, a, "b");
      // console.log(`migrateCommitIdMain: ${migrateCommitIdMain}`);
      var bool = false;
      var lastCommitId = "";
     
      for (const commitId in commits) {
        if (commits.hasOwnProperty(commitId)) {
          const commit = commits[commitId];
          if (bool === false) {
            if (commitId === migrateCommitIdMain) {
              bool = true;
            }
          } else if (bool === true) {
            lastCommitId = commitId;
            // console.log("lastMainId",lastCommitId);
            // console.log(clc.cyanBright("IDS->", commitId));
            await this.gotoWorkingAndStaging(commitId);
          }
        }
      }
      await this?.add(".");
      await fsExtra.remove(path.join(this.gitpath, "cmpA"));
      // await fsExtra.mkdirSync(path.join(this.gitpath,"cmpA"));
      // fsExtra.mkdirSync(path.join(this.gitpath,"cmpA"));
      // console.log("->", path.join(this.gitpath, "cmpA"));
      await fsExtra.mkdir(path.join(this.gitpath, "cmpA"));
      await this.copyStagingCmpa();
      await fs.writeFileSync(this.currentHead, lastCommitId)
      await fs.writeFileSync(this.currentBranchName, branchName)
      console.log("End");
    }
  }

  async copyStagingCmpa() {
    try {

      await this.copyDirectory(path.join(this.stagingPath), path.join(this.gitpath, "cmpA"));
      // console.log("Copied");
    } catch (error) {
      // console.log(error)
    }
  }



  async gotoWorkingAndStaging(commitId: string) {
    const branchPathObject = path.join(this.branchingObjectsPath, commitId);
    const addedFiles = fs.readFileSync(path.join(branchPathObject, "ad.txt"), "utf-8");
    // console.log("####################");
    const addedFilesArray = addedFiles.split("\n").filter(line => line !== "");

    // console.log("ADDED FILES->",addedFilesArray);
    addedFilesArray.forEach(async(addedFile) => { 
      const index = addedFile.indexOf(path.basename(path.join(process.cwd(),"../")));
      let basename = path.join(process.cwd(),path.basename(addedFile));
      const a = addedFile.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
      // console.log("IMPORTANT => ",addedFile,path.basename(process.cwd(),"../"));
      basename = path.join(process.cwd(),"../",a)
      // return;
      const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
      if (!fileExtensionRegex.test(basename)) {
        if (!fs.existsSync(basename)) {
          // console.log('Folder does not exist. Creating new file.',"Directory",basename);
          await fsExtra.mkdirSync(basename);
        } else {
          // console.log('Folder already exists.');
        }
      } else {
        // console.log('File doesnot exists.',basename);
        fsExtra.writeFileSync(basename, "");
      }
    })

    const modifiedFilesFiles = fs.readdir(path.join(branchPathObject, "mdf"), async (err, files) => {
      if(!files){
        return;
      }
      const filesArray = files;
      filesArray.forEach((file) => {

        const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
        let basename = path.join(process.cwd(),path.basename(file));
        const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
        basename = path.join(process.cwd(),"../",a)
        const fileCompressed = path.join(path.join(branchPathObject, "mdf", file));
        const compressedData = fs.readFileSync(fileCompressed, { encoding: null });
        const decompressedData = zlib.gunzipSync(compressedData);
        const content = decompressedData.toString('utf8');
        const newlineIndex = content.indexOf('\n');
        if (newlineIndex === -1) {
          return console.log(clc.red("Something went wrong ..."));
        }
        const firstLine = content.substring(0, newlineIndex);
        const remainingContent = content.substring(newlineIndex + 1);
        fs.writeFileSync(path.join(this.cwd, firstLine), remainingContent);
      })
    });

    const deletedFiles = fs.readFileSync(path.join(branchPathObject, "rm.txt"), "utf-8");
    const deletedFilesArray: string[] | null = deletedFiles.split("\n").filter(line => line !== "");
    deletedFilesArray.forEach(async (delFile) => {
      const index = delFile.indexOf(path.basename(path.join(process.cwd(),"../")));
        let basename = path.join(process.cwd(),path.basename(delFile));
        const a = delFile.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
        basename = path.join(process.cwd(),"../",a)
      try {
        // console.log("START DELETING---------------",basename);
         await fsExtra.remove(basename);
        // console.log(`Successfully deleted: ${basename}`);
      } catch (error) {
        // console.error(`Error deleting ${basename}:`, error);
      }
    })
    // console.log(clc.redBright(`Now next`));
  }


  async migrateToBranchCommit(commitIdGiven:string){
    const branchName = fs.readFileSync(this.currentBranchName,"utf-8")
    const jsonData = fs.readFileSync(this.branchesPath,"utf-8");
    const parsedJSONdata:BranchInterface = JSON.parse(jsonData);
    const data = parsedJSONdata[branchName]; 
    if(!data){
      return console.log(clc.red(`Commit - ${commitIdGiven} is not present in ${branchName}`))
    }else{
      var bool = false;
      for (const commitId in data) {
        if (data.hasOwnProperty(commitId)) {
          const commit = data[commitId];
          if(commitId === commitIdGiven && commit.message.includes("MAIN")){
              bool = true;
              break;
          }
        }
      }
      if(bool===true){
        return console.log(clc.cyanBright(`Commit ${commitIdGiven} also exists in Main branch. Please "Goto" main branch and migrate to make changes to it.`));
      }else{
        await this.gotoBranchCommit(branchName,commitIdGiven);
      }
    }
  }

  async gotoBranchCommit(branchName: string,commitIdGiven:string) {
     if (branchName !== "main") {
      const jsonData = fs.readFileSync(this.branchesPath, "utf-8");
      const parsedData: BranchInterface = JSON.parse(jsonData);
      const commits = parsedData[branchName];
      if (!commits) {
        { return console.log(clc.red(`There are no commits for ${branchName} branch`)) }
      }
      var migrateCommitIdMain = "";
      for (const commitId in commits) {
        if (commits.hasOwnProperty(commitId)) {
          const commit = commits[commitId];
          if (commit.message.includes("MAIN")) {
            migrateCommitIdMain = commitId;
            break;
          }
        }
      }

      if (migrateCommitIdMain === "") {
        return console.log(clc.redBright("Some issue is there"));
      }
      // console.log("ID main->",migrateCommitIdMain);
      const a = path.join(process.cwd(), "../");
      // console.log("//////////////////////////////////////////////");
      await this.migrateToCommitInMain(migrateCommitIdMain, a, "b");
      // console.log(`migrateCommitIdMain: ${migrateCommitIdMain}`);
      var bool = false;
      var lastCommitId = "";
      for (const commitId in commits) {
        if (commits.hasOwnProperty(commitId)) {
          const commit = commits[commitId];
          if (bool === false) {
            if (commitId === migrateCommitIdMain) {
              bool = true;
            }
          } else if (bool === true) {
            // console.log(clc.cyanBright("Applying->", commitId));
            lastCommitId = commitId;
            await this.gotoWorkingAndStaging(commitId);
            if(commitIdGiven === commitId){
              break;
            }
            // console.log(clc.cyanBright("->", commitId));
          }
        }
      }
      await this?.add(".");
      await fsExtra.remove(path.join(this.gitpath, "cmpA"));
      // await fsExtra.mkdirSync(path.join(this.gitpath,"cmpA"));
      // fsExtra.mkdirSync(path.join(this.gitpath,"cmpA"));
      // console.log("->", path.join(this.gitpath, "cmpA"));
      await fsExtra.mkdir(path.join(this.gitpath, "cmpA"));
      await this.copyStagingCmpa();
      fs.writeFileSync(this.currentHead, lastCommitId)
      fs.writeFileSync(this.currentBranchName, branchName)
      console.log("End");
    }
  }

  async merge(message:string){
    const currentBranchName = fs.readFileSync(this.currentBranchName,"utf-8");
    if(currentBranchName === "main"){
      return console.log(clc.cyanBright(`You need to be on the source branch`));
    }
   try {
    await this.mergeAndCommit(message);
    return console.log(clc.greenBright(`Branch - ${currentBranchName} is merged with MAIN`));
   } catch (error) {
    console.log(error)
   }
  }



  async mergeAndCommit(message:string){

    const commitDataPath: string = fs.readFileSync(this.commitsPath, "utf-8");
    const lines = commitDataPath.split('\n').filter(line => line !== '');
    fs.mkdir(path.join(this.gitpath, "diff"), { recursive: true }, (err) => {
      console.log(err);
    });
    await this.copyDirectory(path.join(this.objPath, "init"), path.join(this.gitpath, "diff"));
    const arr = lines;
    arr.shift();
    let reverseCommitsId = arr;
    reverseCommitsId.forEach((id) => {
      const startI = id.indexOf(":") + 1;
      const endI = 40 + id.indexOf(":") + 1;
      id = id.substring(startI, endI);
      // console.log("ID-<>",id );

      const addFilePath = path.join(this.objPath, id, "ad.txt");
      let addedFiles = fs.readFileSync(addFilePath, "utf-8");
      const addedFilesArray = addedFiles.split("\n").filter(line => line !== '');

      const deleteFilePath = path.join(this.objPath, id, "rm.txt");
      let deletedFiles = fs.readFileSync(deleteFilePath, "utf-8");

      addedFilesArray.forEach((file) => {
        
        const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
        let basename = path.join(process.cwd(),path.basename(file));
        const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
        basename = path.join(process.cwd(),"../",a)

        // const fileName = file.substring(this.cwd.length);
        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
        // console.log("ADD->",path.join(this.gitpath, "diff", a));
        try {
          if (!fileExtensionRegex.test(basename)) {
            fs.mkdirSync(path.join(this.gitpath, "diff", a))
          } else {
            fs.writeFileSync(path.join(this.gitpath, "diff", a), "")
          }
        } catch (error) {
          console.log(error)
        }
      })  

      var filesCount;
      const mdfPath = path.join(this.objPath, id, "mdf");
      fs.readdir(mdfPath, (err, files) => {
        if (!files || files.length === 0) {
          filesCount = 0;
          //&& addedFilesArray.length===0 && deletedFilesArray.length===0
          return;
        }
        files.forEach((file) => {
          const pathC = path.join(mdfPath, file);
          const compressedData = fs.readFileSync(pathC);
          const decompressedData = zlib.gunzipSync(compressedData);
          const content = decompressedData.toString('utf8');
          const newlineIndex = content.indexOf('\n');
          if (newlineIndex === -1) {
          }
          const firstLine = content.substring(0, newlineIndex);
          const remainingContent = content.substring(newlineIndex + 1);

          const index = firstLine.indexOf(path.basename(path.join(process.cwd(),"../")));
          let basename = path.join(process.cwd(),path.basename(firstLine));
          const a = firstLine.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
          basename = path.join(this.gitpath, "diff",a)
          // console.log("MODI-<>" ,basename)
         const filePath = firstLine.substring(this.cwd.length);
         try {
          fs.writeFileSync(basename, remainingContent);
         } catch (error) {
          // console.log("EROR modi",error)
         }
        })

      })

      const deletedFilesArray = deletedFiles.split("\n").filter(line => line !== '');

      deletedFilesArray.forEach(async(file) => {
        const index = file.indexOf(path.basename(path.join(process.cwd(),"../")));
        let basename = path.join(process.cwd(),path.basename(file));
        const a = file.substring(index + path.basename(path.join(process.cwd(),"../")).length + 1);
        basename = path.join(process.cwd(),"../",a)
        // console.log("DEL FILES->",path.join(this.gitpath, "diff", a));
        // const fileName = file.substring(this.cwd.length);
        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;
        if (!fileExtensionRegex.test(basename)) {
          // console.log("DEL dir", basename)
          await fsExtra.remove(path.join(this.gitpath, "diff", a));
        } else {
          // console.log("DEL files", path.join(this.gitpath, "diff", a));
          await fsExtra.remove(path.join(this.gitpath, "diff", a))
        }
      })

      if (filesCount === 0 && addedFilesArray.length === 0 && deletedFilesArray.length === 0) {
        return console.log(clc.greenBright("Nothing to commit,working tree clean"));
      }
    })
    const randomBytes = crypto.randomBytes(20);
    const newCommitId = randomBytes.toString('hex');

    const newCommitIdpath = path.join(this.objPath, newCommitId);

    fs.mkdirSync(newCommitIdpath);
    fs.mkdirSync(path.join(newCommitIdpath, "mdf"));
    fs.writeFileSync(path.join(newCommitIdpath, "ad.txt"), "");
    fs.writeFileSync(path.join(newCommitIdpath, "rm.txt"), "");
    await this.commpare2directoriesDiff(path.join(this.gitpath, "cmpA"), path.join(this.gitpath, "diff"), newCommitId, message);
    fs.writeFileSync(this.head, newCommitId);
    fs.writeFileSync(this.currentHead, newCommitId);
    fsExtra.remove(path.join(this.gitpath, "diff"));
    fs.writeFileSync(this.currentBranchName,"main");
  }

  
  async view(){
  try {
    const currentBranch = fs.readFileSync(this.currentBranchName,"utf-8")
    let jsonData:string|null = fs.readFileSync(this.branchesPath,"utf-8");
    let parsedJson:BranchInterface =jsonData? JSON.parse(jsonData):{};
    const branches = Object.keys(parsedJson);
    branches.unshift('main');
    console.log(clc.bold('Branches:'));
    branches.forEach(branch => {
      if (branch === currentBranch) {
        console.log(clc.green(`* ${branch} (current)`));
      } else {
        console.log(`  ${clc.yellow(branch)}`);
      }
    });
    console.log(clc.bold('End:'));
  } catch (error) {
    return console.log(clc.redBright(`Error reading all branches -> `,error));
  }
  }

  async eagleView(){
    generateMermaidCode(path.join(this.branchesHistorykeymap));
  }

  async pushOrigin(branchName:string){
    try {
      let parentB  = fs.readFileSync(this.branchesHistorykeymap,"utf-8");
      const parentBranch = parentB ? JSON.parse(parentB):null;
      let value_key = "";
      if (parentBranch && typeof parentBranch === 'object') {
        // Iterate over the object to find the key for the given value
        for (const [key, value] of Object.entries(parentBranch)) {
          // Ensure the value is an array and contains the branchName
          if (Array.isArray(value) && value.includes(branchName)) {
            value_key = key;
            break; // Stop iterating once the key is found
          }
        }
      }
      const jsonData = fs.readFileSync(this.branchesPath, "utf-8");
      const parsedData: BranchInterface |null= JSON.parse(jsonData);
      const commits =parsedData ?  parsedData[branchName]:null;

      const key_commits = parsedData ?  parsedData[value_key]:null;
      const key_commits_main = fs.readFileSync(this.mainCommitsIdOnly,"utf-8").split("\n").filter(line=>line!=="");

      let diff_commit_message:string[]|null = [];
      var diff:string[]|null =[];
     if(value_key!=="main"){
      for(const keys in commits){
        if(commits && key_commits){
          const commitValue = key_commits[keys];
          if(!commitValue){
            diff?.push(keys)
            diff_commit_message?.push(commits[keys].message);
            // console.log("NP",keys)
          }

        }
      }
     }else if(value_key==="main"){
      let i = 0;
      for(const keys in commits){
        if(commits && key_commits_main){
          const commitValue = key_commits_main[i];
          if(!commitValue){
            diff?.push(keys)
            diff_commit_message?.push(commits[keys].message);
            // console.log("NP",keys)
          }

        }
        i++;
      }
     }
      if(!commits){
        return console.log(clc.redBright(`Something went wrong`));
      } 

      if(diff.length === 0){
        return console.log(clc.redBright(`You have nothing to commit`))
      }
      else if(diff.length > 0){
        // console.log(diff,branchName,value_key,diff_commit_message);
        await Push(diff,branchName,value_key,diff_commit_message);
      }
      // return console.log(clc.greenBright(`Reached here`));
    } catch (error) {
      return console.log(clc.redBright`Something went wrong`);
    }
  }

  async initOrigin(){
    await initOriginMethod();
  }

  async pushOriginS3(){
    await pushOriginOwner();
  }

  async mergePr(){
    await mergePullRequest();
  }

  async pullOrigin(){
    await pullOriginRequest();
  }
}

export default Gitpulse;


const program = new Command();

let gitpulse: Gitpulse | null;
const args = process.argv.slice(2);


program
  .command('status')
  .description('Check the status of the project')
  .action((options, command) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
      gitpulse.status();
    } else {
      console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });

program
  .command('init')
  .description('Initialize Gitpulse in project')
  .action((options, command) => {
    gitpulse = new Gitpulse();
    gitpulse.saveToConfig();
  });

program
  .command('log [branch]')
  .description('Show commit history')
  .action((branch) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
      if (!branch) {
        gitpulse.log("");
      }
      else {
        gitpulse.log(branch);
      }
    } else {
      console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });


program
  .command('migrate-main <commitId>')
  .description('Go back to previous commit')
  .action((commitId) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
      const a = path.join(process.cwd(), "../");
      gitpulse.migrateToCommitInMain(commitId, a, "n");
    } else {
      console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });

  
program
.command('migrate-branch <commitId>')
.description('Go back to current branch previous commit')
.action((commitId) => {
  gitpulse = Gitpulse.loadFromConfig();
  if (gitpulse) {
    gitpulse.migrateToBranchCommit(commitId);
  } else {
    console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
  }
});

program
  .command('checkout <branch>')
  .description('Create a different branch')
  .action((branch) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
      gitpulse.checkout(branch);
    } else {
      console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });

program
  .command('goto <branch>')
  .description('Goto an already created branch with latest commit')
  .action((branch) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
      gitpulse.goto(branch);
    } else {
      console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });

program
  .command('delete <commitId>')
  .description('Delete main commit')
  .action((commitId) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
      // console.log("commitId",commitId);
      gitpulse.deleteCommitFromMain(commitId);
    } else {
      console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });


program
  .command('commit <message>')
  .description('Commits the project')
  .action((message) => {
    // console.log(message);
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.commit(message);
  });

  program
  .command('merge <message>')
  .description('Commits the project')
  .action((message) => {
    console.log(message);
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.merge(message);
  });

  program.command('add <action>')
  .description("Add files to stage area")
  .action((action: string) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.add(action);
  })

  program.command('view ')
  .description("View all the branches")
  .action((action: string) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.view();
  })

  program
  .command('eagle view')
  .description('Shows all the branches diagramatically')
  .action(() => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.eagleView();
  });


  program
  .command('create origin')
  .description('Create a new repo on internet')
  .action(() => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.initOrigin();
  });


  program
  .command('push-origin <branch>')
  .description('Push to the repo on internet')
  .action((branch) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.pushOrigin(branch);
  });


  program
  .command('push origin')
  .description('Create a new repo on internet')
  .action(() => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.pushOriginS3();
  });

  program
  .command('merge-pr')
  .description('Create a new repo on internet')
  .action(() => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.mergePr();
  });


  program
  .command('pull origin')
  .description('Pulls the latest changes of repository')
  .action(() => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.pullOrigin();
  });




program.parse(process.argv);