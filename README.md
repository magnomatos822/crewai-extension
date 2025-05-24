# CrewAI Helper (Extensão VSCode)

**CrewAI Helper** é uma extensão para o Visual Studio Code projetada para otimizar o desenvolvimento de agentes e crews utilizando o framework [CrewAI](https://www.crewai.com/). Ela oferece snippets de código, comandos para criação de projetos, execução de crews, chat interativo e mais, diretamente no seu ambiente de desenvolvimento.

## Features

Esta extensão traz as seguintes funcionalidades para facilitar seu trabalho com CrewAI:

*   **Criação de Projetos CrewAI:**
    *   **Comando:** `CrewAI: Create New Project (Crew/Flow)`
    *   **Como usar:** Acesse pela paleta de comandos (Ctrl+Shift+P ou Cmd+Shift+P). A extensão guiará você para selecionar o tipo de projeto (`crew` ou `flow`), nomear o projeto e escolher o diretório pai. O projeto será criado usando o comando `crewai create` da CLI.

*   **Snippets de Código Inteligentes:**
    *   **Prefixos:** `crewAgent`, `crewTask`, `crewCrew`, `crewTool`, `crewFlow`.
    *   **Como usar:** Comece a digitar um dos prefixos em um arquivo Python (`.py`) e o VSCode sugerirá o snippet correspondente. Os snippets incluem placeholders para facilitar o preenchimento dos parâmetros necessários para cada componente CrewAI.

*   **Executar Crew/Flow:**
    *   **Comando:** `CrewAI: Run This Crew/Flow File`
    *   **Como usar:** Disponível no menu de contexto (clique direito) ao editar um arquivo Python do seu projeto CrewAI, ou pela paleta de comandos. A extensão executará `crewai run` no diretório do arquivo ativo.

*   **Chat Interativo com Crew/Flow:**
    *   **Comando:** `CrewAI: Chat with This Crew/Flow`
    *   **Como usar:** Disponível no menu de contexto ao editar um arquivo Python do seu projeto CrewAI, ou pela paleta de comandos. A extensão executará `crewai chat` no diretório do arquivo ativo.
    *   **Nota:** Requer que a propriedade `chat_llm` esteja configurada na definição da sua crew.

*   **Visualizar Últimas Saídas de Tarefas:**
    *   **Comando:** `CrewAI: View Last Task Outputs`
    *   **Como usar:** Disponível no menu de contexto ao editar um arquivo Python ou pela paleta de comandos. A extensão executará `crewai log-tasks-outputs` no diretório do projeto.

*   **Executar Testes do Projeto:**
    *   **Comando:** `CrewAI: Run Tests`
    *   **Como usar:** Disponível no menu de contexto ao editar um arquivo Python ou pela paleta de comandos. A extensão executará `crewai test` no diretório do projeto.

## Requirements

*   **Python 3.x:** Instalado e configurado no seu sistema.
*   **CrewAI CLI:** A interface de linha de comando do CrewAI deve estar instalada e acessível no PATH do seu sistema.
    *   Instale com: `pip install crewai` ou `pip install crewai[tools]` para incluir as ferramentas básicas.

## Extension Settings

Atualmente, esta extensão não adiciona configurações específicas ao VSCode. Todas as configurações são gerenciadas através dos arquivos de configuração do seu projeto CrewAI (ex: `crew.py`, `tasks.py`, etc.).

## Known Issues

*   **Dependência do Comportamento da CLI `crewai`:** A funcionalidade da extensão depende da CLI `crewai` estar instalada e se comportar conforme o esperado, especialmente em relação ao diretório de trabalho (`cwd`).
    *   `crewai run`, `crewai chat`, `crewai log-tasks-outputs`, `crewai test` são executados no diretório do arquivo Python ativo ou no diretório raiz do workspace. Certifique-se de que seus arquivos de projeto (`crew.py`, `pyproject.toml`, etc.) estão estruturados para que a CLI os encontre corretamente a partir desses locais.
*   **Saída da CLI no Terminal:** Todas as saídas dos comandos da CLI são exibidas no terminal integrado do VSCode. A extensão não processa essas saídas diretamente (além de exibi-las).
*   **Criação de Projeto:** O comando `crewai create` é executado no diretório pai especificado. A estrutura exata do projeto gerado é definida pela CLI do CrewAI.

## Release Notes

Consulte o arquivo [CHANGELOG.md](CHANGELOG.md) para um histórico detalhado das mudanças.

---

Se você tiver sugestões ou encontrar problemas, por favor, abra uma issue no [repositório do GitHub](https://github.com/placeholder/vscode-crewai-extension/issues) (substitua pelo link real do repositório).
