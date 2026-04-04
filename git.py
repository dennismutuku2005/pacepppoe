import subprocess
import os

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"Executed: {command}")
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing {command}: {e.stderr}")
        return False

def git_sync():
    # Get modified and untracked files
    status_proc = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    lines = status_proc.stdout.splitlines()
    
    if not lines:
        print("No changes to sync.")
        return

    files_to_sync = []
    for line in lines:
        # Status is first 2 chars, then space, then filename
        # ' M file' or '?? file'
        filename = line[3:].strip()
        # Handle cases where git output might have quotes (spaces in filename)
        if filename.startswith('"') and filename.endswith('"'):
            filename = filename[1:-1]
        files_to_sync.append(filename)

    print(f"Found {len(files_to_sync)} files to sync.")

    for file_path in files_to_sync:
        print(f"\n--- Syncing: {file_path} ---")
        
        # 1. Add the file
        if not run_command(f'git add "{file_path}"'):
            continue
            
        # 2. Determine Step/Type for conventional commits
        status_proc = subprocess.run(["git", "status", "--porcelain", file_path], capture_output=True, text=True)
        status_output = status_proc.stdout.strip()
        status_code = status_output[:2].strip() if status_output else "M"
        
        filename = os.path.basename(file_path)
        
        if status_code == "??" or status_code == "A":
            prefix = "feature"
            description = f"added {filename}"
        elif status_code == "D":
            prefix = "fix"
            description = f"removed {filename}"
        else:
            # Default to update, use fix for maintenance keywords
            prefix = "update"
            if any(k in filename.lower() for k in ["fix", "bug", "err", "remove", "clean"]):
                prefix = "fix"
            description = f"refined {filename} functionality"

        commit_message = f"{prefix}: {description}"
        
        # 3. Commit the file
        if not run_command(f'git commit -m "{commit_message}"'):
            pass
            
        # 3. Push the file
        # Note: git push usually pushes all local commits for the branch
        # But if we want to ensure it goes up after each commit:
        run_command("git push")

if __name__ == "__main__":
    git_sync()
