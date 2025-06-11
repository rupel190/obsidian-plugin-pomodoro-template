<%*
try {
  console.log("Logging Pomodoro...");

  // Output file
  const pathParts = log.task.path.split("/");
  const fileName = pathParts.pop().replace(".md", "");
const parentFolder = pathParts.length >= 2 ? pathParts[pathParts.length - 1] : "General";

  const outputPath = `Work/Pomodoros/${parentFolder}.md`;

  // DataView
  const formatTime = (date) => date ? date.toISOString() : "Unknown"; // format time to ISO
  const dwMode = `(pomodoro::${log.mode})`;
  const dwBegin = `(begin::${formatTime(log.begin)})`;
  const dwEnd = `(end::${formatTime(log.end)})`;
  const dwDuration = `(duration::${log.duration})`;
  const dwFullPath = `(path::${log.task.path})`;
  const dwTaskName = `(taskname::${log.task.name})`;
  const dwBlocklink = `(blocklink::${(log.task.blockLink).trim()})`;
  const dwFileName = `(fileName::${fileName})`;

  // Construct log entry while retaining DataView variables
  const link = `[[${log.task.path}#${log.task.blockLink.trim()}|${log.task.name}]]`;
  let icon = log.mode === "WORK" ? (log.finished ? "🍅" : "🟡") : "☕️";
  let logEntry = `- ${icon} ${dwMode} for ${dwDuration} min (${dwBegin} - ${dwEnd}) | \n${dwFullPath}${dwBlocklink}\n${dwFileName} ${dwTaskName}\n${link}\n`;

  // Read or create file
  let content = "";
  let file = app.vault.getAbstractFileByPath(outputPath);

  if (file) {
    content = await app.vault.read(file);
  } else {
    console.warn(`⚠️ File not found: ${outputPath}, creating new file.`);
    await app.vault.create(outputPath, ""); // Create file if it does not exist
  }

  // Wait for frontmatter stabilization (TimeThings Plugin)
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1000ms

  // Append to top of the file after frontmatter and use proper file path instead of a file object
  let newContent;
  if (content.startsWith("---")) {
    // Find the end of frontmatter block
    const fmEnd = content.indexOf("---", 3); // skip first '---'
    if (fmEnd !== -1) {
      const before = content.slice(0, fmEnd + 3); // include closing ---
      const after = content.slice(fmEnd + 3).trimStart(); // rest of the file
      newContent = `${before}\n\n\n${logEntry}\n${after}`;
    } else {
      newContent = `${logEntry}\n\n${content}`;
    }
  } else {
    newContent = `${logEntry}\n\n${content}`;
  }
  await app.vault.adapter.write(outputPath, newContent);

  console.log(`✅ Logged to: ${outputPath}`);
} catch (error) {
  console.error(`❌ Templater Error: ${error.message}`);
}
%>


