
// 使用 Node.js 脚本在 Ubuntu 上查找并杀死名为 "node server.js" 的进程

import { execSync } from 'child_process';


function stop_a_process(process_name){
  const result = execSync(`ps aux | grep '${process_name}' | grep -v grep`).toString();
  const lines = result.split('\n').filter(line => line.trim() !== '');
  let killed = 0;

  lines.forEach(line => {
    // ps aux 输出格式: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
    const parts = line.trim().split(/\s+/);
    
    const pid = parts[1];
    if (pid && !isNaN(Number(pid))) {
      try {
        process.kill(pid, 'SIGKILL');
        console.log(`Killed process node server.js with PID: ${pid}`);
        killed++;
      } catch (e) {
        console.error(`Failed to kill PID ${pid}:`, e.message);
      }
    }
  });

  if (killed === 0) {
    console.log('No "node server.js" process found.');
  }
}

// 从命令行参数读取进程名，如果有则用参数，否则默认 "node server.js"
const processName = process.argv[2] || "node server.js";


stop_a_process("node server.js")
stop_a_process("node server.js")
