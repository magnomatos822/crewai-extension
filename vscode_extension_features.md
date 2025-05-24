# Features da Extensão VSCode para CrewAI

Este documento descreve o conjunto inicial de funcionalidades para a extensão VSCode destinada a auxiliar no desenvolvimento com o framework CrewAI.

## 1. Integração com a CLI do CrewAI

A extensão fornecerá acesso facilitado aos comandos da CLI do CrewAI diretamente do ambiente VSCode.

### 1.1. Criação de Projetos e Componentes (`crewai create`)
*   **Comando:** `CrewAI: Novo Projeto Crew`
    *   **Ação:** Executa `crewai create crew <nome_do_projeto>` em um diretório selecionado pelo usuário. Cria a estrutura base de um projeto CrewAI.
*   **Comando:** `CrewAI: Novo Fluxo (Flow)`
    *   **Ação:** Executa `crewai create flow <nome_do_fluxo>` no diretório raiz do projeto. Cria a estrutura base para um novo Flow.
*   **Interface:** Comandos disponíveis na paleta de comandos do VSCode (Ctrl+Shift+P).

### 1.2. Execução de Crews e Flows (`crewai run`)
*   **Comando:** `CrewAI: Executar Crew/Flow`
    *   **Ação:** Executa `crewai run` no diretório raiz do projeto. A CLI do CrewAI detectará automaticamente se é um Crew ou Flow.
    *   **Saída:** O output do comando será exibido no terminal integrado do VSCode.
*   **Contexto:** Disponível através da paleta de comandos e potencialmente por um clique direito no arquivo principal do crew/flow (ex: `main.py` ou similar).

### 1.3. Chat Interativo com Crews (`crewai chat`)
*   **Comando:** `CrewAI: Iniciar Chat com Crew`
    *   **Ação:** Abre um terminal integrado no VSCode e executa `crewai chat`.
    *   **Interação:** O usuário poderá interagir com a crew diretamente no terminal.
*   **Requisito:** O usuário precisa ter configurado a propriedade `chat_llm` em sua definição de crew, conforme a documentação do CrewAI. A extensão pode verificar isso e orientar o usuário.

### 1.4. Teste de Crews (`crewai test`)
*   **Comando:** `CrewAI: Testar Crew`
    *   **Ação:** Executa `crewai test` no diretório raiz do projeto.
    *   **Opções:** A extensão poderá, futuramente, permitir que o usuário insira o número de iterações (`-n`) e o modelo (`-m`) através de um input box. Inicialmente, usará os defaults da CLI.
    *   **Saída:** Os resultados do teste serão exibidos no terminal integrado.

### 1.5. Visualização de Saídas de Tarefas (`crewai log-tasks-outputs`)
*   **Comando:** `CrewAI: Ver Últimas Saídas de Tarefas`
    *   **Ação:** Executa `crewai log-tasks-outputs`.
    *   **Saída:** As saídas serão exibidas em um painel de output dedicado no VSCode ou em um novo editor de texto (formatado para leitura).

## 2. Assistência ao Desenvolvimento

Recursos para agilizar a escrita de código CrewAI.

### 2.1. Snippets de Código
A extensão incluirá snippets para as estruturas mais comuns do CrewAI:
*   **Agente:** `crewai_agent` -> Estrutura de uma classe de Agente.
    ```python
    from crewai import Agent

    ${1:agent_name} = Agent(
        role='${2:Your Agent Role}',
        goal='${3:Your Agent Goal}',
        backstory="""${4:A detailed backstory for your agent.}""",
        tools=[
            # Adicione suas ferramentas aqui
        ],
        allow_delegation=${5:False},
        verbose=True,
        # llm=your_llm_instance  # Opcional
    )
    ```
*   **Tarefa:** `crewai_task` -> Estrutura para criar uma Tarefa.
    ```python
    from crewai import Task

    ${1:task_name} = Task(
        description="""${2:Detailed description of the task.}""",
        expected_output="""${3:Expected output of the task.}""",
        agent=${4:agent_instance},
        # tools=[optional_tool_instance], # Opcional
        # async_execution=False, # Opcional
        # context=[optional_task_instance], # Opcional
        # output_file='${5:output_file.md}' # Opcional
    )
    ```
*   **Crew:** `crewai_crew` -> Estrutura para definir uma Crew.
    ```python
    from crewai import Crew, Process

    ${1:crew_name} = Crew(
        agents=[
            # Lista de instâncias de agentes
            ${2:agent_instance_1},
            ${3:agent_instance_2}
        ],
        tasks=[
            # Lista de instâncias de tarefas
            ${4:task_instance_1},
            ${5:task_instance_2}
        ],
        process=Process.${6:sequential},  # Outras opções: hierarchical
        verbose=True,
        # memory=True, # Opcional, para habilitar memória de curto/longo prazo
        # cache=True, # Opcional, para habilitar cache
        # manager_llm=your_llm_instance, # Opcional, para processo hierárquico
        # output_log_file='${7:crew_log.txt}' # Opcional
    )
    ```
*   **Ferramenta (Tool):** `crewai_tool` -> Estrutura para criar uma ferramenta customizada.
    ```python
    from crewai_tools import BaseTool

    class ${1:MyCustomTool}(BaseTool):
        name: str = "${2:Name of your custom tool}"
        description: str = "${3:Brief description of what your tool does}"

        def _run(self, argument: str) -> str:
            # Lógica da sua ferramenta aqui
            return f"Resultado para o argumento: {argument}"

    ${4:tool_instance} = ${1:MyCustomTool}()
    ```
*   **Flow (Básico):** `crewai_flow` -> Estrutura inicial para um Flow (pode evoluir com a documentação).
    ```python
    from crewai import Flow # (ou a importação correta para flows)

    # Exemplo de estrutura de flow (a ser adaptado conforme API do CrewAI)
    # @flow # Decorador se aplicável
    # def my_flow_function():
    #     # Defina os passos do seu flow aqui
    #     pass
    ```
    *Nota: A estrutura exata do snippet para Flow dependerá da API final e das melhores práticas para definir Flows em código.*

### 2.2. Autocompletar Básico
*   **Parâmetros de Classes:** Sugestões para parâmetros comuns ao instanciar `Agent`, `Task`, `Crew`.
*   **Tipos de Processo:** Ao definir `process=Process.` em uma `Crew`, sugerir `sequential` e `hierarchical`.
*   **Importações:** (Futuro) Sugerir importações para classes do CrewAI.

## 3. Gerenciamento e Visualização (Considerações Futuras)

*   **Painel CrewAI:** Uma view na barra lateral do VSCode que lista:
    *   Crews, Agents, Tasks e Tools definidos no workspace.
    *   Facilitar a navegação entre esses componentes.
*   **Gerenciamento de Memória:** Interface para executar comandos `crewai reset-memories` com seleções específicas.
*   **Validação de Configuração:** Avisos se configurações essenciais (ex: `OPENAI_API_KEY` para ferramentas que a usam, `chat_llm` para `crewai chat`) não estiverem presentes no ambiente ou configurações do projeto.

## Roadmap Inicial

1.  **Fase 1 (MVP):**
    *   Implementar todos os comandos da CLI listados na seção 1.
    *   Implementar os snippets de código para Agent, Task, Crew, Tool.
    *   Autocompletar básico para `Process`.
2.  **Fase 2:**
    *   Melhorar o autocompletar com mais parâmetros e contextos.
    *   Adicionar snippet para Flow (após clarificação da API, se necessário).
    *   Começar a explorar o "Painel CrewAI" básico.
    *   Adicionar mais verificações e orientações ao usuário (ex: `chat_llm` não configurado).
```
