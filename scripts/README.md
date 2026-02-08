# PowerShell `pkill` Command Setup

This folder contains scripts to help you easily kill development server processes on commonly used ports.

---

## 🚀 Quick Setup (Recommended)

**Option 1: Automatic Setup**

1. Open **PowerShell as Administrator**
2. Navigate to the project directory:
   ```powershell
   cd E:\Learn-Typescript\DeshGhuri
   ```
3. Run the setup script:
   ```powershell
   .\scripts\setup-pkill.ps1
   ```
4. Restart PowerShell (or reload profile):
   ```powershell
   . $PROFILE
   ```
5. **Done!** Now you can use `pkill` anywhere in PowerShell

---

## 📝 Manual Setup

If you prefer to add the function manually:

1. Open PowerShell and find your profile location:
   ```powershell
   $PROFILE
   ```
   (Usually: `C:\Users\YourName\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`)

2. Open the profile file in your favorite editor:
   ```powershell
   notepad $PROFILE
   ```

3. Copy the entire content from `scripts/pkill.ps1` and paste it into your profile

4. Save and close the file

5. Reload your profile:
   ```powershell
   . $PROFILE
   ```

---

## 🎯 Usage

Once setup is complete, simply type:

```powershell
pkill
```

**Example output:**
```
🔍 Scanning for processes on development ports...
✅ Killed node (PID: 12345) on port 3000
✅ Killed node (PID: 67890) on port 3001

🎉 Successfully killed 2 process(es)!
```

---

## 🔧 What Ports Are Checked?

The `pkill` command automatically scans and kills processes on these ports:
- **3000** - Backend server (Hono/Express)
- **3001** - Frontend server (Vite/React)
- **3002** - Alternative frontend port
- **5173** - Vite dev server default
- **8080** - Common alternative server port
- **8000** - Python/Django servers
- **4000** - Apollo/GraphQL servers
- **5000** - Flask/other servers

---

## 🛠️ Troubleshooting

### Issue: "Cannot be loaded because running scripts is disabled"

**Solution:** Enable script execution in PowerShell:

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` to confirm

### Issue: "pkill is not recognized"

**Solution:** Reload your PowerShell profile:
```powershell
. $PROFILE
```

Or restart PowerShell.

### Issue: "Access Denied" when killing a process

**Solution:** Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Try `pkill` again

---

## 📦 Files Included

- **`pkill.ps1`** - Standalone script (can be run directly)
- **`setup-pkill.ps1`** - Automatic setup script (adds to PowerShell profile)
- **`README.md`** - This file

---

## 💡 Tips

### One-Time Use (Without Installing)

If you don't want to install it permanently, you can run the standalone script:

```powershell
cd E:\Learn-Typescript\DeshGhuri
.\scripts\pkill.ps1
```

### Kill Specific Port Only

If you want to kill a specific port, you can use this one-liner:

```powershell
# Kill port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Add More Ports

To add more ports to check, edit your PowerShell profile:

1. Open profile:
   ```powershell
   notepad $PROFILE
   ```

2. Find the line:
   ```powershell
   $ports = @(3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000)
   ```

3. Add your ports:
   ```powershell
   $ports = @(3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000, 9000, 9001)
   ```

4. Save and reload profile:
   ```powershell
   . $PROFILE
   ```

---

## 🔄 Updating

To update the pkill function:

1. Run the setup script again:
   ```powershell
   .\scripts\setup-pkill.ps1
   ```

2. Choose `y` when asked to update

3. Reload profile:
   ```powershell
   . $PROFILE
   ```

---

## 🗑️ Uninstalling

To remove pkill from your PowerShell profile:

1. Open profile:
   ```powershell
   notepad $PROFILE
   ```

2. Find and delete the entire `pkill` function block:
   ```powershell
   # pkill - Kill processes on development ports
   function pkill {
       # ... (entire function)
   }
   ```

3. Save and reload:
   ```powershell
   . $PROFILE
   ```

---

## ❓ FAQ

**Q: Will this kill my database or other important services?**
A: No, it only kills processes on development ports (3000, 3001, etc.). Your database, email server, and other services on different ports are safe.

**Q: Can I use this on Mac/Linux?**
A: This is specifically for Windows PowerShell. For Mac/Linux, use:
```bash
# Create alias in ~/.bashrc or ~/.zshrc
alias pkill='lsof -ti:3000,3001,3002 | xargs kill -9'
```

**Q: Do I need to run this every time I start development?**
A: Only if you have leftover processes from a previous session. Usually, you'll only need it when:
- You closed your terminal without stopping servers
- A server crashed but the port is still occupied
- You're getting "Port already in use" errors

---

**Need Help?**

If you encounter any issues, check the Troubleshooting section or reach out for assistance!

Happy coding! 🚀
