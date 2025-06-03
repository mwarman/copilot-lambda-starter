# Requirement: Implement Continuous Integration with GitHub Actions

This document describes the requirements for implementing a Continuous Integration (CI) workflow using GitHub Actions for the AWS Lambda REST API project.

---

## Description

Create a GitHub Actions workflow to automate the testing, building, and validation of the AWS Lambda REST API project. The CI workflow should run automatically when code changes are pushed to the repository or when pull requests are created or updated. The workflow should ensure that all code meets the project's quality standards before it can be deployed to any environment.

The CI workflow should include multiple jobs that run in parallel where possible, to validate different aspects of the codebase. The workflow should check out the source code, set up the necessary runtime environment (Node.js using the .nvmrc file), install dependencies, and execute various validation steps.

The CI workflow should include steps to validate code formatting with Prettier, check code quality with ESLint, run unit tests with Vitest to ensure code functionality, and perform a CDK synthesis to validate that the infrastructure code can be properly synthesized without errors.

The workflow should provide clear feedback on any failures, including detailed error messages and logs to help developers quickly identify and fix issues. All jobs in the workflow must pass successfully for the CI process to be considered successful.

Create the workflow definition in the `.github/workflows` directory using YAML format, following GitHub Actions best practices and conventions. The workflow should be configured to run on the main branch and all feature branches, as well as on pull requests targeting the main branch.

---

## CI Workflow Requirements

The GitHub Actions workflow should include the following jobs:

1. **Lint and Format Check**:

- Verify code formatting using Prettier
- Run ESLint to check for code quality issues and potential bugs
- Fail the workflow if any formatting or linting errors are found

2. **Unit Tests**:

- Set up the Node.js environment
- Install all project dependencies
- Run all unit tests using Vitest
- Collect and report test coverage metrics
- Fail the workflow if any tests fail or if coverage falls below an acceptable threshold (80%)

3. **Infrastructure Validation**:

- Set up the Node.js environment
- Install all project dependencies
- Run CDK synthesis (`cdk synth`) to validate the infrastructure code
- Fail the workflow if the CDK synthesis produces any errors

4. **Dependency Checks** (optional):

- Check for outdated or vulnerable dependencies
- Generate a report of dependency issues
- Consider using tools like npm audit or Dependabot

The workflow should be designed to be efficient, running jobs in parallel where possible to minimize the overall execution time. Each job should provide clear, actionable feedback to developers when issues are detected.

Implement these requirements step by step, following all best practices for GitHub Actions workflows and ensuring proper configuration for this specific project.
