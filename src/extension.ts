import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to check if crewai is installed
function checkCrewaiInstallation(): Promise<boolean> {
    return new Promise((resolve) => {
        cp.exec('crewai --version', (error) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}


async function createCrewAIProject(type: 'crew' | 'flow', context: vscode.ExtensionContext) {
    const isCrewaiInstalled = await checkCrewaiInstallation();
    if (!isCrewaiInstalled) {
        vscode.window.showErrorMessage(
            'CrewAI CLI is not installed. Please install it by running: pip install crewai'
        );
        return;
    }

    const name = await vscode.window.showInputBox({
        prompt: `Enter the name for your new ${type}`,
        placeHolder: `${type === 'crew' ? 'my-crew-project' : 'my-flow-project'}`,
        validateInput: (value: string) => {
            if (!value || value.trim().length === 0) {
                return 'Name cannot be empty.';
            }
            if (value.includes(' ')) {
                return 'Name cannot contain spaces.';
            }
            return null;
        }
    });

    if (name && name.trim().length > 0) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        let projectPath: string | undefined;

        if (workspaceFolders && workspaceFolders.length > 0) {
            // If a folder is open, create the project inside it
             projectPath = workspaceFolders[0].uri.fsPath;
        } else {
            // If no folder is open, prompt user to select a parent directory
            const parentDirUri = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: `Select Parent Directory for ${name}`
            });

            if (parentDirUri && parentDirUri.length > 0) {
                projectPath = parentDirUri[0].fsPath;
            } else {
                vscode.window.showWarningMessage('Project creation cancelled: No parent directory selected.');
                return;
            }
        }
        
        // The crewai CLI creates a directory with the project name.
        // So, we execute the command in the parent directory (projectPath).
        const command = `crewai create ${type} ${name.trim()}`;

        vscode.window.showInformationMessage(`Creating ${type} '${name}'... Command: ${command} in ${projectPath}`);

        cp.exec(command, { cwd: projectPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating ${type}: ${error.message}`);
                console.error(`stderr: ${stderr}`);
                vscode.window.showErrorMessage(
                    `Failed to create ${type} '${name}'. Error: ${error.message}. Check the terminal for more details (View > Output > Log (Extension Host)).`
                );
                // You can also show stderr in an output channel
                const outputChannel = vscode.window.createOutputChannel("CrewAI CLI");
                outputChannel.appendLine(`Error executing: ${command}`);
                outputChannel.appendLine(`CWD: ${projectPath}`);
                outputChannel.appendLine(`stdout: ${stdout}`);
                outputChannel.appendLine(`stderr: ${stderr}`);
                outputChannel.show();

            } else {
                vscode.window.showInformationMessage(
                    `${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' created successfully at ${path.join(projectPath, name)}.`
                );
                // Optionally, open the newly created project folder
                const newProjectPath = path.join(projectPath, name);
                if (fs.existsSync(newProjectPath)) {
                    const uri = vscode.Uri.file(newProjectPath);
                    vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: workspaceFolders && workspaceFolders.length > 0 });
                }
            }
        });
    } else if (name !== undefined) { // User pressed Esc or provided empty/invalid name after initial prompt
        vscode.window.showWarningMessage('Project creation cancelled: No name provided or input was invalid.');
    }
    // If name is undefined, it means the user cancelled the input box, so no message is needed.
}


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "crewai-vscode-extension" is now active!');

    let helloWorldDisposable = vscode.commands.registerCommand('crewai-vscode-extension.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from CrewAI VSCode Extension!');
    });
    context.subscriptions.push(helloWorldDisposable);

    let createCrewDisposable = vscode.commands.registerCommand('crewai-vscode-extension.createCrew', async () => {
        await createCrewAIProject('crew', context);
    });
    context.subscriptions.push(createCrewDisposable);

    let createFlowDisposable = vscode.commands.registerCommand('crewai-vscode-extension.createFlow', async () => {
        await createCrewAIProject('flow', context);
    });
    context.subscriptions.push(createFlowDisposable);

    let runCrewOrFlowDisposable = vscode.commands.registerCommand('crewai-vscode-extension.runCrewOrFlow', async () => {
        const isCrewaiInstalled = await checkCrewaiInstallation();
        if (!isCrewaiInstalled) {
            vscode.window.showErrorMessage(
                'CrewAI CLI is not installed. Please install it by running: pip install crewai'
            );
            return;
        }

        let targetFilePath: string | undefined;
        const activeEditor = vscode.window.activeTextEditor;

        if (activeEditor && activeEditor.document.languageId === 'python') {
            targetFilePath = activeEditor.document.uri.fsPath;
            const proceed = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Run the currently active file: ${path.basename(targetFilePath)}?`
            });
            if (proceed !== 'Yes') {
                targetFilePath = undefined; // Clear if user says No, to proceed to file selection
            }
        }

        if (!targetFilePath) {
            const fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: 'Select Crew/Flow Python File to Run',
                filters: {
                    'Python files': ['py']
                }
            });

            if (fileUri && fileUri.length > 0) {
                targetFilePath = fileUri[0].fsPath;
            } else {
                vscode.window.showInformationMessage('No file selected. Crew/Flow execution cancelled.');
                return;
            }
        }

        if (targetFilePath) {
            // Ensure the file path is quoted to handle spaces or special characters
            const command = `crewai run "${targetFilePath}"`;
            
            let terminal = vscode.window.terminals.find(t => t.name === "CrewAI Run");
            if (!terminal) {
                terminal = vscode.window.createTerminal("CrewAI Run");
            }
            
            terminal.sendText(command);
            terminal.show();
            vscode.window.showInformationMessage(`Attempting to run: ${path.basename(targetFilePath)} in the terminal.`);
        }
    });
    context.subscriptions.push(runCrewOrFlowDisposable);

    let chatWithCrewOrFlowDisposable = vscode.commands.registerCommand('crewai-vscode-extension.chatWithCrewOrFlow', async () => {
        const isCrewaiInstalled = await checkCrewaiInstallation();
        if (!isCrewaiInstalled) {
            vscode.window.showErrorMessage(
                'CrewAI CLI is not installed. Please install it by running: pip install crewai'
            );
            return;
        }

        let projectDir: string | undefined;
        const activeEditor = vscode.window.activeTextEditor;

        if (activeEditor) {
            const activeFileDir = path.dirname(activeEditor.document.uri.fsPath);
            // Heuristic: Check if common crew files exist in this directory or a parent
            // This could be improved by looking for pyproject.toml and parsing it.
            let potentialRoot = activeFileDir;
            let foundCrewFile = false;
            for (let i = 0; i < 3; i++) { // Check current and up to 2 parent directories
                if (fs.existsSync(path.join(potentialRoot, 'crew.py')) || 
                    fs.existsSync(path.join(potentialRoot, 'main.py')) ||
                    fs.existsSync(path.join(potentialRoot, 'flow.py')) ||
                    fs.existsSync(path.join(potentialRoot, 'pyproject.toml'))) {
                    foundCrewFile = true;
                    break;
                }
                const parent = path.dirname(potentialRoot);
                if (parent === potentialRoot) break; // Reached root
                potentialRoot = parent;
            }

            if (foundCrewFile) {
                 const proceed = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Start chat in project directory: ${potentialRoot}? (Ensure crew.py/flow.py with 'chat_llm' is configured here)`
                });
                if (proceed === 'Yes') {
                    projectDir = potentialRoot;
                }
            }
        }

        if (!projectDir) {
            const folderUris = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Project Directory for CrewAI Chat'
            });

            if (folderUris && folderUris.length > 0) {
                projectDir = folderUris[0].fsPath;
            } else {
                vscode.window.showInformationMessage('No project directory selected. CrewAI Chat cancelled.');
                return;
            }
        }
        
        if (projectDir) {
            vscode.window.showInformationMessage(
                "Ensure the `chat_llm` property is set in your Crew definition (e.g., in crew.py or flow.py) for the chat to function correctly."
            );

            const command = `crewai chat`; // crewai chat runs in the current directory context
            
            let terminal = vscode.window.terminals.find(t => t.name === "CrewAI Chat");
            if (!terminal) {
                terminal = vscode.window.createTerminal({ name: "CrewAI Chat", cwd: projectDir });
            } else {
                // If terminal exists, ensure it's in the correct CWD or re-create.
                // For simplicity here, we'll just send a cd command if it's not already in the projectDir.
                // A more robust way would be to dispose and recreate if cwd can't be changed.
                // However, terminal.sendText(`cd "${projectDir}"`) should work for most shells.
                terminal.sendText(`cd "${projectDir}"`); // Change directory first
            }
            
            terminal.sendText(command);
            terminal.show();
            vscode.window.showInformationMessage(`Attempting to start CrewAI Chat in directory: ${projectDir}.`);
        }
    });
    context.subscriptions.push(chatWithCrewOrFlowDisposable);

    let viewTaskLogsDisposable = vscode.commands.registerCommand('crewai-vscode-extension.viewTaskLogs', async () => {
        const isCrewaiInstalled = await checkCrewaiInstallation();
        if (!isCrewaiInstalled) {
            vscode.window.showErrorMessage(
                'CrewAI CLI is not installed. Please install it by running: pip install crewai'
            );
            return;
        }

        let projectDir: string | undefined;
        const activeEditor = vscode.window.activeTextEditor;

        if (activeEditor) {
            const activeFileDir = path.dirname(activeEditor.document.uri.fsPath);
            let potentialRoot = activeFileDir;
            let foundCrewFile = false;
            for (let i = 0; i < 3; i++) { 
                if (fs.existsSync(path.join(potentialRoot, 'crew.py')) || 
                    fs.existsSync(path.join(potentialRoot, 'main.py')) ||
                    fs.existsSync(path.join(potentialRoot, 'flow.py')) ||
                    fs.existsSync(path.join(potentialRoot, 'pyproject.toml'))) {
                    foundCrewFile = true;
                    break;
                }
                const parent = path.dirname(potentialRoot);
                if (parent === potentialRoot) break; 
                potentialRoot = parent;
            }

            if (foundCrewFile) {
                 const proceed = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `View task logs for project in directory: ${potentialRoot}?`
                });
                if (proceed === 'Yes') {
                    projectDir = potentialRoot;
                }
            }
        }

        if (!projectDir) {
            const folderUris = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Project Directory to View Task Logs'
            });

            if (folderUris && folderUris.length > 0) {
                projectDir = folderUris[0].fsPath;
            } else {
                vscode.window.showInformationMessage('No project directory selected. View Task Logs cancelled.');
                return;
            }
        }
        
        if (projectDir) {
            const command = `crewai log-tasks-outputs`;
            
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fetching CrewAI Task Logs...",
                cancellable: false
            }, async (progress) => {
                try {
                    const stdout = await new Promise<string>((resolve, reject) => {
                        cp.exec(command, { cwd: projectDir }, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error fetching task logs: ${error.message}`);
                                console.error(`stderr: ${stderr}`);
                                reject({ error, stderr, stdout });
                                return;
                            }
                            if (stderr) {
                                // Sometimes CLI might output warnings to stderr but still succeed
                                console.warn(`stderr while fetching task logs: ${stderr}`);
                            }
                            resolve(stdout);
                        });
                    });

                    const outputChannel = vscode.window.createOutputChannel("CrewAI Task Logs", "text");
                    outputChannel.clear();
                    outputChannel.append(stdout); // Use append to preserve formatting like newlines
                    outputChannel.show(true); // true to preserve focus on the output channel
                    vscode.window.showInformationMessage(`Task logs fetched successfully for project: ${projectDir}.`);

                } catch (execError: any) {
                    const errorDetails = execError as { error: cp.ExecException | null, stderr: string, stdout: string };
                    vscode.window.showErrorMessage(
                        `Failed to fetch task logs for project: ${projectDir}. Error: ${errorDetails.error?.message || 'Unknown error'}.`
                    );
                    
                    // Show detailed error in a separate output channel or the same one
                    const errorOutputChannel = vscode.window.createOutputChannel("CrewAI CLI Errors");
                    errorOutputChannel.appendLine(`Error executing: ${command} in ${projectDir}`);
                    if (errorDetails.error) errorOutputChannel.appendLine(`Error Code: ${errorDetails.error.code}`);
                    if (errorDetails.error) errorOutputChannel.appendLine(`Error Signal: ${errorDetails.error.signal}`);
                    errorOutputChannel.appendLine(`stdout: ${errorDetails.stdout}`);
                    errorOutputChannel.appendLine(`stderr: ${errorDetails.stderr}`);
                    errorOutputChannel.show(true);
                }
            });
        }
    });
    context.subscriptions.push(viewTaskLogsDisposable);

    let runTestsDisposable = vscode.commands.registerCommand('crewai-vscode-extension.runTests', async () => {
        const isCrewaiInstalled = await checkCrewaiInstallation();
        if (!isCrewaiInstalled) {
            vscode.window.showErrorMessage(
                'CrewAI CLI is not installed. Please install it by running: pip install crewai'
            );
            return;
        }

        let projectDir: string | undefined;
        const activeEditor = vscode.window.activeTextEditor;

        if (activeEditor) {
            const activeFileDir = path.dirname(activeEditor.document.uri.fsPath);
            let potentialRoot = activeFileDir;
            let foundCrewFile = false;
            for (let i = 0; i < 3; i++) { 
                if (fs.existsSync(path.join(potentialRoot, 'crew.py')) || 
                    fs.existsSync(path.join(potentialRoot, 'main.py')) ||
                    fs.existsSync(path.join(potentialRoot, 'flow.py')) ||
                    fs.existsSync(path.join(potentialRoot, 'pyproject.toml'))) {
                    foundCrewFile = true;
                    break;
                }
                const parent = path.dirname(potentialRoot);
                if (parent === potentialRoot) break; 
                potentialRoot = parent;
            }

            if (foundCrewFile) {
                 const proceed = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Run tests for project in directory: ${potentialRoot}?`
                });
                if (proceed === 'Yes') {
                    projectDir = potentialRoot;
                }
            }
        }

        if (!projectDir) {
            const folderUris = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Project Directory to Run Tests'
            });

            if (folderUris && folderUris.length > 0) {
                projectDir = folderUris[0].fsPath;
            } else {
                vscode.window.showInformationMessage('No project directory selected. Test execution cancelled.');
                return;
            }
        }
        
        if (projectDir) {
            const command = `crewai test`; 
            
            let terminal = vscode.window.terminals.find(t => t.name === "CrewAI Tests");
            if (!terminal) {
                terminal = vscode.window.createTerminal({ name: "CrewAI Tests", cwd: projectDir });
            } else {
                terminal.sendText(`cd "${projectDir}"`); 
            }
            
            terminal.sendText(command);
            terminal.show();
            vscode.window.showInformationMessage(`Attempting to run tests for project in directory: ${projectDir}.`);
        }
    });
    context.subscriptions.push(runTestsDisposable);
}

export function deactivate() {}
