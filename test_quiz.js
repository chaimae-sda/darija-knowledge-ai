import fs from 'fs';
const text = fs.readFileSync('src/services/apiService.js', 'utf8');
const match = text.match(/const generateQuestionsFromText = \(text\) => {[\s\S]*?\]\.slice\(0, QUIZ_TARGET_COUNT\);\n};/);
if (match) {
  const func = match[0];
  console.log("Found function:", func.substring(0, 100));
} else {
  console.log("Function not found");
}
