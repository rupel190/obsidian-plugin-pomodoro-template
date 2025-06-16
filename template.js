<%*
try {
  console.log("Logging Pomodoro...");

  // Output file
  const pathParts = log.task.path.split("/");
  console.log(pathParts);
  //const parentFolder = pathParts.length >= 2 ? pathParts[pathParts.length - 1] : "General";
  //const outputPath = `Work/Pomodoros/${parentFolder}.md`;

  // Remove original filename for good
  const ogFilename = pathParts.pop();
  // Save to same folderx with "🍅-folderx" as filename
  const outputFilename = `🍅-${pathParts[pathParts.length - 1]}.md`
  const outputPath = pathParts.join("/") + `/${outputFilename}`;
  // console.log("OutputPath: ", outputPath);

  // DataView
  const formatTime = (date) => date ? date.toISOString() : "Unknown"; // format time to ISO
  const dwMode = `(pomodoro::${log.mode})`;
  const dwBegin = `(begin::${formatTime(log.begin)})`;
  // const dwEnd = `(end::${formatTime(log.end)})`; // Currently unused because begin + duration is more consistent when manually fixing pomo logs
  const dwDuration = `(duration::${log.duration})`;
  const dwFullPath = `(path::${log.task.path})`;
  const dwTaskName = `(taskname::${log.task.name})`;
  const dwComment = `(comment::${log.comment})`;
  const dwBlocklink = `(blocklink::${(log.task.blockLink).trim()})`;
  // const dwFilename = `(filename::${ogFilename})`;

  // Construct log entry while retaining DataView variables
  const link = `[[${log.task.path}#${log.task.blockLink.trim()}|${log.task.name}]]`;
  let icon = log.mode === "WORK" ? (log.finished ? "🍅" : "🟡") : "☕️";
  let logEntry = `${icon} ${dwMode} ${dwDuration} min   | ${dwBegin.trim()}\n${dwComment}\n${link}\n\n(${dwFullPath}${dwBlocklink}\n${dwTaskName})\n\n---\n`;

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


