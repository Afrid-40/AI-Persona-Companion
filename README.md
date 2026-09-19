🤖 AI Persona

An AI-powered virtual assistant that provides intelligent, context-aware conversations using Large Language Models (LLMs). AI Persona delivers personalized responses, remembers conversation context, and supports document understanding through a modern full-stack architecture.

🚀 Features

💬 Natural language conversations

🧠 Context-aware AI with conversation memory

📄 Upload and analyze PDF/Text documents

❓ Ask questions about uploaded documents

⚡ Fast and responsive chat interface

🔒 Secure backend API integration

🌐 Modern and user-friendly UI

🤖 Supports local and cloud-based LLMs

🔌 OpenRouter API integration

🛠️ Tech Stack

Frontend

React.js

HTML5

CSS3

JavaScript

Backend

Python

FastAPI

AI & LLM

OpenRouter API

OpenAI GPT-4o Mini

Ollama (Qwen 3 4B)

OpenAI API (Optional)

Google Gemini (Optional)

Database

MongoDB

Tools

Git

GitHub

VS Code

📂 Project Structure

AI-Persona/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── main.py
│   └── requirements.txt
│
├── .env
├── .gitignore
├── README.md
└── LICENSE

⚙️ Installation & Setup

Follow the steps below to run AI Persona locally.

1. Clone the Repository

git clone https://github.com/Surendra1579/AI-Persona.git
cd AI-Persona

2. Create the Environment File

Before starting the backend, you must create a .env file in the project directory.

Create a file named:

.env

Add the following configuration:

OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

🔑 Getting an OpenRouter API Key

You need your own OpenRouter API key to use the cloud LLM configuration.

Replace:

YOUR_OPENROUTER_API_KEY

with your personal OpenRouter API key.

Never commit your .env file or API key to GitHub.

Your .gitignore should contain:

.env
venv/
__pycache__/
node_modules/

⚠️ Security: API keys are private credentials. Do not share them publicly, upload them to GitHub, or hard-code them directly into source code.

3. Backend Setup

Open a terminal in the project directory and run:

cd backend

Create a Python virtual environment:

python -m venv venv

Windows

Activate the virtual environment:

venv\Scripts\activate

Install Dependencies

pip install -r requirements.txt

Start the FastAPI Backend

uvicorn main:app --reload

The backend should now be available at:

http://127.0.0.1:8000

FastAPI documentation can be accessed at:

http://127.0.0.1:8000/docs

4. Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend

Install the required packages:

npm install

Start the development server:

npm start

The frontend will normally be available at:

http://localhost:3000

🔐 Environment Variables

AI Persona uses environment variables to configure the OpenRouter connection.

Variable

Description

Example

OPENROUTER_API_KEY

Your personal OpenRouter API key

YOUR_OPENROUTER_API_KEY

OPENROUTER_MODEL

LLM model used by the application

openai/gpt-4o-mini

OPENROUTER_BASE_URL

OpenRouter API endpoint

https://openrouter.ai/api/v1

Example .env

OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

Each developer must create their own .env file after cloning the repository.

The .env file should not be pushed to GitHub.

▶️ Running the Complete Application

After completing the setup:

Terminal 1 — Backend

cd backend
venv\Scripts\activate
uvicorn main:app --reload

Terminal 2 — Frontend

cd frontend
npm start

Once both servers are running, open the frontend in your browser.

http://localhost:3000

📸 Features in Action

AI Persona provides:

🤖 AI Chat Assistant

🧠 Personalized Conversations

📄 Document Upload

❓ Intelligent Question Answering

💬 Context-Aware Responses

⚡ Real-Time AI Interaction

🎯 Future Enhancements

🎤 Voice Assistant

🔊 Text-to-Speech

🌍 Multi-language Support

🖼️ Image Understanding

📚 RAG-based Knowledge Base

👤 User Authentication

☁️ Cloud Deployment

🧩 Additional LLM Provider Support

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a new branch

Create your .env file locally

Make your changes

Commit your changes

Push the branch

Open a Pull Request

Never commit API keys, passwords, tokens, or other sensitive credentials.

📜 License

This project is licensed under the MIT License.

👨‍💻 Author

Naga Surendra

GitHub: https://github.com/Surendra1579

⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub!
