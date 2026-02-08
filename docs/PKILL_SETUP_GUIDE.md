# 🚀 Quick Guide: Setup `pkill` Command

Never manually kill ports again! This guide will help you set up a convenient `pkill` command in PowerShell.

---

## ✨ What is `pkill`?

`pkill` is a custom PowerShell command that instantly kills all development server processes on commonly used ports (3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000).

**Before `pkill`:**
```powershell
netstat -ano | findstr :3000
taskkill /PID 12345 /F
netstat -ano | findstr :3001
taskkill /PID 67890 /F
# ... repeat for each port 😫
```

**After `pkill`:**
```powershell
pkill
# ✅ Done! All ports killed in one command 🎉
```

---

## 🎯 3 Ways to Use It

### Option 1: Install Permanently (Recommended) ⭐

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   cd E:\Learn-Typescript\DeshGhuri
   .\scripts\setup-pkill.ps1
   ```
3. Restart PowerShell or run:
   ```powershell
   . $PROFILE
   ```
4. Now `pkill` works anywhere in PowerShell!

### Option 2: Double-Click Method (No Installation)

1. Go to `E:\Learn-Typescript\DeshGhuri\scripts\`
2. Double-click `pkill.bat`
3. **Done!** Ports are killed

### Option 3: Run Directly (One-Time Use)

```powershell
cd E:\Learn-Typescript\DeshGhuri
.\scripts\pkill.ps1
```

---

## 📋 What You'll See

```
🔍 Scanning for processes on development ports...
✅ Killed node (PID: 12345) on port 3000
✅ Killed node (PID: 67890) on port 3001

🎉 Successfully killed 2 process(es)!
```

If no processes are found:
```
🔍 Scanning for processes on development ports...
✨ No processes found on development ports. All clear!
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Running scripts is disabled"

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "pkill not recognized"

**Solution:**
```powershell
# Reload PowerShell profile
. $PROFILE
```

Or restart PowerShell.

### Issue: "Access Denied"

**Solution:**
Run PowerShell as Administrator (Right-click → Run as Administrator)

---

## 🔧 Customization

Want to add more ports? Edit your PowerShell profile:

```powershell
# Open profile
notepad $PROFILE

# Find this line:
$ports = @(3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000)

# Add your ports:
$ports = @(3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000, 9000, 9001)

# Save and reload
. $PROFILE
```

---

## 📚 More Info

See `scripts/README.md` for:
- Detailed documentation
- Manual setup instructions
- Troubleshooting guide
- How to uninstall

---

## ✅ Current Status

**Ports Cleared:**
- ✅ Port 3000 (backend)
- ✅ Port 3001 (frontend)

All ports are currently free and ready for development!

---

Happy coding! 🚀
