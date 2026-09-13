import { execFileSync } from 'node:child_process';

function runGit(args) {
  execFileSync('git', args, { stdio: 'inherit' });
}

const status = execFileSync('git', ['status', '--porcelain'], {
  encoding: 'utf8',
}).trim();

if (status) {
  runGit(['add', '-A']);
  runGit(['commit', '-m', `chore: sync changes ${new Date().toISOString()}`]);
}

runGit(['push', 'origin', 'HEAD']);
