#!/usr/bin/env node

import path from "path";
import fs from "fs/promises";
import { json } from "stream/consumers";
import crypto from "crypto";
import { diffLines } from "diff";
import chalk from "chalk";
import { Command } from "commander";
chalk.level = 3;

const program = new Command();

class Revu {
  constructor(repoPath = ".") {
    this.repoPath = path.join(repoPath, ".revu");
    this.objectsPath = path.join(this.repoPath, "objects");
    this.headPath = path.join(this.repoPath, "HEAD");
    this.indexPath = path.join(this.repoPath, "index");
    this.init();
  }
  async init() {
    await fs.mkdir(this.objectsPath, { recursive: true });
    try {
      await fs.writeFile(this.headPath, "", { flag: "wx" });
      await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: "wx" });
    } catch (error) {
      console.log("Already initialized the .revu folder");
    }
  }
  hashObject(content) {
    return crypto.createHash("sha1").update(content, "utf-8").digest("hex");
  }
  async add(fileToBeAdded) {
    const fileData = await fs.readFile(fileToBeAdded, { encoding: "utf-8" });
    const fileHash = this.hashObject(fileData);
    console.log(fileHash);
    const newFileHashedObjectPath = path.join(this.objectsPath, fileHash);
    await fs.writeFile(newFileHashedObjectPath, fileData);
    await this.updateStagingArea(newFileHashedObjectPath, fileHash);
    console.log(`Added ${fileToBeAdded}`);
  }
  async updateStagingArea(filePath, fileHash) {
    const index = JSON.parse(
      await fs.readFile(this.indexPath, { encoding: "utf-8" })
    );
    index.push({ path: filePath, hash: fileHash });
    await fs.writeFile(this.indexPath, JSON.stringify(index));
  }
  async commit(message) {
    const index = JSON.parse(
      await fs.readFile(this.indexPath, { encoding: "utf-8" })
    );
    const parentCommit = await this.getCurrentHead();

    const commitData = {
      timeStamp: new Date().toISOString(),
      message,
      files: index,
      parent: parentCommit,
    };

    const commitHash = this.hashObject(JSON.stringify(commitData));
    const commitPath = path.join(this.objectsPath, commitHash);
    await fs.writeFile(commitPath, JSON.stringify(commitData));
    await fs.writeFile(this.headPath, commitHash);
    await fs.writeFile(this.indexPath, JSON.stringify([]));
    console.log(`Commit Successfully created: ${commitHash}`);
  }
  async getCurrentHead() {
    try {
      return await fs.readFile(this.headPath, { encoding: "utf-8" });
    } catch (error) {
      return null;
    }
  }
  async log() {
    let currentCommitHash = await this.getCurrentHead();
    while (currentCommitHash) {
      const commitData = JSON.parse(
        await fs.readFile(path.join(this.objectsPath, currentCommitHash), {
          encoding: "utf-8",
        })
      );
      console.log(
        `__________________________________________________________________________`
      );
      console.log(
        `Commit: ${currentCommitHash}\nDate: ${commitData.timeStamp}\n\n${commitData.message}\n\n`
      );
      currentCommitHash = commitData.parent;
    }
  }
  async showCommitDiff(commitHash) {
    const commitDataRaw = await this.getCommitData(commitHash);
    let commitData;
    try {
      commitData = JSON.parse(commitDataRaw);
    } catch (err) {
      console.error(
        "❌ Error: The provided hash is not a valid commit object."
      );
      return;
    }

    console.log(`Changes in the last commit are:`);

    for (const file of commitData.files) {
      console.log(`File: ${file.path}`);

      // ❗ Don't use JSON.parse on plain text files
      const fileContent = await this.getFileContent(file.hash);
      console.log(fileContent);

      if (commitData.parent) {
        const parentCommitDataRaw = await this.getCommitData(commitData.parent);
        const parentCommitData = JSON.parse(parentCommitDataRaw);

        const parentFileContent = await this.getParentFileContent(
          parentCommitData,
          file.path
        );

        if (parentFileContent !== undefined) {
          console.log(`\ndiff:`);
          const diff = diffLines(parentFileContent, fileContent);
          diff.forEach((part) => {
            if (part.added) {
              process.stdout.write(chalk.green("++" + part.value));
            } else if (part.removed) {
              process.stdout.write(chalk.red("--" + part.value));
            } else {
              process.stdout.write(chalk.grey(part.value));
            }
          });
          console.log();
        } else {
          console.log(`New file in this commit`);
        }
      } else {
        console.log(`First Commit`);
      }
    }
  }

  async getParentFileContent(parentCommitData, filePath) {
    const parentFile = parentCommitData.files.find(
      (file) => file.path === filePath
    );
    if (parentFile) {
      return await this.getFileContent(parentFile.hash);
    }
  }
  async getCommitData(commitHash) {
    const commitPath = path.join(this.objectsPath, commitHash);

    try {
      return await fs.readFile(commitPath, { encoding: "utf-8" });
    } catch (error) {
      console.log(`Failed to read the commit data`, error);
    }
  }
  async getFileContent(fileHash) {
    const objectPath = path.join(this.objectsPath, fileHash);
    return fs.readFile(objectPath, { encoding: "utf-8" });
  }
}
// (async () => {
//   const revu = new Revu();
//   // await revu.add("sample.txt");
//   // await revu.add("gandu.txt");
//   // await revu.commit("Added two new files");
//   // await revu.log();
//   await revu.showCommitDiff("7295d64d8fa482ab551708b6e6ff83dc5cfb1446");
// })();

program.command("init").action(async () => {
  const revu = new Revu();
});

program.command("add <file>").action(async (file) => {
  const revu = new Revu();
  await revu.add(file);
});

program.command("commit <message>").action(async (message) => {
  const revu = new Revu();
  await revu.commit(message);
});

program.command("log").action(async (log) => {
  const revu = new Revu();
  await revu.log();
});

program.command("show <commitHash>").action(async (commitHash) => {
  const revu = new Revu();
  await revu.showCommitDiff(commitHash);
});
program.parse(process.argv);