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
