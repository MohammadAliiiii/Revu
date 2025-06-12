# Revu - A Minimal Git-like Version Control System

Revu is a simple, custom-built version control system inspired by Git. It helps you **track file changes**, **commit snapshots**, and **view diffs**, using the command line. Ideal for learning how Git works under the hood.

---


> Features:

- ✅ Initialize a `.revu` repository  
- ✅ Add files to staging area  
- ✅ Commit staged files  
- ✅ View commit history  
- ✅ View differences between commits (diff)

---

## 🚀 Getting Started

### 1. 📦 Installation

Ensure you have **Node.js** installed (`v20.x` or later).

```bash
git clone https://github.com/your-username/revu.git
cd revu
chmod +x Revu.mjs
````

---

### 2. 🔌 Setup

To use `./Revu.mjs` like a global CLI:

```bash
sudo ln -s $(pwd)/Revu.mjs /usr/local/bin/revu
```

Now you can run `revu` from anywhere.

---

## 🛠️ Usage

### ✅ `init`

Initializes a new `.revu` repository in the current directory.

```bash
revu init
```

---

### ➕ `add <filename>`

Adds a file to the staging area.

```bash
revu add sample.txt
```

---

### 💾 `commit <message>`

Commits all staged files with a message.

```bash
revu commit "Initial commit"
```

---

### 📜 `log`

Shows the history of all commits.

```bash
revu log
```

---

### 🧾 `show <commitHash>`

Shows the differences (diff) of files between this and previous commit.

```bash
revu show <commit-hash>
```

---

## 📁 File Structure

| Folder/File      | Description                            |
| ---------------- | -------------------------------------- |
| `.revu/`         | Stores objects and metadata            |
| `.revu/HEAD`     | Points to the latest commit            |
| `.revu/index`    | Holds the staging area data            |
| `.revu/objects/` | Stores file blobs and commit snapshots |

---

## ⚠️ Limitations

* No branch support
* Works only on files (not directories)
* Commits are snapshot-based
* No remote or push/pull functionality

---

## 💡 Learning Purpose

This tool is built to **learn Git's internal structure**. It is **not a replacement** for Git but a hands-on way to understand how it works.

---

## 👨‍💻 Author

* **Your Name**
* GitHub: [@MohammadAliiiii](https://github.com/MohammadAliiiii)

---

Let me know if you'd like any adjustments!
