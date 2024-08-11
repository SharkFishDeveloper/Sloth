
import clc from 'cli-color';
import readline from "readline";


function promptQuestion(query:string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, (answer:string) => {
    rl.close();
    resolve(answer);
  }));
}




export async function Push(diff: string[], branchname: string, parentBranch: string, history: any) {
  console.log(diff,branchname,parentBranch,history);
  const messages:string[] = [];
  for(const id in history){
    const entry = history[id];
    messages.push(entry.message);
  }
  const reponame = await promptQuestion('Enter Repo name: ')
  const username = await promptQuestion('Enter your username: ');
  const password = await promptQuestion('Enter your password: ');

  //@ts-ignore
  if(reponame.length<6 && username.length < 6 || password.length < 6){
    return console.log(clc.redBright(`Reponame or Name or Password is too short !!`));
  }
  if(diff.length===0){
    return console.log(clc.redBright(`Nothing to commit`));
  }

}
