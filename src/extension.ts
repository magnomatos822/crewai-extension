// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "crewai-vscode-extension" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let helloWorldDisposable = vscode.commands.registerCommand('crewai-vscode-extension.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from CrewAI VSCode Extension!');
    });
    context.subscriptions.push(helloWorldDisposable);

    let createProjectDisposable = vscode.commands.registerCommand('crewai-vscode-extension.createProject', async () => {
        // 1. Get project type
        const projectType = await vscode.window.showQuickPick(['crew', 'flow'], {
            placeHolder: 'Select the type of CrewAI project to create (crew or flow)',
            title: 'Create New CrewAI Project: Select Type'
        });

        if (!projectType) {
            vscode.window.showInformationMessage('Project creation cancelled: No project type selected.');
            return;
        }

        // 2. Get project name
        const projectName = await vscode.window.showInputBox({
            prompt: `Enter the name for your new ${projectType} project`,
            placeHolder: 'e.g., my-awesome-crew',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Project name cannot be empty.';
                }
                if (/\s/.test(value)) {
                    return 'Project name cannot contain spaces.';
                }
                // Add more validation if needed (e.g., for special characters)
                return null;
            },
            title: 'Create New CrewAI Project: Enter Name'
        });

        if (!projectName) {
            vscode.window.showInformationMessage('Project creation cancelled: No project name provided.');
            return;
        }

        // 3. Get parent directory
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: 'Select Parent Directory for Project',
            canSelectFiles: false,
            canSelectFolders: true,
            title: 'Create New CrewAI Project: Select Parent Directory'
        };

        const parentDirectoryUri = await vscode.window.showOpenDialog(options);
        if (!parentDirectoryUri || parentDirectoryUri.length === 0) {
            vscode.window.showInformationMessage('Project creation cancelled: No parent directory selected.');
            return;
        }

        const parentDirectoryPath = parentDirectoryUri[0].fsPath;

        // 4. Construct and execute the command
        const commandToExecute = `crewai create ${projectType} ${projectName}`;
        
        // Use a descriptive name for the terminal
        const terminalName = `CrewAI Create: ${projectName}`;
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal({ 
                name: terminalName,
                cwd: parentDirectoryPath // Execute in the selected parent directory
            });
        }
        
        terminal.show();
        terminal.sendText(commandToExecute);

        vscode.window.showInformationMessage(`Attempting to create ${projectType} project '${projectName}' in ${parentDirectoryPath}.\nExecuting: ${commandToExecute}`);
    });

    context.subscriptions.push(createProjectDisposable);

    let runCrewFileDisposable = vscode.commands.registerCommand('crewai-vscode-extension.runCrewFile', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active editor found. Please open a CrewAI Python file.');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'python') {
            vscode.window.showErrorMessage('The active file is not a Python file. Please select a Python file to run.');
            return;
        }

        if (document.isUntitled) {
            vscode.window.showErrorMessage('Please save the file before running it as a CrewAI project.');
            return;
        }
        
        const filePath = document.uri.fsPath;
        const path = require('path'); // Node.js path module
        const projectDirectory = path.dirname(filePath);

        const commandToExecute = `crewai run`; // The command is simply 'crewai run' executed in the project directory
        
        const terminalName = "CrewAI Run";
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal || terminal.exitStatus !== undefined) { // If terminal doesn't exist or has exited
            terminal = vscode.window.createTerminal({ 
                name: terminalName,
                cwd: projectDirectory // Set the current working directory for the terminal
            });
        }
        
        terminal.show();
        // Clear previous command output (optional, but can be nice)
        // terminal.sendText('clear'); // or 'cls' on Windows, consider platform check or omit
        terminal.sendText(commandToExecute);

        vscode.window.showInformationMessage(`Attempting to run CrewAI project in: ${projectDirectory}`);
    });

    context.subscriptions.push(runCrewFileDisposable);

    let chatWithCrewDisposable = vscode.commands.registerCommand('crewai-vscode-extension.chatWithCrew', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active editor found. Please open a CrewAI Python file.');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'python') {
            vscode.window.showErrorMessage('The active file is not a Python file. Please select a Python file to chat with.');
            return;
        }

        if (document.isUntitled) {
            vscode.window.showErrorMessage('Please save the file before attempting to chat with it as a CrewAI project.');
            return;
        }
        
        const filePath = document.uri.fsPath;
        const path = require('path'); // Node.js path module
        const projectDirectory = path.dirname(filePath);

        // Command is `crewai chat`, executed in the project directory
        const commandToExecute = `crewai chat`; 
        
        const terminalName = "CrewAI Chat";
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal || terminal.exitStatus !== undefined) { // If terminal doesn't exist or has exited
            terminal = vscode.window.createTerminal({ 
                name: terminalName,
                cwd: projectDirectory // Set the current working directory for the terminal
            });
        }
        
        terminal.show();
        terminal.sendText(commandToExecute);

        vscode.window.showInformationMessage(
            `Attempting to start chat session for CrewAI project in: ${projectDirectory}. ` +
            `Ensure 'chat_llm' is configured in your crew definition.`
        );
    });

    context.subscriptions.push(chatWithCrewDisposable);

    let viewTaskLogsDisposable = vscode.commands.registerCommand('crewai-vscode-extension.viewTaskLogs', () => {
        const activeEditor = vscode.window.activeTextEditor;
        let projectDirectory: string | undefined;

        if (activeEditor && activeEditor.document.languageId === 'python' && !activeEditor.document.isUntitled) {
            const filePath = activeEditor.document.uri.fsPath;
            const path = require('path');
            projectDirectory = path.dirname(filePath);
        } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            // Fallback to the first workspace folder if no suitable active editor
            projectDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;
        } else {
            vscode.window.showErrorMessage('Cannot determine CrewAI project directory. Please open a file within a CrewAI project or open a workspace.');
            return;
        }
        
        const commandToExecute = `crewai log-tasks-outputs`; 
        
        const terminalName = "CrewAI Task Logs";
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal || terminal.exitStatus !== undefined) { 
            terminal = vscode.window.createTerminal({ 
                name: terminalName,
                cwd: projectDirectory 
            });
        }
        
        terminal.show();
        terminal.sendText(commandToExecute);

        vscode.window.showInformationMessage(`Attempting to view task logs for CrewAI project in: ${projectDirectory}.`);
    });

    context.subscriptions.push(viewTaskLogsDisposable);

    let runTestsDisposable = vscode.commands.registerCommand('crewai-vscode-extension.runTests', () => {
        const activeEditor = vscode.window.activeTextEditor;
        let projectDirectory: string | undefined;

        if (activeEditor && activeEditor.document.languageId === 'python' && !activeEditor.document.isUntitled) {
            const filePath = activeEditor.document.uri.fsPath;
            const path = require('path');
            projectDirectory = path.dirname(filePath);
        } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            projectDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;
        } else {
            vscode.window.showErrorMessage('Cannot determine CrewAI project directory. Please open a file within a CrewAI project or open a workspace.');
            return;
        }
        
        const commandToExecute = `crewai test`; 
        
        const terminalName = "CrewAI Tests";
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal || terminal.exitStatus !== undefined) { 
            terminal = vscode.window.createTerminal({ 
                name: terminalName,
                cwd: projectDirectory 
            });
        }
        
        terminal.show();
        terminal.sendText(commandToExecute);

        vscode.window.showInformationMessage(`Attempting to run tests for CrewAI project in: ${projectDirectory}.`);
    });

    context.subscriptions.push(runTestsDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
