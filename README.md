# Universal Audio Manager

O **Universal Audio Manager** é um player de áudio de alta performance focado em organização de biblioteca, extensibilidade e privacidade. Desenvolvido com uma arquitetura de **Core em Rust** e **Interface em React**, o projeto utiliza o framework **Tauri** para entregar uma experiência desktop nativa leve e segura.

O grande diferencial do projeto é o seu módulo de **Inteligência Artificial Local**, que permite a transcrição e geração de letras (lyrics) sem a necessidade de APIs externas ou conexão com a internet.

## 🚀 Tecnologias Core

### Backend (Rust)

- **Tauri v2:** Framework para interface desktop segura.
- **Symphonia:** Decodificação de áudio nativa em Rust (MP3, WAV, FLAC, etc).
- **Rodio:** Engine de reprodução de áudio.
- **Redb:** Banco de dados embarcado de alta performance (Key-Value).
- **Whisper-rs:** Bindings para o motor de IA Whisper (OpenAI) rodando localmente via CPU/GPU.

### Frontend (React + TypeScript)

- **Zustand:** Gerenciamento de estado leve para o player e fila.
- **Tailwind CSS + Shadcn/UI:** Interface moderna e responsiva.
- **TanStack Query:** Sincronização eficiente entre o Frontend e o Banco de Dados em Rust.

---

## 🏗️ Arquitetura do Projeto

O projeto segue os princípios de **Clean Architecture**, garantindo que as regras de negócio sejam independentes da interface e de bibliotecas externas.

### Estrutura de Crates (Rust)

```text
crates
├── intelligence   # Engine de IA (Whisper) e utilitários de áudio (Symphonia)
├── library        # Gestão de arquivos, metadados e banco de dados (Redb)
├── playback       # Lógica de reprodução e controle de hardware (Rodio)
└── delivery_tauri # Ponte (Bridge) entre os comandos Tauri e o Core do sistema
```

---

## 🧠 Módulo de IA Local (Add-on)

Diferente de outros players, o Universal Audio Manager oferece um sistema de **Complementos Modulares**.

- **Instalação sob demanda:** O usuário escolhe se deseja baixar o modelo de IA (ex: `ggml-tiny.bin`).
- **Privacidade Total:** Nenhuma informação de áudio sai da máquina do usuário.
- **Geração de Sidecar:** A transcrição é salva como um arquivo `.txt` ou `.lrc` ao lado do áudio original, funcionando como um complemento e não alterando o arquivo original.

---

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos (Windows)

Devido ao uso de IA nativa e compilação de código C++, este projeto requer:

1.  **Visual Studio 2022** com carga de trabalho "Desenvolvimento para Desktop com C++".
2.  **LLVM/Clang** instalado (preferencialmente o embutido no VS).
3.  **CMake** instalado e configurado no PATH.

### Comandos

1.  **Instalar dependências:**
    ```bash
    pnpm install
    ```
2.  **Rodar em modo Desenvolvimento:**
    ```bash
    pnpm tauri dev
    ```
3.  **Build de Produção:**
    ```bash
    pnpm tauri build
    ```

---

## 📂 Organização do Frontend

A interface é dividida em módulos funcionais:

- **Library:** Varredura de pastas e exibição de assets.
- **Playback:** Controles de áudio, fila de reprodução e visualização de ondas.
- **Settings:** Configurações de sistema e gerenciamento de plugins de IA.

---

## 📄 Licença

Este projeto é desenvolvido para fins de estudo e uso pessoal, focado em engenharia de software de alta performance.

```

```
