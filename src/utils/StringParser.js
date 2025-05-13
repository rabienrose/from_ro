var StringParser={}

StringParser.parseJobStr = function(job_id){
  console.log(job_id)
  switch(job_id){
    case 0:
      return '初心者';
    case 1:
      return '剑士';
    case 2:
      return '魔法师';
    case 3:
      return '弓箭手';
    case 4:
      return '服侍';
    case 5:
      return '商人';
    case 6:
      return '盗贼';
    default:
      return '未知';
  }
}

export default StringParser