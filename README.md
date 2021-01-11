# IOC Submission Integration Development Template

## Steps for How to Use this Repo
1. Create your `___-ioc-submission` repo on GitHub
2. Clone your repo and copy over the files from this template repo to your newly recreated repo and use the template as your initial commit to master.
>_NOTE:_ Make sure not to accidentally copy over the .git file from this repo
3. Run this in the terminal: 
```
  git checkout -b develop && git push --set-upstream origin develop && 
  git checkout -b initial-release && git push --set-upstream origin initial-release
```
4. Do a global search for `___` and repace every `___` you can find in the app with the _App Specific Data_ 
5. Do a global search for `TODO` and Do each of the steps Deleting the comments as you go.  In general, it might be good to go in the order of:
   1. Add user options and option validation needed for making requests in your app's api.
   2. Implement authentication in `createRequestWithDefaults` if possible/needed
   3. Implement feneric `_getFoundEntities` query and data transformations in `getLookupResults.js` to both find results and get the found results link working correctly
   4. Implement `createItems` request without any submission options if possible and data transformations needed for creating the link in `submitItems.js`, commenting out the `createTags` function implementation in the `submitItems` function for now
   5. Implement the request in `deleteItem.js`
   6. Add non-tag submission options and hook them up to `createItems.js`
   7. Implement tag search, styling, and creation
6. Delete This File and Rename your `_README.md` file to `README.md`