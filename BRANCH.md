# Team Branch
git checkout team  #Switch to team branch

# Make changes to your code (Write and Test)

git add .                                     # Stage all changes
git commit -m "Your commit message"           # Commit changes
git push origin team                          # Push to GitHub


# Develop Branch

git checkout develop           # Switch to develop branch
git pull origin develop        # Get the latest changes
git merge team                 # Merge team branch into develop 
git push origin develop        # Push changes to GitHub
