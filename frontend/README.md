# NoteRoom Development, Next Steps

### <u>Folder Structure</u>
Currently, all the React codes (converted from EJS) are placed inside the `frontend/` folder.

All the components and boilerplate code are placed inside the `frontend/src` folder. At our current stage, there is no need to modify the **config files** unless we have specific reasons. If you modify them, let the team members know to prepare their environment according to the modifications.

#### Core File Structure
- **src/pages**: This folder contains a subfolder for each page in the platform. Each subfolder contains components for that page. If we want to create a new page in our platform, we must create another folder as our first step of development. The name has to be specific and apparent.

- **src/partials**: This folder contains shared components. Shared components are used in more than one place across the platform. For example, the side panel components.

- **src/types** : This folder contains globally used types.

- **src/utils** : This folder contains all the files which are not directly related to the core functionality and state management. Rather they will contain utility functions. For example, api calls.

- **src/public** : This folder contains all the publicly available assets. For example, static images, style sheets.

These are the core folders. But we will create more folders and files for specific purposes and to isolate and consolidate the logics. For example, all the **contexts** can be placed inside a specific folder for better context managements.

#### Component File Naming
Use typescript (`.tsx`/`.ts`) first of all.
****
For components, give a suitable name that aligns with the component's funcionality. And make an root component that will contain all the separate components of that page. Give that a name which directly reflects the page's behaviour. For example, for dashboard, **DashBoard.tsx** contains all the visible components (**QuickPost Container** and **FeedSection**. By just looking at dashbord, you can tell it has these 2 components). Those components can have components, but keep a clear intention when consolidating them. And make an `index.ts` which will consolidate the root components, reducers, contenxts or other functions or states and export them from there.

#### Component Strcuture
For seamless flow, create a base component which will contain all the components of that page and consolidate them. For example, in dashboard, there is a base component called `DashBoard.tsx` which contains the main components of that page. In this way we can directly use that base component in our router. 

### <u>Development Environment Setup</u>
Now we have 2 servers. One is our api server (node) and other one is React development server provided by vite. We have to make sure both servers are running without errors to start development.
- **Running API Server**: The api server is in the noteroom's root directory. You can run that as you did before via `npm start`
- **Running Vite Development Server**: The vite server is in the `frontend/` directory. So you have to change the directory first via `cd frontend` and then start the server `npm run dev`. The server will run on [localhost:5173](http://localhost:5173). You can access the React app from there.


### <u>Git Workflow</u>
All the React codes will be pushed in `test/react` branch (until we change the name when we will be doing full time React development). No other changes except pure React code changes will be accepted. Also all the changes must be merged in `test/react` before pushing to remote via `git merge <feature-branch>` 

#### Branching
- `react/<page-name>`: When we will be developing a specific page, a branch from `test/react` must be created via `git checkout -b <branch-name>`. For example, `react/settings`. And make sure to only commit the changes related to React.
- `<feature-name>` : When developing a new feature or optimizing an existing one for a specific page, a feature branch has to be created from that page's branch. For example `comment-section` from `react/post-view`. For this, make sure to update the branch with the latest changes first via `git pull origin test/react` (as the `test/react` will always contain the latest updates)

Don't push any feature branch to the remote unless you are confused about its stability. Always make sure to merge the feature branch to `test/react` first and then push. If you are not sure about its stability and efficiency, push the feature-branch and let an experienced developer review that. (Best for who are starting with React)

### <u>Development Strategies</u>
React development can be overwhelming for 2 reasons. Either you can't understand the "React-way thinking" or you have thousands of solutions for a specific problem. I recommend you not to implement a logic or a feature directly in the development. Rather test that in an online editor which gives pre-made React envionment for testing logics or building prototypes. The one I use is [CodeSandBox](https://codesandbox.io). Create a React sandbox and test the prototype of your implementation there using hardcoded templates. Also if you use sandbox and face any problems with your solution, you can share that with the team and they can give reviews. This is one of the coolest way of collaboration rather than sharing code-files or committing changes in git with comments. (Btw CodeSandBox isn't a sponsor🫥)


***In this AI-Dominated world, I chose to write all the things by my own🙎‍♂️***
