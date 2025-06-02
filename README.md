# AWS Lambda Starter Kit with GitHub Copilot

A starter kit for creating AWS Lambda microservices with GitHub Copilot for AI assisted pair programming.

## Getting started

Begin by reviewing and updating the [Copilot Instructions](.github/copilot-instructions.md) to suit the needs and preferences for your project.

Interact with Copilot using your favorite editor to create your application. We strongly recommend [VS Code][vscode] with the following extensions:

- GitHub Copilot
- GitHub Copilot Chat
- Prettier - Code formatter
- ESLint
- Vitest
- indent-rainbow

## Additional reading

The [official guide for GitHub Copilot in VS Code][vscode-copilot-docs] provides a lot of information and is very useful for those who are just starting to use Copilot in VS Code.

The VS Code YouTube channel has a playlist with many interesting videos and tutorials for [GitHub Copilot in VS Code](https://youtube.com/playlist?list=PLj6YeMhvp2S7rQaCLRrMnzRdkNdKnMVwg&si=KIRHyFKYyMcUssQ3).

This official [tips and tricks guide](https://code.visualstudio.com/docs/copilot/copilot-tips-and-tricks) from VS Code provides an excellent summary of Copilot best practices.

## Project structure

The project structure follows the best practices for Copilot assistance. This project is ready to begin iterative development with a Copilot AI agent.

Note that the application component does not exist, not yet anyway. This base project structure is primed for building an AWS Lambda component from the very beginning using Copilot agent mode with you in the driver's seat.

```
/.github
  copilot-instructions.md   # Copilot instructions

/docs
  /requirements
    01-create-task.md       # Requirements specification

.editorconfig               # Editor configuration
.prettierrc                 # Prettier configuration
.gitignore                  # Git ignore
LICENSE                     # Software license
README.md                   # This document
```

## How to use

### Update the instructions

Add a section to the [Copilot Instructions](./.github/copilot-instructions.md) document immediately following the **Role** section. Provide an overview of the project like this:

```md
---

## Project Overview

- **Component:** Task Service **task-service**
- **Description:** This service provides a REST API for managing tasks, including creating, retrieving, updating, and deleting tasks. It uses AWS Lambda functions triggered by API Gateway events, with business logic encapsulated in service classes. The project follows best practices for TypeScript development, AWS CDK infrastructure management, and unit testing with Vitest.

---
```

Want to learn more about Copilot instructions files? Read more in the [official guide...](https://code.visualstudio.com/docs/copilot/copilot-tips-and-tricks#_personalize-copilot-with-instructions-files)

### Work with the Copilot agent

Begin working with Copilot to create the application. Copilot works best when it has a rich context to use as reference material when updating the project. When you first begin, there is no source code for Copilot to reference. Working with Copilot to implement the first story may seem tedious for this reason. However, I find it best to let Copilot implement the first story to the best of the agent's ability. Then, review all of the generated source members. Make changes to the source to match your coding preference. Don't like to use `class`? Change it. Prefer `default` exports? Use those.

When you implement the second and subsequent stories, Copilot will use the existing code as a reference and pattern the code that the agent creates to match.

#### Requirements

The requirements are located in the [`docs/requirements`](docs/requirements/) directory. Open Copilot chat in VS Code and place it into **Ask** mode if it is not already.

#### Ask Copilot

Drag the [01-create-task.md](docs/requirements/01-create-task.md) requirements specification into the Copilot chat. Any files you explictly drag onto the Copilot chat will be included in the context of the current session. Enter the following prompt:

```
let's update the project with these requirements.
```

or you can use the `#file` command to explicitly reference the requirements like this:

```
let's update the project with the requirements in #file:01-create-task.md
```

Since Copilot is in **Ask** mode, it will not make any changes to the project. Instead it will tell you what the agent _would_ do if it were in **Agent** mode. Ask mode allows you to ask Copilot questions or, in this instance, allows you to get a preview of a more complex set of changes.

If you do not like the apporoach that Copilot proposes, update the requirements specification to be more specific. Remember that Copilot will improve as the code base grows.

#### Agent mode

Change Copilot from **Ask** to **Agent** mode. In **Agent** mode, Copilot is free to make changes to your project. Don't worry though, you may pause or cancel the Copilot session at any time. Any changes made by Copilot are not fully applied until you choose to **Keep** them, or you may revert the project by choosing to **Undo** the changes.

When you are ready, submit the prompt in **Agent** mode and the Copilot agent will update the VS Code project with the changes.

#### One story at a time

Copilot often works best when asked to implement small units of work. For that reason, work on 1 story at a time. When Copilot has finished, you play the role of the code reviewer (you are the expert after all). Review and update the code as needed (or ask Copilot to make a change). Run the unit tests. Run the linter. Deploy and test the changes. Finally, create a PR and commit the work.

Then, move to the next story and repeat.

[vscode]: https://code.visualstudio.com/ 'Visual Studio Code'
[vscode-copilot-docs]: https://code.visualstudio.com/docs/copilot/overview 'GitHub Copilot in VS Code'
